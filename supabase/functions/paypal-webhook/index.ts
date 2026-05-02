// PayPal webhook listener — verifies notifications and finalizes payments.
// Configure your webhook in the PayPal dashboard to point at this function URL
// and subscribe to PAYMENT.CAPTURE.COMPLETED.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "content-type, paypal-transmission-id, paypal-transmission-time, paypal-transmission-sig, paypal-cert-url, paypal-auth-algo",
};

const PAYPAL_BASE =
  Deno.env.get("PAYPAL_ENV") === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";

async function token() {
  const auth = btoa(
    `${Deno.env.get("PAYPAL_CLIENT_ID")}:${Deno.env.get("PAYPAL_SECRET_KEY")}`
  );
  const r = await fetch(`${PAYPAL_BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  return (await r.json()).access_token;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const raw = await req.text();
    const event = JSON.parse(raw);
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Verify signature with PayPal
    const webhookId = Deno.env.get("PAYPAL_WEBHOOK_ID");
    if (webhookId) {
      const at = await token();
      const verify = await fetch(`${PAYPAL_BASE}/v1/notifications/verify-webhook-signature`, {
        method: "POST",
        headers: { Authorization: `Bearer ${at}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          auth_algo: req.headers.get("paypal-auth-algo"),
          cert_url: req.headers.get("paypal-cert-url"),
          transmission_id: req.headers.get("paypal-transmission-id"),
          transmission_sig: req.headers.get("paypal-transmission-sig"),
          transmission_time: req.headers.get("paypal-transmission-time"),
          webhook_id: webhookId,
          webhook_event: event,
        }),
      });
      const v = await verify.json();
      if (v.verification_status !== "SUCCESS") {
        console.warn("Webhook signature failed", v);
        return new Response("invalid", { status: 400 });
      }
    }

    if (event.event_type === "PAYMENT.CAPTURE.COMPLETED") {
      const captureId = event.resource?.id;
      const supplementaryData =
        event.resource?.supplementary_data?.related_ids?.order_id;
      const orderRef = supplementaryData;

      if (orderRef) {
        // Update order status
        await supabase
          .from("orders")
          .update({ status: "paid_full", paypal_capture_id: captureId })
          .eq("paypal_order_id", orderRef);

        // Update top-up
        const { data: t } = await supabase
          .from("wallet_topups")
          .select("id, user_id, amount, status")
          .eq("paypal_order_id", orderRef)
          .maybeSingle();
        if (t && t.status !== "completed") {
          await supabase
            .from("wallet_topups")
            .update({ status: "completed", paypal_capture_id: captureId })
            .eq("id", t.id);
          await supabase.rpc("credit_wallet_from_topup", {
            _user: t.user_id,
            _amount: Number(t.amount),
            _topup_id: t.id,
          });
        }
      }
    }

    return new Response("ok", { headers: corsHeaders });
  } catch (e) {
    console.error("webhook error", e);
    return new Response("error", { status: 500, headers: corsHeaders });
  }
});
