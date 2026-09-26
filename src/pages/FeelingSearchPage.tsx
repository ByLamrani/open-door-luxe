import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Loader2, Sparkles, Search } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { products as allProducts, Product } from "@/data/products";

interface Result {
  interpretation: string;
  categories: string[];
  mood_tags: string[];
  suggestions: { name: string; reason: string; category: string }[];
}

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9 ]/g, " ");

const FeelingSearchPage = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const q = params.get("q") || "";
  const [input, setInput] = useState(q);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [items, setItems] = useState<Product[]>([]);

  useEffect(() => {
    setInput(q);
    if (!q.trim()) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      setResult(null);
      setItems([]);
      const [{ data }, { data: db }] = await Promise.all([
        supabase.functions.invoke("semantic-search", { body: { query: q, action: "search" } }),
        supabase.from("products").select("*"),
      ]);
      if (cancelled) return;
      const res = (data as Result) || null;
      setResult(res);
      const pool: Product[] = [
        ...allProducts,
        ...((db as any[]) ?? []).map((p) => ({
          id: p.id, name: p.name, price: Number(p.price), image: p.image || "", images: p.image ? [p.image] : [],
          category: p.category || "", subcategory: p.subcategory || undefined, description: p.description || "",
        })),
      ];
      const cats = new Set([
        ...(res?.categories ?? []),
        ...(res?.suggestions ?? []).map((s) => s.category),
      ].map((c) => c.toLowerCase()));
      const words = norm([q, ...(res?.mood_tags ?? []), ...(res?.suggestions ?? []).map((s) => s.name)].join(" "))
        .split(" ").filter((w) => w.length > 3);
      const scored = pool
        .map((p) => {
          let score = 0;
          if (cats.has(p.category.toLowerCase())) score += 3;
          if (p.subcategory && cats.has(p.subcategory.toLowerCase())) score += 2;
          const hay = norm(`${p.name} ${p.description} ${p.subcategory ?? ""}`);
          words.forEach((w) => { if (hay.includes(w)) score += 1; });
          return { p, score };
        })
        .filter((x) => x.score > 0)
        .sort((a, b) => b.score - a.score)
        .map((x) => x.p);
      setItems(scored.slice(0, 24));
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [q]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 pt-28 pb-16">
        <div className="max-w-3xl mx-auto text-center mb-10">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Sparkles className="w-5 h-5" />
            <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Search by feeling</span>
          </div>
          <h1 className="font-display text-3xl md:text-4xl mb-6">“{q}”</h1>
          <form
            className="flex gap-2"
            onSubmit={(e) => { e.preventDefault(); if (input.trim()) navigate(`/feeling-search?q=${encodeURIComponent(input.trim())}`); }}
          >
            <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Describe a feeling, mood or occasion…" />
            <Button type="submit"><Search className="w-4 h-4" /></Button>
          </form>
        </div>

        {loading && (
          <div className="py-20 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Analyzing your feeling…</p>
          </div>
        )}

        {result && !loading && (
          <>
            <div className="max-w-3xl mx-auto border border-border rounded-lg p-4 mb-6 text-sm">
              <span className="font-semibold">AI Insight: </span>{result.interpretation}
              {result.mood_tags?.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {result.mood_tags.map((t) => (
                    <span key={t} className="px-3 py-1 rounded-full text-xs bg-muted text-muted-foreground">{t}</span>
                  ))}
                </div>
              )}
            </div>
            <h2 className="font-display text-xl mb-4">{items.length} products matching your feeling</h2>
            {items.length === 0 ? (
              <p className="text-muted-foreground">No matching products — try describing it differently.</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {items.map((p) => (
                  <ProductCard key={p.id} id={p.id} name={p.name} price={p.price} image={p.image} category={p.category} isNew={p.isNew} />
                ))}
              </div>
            )}
          </>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default FeelingSearchPage;
