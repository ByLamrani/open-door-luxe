// Batch translation endpoint used to localise dynamic content (product names,
// descriptions, category blurbs) into the active site language.
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const LANG_NAMES: Record<string, string> = {
  en: "English",
  fr: "French",
  ar: "Arabic",
  es: "Spanish",
  ru: "Russian",
  de: "German",
  zh: "Simplified Chinese",
  ja: "Japanese",
  ko: "Korean",
  nl: "Dutch",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { texts, target } = await req.json();
    const list: string[] = Array.isArray(texts) ? texts.filter((t) => typeof t === "string") : [];
    const langName = LANG_NAMES[target] ?? "English";

    if (list.length === 0 || target === "en") {
      return new Response(JSON.stringify({ translations: list }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) throw new Error("Missing LOVABLE_API_KEY");

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content:
              `You are a translation engine for a Moroccan luxury boutique. Translate each string into ${langName}. ` +
              `Keep the brand name "Lamra Lux" untouched. Preserve tone and length. ` +
              `Reply with ONLY a JSON array of translated strings, same order and same length as the input array.`,
          },
          { role: "user", content: JSON.stringify(list) },
        ],
      }),
    });

    if (res.status === 429 || res.status === 402) {
      return new Response(JSON.stringify({ translations: list }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await res.json();
    const raw: string = data?.choices?.[0]?.message?.content ?? "[]";
    const cleaned = raw.replace(/```json|```/g, "").trim();
    let translations: string[] = list;
    try {
      const parsed = JSON.parse(cleaned);
      if (Array.isArray(parsed) && parsed.length === list.length) translations = parsed.map(String);
    } catch {
      // keep originals
    }

    return new Response(JSON.stringify({ translations }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("translate error", e);
    return new Response(JSON.stringify({ translations: [], error: String((e as Error).message) }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
