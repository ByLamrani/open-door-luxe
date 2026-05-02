import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const PAYPAL_BASE =
  Deno.env.get("PAYPAL_ENV") === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";

async function getAccessToken(): Promise<string> {
  const auth = btoa(
    `${Deno.env.get("PAYPAL_CLIENT_ID")}:${Deno.env.get("PAYPAL_SECRET_KEY")}`
  );
  const res = await fetch(`${PAYPAL_BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  const json = await res.json();
  return json.access_token;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Unauthorized" }, 401);
    const { data: userData } = await supabase.auth.getUser(
      authHeader.replace("Bearer ", "")
    );
    const user = userData.user;
    if (!user) return json({ error: "Unauthorized" }, 401);

    const { providerOrderId } = await req.json();
    if (!providerOrderId) return json({ error: "Missing providerOrderId" }, 400);

    const accessToken = await getAccessToken();
    const res = await fetch(
      `${PAYPAL_BASE}/v2/checkout/orders/${providerOrderId}/capture`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );
    const data = await res.json();
    if (!res.ok) {
      console.error("PayPal capture error", data);
      return json({ error: data }, 500);
    }

    const captureId =
      data.purchase_units?.[0]?.payments?.captures?.[0]?.id ?? null;
    const totalAmount = (data.purchase_units || []).reduce(
      (sum: number, u: any) =>
        sum +
        Number(u.payments?.captures?.[0]?.amount?.value ?? u.amount?.value ?? 0),
      0
    );
    const currency =
      data.purchase_units?.[0]?.payments?.captures?.[0]?.amount?.currency_code ??
      "USD";

    // Determine if this is a top-up
    const { data: topup } = await supabase
      .from("wallet_topups")
      .select("id, user_id, amount")
      .eq("paypal_order_id", providerOrderId)
      .maybeSingle();

    if (topup) {
      await supabase
        .from("wallet_topups")
        .update({
          status: "completed",
          paypal_capture_id: captureId,
        })
        .eq("id", topup.id);
      // Credit wallet
      await supabase.rpc("credit_wallet_from_topup", {
        _user: topup.user_id,
        _amount: Number(topup.amount),
        _topup_id: topup.id,
      });
    } else {
      // Order checkout flow — find by paypal_order_id
      const { data: order } = await supabase
        .from("orders")
        .select("id, order_id, vendor_id, total, deposit_amount")
        .eq("paypal_order_id", providerOrderId)
        .maybeSingle();
      if (order) {
        const isDeposit =
          order.deposit_amount && Number(order.deposit_amount) > 0;
        await supabase
          .from("orders")
          .update({
            status: isDeposit ? "paid_deposit" : "paid_full",
            paypal_capture_id: captureId,
          })
          .eq("id", order.id);

        // Credit vendor pending balance + lifetime earnings (90%)
        if (order.vendor_id) {
          const vendorShare = +(Number(totalAmount) * 0.9).toFixed(2);
          const { data: w } = await supabase
            .from("wallets")
            .select("pending_balance, lifetime_earnings")
            .eq("user_id", order.vendor_id)
            .maybeSingle();
          if (w) {
            await supabase
              .from("wallets")
              .update({
                pending_balance: Number(w.pending_balance) + vendorShare,
                lifetime_earnings:
                  Number(w.lifetime_earnings) + vendorShare,
              })
              .eq("user_id", order.vendor_id);
          }
        }
      }
    }

    return json({
      captureId,
      status: data.status === "COMPLETED" ? "COMPLETED" : "PENDING",
      amount: totalAmount,
      currency,
    });
  } catch (e) {
    console.error("paypal-capture-order error", e);
    return json({ error: String(e) }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
