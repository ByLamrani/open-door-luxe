import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Watch, Ruler, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import ReactMarkdown from "react-markdown";

interface WatchFitCheckProps {
  productName: string;
  productDescription: string;
}

const WatchFitCheck = ({ productName, productDescription }: WatchFitCheckProps) => {
  const [wristSize, setWristSize] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [advice, setAdvice] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const handleFitCheck = async () => {
    const size = parseFloat(wristSize);
    if (!size || size < 10 || size > 30) return;

    setIsChecking(true);
    setAdvice(null);

    try {
      const { data, error } = await supabase.functions.invoke("watch-horologist", {
        body: { wristSize: size, productName, productDescription, action: "fit-check" },
      });

      if (error) throw error;
      setAdvice(data.advice);
    } catch (err: any) {
      console.error("Fit check error:", err);
      setAdvice("Unable to perform fit check at this time. Please try again.");
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center">
            <Watch className="w-5 h-5 text-gold" />
          </div>
          <div className="text-left">
            <p className="font-display text-sm text-foreground">AI Fit-Check</p>
            <p className="text-xs text-muted-foreground font-body">Get personalized sizing advice</p>
          </div>
        </div>
        <Sparkles className="w-4 h-4 text-gold" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 pt-0 space-y-4">
              <div className="flex items-end gap-3">
                <div className="flex-1 space-y-1">
                  <label className="text-xs text-muted-foreground font-body flex items-center gap-1">
                    <Ruler className="w-3 h-3" /> Wrist circumference (cm)
                  </label>
                  <Input
                    type="number"
                    value={wristSize}
                    onChange={(e) => setWristSize(e.target.value)}
                    placeholder="e.g. 17.5"
                    min="10"
                    max="30"
                    step="0.5"
                  />
                </div>
                <Button
                  variant="gold"
                  size="sm"
                  onClick={handleFitCheck}
                  disabled={isChecking || !wristSize}
                >
                  {isChecking ? <Loader2 className="w-4 h-4 animate-spin" /> : "Check Fit"}
                </Button>
              </div>

              {advice && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-muted/50 rounded-lg p-4"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-gold" />
                    <span className="font-display text-sm text-foreground">AI Horologist Advice</span>
                  </div>
                  <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground font-body text-sm">
                    <ReactMarkdown>{advice}</ReactMarkdown>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WatchFitCheck;
