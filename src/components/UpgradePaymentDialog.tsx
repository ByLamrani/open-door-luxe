import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Wallet, CreditCard, Sparkles, Loader2 } from "lucide-react";
import PayPalButton from "@/components/payments/PayPalButton";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  tier: "buyer_pro" | "seller_pro";
  amount: number;
  onActivated?: () => void;
}

const UpgradePaymentDialog = ({ open, onOpenChange, tier, amount, onActivated }: Props) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [method, setMethod] = useState<"wallet" | "card" | "paypal" | null>(null);
  const [walletBalance, setWalletBalance] = useState(0);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open || !user) return;
    setMethod(null);
    supabase.from("wallets").select("balance").eq("user_id", user.id).maybeSingle()
      .then(({ data }) => setWalletBalance(Number(data?.balance ?? 0)));
  }, [open, user]);

  const activate = async (paymentRef?: string) => {
    const { error } = await supabase.rpc("activate_subscription" as any, { _tier: tier, _months: 1 });
    if (error) throw error;
    await supabase.from("subscription_payments" as any).insert({
      user_id: user!.id, tier, amount, status: "completed",
      paypal_capture_id: paymentRef ?? null,
    });
    toast({ title: "Subscription activated 🎉", description: `Lamra Lux Club ${tier === "seller_pro" ? "Pro" : ""} is now active.` });
    onActivated?.();
    onOpenChange(false);
  };

  const payWithWallet = async () => {
    if (!user) return;
    if (walletBalance < amount) {
      toast({ title: "Insufficient balance", description: `You need $${amount} but only have $${walletBalance.toFixed(2)}.`, variant: "destructive" });
      return;
    }
    setBusy(true);
    try {
      const { data: w } = await supabase.from("wallets").select("id, balance").eq("user_id", user.id).single();
      await supabase.from("wallets").update({ balance: Number(w!.balance) - amount }).eq("user_id", user.id);
      await supabase.from("wallet_transactions").insert({
        wallet_id: w!.id, amount: -amount, transaction_type: "subscription",
        description: `Lamra Lux Club ${tier} (1 month)`,
      });
      await activate("wallet");
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally { setBusy(false); }
  };

  const payWithStripe = async () => {
    setBusy(true);
    try {
      const { data, error } = await supabase.functions.invoke("stripe-create-checkout", {
        body: { tier, amount, productName: `Lamra Lux Club ${tier === "seller_pro" ? "Pro" : ""} (1 month)` },
      });
      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      } else if (data?.activated) {
        await activate("stripe-test");
      } else {
        throw new Error(data?.error || "Stripe checkout unavailable");
      }
    } catch (e: any) {
      toast({
        title: "Stripe not configured",
        description: "Add your Stripe API key under Profile → APIs to enable card payments.",
        variant: "destructive",
      });
    } finally { setBusy(false); }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-gold" /> Choose Payment Method
          </DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">Total due: <span className="text-foreground font-semibold">${amount}.00 / month</span></p>

        {!method && (
          <div className="space-y-2">
            <button onClick={() => setMethod("wallet")} className="w-full flex items-center justify-between p-4 rounded-lg border border-border hover:border-gold/50 transition-all">
              <div className="flex items-center gap-3"><Wallet className="w-5 h-5 text-primary" /><div className="text-left"><p className="font-display text-sm">Account Balance</p><p className="text-xs text-muted-foreground">${walletBalance.toFixed(2)} available</p></div></div>
              <span className="text-xs text-gold">Use →</span>
            </button>
            <button onClick={() => setMethod("card")} className="w-full flex items-center justify-between p-4 rounded-lg border border-border hover:border-gold/50 transition-all">
              <div className="flex items-center gap-3"><CreditCard className="w-5 h-5 text-primary" /><p className="font-display text-sm">Credit / Debit Card (Stripe)</p></div>
              <span className="text-xs text-gold">Use →</span>
            </button>
            <button onClick={() => setMethod("paypal")} className="w-full flex items-center justify-between p-4 rounded-lg border border-border hover:border-gold/50 transition-all">
              <div className="flex items-center gap-3"><span className="font-bold text-blue-400">PayPal</span></div>
              <span className="text-xs text-gold">Use →</span>
            </button>
          </div>
        )}

        {method === "wallet" && (
          <div className="space-y-3">
            <p className="text-sm">Pay <strong>${amount}</strong> from your wallet (Balance: ${walletBalance.toFixed(2)}).</p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setMethod(null)} disabled={busy}>Back</Button>
              <Button variant="gold" className="flex-1" onClick={payWithWallet} disabled={busy}>
                {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : `Pay $${amount} from Wallet`}
              </Button>
            </div>
          </div>
        )}

        {method === "card" && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">You will be redirected to a secure Stripe Checkout page.</p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setMethod(null)} disabled={busy}>Back</Button>
              <Button variant="gold" className="flex-1" onClick={payWithStripe} disabled={busy}>
                {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : "Continue with Stripe"}
              </Button>
            </div>
          </div>
        )}

        {method === "paypal" && (
          <div className="space-y-3">
            <PayPalButton
              buildOrderInput={() => ({
                orderId: crypto.randomUUID(),
                currency: "USD",
                items: [{ name: `Lamra Lux Club ${tier} (1 month)`, amount, quantity: 1 }],
                totalAmount: amount,
                mode: "topup",
              })}
              onApproved={async (r) => {
                if (r.status === "COMPLETED") await activate(r.captureId);
                else toast({ title: "Payment pending", description: "Activation will follow capture." });
              }}
              onError={(e) => toast({ title: "PayPal error", description: String((e as any)?.message || e), variant: "destructive" })}
            />
            <Button variant="outline" onClick={() => setMethod(null)}>Back</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default UpgradePaymentDialog;
