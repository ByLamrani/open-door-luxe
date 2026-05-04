// Public edge function returning latest USD-based FX rates (cached 1h client-side).
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const key = Deno.env.get("EXCHANGE_RATE_API_KEY");
    if (!key) throw new Error("EXCHANGE_RATE_API_KEY not configured");
    const url = `https://v6.exchangerate-api.com/v6/${key}/latest/USD`;
    const r = await fetch(url);
    const j = await r.json();
    if (j.result !== "success") throw new Error(j["error-type"] || "rate fetch failed");
    return new Response(
      JSON.stringify({ base: "USD", rates: j.conversion_rates, fetched_at: Date.now() }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    return new Response(JSON.stringify({ error: String((e as Error).message) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
