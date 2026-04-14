import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { type, metrics, inventory } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const prompts: Record<string, string> = {
      price_optimizer: `You are a pricing analyst for VANTA marketplace. Analyze these seller metrics and suggest optimal pricing. Metrics: Revenue ${metrics?.totalRevenue}, AOV ${metrics?.avgOrderValue}, Conversion ${metrics?.conversionRate}%. Inventory: ${JSON.stringify(inventory?.slice(0, 5))}. Give specific, actionable pricing advice in 3-4 sentences.`,
      revenue_forecast: `You are a revenue forecaster for VANTA marketplace. Based on: Revenue ${metrics?.totalRevenue}, Orders ${metrics?.totalOrders}, AOV ${metrics?.avgOrderValue}. Project the next 30 days revenue with reasoning. Be specific with numbers.`,
      sentiment: `You are a customer sentiment analyst for VANTA. Based on ${metrics?.totalOrders} orders and ${metrics?.conversionRate}% conversion rate. Generate a "Vibe Score" and summarize likely customer sentiment. Suggest 2 improvements.`,
      restock: `You are an inventory intelligence AI for VANTA. Analyze: ${JSON.stringify(inventory)}. Identify items that need restocking urgently. Predict seasonal demand spikes (Ramadan, Summer, Holidays). Give specific restock recommendations.`,
      discount_impact: `You are a discount strategy AI for VANTA. Current metrics: Revenue ${metrics?.totalRevenue}, Conversion ${metrics?.conversionRate}%, AOV ${metrics?.avgOrderValue}. Predict the impact of running a 10% discount this weekend. Give specific predictions.`,
      ad_roi: `You are an advertising ROI analyst for VANTA. With ${metrics?.totalViews} views and ${metrics?.conversionRate}% conversion, calculate theoretical ROI for featured placement. The AI advertising fee is 3%. Give specific recommendations.`,
    };

    const prompt = prompts[type] || "Provide general seller insights for a luxury marketplace.";

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "You are an AI business analyst for VANTA by Lamrani, a luxury smart-commerce marketplace. Give concise, data-driven insights." },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited" }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Credits exhausted" }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const insight = data.choices?.[0]?.message?.content || "No insight generated.";

    return new Response(JSON.stringify({ insight }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("seller-ai error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
