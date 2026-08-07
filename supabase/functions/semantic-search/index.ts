import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { query, action } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    if (action === "search") {
      // Use AI to interpret the feeling/mood and find matching products
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
              content: `You are a luxury product recommendation AI for "Lamra Lux" store. The store sells:
- Fragrances (men's and women's perfumes, oud, floral, woody scents)
- Self-Care (professional trimmers, grooming kits, spa products, massage tools)
- Air Diffusers (reed diffusers, lavender, essential oil diffusers)
- Watches (luxury men's and women's watches)

When a user describes a feeling, mood, occasion, or vibe, recommend the most relevant product categories and describe what kind of products would match. 

Respond ONLY with a JSON object (no markdown) with this structure:
{
  "interpretation": "Brief interpretation of what the user is looking for",
  "categories": ["matching category names"],
  "mood_tags": ["relevant mood/feeling tags"],
  "suggestions": [
    {"name": "Product type suggestion", "reason": "Why this matches", "category": "Category name"}
  ]
}`
            },
            { role: "user", content: query }
          ],
          tools: [
            {
              type: "function",
              function: {
                name: "recommend_products",
                description: "Recommend products based on mood/feeling analysis",
                parameters: {
                  type: "object",
                  properties: {
                    interpretation: { type: "string", description: "Brief interpretation of user's mood/desire" },
                    categories: { type: "array", items: { type: "string" }, description: "Matching product categories" },
                    mood_tags: { type: "array", items: { type: "string" }, description: "Relevant mood tags" },
                    suggestions: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          name: { type: "string" },
                          reason: { type: "string" },
                          category: { type: "string" }
                        },
                        required: ["name", "reason", "category"]
                      }
                    }
                  },
                  required: ["interpretation", "categories", "mood_tags", "suggestions"]
                }
              }
            }
          ],
          tool_choice: { type: "function", function: { name: "recommend_products" } }
        }),
      });

      if (!response.ok) {
        const t = await response.text();
        console.error("AI error:", response.status, t);
        return new Response(JSON.stringify({ error: "AI search failed" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const data = await response.json();
      const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
      let result;
      if (toolCall) {
        result = JSON.parse(toolCall.function.arguments);
      } else {
        // Fallback: try to parse content as JSON
        try {
          result = JSON.parse(data.choices?.[0]?.message?.content || "{}");
        } catch {
          result = { interpretation: "Could not interpret your request", categories: [], mood_tags: [], suggestions: [] };
        }
      }

      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Invalid action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("semantic-search error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
