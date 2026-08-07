import { useState } from "react";
import { Sparkles, Send, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";

interface Props {
  metrics?: any;
  inventory?: any;
  unlocked: boolean;
  onUpgrade: () => void;
}

const AIInsightCommand = ({ metrics, inventory, unlocked, onUpgrade }: Props) => {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState(false);
  const [answer, setAnswer] = useState<string | null>(null);

  const ask = async () => {
    if (!q.trim()) return;
    if (!unlocked) { onUpgrade(); return; }
    setBusy(true); setAnswer(null);
    try {
      const { data, error } = await supabase.functions.invoke("seller-ai", {
        body: { type: "custom", prompt: q, metrics, inventory },
      });
      if (error) throw error;
      setAnswer(data?.insight || "No response.");
    } catch (e: any) {
      setAnswer("AI is temporarily unavailable.");
    } finally { setBusy(false); }
  };

  return (
    <>
      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-4 py-3 rounded-full bg-gradient-to-r from-gold to-primary text-primary-foreground shadow-[0_0_30px_-5px_hsl(var(--primary)/0.6)] hover:scale-105 transition-transform"
        aria-label="AI Insight"
      >
        <Sparkles className="w-4 h-4" /> AI Insight
      </button>
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-[360px] max-w-[90vw] bg-card border border-border rounded-xl shadow-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-display flex items-center gap-2 text-sm"><Sparkles className="w-4 h-4 text-gold" /> AI Insight Command</h3>
            <button onClick={() => setOpen(false)}><X className="w-4 h-4" /></button>
          </div>
          {!unlocked ? (
            <div className="text-sm space-y-2">
              <p className="text-muted-foreground">AI features are part of <span className="text-gold">Lamra Lux Pro</span>.</p>
              <Button variant="gold" size="sm" className="w-full" onClick={onUpgrade}>Unlock for $20/mo</Button>
            </div>
          ) : (
            <>
              <div className="flex gap-2">
                <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Ask anything about your store…" onKeyDown={(e) => e.key === "Enter" && ask()} />
                <Button size="icon" variant="gold" onClick={ask} disabled={busy}>
                  {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </Button>
              </div>
              {answer && <div className="text-sm text-foreground/90 bg-muted rounded-md p-2 max-h-60 overflow-y-auto whitespace-pre-wrap">{answer}</div>}
            </>
          )}
        </div>
      )}
    </>
  );
};

export default AIInsightCommand;
