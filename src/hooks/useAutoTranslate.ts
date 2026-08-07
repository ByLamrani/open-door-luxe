import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";

const CACHE_PREFIX = "lamralux_tr_v1:";

const cacheKey = (lang: string, text: string) => `${CACHE_PREFIX}${lang}:${text}`;

const readCache = (lang: string, text: string) => {
  try {
    return localStorage.getItem(cacheKey(lang, text));
  } catch {
    return null;
  }
};

const writeCache = (lang: string, text: string, value: string) => {
  try {
    localStorage.setItem(cacheKey(lang, text), value);
  } catch {
    /* quota — ignore */
  }
};

/**
 * Translates dynamic content (product names, descriptions, blurbs) into the
 * active UI language. Results are cached in localStorage so each string is
 * translated once per language.
 */
export function useAutoTranslate(texts: (string | undefined)[]): string[] {
  const { i18n } = useTranslation();
  const lang = (i18n.resolvedLanguage || i18n.language || "en").split("-")[0];
  const source = texts.map((t) => t ?? "");
  const [output, setOutput] = useState<string[]>(source);

  const signature = JSON.stringify(source);

  useEffect(() => {
    const list: string[] = JSON.parse(signature);

    if (lang === "en") {
      setOutput(list);
      return;
    }

    // Serve from cache immediately
    const cached = list.map((text) => (text ? readCache(lang, text) : ""));
    setOutput(list.map((text, i) => cached[i] ?? text));

    const missing = list.filter((text, i) => text && !cached[i]);
    if (missing.length === 0) return;

    let cancelled = false;
    (async () => {
      try {
        const { data } = await supabase.functions.invoke("translate", {
          body: { texts: missing, target: lang },
        });
        const translations: string[] = data?.translations ?? [];
        if (translations.length !== missing.length) return;
        missing.forEach((text, i) => writeCache(lang, text, translations[i]));
        if (cancelled) return;
        setOutput(list.map((text) => (text ? readCache(lang, text) ?? text : text)));
      } catch {
        /* keep originals */
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [signature, lang]);

  return output;
}

export function useAutoTranslateText(text?: string): string {
  return useAutoTranslate([text])[0];
}
