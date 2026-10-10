import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { z } from "npm:zod@3";

const json = (b: unknown, status = 200) =>
  new Response(JSON.stringify(b), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

const Str = z.string().max(4000);
const Body = z.discriminatedUnion("action", [
  z.object({ action: z.literal("list") }),
  z.object({
    action: z.literal("create"),
    provider: z.string().trim().min(1).max(80),
    category: z.string().trim().min(1).max(60),
    label: z.string().trim().min(1).max(80),
    public_fields: z.record(Str).default({}),
    secret_fields: z.record(Str).default({}),
  }),
  z.object({ action: z.literal("toggle"), id: z.string().uuid() }),
  z.object({ action: z.literal("delete"), id: z.string().uuid() }),
]);

async function key() {
  const raw = Deno.env.get("CONNECTIONS_ENC_KEY");
  if (!raw) throw new Error("Encryption key missing");
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(raw));
  return crypto.subtle.importKey("raw", digest, "AES-GCM", false, ["encrypt"]);
}
async function encrypt(text: string) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv }, await key(), new TextEncoder().encode(text)));
  const buf = new Uint8Array(iv.length + ct.length); buf.set(iv); buf.set(ct, iv.length);
  return btoa(String.fromCharCode(...buf));
}
const hint = (v: string) => (v.length <= 4 ? "••••" : `••••${v.slice(-4)}`);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const token = (req.headers.get("Authorization") || "").replace("Bearer ", "");
    const { data: u } = await admin.auth.getUser(token);
    if (!u?.user) return json({ error: "Unauthorized" }, 401);
    const { data: isAdmin } = await admin.rpc("has_role", { _user_id: u.user.id, _role: "admin" });
    if (isAdmin !== true) return json({ error: "Forbidden" }, 403);

    const parsed = Body.safeParse(await req.json());
    if (!parsed.success) return json({ error: "Invalid request" }, 400);
    const b = parsed.data;
    const audit = (action: string, details: Record<string, unknown>, entity_id?: string) =>
      admin.from("audit_logs").insert({ actor_id: u.user!.id, actor_email: u.user!.email, action, entity: "api_connections", entity_id: entity_id ?? null, details });

    if (b.action === "list") {
      const { data, error } = await admin.from("api_connections")
        .select("id, provider, category, label, fields, secret_hints, secret_ciphertext, is_active, created_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      // Never return ciphertext. Legacy rows that stored everything in `fields` are masked.
      return json({ rows: (data ?? []).map(({ secret_ciphertext, fields, ...r }) => ({
        ...r,
        fields: secret_ciphertext ? fields : Object.fromEntries(Object.entries(fields || {}).map(([k, v]) => [k, hint(String(v))])),
      })) });
    }
    if (b.action === "create") {
      const secrets = Object.fromEntries(Object.entries(b.secret_fields).filter(([, v]) => v.trim()));
      const { data, error } = await admin.from("api_connections").insert({
        provider: b.provider, category: b.category, label: b.label,
        fields: b.public_fields,
        secret_ciphertext: await encrypt(JSON.stringify(secrets)),
        secret_hints: Object.fromEntries(Object.entries(secrets).map(([k, v]) => [k, hint(v)])),
      }).select("id").single();
      if (error) throw error;
      await audit("connection.create", { provider: b.provider, label: b.label }, data.id);
      return json({ ok: true });
    }
    if (b.action === "toggle") {
      const { data: row } = await admin.from("api_connections").select("is_active").eq("id", b.id).single();
      if (!row) return json({ error: "Not found" }, 404);
      await admin.from("api_connections").update({ is_active: !row.is_active, updated_at: new Date().toISOString() }).eq("id", b.id);
      await audit("connection.toggle", { active: !row.is_active }, b.id);
      return json({ ok: true });
    }
    await admin.from("api_connections").delete().eq("id", b.id);
    await audit("connection.delete", {}, b.id);
    return json({ ok: true });
  } catch (e) {
    console.error(e);
    return json({ error: "Server error" }, 500);
  }
});
