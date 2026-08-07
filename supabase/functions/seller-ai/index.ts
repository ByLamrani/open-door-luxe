import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const AI_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";

async function callAI(body: any, key: string) {
  const r = await fetch(AI_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!r.ok) {
    if (r.status === 429) throw new Error("Rate limited");
    if (r.status === 402) throw new Error("Credits exhausted");
    throw new Error(`AI gateway error ${r.status}`);
  }
  return r.json();
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const body = await req.json();
    const { type, metrics, inventory, prompt: customPrompt, document, productName, details } = body;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // ---------- Document analysis (vision) ----------
    if (type === "document_analysis") {
      if (!document?.dataUrl) throw new Error("document required");
      const data = await callAI({
        model: "google/gemini-2.5-pro",
        messages: [
          { role: "system", content: "You are a document analyst. Extract key data, amounts, parties, dates, and flag risks or anomalies. Be concise." },
          { role: "user", content: [
            { type: "text", text: `Analyze this document (${document.name}). Provide: 1) Document type, 2) Key fields extracted, 3) Risks/red flags, 4) Recommended actions.` },
            { type: "image_url", image_url: { url: document.dataUrl } },
          ]},
        ],
      }, LOVABLE_API_KEY);
      return new Response(JSON.stringify({ insight: data.choices?.[0]?.message?.content }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ---------- Product image + copy generation ----------
    if (type === "product_generator") {
      if (!productName) throw new Error("productName required");
      // 1) Image
      const imgResp = await fetch(AI_URL, {
        method: "POST",
        headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "google/gemini-3-pro-image-preview",
          messages: [{ role: "user", content: `Professional luxury product photo of "${productName}". ${details || ""}. Studio lighting, premium e-commerce style, dark elegant backdrop, sharp focus, no text.` }],
          modalities: ["image", "text"],
        }),
      });
      const imgJson = await imgResp.json();
      const imageUrl = imgJson.choices?.[0]?.message?.images?.[0]?.image_url?.url || null;

      // 2) Description
      const descData = await callAI({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You are a luxury copywriter for Lamra Lux boutique. Write seductive, premium product descriptions." },
          { role: "user", content: `Write a marketing description (≈80 words) and 5 SEO bullet points for: "${productName}". Style notes: ${details || "luxury, premium"}.` },
        ],
      }, LOVABLE_API_KEY);

      return new Response(JSON.stringify({
        imageUrl,
        description: descData.choices?.[0]?.message?.content,
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // ---------- Existing text-based insights ----------
    const prompts: Record<string, string> = {
      price_optimizer: `You are a pricing analyst for Lamra Lux boutique. Analyze these seller metrics and suggest optimal pricing. Metrics: Revenue ${metrics?.totalRevenue}, AOV ${metrics?.avgOrderValue}, Conversion ${metrics?.conversionRate}%. Inventory: ${JSON.stringify(inventory?.slice(0, 5))}. Give specific, actionable pricing advice in 3-4 sentences.`,
      revenue_forecast: `You are a revenue forecaster for Lamra Lux boutique. Based on: Revenue ${metrics?.totalRevenue}, Orders ${metrics?.totalOrders}, AOV ${metrics?.avgOrderValue}. Project the next 30 days revenue with reasoning. Be specific with numbers.`,
      sentiment: `You are a customer sentiment analyst for Lamra Lux. Based on ${metrics?.totalOrders} orders and ${metrics?.conversionRate}% conversion rate. Generate a "Vibe Score" and summarize likely customer sentiment. Suggest 2 improvements.`,
      restock: `You are an inventory intelligence AI for Lamra Lux. Analyze: ${JSON.stringify(inventory)}. Identify items that need restocking urgently. Predict seasonal demand spikes (Ramadan, Summer, Holidays). Give specific restock recommendations.`,
      discount_impact: `You are a discount strategy AI for Lamra Lux. Current metrics: Revenue ${metrics?.totalRevenue}, Conversion ${metrics?.conversionRate}%, AOV ${metrics?.avgOrderValue}. Predict the impact of running a 10% discount this weekend. Give specific predictions.`,
      ad_roi: `You are an advertising ROI analyst for Lamra Lux. With ${metrics?.totalViews} views and ${metrics?.conversionRate}% conversion, calculate theoretical ROI for featured placement. The AI advertising fee is 3%. Give specific recommendations.`,
      custom: `Seller asks: "${customPrompt}". Context: metrics=${JSON.stringify(metrics)}, inventory=${JSON.stringify(inventory?.slice(0,5))}. Reply concisely with actionable advice.`,
    };
    const prompt = prompts[type] || "Provide general seller insights for a luxury marketplace.";
    const data = await callAI({
      model: "google/gemini-3-flash-preview",
      messages: [
        { role: "system", content: "You are an AI business analyst for Lamra Lux, a luxury smart-commerce marketplace. Give concise, data-driven insights." },
        { role: "user", content: prompt },
      ],
    }, LOVABLE_API_KEY);
    return new Response(JSON.stringify({ insight: data.choices?.[0]?.message?.content || "No insight generated." }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("seller-ai error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
