import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Wallet, Plus } from "lucide-react";
import PayPalButton from "@/components/payments/PayPalButton";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const WalletTopUp = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [amount, setAmount] = useState<number>(50);
  const [balance, setBalance] = useState<number>(0);
  const [showPay, setShowPay] = useState(false);

  const refresh = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("wallets")
      .select("balance")
      .eq("user_id", user.id)
      .maybeSingle();
    setBalance(Number(data?.balance ?? 0));
  };

  useEffect(() => {
    refresh();
  }, [user]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5 text-primary" /> Wallet Top-up
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground">
          Current balance:{" "}
          <span className="text-foreground font-semibold">${balance.toFixed(2)}</span>
        </div>
        <div className="space-y-2">
          <Label htmlFor="topup-amount">Amount (USD)</Label>
          <Input
            id="topup-amount"
            type="number"
            min={5}
            step={5}
            value={amount}
            onChange={(e) => {
              setAmount(Math.max(5, Number(e.target.value) || 0));
              setShowPay(false);
            }}
          />
        </div>
        {!showPay ? (
          <Button onClick={() => setShowPay(true)} disabled={!amount || amount < 5}>
            <Plus className="h-4 w-4 mr-2" /> Top-up with PayPal
          </Button>
        ) : (
          <PayPalButton
            buildOrderInput={() => ({
              orderId: crypto.randomUUID(),
              currency: "USD",
              items: [{ name: "Wallet top-up", amount, quantity: 1 }],
              totalAmount: amount,
              mode: "topup",
            })}
            onApproved={async (r) => {
              if (r.status === "COMPLETED") {
                toast({ title: "Top-up successful", description: `$${r.amount.toFixed(2)} added.` });
                setShowPay(false);
                await refresh();
              } else {
                toast({ title: "Top-up pending", description: "We'll credit your wallet once confirmed." });
              }
            }}
            onError={(e) =>
              toast({
                title: "Payment failed",
                description: String((e as any)?.message || e),
                variant: "destructive",
              })
            }
          />
        )}
      </CardContent>
    </Card>
  );
};

export default WalletTopUp;
