import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { z } from "npm:zod@3";

const json = (b: unknown, status = 200) =>
  new Response(JSON.stringify(b), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

const Body = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("create"),
    email: z.string().email().max(255),
    password: z.string().min(8).max(128),
    full_name: z.string().max(120).optional(),
  }),
  z.object({ action: z.literal("delete"), user_id: z.string().uuid() }),
  z.object({
    action: z.literal("update"),
    user_id: z.string().uuid(),
    full_name: z.string().max(120).optional(),
    phone: z.string().max(40).optional(),
    city: z.string().max(80).optional(),
    home_address: z.string().max(255).optional(),
  }),
]);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const url = Deno.env.get("SUPABASE_URL")!;
    const admin = createClient(url, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const token = (req.headers.get("Authorization") || "").replace("Bearer ", "");
    if (!token) return json({ error: "Unauthorized" }, 401);
    const { data: u } = await admin.auth.getUser(token);
    if (!u.user) return json({ error: "Unauthorized" }, 401);
    const { data: isAdmin } = await admin.rpc("has_role", { _user_id: u.user.id, _role: "admin" });
    if (isAdmin !== true) return json({ error: "Forbidden" }, 403);

    const parsed = Body.safeParse(await req.json());
    if (!parsed.success) return json({ error: parsed.error.flatten().fieldErrors }, 400);
    const b = parsed.data;

    if (b.action === "create") {
      const { data, error } = await admin.auth.admin.createUser({
        email: b.email, password: b.password, email_confirm: true,
        user_metadata: { full_name: b.full_name ?? "" },
      });
      if (error) return json({ error: error.message }, 400);
      return json({ ok: true, user_id: data.user?.id });
    }
    if (b.action === "delete") {
      if (b.user_id === u.user.id) return json({ error: "You cannot delete your own account" }, 400);
      const { error } = await admin.auth.admin.deleteUser(b.user_id);
      if (error) return json({ error: error.message }, 400);
      return json({ ok: true });
    }
    const { action: _a, user_id, ...fields } = b;
    const { error } = await admin.from("profiles").update(fields).eq("user_id", user_id);
    if (error) return json({ error: error.message }, 400);
    return json({ ok: true });
  } catch (e) {
    return json({ error: String((e as Error).message) }, 500);
  }
});
