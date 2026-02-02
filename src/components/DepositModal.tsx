import { useState } from "react";
import { X, CreditCard, Lock, ArrowLeft, CheckCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (amount: number) => Promise<void>;
  type: "deposit" | "withdraw";
  currentBalance?: number;
}

const DepositModal = ({ isOpen, onClose, onSuccess, type, currentBalance = 0 }: DepositModalProps) => {
  const { toast } = useToast();
  const [step, setStep] = useState<"amount" | "card" | "verify" | "success">("amount");
  const [amount, setAmount] = useState("");
  const [cardDetails, setCardDetails] = useState({
    name: "",
    number: "",
    expiry: "",
    cvv: "",
  });
  const [verificationCode, setVerificationCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [generatedCode] = useState(() => Math.random().toString().slice(2, 8));

  const handleAmountSubmit = () => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      toast({ title: "Invalid Amount", description: "Please enter a valid amount", variant: "destructive" });
      return;
    }
    if (type === "withdraw" && numAmount > currentBalance) {
      toast({ title: "Insufficient Balance", description: "You don't have enough funds", variant: "destructive" });
      return;
    }
    setStep("card");
  };

  const handleCardSubmit = () => {
    if (!cardDetails.name || !cardDetails.number || !cardDetails.expiry || !cardDetails.cvv) {
      toast({ title: "Missing Information", description: "Please fill in all card details", variant: "destructive" });
      return;
    }
    if (cardDetails.number.replace(/\s/g, "").length < 16) {
      toast({ title: "Invalid Card", description: "Please enter a valid card number", variant: "destructive" });
      return;
    }
    // Send verification code (simulated)
    toast({ title: "Verification Code Sent", description: `Code: ${generatedCode} (for demo)` });
    setStep("verify");
  };

  const handleVerify = async () => {
    if (verificationCode !== generatedCode) {
      toast({ title: "Invalid Code", description: "The verification code is incorrect", variant: "destructive" });
      return;
    }
    
    setIsLoading(true);
    try {
      await onSuccess(parseFloat(amount));
      setStep("success");
    } catch (error) {
      toast({ title: "Error", description: "Transaction failed. Please try again.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setStep("amount");
    setAmount("");
    setCardDetails({ name: "", number: "", expiry: "", cvv: "" });
    setVerificationCode("");
    onClose();
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    return parts.length ? parts.join(" ") : value;
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    if (v.length >= 2) {
      return v.substring(0, 2) + "/" + v.substring(2, 4);
    }
    return v;
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="font-display text-xl flex items-center gap-2">
            {type === "deposit" ? (
              <>
                <CreditCard className="w-5 h-5 text-green-500" />
                Deposit Funds
              </>
            ) : (
              <>
                <CreditCard className="w-5 h-5 text-red-500" />
                Withdraw Funds
              </>
            )}
          </DialogTitle>
        </DialogHeader>

        {/* Step 1: Amount */}
        {step === "amount" && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Amount (USD)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="pl-8 text-lg"
                />
              </div>
              {type === "withdraw" && (
                <p className="text-sm text-muted-foreground">
                  Available balance: <span className="text-gold">${currentBalance.toFixed(2)}</span>
                </p>
              )}
            </div>
            <div className="flex gap-2">
              {[10, 25, 50, 100].map((preset) => (
                <Button
                  key={preset}
                  variant="outline"
                  size="sm"
                  onClick={() => setAmount(preset.toString())}
                  className="flex-1"
                >
                  ${preset}
                </Button>
              ))}
            </div>
            <Button variant="gold" className="w-full" onClick={handleAmountSubmit}>
              Continue
            </Button>
          </div>
        )}

        {/* Step 2: Card Details */}
        {step === "card" && (
          <div className="space-y-4">
            <button
              onClick={() => setStep("amount")}
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>

            <div className="p-4 bg-gradient-to-r from-gold-light to-gold rounded-lg text-primary-foreground">
              <p className="text-sm opacity-80">
                {type === "deposit" ? "Deposit" : "Withdraw"} Amount
              </p>
              <p className="font-display text-2xl">${parseFloat(amount).toFixed(2)}</p>
            </div>

            <div className="space-y-3">
              <div className="space-y-2">
                <Label>Name on Card</Label>
                <Input
                  placeholder="John Doe"
                  value={cardDetails.name}
                  onChange={(e) => setCardDetails({ ...cardDetails, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Card Number</Label>
                <Input
                  placeholder="1234 5678 9012 3456"
                  value={cardDetails.number}
                  onChange={(e) => setCardDetails({ ...cardDetails, number: formatCardNumber(e.target.value) })}
                  maxLength={19}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Expiry Date</Label>
                  <Input
                    placeholder="MM/YY"
                    value={cardDetails.expiry}
                    onChange={(e) => setCardDetails({ ...cardDetails, expiry: formatExpiry(e.target.value) })}
                    maxLength={5}
                  />
                </div>
                <div className="space-y-2">
                  <Label>CVV</Label>
                  <Input
                    placeholder="123"
                    type="password"
                    value={cardDetails.cvv}
                    onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value.replace(/\D/g, "").slice(0, 4) })}
                    maxLength={4}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Lock className="w-4 h-4" />
              Your payment information is secure and encrypted
            </div>

            <Button variant="gold" className="w-full" onClick={handleCardSubmit}>
              Continue to Verification
            </Button>
          </div>
        )}

        {/* Step 3: Verification */}
        {step === "verify" && (
          <div className="space-y-4">
            <button
              onClick={() => setStep("card")}
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>

            <div className="text-center py-4">
              <div className="w-16 h-16 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8 text-gold" />
              </div>
              <h3 className="font-display text-lg mb-2">Enter Verification Code</h3>
              <p className="text-sm text-muted-foreground">
                We've sent a 6-digit code to your registered phone/email
              </p>
            </div>

            <Input
              placeholder="Enter 6-digit code"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              className="text-center text-2xl tracking-widest"
              maxLength={6}
            />

            <Button
              variant="gold"
              className="w-full"
              onClick={handleVerify}
              disabled={verificationCode.length !== 6 || isLoading}
            >
              {isLoading ? "Processing..." : `Confirm ${type === "deposit" ? "Deposit" : "Withdrawal"}`}
            </Button>
          </div>
        )}

        {/* Step 4: Success */}
        {step === "success" && (
          <div className="text-center py-8">
            <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
            <h3 className="font-display text-xl mb-2">
              {type === "deposit" ? "Deposit Successful!" : "Withdrawal Successful!"}
            </h3>
            <p className="text-muted-foreground mb-6">
              ${parseFloat(amount).toFixed(2)} has been {type === "deposit" ? "added to" : "withdrawn from"} your wallet
            </p>
            <Button variant="gold" onClick={handleClose}>
              Done
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default DepositModal;
