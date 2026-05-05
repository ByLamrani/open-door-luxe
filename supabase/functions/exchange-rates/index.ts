// Public edge function returning latest USD-based FX rates.
// Tries ExchangeRate-API v6 (with key), falls back to open.er-api.com (no key).
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function fetchPaid(key: string) {
  const r = await fetch(`https://v6.exchangerate-api.com/v6/${key}/latest/USD`);
  const j = await r.json();
  if (j.result === "success") return j.conversion_rates as Record<string, number>;
  throw new Error(j["error-type"] || "rate fetch failed");
}

async function fetchOpen() {
  const r = await fetch("https://open.er-api.com/v6/latest/USD");
  const j = await r.json();
  if (j.result === "success") return j.rates as Record<string, number>;
  throw new Error("open rates failed");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const key = Deno.env.get("EXCHANGE_RATE_API_KEY");
    let rates: Record<string, number> | null = null;
    if (key) {
      try { rates = await fetchPaid(key); } catch (e) { console.warn("Paid FX failed:", (e as Error).message); }
    }
    if (!rates) rates = await fetchOpen();
    return new Response(
      JSON.stringify({ base: "USD", rates, fetched_at: Date.now() }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    // Last-resort static fallback so the UI never breaks
    const fallback = { USD: 1, EUR: 0.92, MAD: 10.0, GBP: 0.79, AED: 3.67, SAR: 3.75, CAD: 1.36, JPY: 155, CNY: 7.2, RUB: 92 };
    return new Response(JSON.stringify({ base: "USD", rates: fallback, fetched_at: Date.now(), warning: String((e as Error).message) }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
