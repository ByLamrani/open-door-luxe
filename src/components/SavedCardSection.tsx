import { useState, useEffect } from "react";
import { CreditCard, Plus, Trash2, Edit2, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";

export interface SavedCard {
  id: string;
  name: string;
  last4: string;
  expiry: string;
  brand: string;
  fullNumber?: string;
  cvv?: string;
}

interface SavedCardSectionProps {
  onCardSave?: (card: SavedCard) => void;
  compact?: boolean;
}

const SavedCardSection = ({ onCardSave, compact = false }: SavedCardSectionProps) => {
  const { toast } = useToast();
  const [isEnabled, setIsEnabled] = useState(false);
  const [savedCard, setSavedCard] = useState<SavedCard | null>(null);
  const [storedCard, setStoredCard] = useState<SavedCard | null>(null); // Persisted card data
  const [isEditing, setIsEditing] = useState(false);
  const [cardDetails, setCardDetails] = useState({
    name: "",
    number: "",
    expiry: "",
    cvv: "",
  });

  // Load saved card and enabled state from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("savedCard");
    const enabled = localStorage.getItem("savedCardEnabled");
    
    if (stored) {
      const parsedCard = JSON.parse(stored);
      setStoredCard(parsedCard);
      
      // Only show as active if enabled
      if (enabled === "true") {
        setSavedCard(parsedCard);
        setIsEnabled(true);
      }
    }
  }, []);

  const handleToggle = (checked: boolean) => {
    setIsEnabled(checked);
    localStorage.setItem("savedCardEnabled", checked.toString());
    
    if (checked && storedCard) {
      // Reactivate stored card without needing to re-enter info
      setSavedCard(storedCard);
    } else if (!checked) {
      // Deactivate but keep stored card data
      setSavedCard(null);
    }
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

  const getCardBrand = (number: string) => {
    const n = number.replace(/\s/g, "");
    if (n.startsWith("4")) return "Visa";
    if (n.startsWith("5")) return "Mastercard";
    if (n.startsWith("3")) return "Amex";
    if (n.startsWith("6")) return "Discover";
    return "Card";
  };

  const handleSave = () => {
    if (!cardDetails.name || !cardDetails.number || !cardDetails.expiry || !cardDetails.cvv) {
      toast({ title: "Missing Information", description: "Please fill in all card details", variant: "destructive" });
      return;
    }

    const cleanNumber = cardDetails.number.replace(/\s/g, "");
    if (cleanNumber.length < 16) {
      toast({ title: "Invalid Card", description: "Please enter a valid card number", variant: "destructive" });
      return;
    }

    const newCard: SavedCard = {
      id: Date.now().toString(),
      name: cardDetails.name,
      last4: cleanNumber.slice(-4),
      expiry: cardDetails.expiry,
      brand: getCardBrand(cleanNumber),
      fullNumber: cleanNumber,
      cvv: cardDetails.cvv,
    };

    setSavedCard(newCard);
    setStoredCard(newCard);
    localStorage.setItem("savedCard", JSON.stringify(newCard));
    setIsEditing(false);
    setCardDetails({ name: "", number: "", expiry: "", cvv: "" });
    toast({ title: "Card Saved", description: "Your card has been saved securely" });
    onCardSave?.(newCard);
  };

  const handleDelete = () => {
    setSavedCard(null);
    setStoredCard(null);
    localStorage.removeItem("savedCard");
    toast({ title: "Card Removed" });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setCardDetails({ name: "", number: "", expiry: "", cvv: "" });
  };

  if (compact) {
    return (
      <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
        <div className="flex items-center gap-3">
          <CreditCard className="w-5 h-5 text-gold" />
          <div>
            <p className="font-body text-sm text-foreground">Use Saved Card</p>
            {savedCard && (
              <p className="text-xs text-muted-foreground">
                {savedCard.brand} •••• {savedCard.last4}
              </p>
            )}
          </div>
        </div>
        <Switch 
          checked={isEnabled && !!savedCard} 
          onCheckedChange={handleToggle}
          disabled={!storedCard && !savedCard}
        />
      </div>
    );
  }

  return (
    <div className="border border-border rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <CreditCard className="w-5 h-5 text-gold" />
          <div>
            <h3 className="font-display text-lg">My Card</h3>
            <p className="text-xs text-muted-foreground">Save your card for faster checkout</p>
          </div>
        </div>
        <Switch checked={isEnabled} onCheckedChange={handleToggle} />
      </div>

      {isEnabled && (
        <div className="pt-4 border-t border-border">
          {!savedCard && !storedCard && !isEditing && (
            <Button
              variant="outline"
              className="w-full border-dashed"
              onClick={() => setIsEditing(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add a Card
            </Button>
          )}

          {(savedCard || storedCard) && !isEditing && (
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-12 h-8 bg-gradient-to-r from-gold-light to-gold rounded flex items-center justify-center text-primary-foreground text-xs font-bold">
                  {(savedCard || storedCard)?.brand.slice(0, 4)}
                </div>
                <div>
                  <p className="font-body text-sm text-foreground">
                    •••• •••• •••• {(savedCard || storedCard)?.last4}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {(savedCard || storedCard)?.name} • Expires {(savedCard || storedCard)?.expiry}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setIsEditing(true);
                    setCardDetails({
                      name: (savedCard || storedCard)?.name || "",
                      number: "",
                      expiry: (savedCard || storedCard)?.expiry || "",
                      cvv: "",
                    });
                  }}
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={handleDelete}>
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              </div>
            </div>
          )}

          {isEditing && (
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
              <div className="flex gap-2 pt-2">
                <Button variant="gold" className="flex-1" onClick={handleSave}>
                  <Check className="w-4 h-4 mr-2" />
                  Save Card
                </Button>
                <Button variant="outline" onClick={handleCancel}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground text-center">
                Your card details are stored securely on your device
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Helper to get saved card for checkout
export const getSavedCardForCheckout = (): SavedCard | null => {
  const enabled = localStorage.getItem("savedCardEnabled");
  const stored = localStorage.getItem("savedCard");
  
  if (enabled === "true" && stored) {
    return JSON.parse(stored);
  }
  return null;
};

// Helper to check if saved card is enabled
export const isSavedCardEnabled = (): boolean => {
  return localStorage.getItem("savedCardEnabled") === "true" && !!localStorage.getItem("savedCard");
};

export default SavedCardSection;
