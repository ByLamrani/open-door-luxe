import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { wristSize, productName, productDescription, action } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    if (action === "fit-check") {
      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            {
              role: "system",
              content: `You are an expert horologist (watch specialist) for "VANTA by Lamrani" luxury watch store. You help customers with watch sizing and fit advice.

Given a wrist circumference in cm, provide:
1. Whether the watch will fit well
2. How many links might need to be removed (standard link = ~1cm, most watches come with 20-22cm band)
3. Which strap hole they'd likely use (for leather straps, holes are ~1cm apart, starting at ~16cm)
4. Comfort tips
5. Any maintenance advice

Standard watch sizes:
- Small: 36-38mm case, fits 14-16cm wrists
- Medium: 39-42mm case, fits 16-19cm wrists  
- Large: 43-46mm case, fits 19-22cm wrists

Be concise, professional, and luxury-oriented in tone.`
            },
            {
              role: "user",
              content: `My wrist circumference is ${wristSize}cm. I'm looking at the "${productName}". ${productDescription ? `Product details: ${productDescription}` : ''} Can you do a fit-check and give me sizing advice?`
            }
          ],
        }),
      });

      if (!response.ok) {
        const t = await response.text();
        console.error("AI error:", response.status, t);
        return new Response(JSON.stringify({ error: "AI horologist failed" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const data = await response.json();
      const advice = data.choices?.[0]?.message?.content || "Unable to provide advice at this time.";

      return new Response(JSON.stringify({ advice }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "ask") {
      const { question } = await req.json();
      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            {
              role: "system",
              content: `You are an expert horologist for "VANTA by Lamrani". Answer questions about watch care, maintenance, sizing, and technical details. Be concise and professional.`
            },
            { role: "user", content: question }
          ],
        }),
      });

      if (!response.ok) {
        return new Response(JSON.stringify({ error: "AI failed" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const data = await response.json();
      return new Response(JSON.stringify({ answer: data.choices?.[0]?.message?.content }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Invalid action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("watch-horologist error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
