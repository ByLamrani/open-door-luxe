import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Not authenticated");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const { tier, amount, productName } = await req.json();

    // Look up user's stored Stripe key
    const { data: keys } = await supabase
      .from("integration_keys")
      .select("api_key")
      .eq("user_id", user.id)
      .eq("provider", "stripe")
      .eq("is_active", true)
      .limit(1);

    const stripeKey = keys?.[0]?.api_key;
    if (!stripeKey) {
      return new Response(JSON.stringify({
        error: "no_stripe_key",
        message: "Add your Stripe Secret Key under Profile → APIs to enable card payments.",
      }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const origin = req.headers.get("origin") || "https://vanta.lovable.app";
    const params = new URLSearchParams();
    params.append("mode", "payment");
    params.append("success_url", `${origin}/profile?upgrade=success&tier=${tier}`);
    params.append("cancel_url", `${origin}/profile?upgrade=cancel`);
    params.append("line_items[0][price_data][currency]", "usd");
    params.append("line_items[0][price_data][product_data][name]", productName);
    params.append("line_items[0][price_data][unit_amount]", String(Math.round(amount * 100)));
    params.append("line_items[0][quantity]", "1");
    params.append("metadata[user_id]", user.id);
    params.append("metadata[tier]", tier);

    const r = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${stripeKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });
    const session = await r.json();
    if (!r.ok) throw new Error(session?.error?.message || "Stripe error");

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
