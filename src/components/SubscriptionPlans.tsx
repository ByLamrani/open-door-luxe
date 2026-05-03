import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Sparkles, Bot, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export type SubscriptionTier = "free" | "seller_pro" | "buyer_pro";

interface Props {
  accountType: "buyer" | "seller" | "shipping_company";
  onSelected?: (tier: SubscriptionTier) => void;
  showSkip?: boolean;
}

const SubscriptionPlans = ({ accountType, onSelected, showSkip }: Props) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState<SubscriptionTier | null>(null);

  const isSellerLike = accountType === "seller" || accountType === "shipping_company";

  const plans = [
    {
      tier: "free" as SubscriptionTier,
      name: "Free",
      price: 0,
      tagline: "Basic access",
      icon: Check,
      features: [
        "Browse & shop the full marketplace",
        "Standard cart, wallet & checkout",
        "Order tracking & gift reminders",
        isSellerLike ? "Manual dashboard & listings" : "Manual favorites & alerts",
      ],
    },
    isSellerLike
      ? {
          tier: "seller_pro" as SubscriptionTier,
          name: "Vanta Connect Pro",
          price: 20,
          tagline: "AI + API for sellers & companies",
          icon: Zap,
          highlight: true,
          features: [
            "Link external APIs (markets, NYSE, trading platforms)",
            "AI dashboard analytics + sales strategy suggestions",
            "AI document analysis & insights",
            "Global e-commerce market intelligence",
            "Interactive AI Chatbot",
          ],
        }
      : {
          tier: "buyer_pro" as SubscriptionTier,
          name: "Vanta Connect",
          price: 9,
          tagline: "Personal AI shopping assistant",
          icon: Bot,
          highlight: true,
          features: [
            "AI Chatbot for personalized shopping",
            "Smart 'New Arrivals' reminders by your schedule",
            "WhatsApp confirm-to-buy: AI completes purchases for you",
            "Preference-based curation",
          ],
        },
  ];

  const handleSelect = async (tier: SubscriptionTier, price: number) => {
    if (tier === "free") {
      onSelected?.(tier);
      return;
    }
    setLoading(tier);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({ title: "Please sign in first", variant: "destructive" });
        return;
      }
      // Record pending subscription payment, activation happens after PayPal capture
      const { error } = await supabase.from("subscription_payments" as any).insert({
        user_id: user.id,
        tier,
        amount: price,
        status: "pending",
      });
      if (error) throw error;
      // For now, immediately activate (PayPal flow can be wired identically to wallet top-up)
      const { error: actErr } = await supabase.rpc("activate_subscription" as any, { _tier: tier, _months: 1 });
      if (actErr) throw actErr;
      toast({ title: "Subscription activated 🎉", description: `${tier === "seller_pro" ? "Vanta Connect Pro" : "Vanta Connect"} is now active.` });
      onSelected?.(tier);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-center mb-2">
        <h2 className="font-display text-2xl text-foreground flex items-center justify-center gap-2">
          <Sparkles className="w-5 h-5 text-gold" />
          Choose Your Plan
        </h2>
        <p className="text-sm text-muted-foreground mt-1">Start free or unlock AI-powered features</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {plans.map((plan: any) => (
          <motion.div
            key={plan.tier}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`relative p-5 rounded-xl border ${
              plan.highlight
                ? "border-gold bg-gradient-to-br from-gold/5 to-transparent shadow-[0_0_30px_-10px_hsl(var(--primary)/0.4)]"
                : "border-border bg-card"
            }`}
          >
            {plan.highlight && (
              <span className="absolute -top-2 right-4 text-[10px] bg-gold text-primary-foreground px-2 py-0.5 rounded-full font-semibold">
                AI-ENABLED
              </span>
            )}
            <div className="flex items-center gap-2 mb-1">
              <plan.icon className="w-5 h-5 text-gold" />
              <h3 className="font-display text-lg">{plan.name}</h3>
            </div>
            <p className="text-xs text-muted-foreground mb-3">{plan.tagline}</p>
            <p className="font-display text-3xl mb-4">
              ${plan.price}
              <span className="text-sm text-muted-foreground font-body">{plan.price > 0 ? "/month" : ""}</span>
            </p>
            <ul className="space-y-2 mb-5 min-h-[140px]">
              {plan.features.map((f: string) => (
                <li key={f} className="flex items-start gap-2 text-sm text-foreground/80">
                  <Check className="w-4 h-4 text-gold shrink-0 mt-0.5" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <Button
              variant={plan.highlight ? "gold" : "outline"}
              className="w-full"
              disabled={loading === plan.tier}
              onClick={() => handleSelect(plan.tier, plan.price)}
            >
              {loading === plan.tier ? "Processing..." : plan.price === 0 ? "Continue Free" : `Subscribe $${plan.price}/mo`}
            </Button>
          </motion.div>
        ))}
      </div>

      {showSkip && (
        <button
          onClick={() => onSelected?.("free")}
          className="w-full text-center text-sm text-muted-foreground hover:text-gold transition-colors mt-2"
        >
          Skip for now — I'll choose later
        </button>
      )}
    </div>
  );
};

export default SubscriptionPlans;
