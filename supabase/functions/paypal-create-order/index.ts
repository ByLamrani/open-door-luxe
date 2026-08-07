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
  const clientId = Deno.env.get("PAYPAL_CLIENT_ID");
  const secret = Deno.env.get("PAYPAL_SECRET_KEY");
  if (!clientId || !secret) throw new Error("Missing PayPal credentials");
  const auth = btoa(`${clientId}:${secret}`);
  const res = await fetch(`${PAYPAL_BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  if (!res.ok) throw new Error(`PayPal auth failed: ${await res.text()}`);
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

    // Auth
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Unauthorized" }, 401);
    const token = authHeader.replace("Bearer ", "");
    const { data: userData } = await supabase.auth.getUser(token);
    const user = userData.user;
    if (!user) return json({ error: "Unauthorized" }, 401);

    const body = await req.json();
    const {
      orderId,
      currency = "USD",
      items = [],
      totalAmount,
      mode, // 'full' | 'deposit_20' | 'topup'
      fullPrice,
      vendorEmail,
    } = body;

    if (!orderId || !totalAmount || totalAmount <= 0) {
      return json({ error: "Invalid input" }, 400);
    }

    const platformEmail = Deno.env.get("PAYPAL_PLATFORM_EMAIL");
    const accessToken = await getAccessToken();

    const fmt = (n: number) => n.toFixed(2);
    const amount = Number(totalAmount);

    // Build purchase_units for multi-seller split (90% vendor / 10% platform)
    // For top-ups, single unit to platform.
    let purchase_units: any[] = [];
    if (mode === "topup") {
      purchase_units = [
        {
          reference_id: orderId,
          amount: { currency_code: currency, value: fmt(amount) },
          description: `Lamra Lux wallet top-up`,
        },
      ];
    } else {
      const vendorShare = +(amount * 0.9).toFixed(2);
      const platformShare = +(amount - vendorShare).toFixed(2);

      const units: any[] = [
        {
          reference_id: `vendor_${orderId}`,
          amount: { currency_code: currency, value: fmt(vendorShare) },
          description: `Vendor share — Order ${orderId}`,
        },
      ];
      if (vendorEmail) units[0].payee = { email_address: vendorEmail };

      if (platformShare > 0) {
        const platformUnit: any = {
          reference_id: `platform_${orderId}`,
          amount: { currency_code: currency, value: fmt(platformShare) },
          description: `Platform fee — Order ${orderId}`,
        };
        if (platformEmail) platformUnit.payee = { email_address: platformEmail };
        units.push(platformUnit);
      }
      purchase_units = units;
    }

    const orderPayload = {
      intent: "CAPTURE",
      purchase_units,
      application_context: {
        brand_name: "Lamra Lux",
        user_action: "PAY_NOW",
        shipping_preference: "NO_SHIPPING",
      },
    };

    const res = await fetch(`${PAYPAL_BASE}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(orderPayload),
    });
    const data = await res.json();
    if (!res.ok) {
      console.error("PayPal create order error", data);
      return json({ error: data }, 500);
    }

    // Persist mapping for the webhook/capture step
    if (mode === "topup") {
      await supabase.from("wallet_topups").insert({
        id: orderId,
        user_id: user.id,
        amount,
        currency,
        paypal_order_id: data.id,
        status: "pending",
      });
    }

    return json({
      providerOrderId: data.id,
      approveUrl: data.links?.find((l: any) => l.rel === "approve")?.href,
    });
  } catch (e) {
    console.error("paypal-create-order error", e);
    return json({ error: String(e) }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
