import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Gift, X, Calendar, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface GiftOccasionPromptProps {
  isOpen: boolean;
  onClose: () => void;
  items: Array<{ id: string; name: string }>;
}

const occasions = [
  "Birthday", "Anniversary", "Valentine's Day", "Mother's Day",
  "Father's Day", "Wedding", "Graduation", "Holiday", "Just Because", "Other"
];

const GiftOccasionPrompt = ({ isOpen, onClose, items }: GiftOccasionPromptProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isGift, setIsGift] = useState<boolean | null>(null);
  const [occasion, setOccasion] = useState("");
  const [occasionDate, setOccasionDate] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveReminder = async () => {
    if (!user || !occasion || !occasionDate) return;
    setIsSaving(true);

    try {
      const reminders = items.map((item) => ({
        user_id: user.id,
        occasion_name: occasion,
        occasion_date: occasionDate,
        product_id: item.id,
        product_name: item.name,
        recipient_name: recipientName || null,
      }));

      const { error } = await supabase.from("reminders").insert(reminders);
      if (error) throw error;

      toast({
        title: "Reminder Set! 🎁",
        description: `We'll remind you about this occasion next year with perfect gift suggestions.`,
      });
      onClose();
    } catch (err: any) {
      console.error("Reminder error:", err);
      toast({ title: "Error", description: "Failed to save reminder", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="w-full max-w-md bg-card rounded-2xl border border-border shadow-2xl p-6"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Gift className="w-5 h-5 text-gold" />
              <h2 className="font-display text-lg text-foreground">Is this a gift?</h2>
            </div>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
              <X className="w-5 h-5" />
            </button>
          </div>

          {isGift === null && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground font-body">
                Let us remember this occasion so we can suggest the perfect complementary gift next year!
              </p>
              <div className="flex gap-3">
                <Button variant="gold" className="flex-1" onClick={() => setIsGift(true)}>
                  <Gift className="w-4 h-4 mr-2" /> Yes, it's a gift!
                </Button>
                <Button variant="outline" className="flex-1" onClick={onClose}>
                  No, it's for me
                </Button>
              </div>
            </div>
          )}

          {isGift && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label className="text-sm">What's the occasion?</Label>
                <div className="flex flex-wrap gap-2">
                  {occasions.map((o) => (
                    <button
                      key={o}
                      onClick={() => setOccasion(o)}
                      className={`px-3 py-1.5 rounded-full text-xs font-body transition-all ${
                        occasion === o
                          ? "bg-gold text-primary-foreground"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      }`}
                    >
                      {o}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> Occasion Date
                </Label>
                <Input
                  type="date"
                  value={occasionDate}
                  onChange={(e) => setOccasionDate(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm flex items-center gap-1">
                  <UserIcon className="w-3 h-3" /> Recipient's Name (optional)
                </Label>
                <Input
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder="e.g. Mom, Ahmed, Sara..."
                />
              </div>

              <Button
                variant="gold"
                className="w-full"
                onClick={handleSaveReminder}
                disabled={!occasion || !occasionDate || isSaving}
              >
                {isSaving ? "Saving..." : "Set Reminder 🔔"}
              </Button>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default GiftOccasionPrompt;
