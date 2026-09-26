import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Sparkles, X, Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface Suggestion {
  name: string;
  reason: string;
  category: string;
}

interface SearchResult {
  interpretation: string;
  categories: string[];
  mood_tags: string[];
  suggestions: Suggestion[];
}

const categoryRoutes: Record<string, string> = {
  "Fragrances": "/fragrances",
  "Self-Care": "/self-care",
  "Air Diffusers": "/air-diffusers",
  "Watches": "/watches",
  "For Men": "/fragrances/men",
  "For Women": "/fragrances/women",
};

const ScentSentimentSearch = () => {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [result, setResult] = useState<SearchResult | null>(null);
  const navigate = useNavigate();

  const placeholders = [
    "Something that smells like a cold morning in the Atlas Mountains...",
    "A fragrance for a high-stakes business meeting...",
    "Something cozy for a rainy Sunday afternoon...",
    "A gift that says 'I appreciate you'...",
    "The confidence of a fresh start...",
  ];
  const [placeholder] = useState(placeholders[Math.floor(Math.random() * placeholders.length)]);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setIsOpen(false);
    navigate(`/feeling-search?q=${encodeURIComponent(query.trim())}`);
  };

  const navigateToCategory = (category: string) => {
    const route = categoryRoutes[category] || `/collections`;
    navigate(route);
    setIsOpen(false);
  };

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-card/50 hover:bg-card text-muted-foreground hover:text-foreground transition-all group"
      >
        <Sparkles className="w-4 h-4 text-gold group-hover:animate-pulse" />
        <span className="text-sm font-body">Search by feeling...</span>
      </button>

      {/* Search Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-background/80 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className="w-full max-w-2xl bg-card rounded-2xl border border-border shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="p-6 border-b border-border">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-gold" />
                    <h2 className="font-display text-lg text-foreground">Scent Sentiment Search</h2>
                  </div>
                  <button onClick={() => setIsOpen(false)} className="text-muted-foreground hover:text-foreground">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-sm text-muted-foreground font-body mb-4">
                  Describe a feeling, mood, or occasion — our AI will find the perfect match.
                </p>
                <div className="flex gap-2">
                  <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={placeholder}
                    className="flex-1"
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    autoFocus
                  />
                  <Button variant="gold" onClick={handleSearch} disabled={isSearching || !query.trim()}>
                    {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              {/* Results */}
              <div className="max-h-[60vh] overflow-y-auto">
                {isSearching && (
                  <div className="p-8 text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-gold mb-3" />
                    <p className="text-muted-foreground font-body text-sm">Analyzing your sentiment...</p>
                  </div>
                )}

                {result && (
                  <div className="p-6 space-y-4">
                    {/* Interpretation */}
                    <div className="bg-gold/5 border border-gold/20 rounded-lg p-4">
                      <p className="text-sm font-body text-foreground">
                        <span className="text-gold font-semibold">AI Insight: </span>
                        {result.interpretation}
                      </p>
                    </div>

                    {/* Mood Tags */}
                    {result.mood_tags?.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {result.mood_tags.map((tag, i) => (
                          <span key={i} className="px-3 py-1 rounded-full text-xs bg-muted text-muted-foreground font-body">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Suggestions */}
                    {result.suggestions?.length > 0 && (
                      <div className="space-y-3">
                        <h3 className="font-display text-sm text-foreground">Recommended For You</h3>
                        {result.suggestions.map((suggestion, i) => (
                          <motion.button
                            key={i}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            onClick={() => navigateToCategory(suggestion.category)}
                            className="w-full flex items-center justify-between p-4 rounded-lg border border-border hover:border-gold/50 hover:bg-gold/5 transition-all text-left group"
                          >
                            <div>
                              <p className="font-display text-sm text-foreground">{suggestion.name}</p>
                              <p className="text-xs text-muted-foreground font-body mt-1">{suggestion.reason}</p>
                              <span className="text-xs text-gold font-body">{suggestion.category}</span>
                            </div>
                            <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-gold transition-colors" />
                          </motion.button>
                        ))}
                      </div>
                    )}

                    {/* Browse Categories */}
                    {result.categories?.length > 0 && (
                      <div>
                        <h3 className="font-display text-sm text-foreground mb-2">Browse Categories</h3>
                        <div className="flex flex-wrap gap-2">
                          {result.categories.map((cat, i) => (
                            <Button
                              key={i}
                              variant="outline"
                              size="sm"
                              onClick={() => navigateToCategory(cat)}
                              className="text-xs"
                            >
                              {cat}
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ScentSentimentSearch;
