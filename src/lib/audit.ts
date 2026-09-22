import { supabase } from "@/integrations/supabase/client";

/**
 * Records an administrative action in the audit_logs table.
 * Failures are swallowed — auditing must never block an admin action.
 */
export async function logAudit(
  action: string,
  opts: { entity?: string; entityId?: string; details?: Record<string, unknown> } = {}
) {
  try {
    const { data } = await supabase.auth.getUser();
    const user = data.user;
    if (!user) return;
    await supabase.from("audit_logs").insert({
      actor_id: user.id,
      actor_email: user.email ?? null,
      action,
      entity: opts.entity ?? null,
      entity_id: opts.entityId ?? null,
      details: (opts.details ?? {}) as never,
    });
  } catch {
    /* noop */
  }
}

/** Basic client-side sanitization for free-text admin input. */
export function sanitizeText(value: string, maxLength = 2000) {
  return value
    .replace(/<\/?[^>]*>/g, "")
    .replace(/(javascript:|data:text\/html)/gi, "")
    .slice(0, maxLength)
    .trim();
}
