import { useEffect, useState } from "react";
import { Gift, Copy, Check } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

export const useReferralCode = () => {
  const { user } = useAuth();
  const [code, setCode] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setCode(null);
      return;
    }
    supabase
      .from("profiles")
      .select("referral_code")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => setCode((data as { referral_code?: string } | null)?.referral_code ?? null));
  }, [user]);

  return code;
};

export const buildInviteUrl = (code: string, productId?: string) => {
  const base = window.location.origin;
  return productId
    ? `${base}/product/${productId}?ref=${code}&refp=${encodeURIComponent(productId)}`
    : `${base}/?ref=${code}`;
};

interface Props {
  /** Product-specific invite: inviter earns $1 when the invited person buys this product */
  productId?: string;
  variant?: "button" | "inline";
  className?: string;
}

const InviteLink = ({ productId, variant = "button", className }: Props) => {
  const code = useReferralCode();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const handleInvite = async () => {
    if (!code) {
      toast({
        title: "Sign in to invite",
        description: "Create your free account to get your personal invite link.",
        variant: "destructive",
      });
      return;
    }
    const url = buildInviteUrl(code, productId);
    const text = productId
      ? `Take a look at this piece on Lamra Lux: ${url}`
      : `Shop Lamra Lux with my invite link: ${url}`;

    if (navigator.share) {
      try {
        await navigator.share({ title: "Lamra Lux", text, url });
        return;
      } catch {
        /* fall through to copy */
      }
    }
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: "Invite link copied",
      description: productId
        ? "You earn $1 in your e-wallet when your friend buys this item."
        : "You earn $1 for every 20 products your friends buy.",
    });
  };

  if (variant === "inline") {
    return (
      <button
        onClick={handleInvite}
        className={`inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-gold transition-colors ${className || ""}`}
      >
        {copied ? <Check className="w-4 h-4" /> : <Gift className="w-4 h-4" />}
        Invite &amp; earn $1
      </button>
    );
  }

  return (
    <Button variant="outline" className={className} onClick={handleInvite}>
      {copied ? <Check className="w-4 h-4 mr-2" /> : <Gift className="w-4 h-4 mr-2" />}
      Invite &amp; earn $1
    </Button>
  );
};

export default InviteLink;
