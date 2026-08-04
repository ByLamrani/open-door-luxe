import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CreditCard, Truck, ArrowLeft, Check, Loader2, Wallet, Lock, AlertCircle, User, Users } from "lucide-react";
import GiftOccasionPrompt from "@/components/GiftOccasionPrompt";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { getSavedCardForCheckout, isSavedCardEnabled } from "@/components/SavedCardSection";
import PayPalButton from "@/components/payments/PayPalButton";
import { PRICING } from "@/lib/payments/config";
import { getQuote, PRICING_RULES, type PayMethod } from "@/lib/pricing";

interface ShippingInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
}

interface CardInfo {
  nameOnCard: string;
  cardNumber: string;
  expireDate: string;
  cvv: string;
}

const countries = [
  "Morocco", "United States", "United Kingdom", "France", "Spain", "Germany", 
  "Italy", "Canada", "Australia", "UAE", "Saudi Arabia", "Qatar", "Other"
];

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { items, subtotal, onlineDiscount, bulkDiscount, total, clearCart } = useCart();
  const [paymentMethod, setPaymentMethod] = useState<"online" | "cod" | "wallet" | "paypal" | "wallet_card">("online");
  const [useAdvancePayment, setUseAdvancePayment] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [verificationCode, setVerificationCode] = useState("");
  const [step, setStep] = useState<"recipient" | "shipping" | "payment" | "verification">("recipient");
  const [showGiftPrompt, setShowGiftPrompt] = useState(false);
  const [completedItems, setCompletedItems] = useState<Array<{ id: string; name: string }>>([]);
  const [useSavedCard, setUseSavedCard] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);
  const [recipientType, setRecipientType] = useState<"self" | "friend" | null>(null);
  const [userProfile, setUserProfile] = useState<{
    full_name: string;
    email: string;
    phone: string | null;
    home_address: string | null;
    city: string | null;
    country: string | null;
  } | null>(null);
  
  const [shippingInfo, setShippingInfo] = useState<ShippingInfo>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    country: "Morocco",
  });

  const [cardInfo, setCardInfo] = useState<CardInfo>({
    nameOnCard: "",
    cardNumber: "",
    expireDate: "",
    cvv: "",
  });

  const savedCard = getSavedCardForCheckout();
  const hasSavedCard = isSavedCardEnabled() && !!savedCard;
  const isMorocco = shippingInfo.country === "Morocco";

  // Fetch wallet balance
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;
      
      // Fetch wallet
      const { data: walletData } = await supabase
        .from("wallets")
        .select("balance")
        .eq("user_id", user.id)
        .single();
      if (walletData) setWalletBalance(walletData.balance);

      // Fetch profile for "Deliver to Me"
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();
      if (profileData) setUserProfile(profileData);
    };
    fetchUserData();
  }, [user]);

  // Auto-enable saved card if available
  useEffect(() => {
    if (hasSavedCard) {
      setUseSavedCard(true);
    }
  }, [hasSavedCard]);

  const handleShippingChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setShippingInfo((prev) => ({ ...prev, [name]: value }));
    
    if (name === "country" && value !== "Morocco") {
      setPaymentMethod("online");
    }
  };

  const handleCardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let formattedValue = value;

    if (name === "cardNumber") {
      formattedValue = value.replace(/\D/g, "").replace(/(\d{4})/g, "$1 ").trim().slice(0, 19);
    } else if (name === "expireDate") {
      formattedValue = value.replace(/\D/g, "").replace(/(\d{2})(\d)/, "$1/$2").slice(0, 5);
    } else if (name === "cvv") {
      formattedValue = value.replace(/\D/g, "").slice(0, 4);
    }

    setCardInfo((prev) => ({ ...prev, [name]: formattedValue }));
  };

  const validateShipping = (): boolean => {
    const required = ["firstName", "lastName", "email", "phone", "address", "city"];
    for (const field of required) {
      if (!shippingInfo[field as keyof ShippingInfo].trim()) {
        toast({
          title: "Missing Information",
          description: `Please fill in your ${field.replace(/([A-Z])/g, " $1").toLowerCase()}`,
          variant: "destructive",
        });
        return false;
      }
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(shippingInfo.email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return false;
    }
    
    return true;
  };

  const validateCard = (): boolean => {
    if (paymentMethod !== "online") return true;
    if (useSavedCard && savedCard) return true;

    if (!cardInfo.nameOnCard.trim()) {
      toast({ title: "Missing Information", description: "Please enter the name on card", variant: "destructive" });
      return false;
    }
    if (cardInfo.cardNumber.replace(/\s/g, "").length < 16) {
      toast({ title: "Invalid Card", description: "Please enter a valid card number", variant: "destructive" });
      return false;
    }
    if (!cardInfo.expireDate.match(/^\d{2}\/\d{2}$/)) {
      toast({ title: "Invalid Date", description: "Please enter expiry date as MM/YY", variant: "destructive" });
      return false;
    }
    if (cardInfo.cvv.length < 3) {
      toast({ title: "Invalid CVV", description: "Please enter a valid CVV", variant: "destructive" });
      return false;
    }
    return true;
  };

  const handleContinueToPayment = () => {
    if (!validateShipping()) return;
    setStep("payment");
  };

  // ---- Single pricing engine (src/lib/pricing.ts) for every method ----
  const quote = getQuote(subtotal, paymentMethod as PayMethod, useAdvancePayment);

  const getAdvanceDiscount = () => quote.advanceDiscount;
  const getSmartDiscount = () => quote.onlineDiscount + quote.advanceDiscount;
  const getFinalTotal = () => quote.total;
  /** Amount charged now (full total, or the 20% deposit for Hybrid COD) */
  const getAdvanceAmount = () => quote.payNow;
  const getRemainingAmount = () => quote.dueOnDelivery;

  const getWalletCardSplit = () => {
    const finalTotal = useAdvancePayment ? getAdvanceAmount() : getFinalTotal();
    const walletPortion = Math.min(walletBalance, finalTotal);
    const cardPortion = finalTotal - walletPortion;
    return { walletPortion, cardPortion };
  };

  const handleProceedToVerification = () => {
    if (paymentMethod === "wallet") {
      const amountNeeded = useAdvancePayment ? getAdvanceAmount() : getFinalTotal();
      if (walletBalance < amountNeeded) {
        toast({ 
          title: "Insufficient Balance", 
          description: "Your wallet balance is not enough. Try 'Wallet + Card' option to combine payment methods.", 
          variant: "destructive" 
        });
        return;
      }
    }

    if (paymentMethod === "wallet_card") {
      if (!validateCard()) return;
    }
    
    if (!validateCard()) return;
    
    if (paymentMethod === "online" || paymentMethod === "wallet" || paymentMethod === "wallet_card") {
      setStep("verification");
      toast({
        title: "Verification Code Sent",
        description: "A 6-digit code has been sent to your phone for security",
      });
    } else if (paymentMethod === "paypal") {
      handlePlaceOrder();
    } else {
      handlePlaceOrder();
    }
  };

  const handlePlaceOrder = async () => {
    if ((paymentMethod === "online" || paymentMethod === "wallet" || paymentMethod === "wallet_card") && verificationCode.length < 6) {
      toast({ title: "Enter Code", description: "Please enter the 6-digit verification code", variant: "destructive" });
      return;
    }

    setIsProcessing(true);
    
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    // Generate longer, more complex order ID
    const timestamp = Date.now().toString(36).toUpperCase();
    const randomPart1 = Math.random().toString(36).substring(2, 7).toUpperCase();
    const randomPart2 = Math.random().toString(36).substring(2, 8).toUpperCase();
    const checksum = (Date.now() % 10000).toString().padStart(4, '0');
    const generatedOrderId = `ALE-${timestamp}-${randomPart1}-${randomPart2}-${checksum}`;
    
    const isOnline = paymentMethod === "online" || paymentMethod === "wallet" || paymentMethod === "paypal" || paymentMethod === "wallet_card";
    const finalTotal = getFinalTotal();
    const advanceAmount = useAdvancePayment ? getAdvanceAmount() : finalTotal;

    // Deduct from wallet if using wallet or wallet_card payment
    if ((paymentMethod === "wallet" || paymentMethod === "wallet_card") && user) {
      const { data: walletData } = await supabase
        .from("wallets")
        .select("id, balance")
        .eq("user_id", user.id)
        .single();
      
      if (walletData) {
        const walletDeduction = paymentMethod === "wallet_card" 
          ? Math.min(walletData.balance, advanceAmount) 
          : advanceAmount;
        await supabase.from("wallets").update({ balance: walletData.balance - walletDeduction }).eq("id", walletData.id);
        await supabase.from("wallet_transactions").insert({
          wallet_id: walletData.id,
          amount: -walletDeduction,
          transaction_type: "purchase",
          description: `Order ${generatedOrderId}${useAdvancePayment ? " (20% advance)" : ""}`,
        });
      }
    }

    const totalDiscount = quote.totalDiscount;

    if (user) {
      try {
        const isHybridCod = paymentMethod === "cod" && useAdvancePayment;
        const depositAmount = isHybridCod ? Number(getAdvanceAmount().toFixed(2)) : 0;
        const dueOnDelivery = isHybridCod ? Number((getFinalTotal() - getAdvanceAmount()).toFixed(2)) : 0;
        await supabase.from("orders").insert({
          user_id: user.id,
          order_id: generatedOrderId,
          items: items as unknown as import("@/integrations/supabase/types").Json,
          subtotal: subtotal,
          discount_amount: totalDiscount,
          total: finalTotal,
          deposit_amount: depositAmount,
          due_on_delivery: dueOnDelivery,
          payment_method: useAdvancePayment ? `${paymentMethod}_advance` : paymentMethod,
          shipping_info: shippingInfo as unknown as import("@/integrations/supabase/types").Json,
          status: isHybridCod ? "paid_deposit" : useAdvancePayment ? "advance_paid" : "pending",
        });
      } catch (error) {
        console.error("Failed to save order:", error);
      }
    }

    setCompletedItems(items.map(item => ({ id: item.id, name: item.name })));
    setOrderId(generatedOrderId);
    clearCart();
    setOrderComplete(true);
    setIsProcessing(false);
    
    // Show gift prompt after a short delay
    if (user) {
      setTimeout(() => setShowGiftPrompt(true), 2000);
    }
    
    toast({
      title: "Order Placed Successfully! 🎉",
      description: `Your order ${generatedOrderId} has been confirmed.`,
    });
  };

  const handleRecipientSelect = (type: "self" | "friend") => {
    setRecipientType(type);
    
    if (type === "self" && userProfile) {
      // Auto-fill with user's profile data
      const nameParts = userProfile.full_name.split(" ");
      setShippingInfo({
        firstName: nameParts[0] || "",
        lastName: nameParts.slice(1).join(" ") || "",
        email: userProfile.email,
        phone: userProfile.phone || "",
        address: userProfile.home_address || "",
        city: userProfile.city || "",
        postalCode: "",
        country: userProfile.country || "Morocco",
      });
      // Skip shipping if profile is complete (name, email, phone, address, city all filled)
      const profileComplete = userProfile.full_name && userProfile.email && userProfile.phone && userProfile.home_address && userProfile.city;
      if (profileComplete) {
        setStep("payment");
      } else {
        setStep("shipping");
      }
    } else {
      // Reset shipping info for friend
      setShippingInfo({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        address: "",
        city: "",
        postalCode: "",
        country: "Morocco",
      });
      setStep("shipping");
    }
  };

  const handleGoBack = () => {
    if (step === "verification") setStep("payment");
    else if (step === "payment") {
      if (recipientType === "self" && userProfile?.full_name && userProfile?.email && userProfile?.phone && userProfile?.home_address && userProfile?.city) {
        setStep("recipient");
      } else {
        setStep("shipping");
      }
    }
    else if (step === "shipping") setStep("recipient");
    else navigate("/cart");
  };

  if (items.length === 0 && !orderComplete) {
    navigate("/cart");
    return null;
  }

  if (orderComplete) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <section className="pt-32 pb-20">
          <div className="max-w-2xl mx-auto px-4 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="w-24 h-24 mx-auto mb-8 rounded-full bg-gradient-to-br from-gold-light to-gold flex items-center justify-center"
            >
              <Check className="w-12 h-12 text-primary-foreground" />
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="font-display text-3xl md:text-4xl text-foreground mb-4"
            >
              Thank You for Your Order!
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="font-body text-muted-foreground mb-2"
            >
              Your order has been successfully placed.
            </motion.p>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="font-body text-gold text-lg mb-8"
            >
              Order ID: <span className="font-semibold">{orderId}</span>
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-card rounded-lg border border-border p-6 mb-8 text-left"
            >
              <h3 className="font-display text-lg text-foreground mb-4">What's Next?</h3>
              <ul className="space-y-3 font-body text-muted-foreground">
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-gold flex-shrink-0 mt-0.5" />
                  <span>You'll receive an email confirmation at <span className="text-foreground">{shippingInfo.email}</span></span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-gold flex-shrink-0 mt-0.5" />
                  <span>We'll notify you when your order ships</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-gold flex-shrink-0 mt-0.5" />
                  <span>Track your order anytime using ID: <span className="text-gold font-semibold">{orderId}</span></span>
                </li>
                {paymentMethod === "cod" && (
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-gold flex-shrink-0 mt-0.5" />
                    <span>Please have <span className="text-gold font-semibold">${total(false).toFixed(2)}</span> ready for cash payment upon delivery</span>
                  </li>
                )}
              </ul>
            </motion.div>
            
            <div className="flex gap-4 justify-center">
              <Button variant="gold" onClick={() => navigate("/")} size="lg">
                Continue Shopping
              </Button>
              <Button variant="outline" onClick={() => navigate("/track-order")} size="lg">
                Track Order
              </Button>
            </div>
          </div>
        </section>
        <Footer />

        {/* Gift Occasion Prompt */}
        <GiftOccasionPrompt
          isOpen={showGiftPrompt}
          onClose={() => setShowGiftPrompt(false)}
          items={completedItems}
        />
      </div>
    );
  }

  const isOnlinePayment = paymentMethod === "online" || paymentMethod === "wallet" || paymentMethod === "paypal" || paymentMethod === "wallet_card";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Button */}
          <Button
            variant="ghost"
            onClick={handleGoBack}
            className="mb-6 text-muted-foreground hover:text-gold"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {step === "verification" ? "Back to Payment" : step === "payment" ? "Back to Shipping" : "Back to Cart"}
          </Button>

          {/* Step Indicator */}
          <div className="flex items-center justify-center gap-4 mb-8">
            {["Recipient", "Shipping", "Payment", "Confirm"].map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  (i === 0 && step === "recipient") || (i === 1 && step === "shipping") || (i === 2 && step === "payment") || (i === 3 && step === "verification")
                    ? "bg-gold text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}>
                  {i + 1}
                </div>
                <span className="font-body text-sm hidden sm:inline">{s}</span>
                {i < 3 && <div className="w-8 h-0.5 bg-border" />}
              </div>
            ))}
          </div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display text-3xl md:text-4xl text-foreground mb-8 text-center"
          >
            {step === "recipient" ? "Who is this for?" : step === "shipping" ? "Shipping Details" : step === "payment" ? "Payment" : "Verify Payment"}
          </motion.h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form Section */}
            <div className="lg:col-span-2 space-y-6">
              {step === "recipient" && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-card rounded-lg border border-border p-6"
                >
                  <h2 className="font-display text-xl text-foreground mb-6">
                    Select Recipient
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                      onClick={() => handleRecipientSelect("self")}
                      className={`p-6 rounded-lg border-2 transition-all text-left ${
                        recipientType === "self"
                          ? "border-gold bg-gold/10"
                          : "border-border hover:border-gold/50"
                      }`}
                    >
                      <User className={`w-8 h-8 mb-3 ${recipientType === "self" ? "text-gold" : "text-muted-foreground"}`} />
                      <h3 className={`font-display text-lg mb-2 ${recipientType === "self" ? "text-gold" : "text-foreground"}`}>
                        Deliver to Me
                      </h3>
                      <p className="font-body text-sm text-muted-foreground">
                        Use my saved address for faster checkout
                      </p>
                    </button>

                    <button
                      onClick={() => handleRecipientSelect("friend")}
                      className={`p-6 rounded-lg border-2 transition-all text-left ${
                        recipientType === "friend"
                          ? "border-gold bg-gold/10"
                          : "border-border hover:border-gold/50"
                      }`}
                    >
                      <Users className={`w-8 h-8 mb-3 ${recipientType === "friend" ? "text-gold" : "text-muted-foreground"}`} />
                      <h3 className={`font-display text-lg mb-2 ${recipientType === "friend" ? "text-gold" : "text-foreground"}`}>
                        Deliver to a Friend
                      </h3>
                      <p className="font-body text-sm text-muted-foreground">
                        Enter recipient's shipping details
                      </p>
                    </button>
                  </div>
                </motion.div>
              )}

              {step === "shipping" && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-card rounded-lg border border-border p-6"
                >
                  <h2 className="font-display text-xl text-foreground mb-6">
                    Shipping Information
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        value={shippingInfo.firstName}
                        onChange={handleShippingChange}
                        placeholder="John"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        value={shippingInfo.lastName}
                        onChange={handleShippingChange}
                        placeholder="Doe"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={shippingInfo.email}
                        onChange={handleShippingChange}
                        placeholder="john@example.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone *</Label>
                      <Input
                        id="phone"
                        name="phone"
                        value={shippingInfo.phone}
                        onChange={handleShippingChange}
                        placeholder="+212 6XX XXX XXX"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="address">Address *</Label>
                      <Input
                        id="address"
                        name="address"
                        value={shippingInfo.address}
                        onChange={handleShippingChange}
                        placeholder="123 Street Name, Building, Apt"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="city">City *</Label>
                      <Input
                        id="city"
                        name="city"
                        value={shippingInfo.city}
                        onChange={handleShippingChange}
                        placeholder="Casablanca"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="postalCode">Postal Code</Label>
                      <Input
                        id="postalCode"
                        name="postalCode"
                        value={shippingInfo.postalCode}
                        onChange={handleShippingChange}
                        placeholder="20000"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="country">Country *</Label>
                      <select
                        id="country"
                        name="country"
                        value={shippingInfo.country}
                        onChange={handleShippingChange}
                        className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                      >
                        {countries.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {!isMorocco && (
                    <div className="mt-4 p-3 bg-gold/10 border border-gold/30 rounded-lg flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-gold flex-shrink-0 mt-0.5" />
                      <p className="text-sm font-body text-gold">
                        International orders require online payment only. Cash on Delivery is only available in Morocco.
                      </p>
                    </div>
                  )}

                  <Button
                    variant="gold"
                    size="lg"
                    className="w-full mt-6"
                    onClick={handleContinueToPayment}
                  >
                    Continue to Payment
                  </Button>
                </motion.div>
              )}

              {step === "payment" && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  {/* Payment Method Selection */}
                  <div className="bg-card rounded-lg border border-border p-6">
                    <h2 className="font-display text-xl text-foreground mb-6">
                      Payment Method
                    </h2>

                    <div className="space-y-3">
                      {/* Credit Card Option */}
                      <button
                        onClick={() => { setPaymentMethod("online"); setUseAdvancePayment(false); }}
                        className={`w-full flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${
                          paymentMethod === "online"
                            ? "border-gold bg-gold/10"
                            : "border-border hover:border-gold/50"
                        }`}
                      >
                        <CreditCard className={`w-5 h-5 ${paymentMethod === "online" ? "text-gold" : "text-muted-foreground"}`} />
                        <div className="flex-1 text-left">
                          <p className={`font-body font-medium ${paymentMethod === "online" ? "text-gold" : "text-foreground"}`}>
                            Credit/Debit Card
                          </p>
                          <p className="font-body text-xs text-muted-foreground">
                            Pay securely with card - Get 5% OFF instantly
                          </p>
                        </div>
                        <span className="px-2 py-1 bg-gold text-primary-foreground text-xs font-bold rounded">
                          5% OFF
                        </span>
                      </button>

                      {/* E-Wallet Option */}
                      <button
                        onClick={() => { setPaymentMethod("wallet"); setUseAdvancePayment(false); }}
                        className={`w-full flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${
                          paymentMethod === "wallet"
                            ? "border-gold bg-gold/10"
                            : "border-border hover:border-gold/50"
                        }`}
                      >
                        <Wallet className={`w-5 h-5 ${paymentMethod === "wallet" ? "text-gold" : "text-muted-foreground"}`} />
                        <div className="flex-1 text-left">
                          <p className={`font-body font-medium ${paymentMethod === "wallet" ? "text-gold" : "text-foreground"}`}>
                            E-Wallet
                          </p>
                          <p className="font-body text-xs text-muted-foreground">
                            Balance: ${walletBalance.toFixed(2)} - Fastest checkout
                          </p>
                        </div>
                        <span className="px-2 py-1 bg-gold text-primary-foreground text-xs font-bold rounded">
                          5% OFF
                        </span>
                      </button>

                      {/* Wallet + Card Combo Option */}
                      {walletBalance > 0 && (
                        <button
                          onClick={() => { setPaymentMethod("wallet_card"); setUseAdvancePayment(false); }}
                          className={`w-full flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${
                            paymentMethod === "wallet_card"
                              ? "border-gold bg-gold/10"
                              : "border-border hover:border-gold/50"
                          }`}
                        >
                          <div className={`flex items-center gap-1 ${paymentMethod === "wallet_card" ? "text-gold" : "text-muted-foreground"}`}>
                            <Wallet className="w-4 h-4" />
                            <span className="text-xs">+</span>
                            <CreditCard className="w-4 h-4" />
                          </div>
                          <div className="flex-1 text-left">
                            <p className={`font-body font-medium ${paymentMethod === "wallet_card" ? "text-gold" : "text-foreground"}`}>
                              Wallet + Card
                            </p>
                            <p className="font-body text-xs text-muted-foreground">
                              Use ${walletBalance.toFixed(2)} from wallet, pay the rest by card
                            </p>
                          </div>
                          <span className="px-2 py-1 bg-gold text-primary-foreground text-xs font-bold rounded">
                            5% OFF
                          </span>
                        </button>
                      )}
                      <button
                        onClick={() => { setPaymentMethod("paypal"); setUseAdvancePayment(false); }}
                        className={`w-full flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${
                          paymentMethod === "paypal"
                            ? "border-gold bg-gold/10"
                            : "border-border hover:border-gold/50"
                        }`}
                      >
                        <div className={`w-5 h-5 flex items-center justify-center text-xs font-bold ${paymentMethod === "paypal" ? "text-gold" : "text-muted-foreground"}`}>
                          PP
                        </div>
                        <div className="flex-1 text-left">
                          <p className={`font-body font-medium ${paymentMethod === "paypal" ? "text-gold" : "text-foreground"}`}>
                            PayPal
                          </p>
                          <p className="font-body text-xs text-muted-foreground">
                            Pay with your PayPal account - Secure & Fast
                          </p>
                        </div>
                        <span className="px-2 py-1 bg-gold text-primary-foreground text-xs font-bold rounded">
                          5% OFF
                        </span>
                      </button>

                      {/* Cash on Delivery (Morocco only) */}
                      {isMorocco && (
                        <button
                          onClick={() => setPaymentMethod("cod")}
                          className={`w-full flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${
                            paymentMethod === "cod"
                              ? "border-gold bg-gold/10"
                              : "border-border hover:border-gold/50"
                          }`}
                        >
                          <Truck className={`w-5 h-5 ${paymentMethod === "cod" ? "text-gold" : "text-muted-foreground"}`} />
                          <div className="flex-1 text-left">
                            <p className={`font-body font-medium ${paymentMethod === "cod" ? "text-gold" : "text-foreground"}`}>
                              Cash on Delivery
                            </p>
                            <p className="font-body text-xs text-muted-foreground">
                              Pay when you receive your order (Morocco only)
                            </p>
                          </div>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Advance Payment Option - COD Only */}
                  {paymentMethod === "cod" && (
                  <div className="bg-card rounded-lg border border-border p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-display text-lg text-foreground">Pay 20% Advance</h3>
                        <p className="font-body text-sm text-muted-foreground">
                          Pay only 30% now and get <span className="text-gold font-semibold">3% OFF</span> the total price. Pay the remaining 70% on delivery.
                        </p>
                      </div>
                      <button
                        onClick={() => setUseAdvancePayment(!useAdvancePayment)}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                          useAdvancePayment
                            ? "bg-gold text-primary-foreground"
                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                        }`}
                      >
                        {useAdvancePayment ? "Enabled ✓" : "Enable"}
                      </button>
                    </div>
                    {useAdvancePayment && (
                      <div className="mt-4 p-3 bg-gold/10 border border-gold/30 rounded-lg space-y-1">
                        <div className="flex justify-between text-sm font-body">
                          <span className="text-muted-foreground">Advance (3% discount applied)</span>
                          <span className="text-gold font-semibold">${getAdvanceAmount().toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm font-body">
                          <span className="text-muted-foreground">Remaining on delivery</span>
                          <span className="text-foreground">${getRemainingAmount().toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm font-body">
                          <span className="text-gold">You save</span>
                          <span className="text-gold">-${getAdvanceDiscount().toFixed(2)}</span>
                        </div>
                      </div>
                    )}
                  </div>
                  )}

                  {/* Wallet + Card Split Info */}
                  {paymentMethod === "wallet_card" && (
                    <div className="bg-card rounded-lg border border-border p-6">
                      <h2 className="font-display text-xl text-foreground mb-4 flex items-center gap-2">
                        <Wallet className="w-5 h-5 text-gold" />
                        Payment Split
                      </h2>
                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm font-body">
                          <span className="text-muted-foreground">From Wallet</span>
                          <span className="text-gold font-semibold">${getWalletCardSplit().walletPortion.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm font-body">
                          <span className="text-muted-foreground">From Card</span>
                          <span className="text-foreground font-semibold">${getWalletCardSplit().cardPortion.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Card Details Form - Show for online or wallet_card */}
                  {(paymentMethod === "online" || paymentMethod === "wallet_card") && (
                    <div className="bg-card rounded-lg border border-border p-6">
                      <h2 className="font-display text-xl text-foreground mb-6 flex items-center gap-2">
                        <Lock className="w-5 h-5 text-gold" />
                        Card Details
                      </h2>

                      {/* Saved Card Toggle */}
                      {hasSavedCard && (
                        <div className="mb-4 p-4 bg-muted rounded-lg">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <CreditCard className="w-5 h-5 text-gold" />
                              <div>
                                <p className="font-body text-sm font-medium text-foreground">
                                  Use Saved Card
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {savedCard?.brand} •••• {savedCard?.last4} - Expires {savedCard?.expiry}
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() => setUseSavedCard(!useSavedCard)}
                              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                                useSavedCard
                                  ? "bg-gold text-primary-foreground"
                                  : "bg-muted-foreground/20 text-muted-foreground"
                              }`}
                            >
                              {useSavedCard ? "Selected" : "Use"}
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Manual Card Entry */}
                      {(!useSavedCard || !hasSavedCard) && (
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="nameOnCard">Name on Card *</Label>
                            <Input
                              id="nameOnCard"
                              name="nameOnCard"
                              value={cardInfo.nameOnCard}
                              onChange={handleCardChange}
                              placeholder="JOHN DOE"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="cardNumber">Card Number *</Label>
                            <Input
                              id="cardNumber"
                              name="cardNumber"
                              value={cardInfo.cardNumber}
                              onChange={handleCardChange}
                              placeholder="1234 5678 9012 3456"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="expireDate">Expire Date *</Label>
                              <Input
                                id="expireDate"
                                name="expireDate"
                                value={cardInfo.expireDate}
                                onChange={handleCardChange}
                                placeholder="MM/YY"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="cvv">CVV *</Label>
                              <Input
                                id="cvv"
                                name="cvv"
                                type="password"
                                value={cardInfo.cvv}
                                onChange={handleCardChange}
                                placeholder="123"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {paymentMethod === "paypal" ? (
                    <div className="space-y-2">
                      <p className="text-xs text-muted-foreground">
                        You'll pay <span className="text-foreground font-semibold">${getFinalTotal().toFixed(2)}</span> via PayPal.
                        90% goes to the vendor, 10% platform fee — split automatically.
                      </p>
                      <PayPalButton
                        buildOrderInput={() => ({
                          orderId: `ALE-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`,
                          currency: "USD",
                          items: items.map((i) => ({ name: i.name, amount: i.price, quantity: i.quantity })),
                          totalAmount: Number(getFinalTotal().toFixed(2)),
                          mode: "full",
                        })}
                        onApproved={async (r) => {
                          if (r.status === "COMPLETED") {
                            await handlePlaceOrder();
                          } else {
                            toast({ title: "Payment pending", description: "We'll update your order once confirmed." });
                          }
                        }}
                        onError={(e) =>
                          toast({
                            title: "PayPal error",
                            description: String((e as any)?.message || e),
                            variant: "destructive",
                          })
                        }
                      />
                    </div>
                  ) : paymentMethod === "cod" && useAdvancePayment ? (
                    <div className="space-y-2">
                      <p className="text-xs text-muted-foreground">
                        Hybrid COD — pay <span className="text-foreground font-semibold">${getAdvanceAmount().toFixed(2)}</span> now (20% deposit).
                        Remaining <span className="text-foreground font-semibold">${(getFinalTotal() - getAdvanceAmount()).toFixed(2)}</span> due on delivery.
                      </p>
                      <PayPalButton
                        buildOrderInput={() => ({
                          orderId: `ALE-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`,
                          currency: "USD",
                          items: items.map((i) => ({ name: i.name, amount: i.price, quantity: i.quantity })),
                          totalAmount: Number(getAdvanceAmount().toFixed(2)),
                          fullPrice: Number(getFinalTotal().toFixed(2)),
                          mode: "deposit_20",
                        })}
                        onApproved={async (r) => {
                          if (r.status === "COMPLETED") await handlePlaceOrder();
                        }}
                        onError={(e) =>
                          toast({ title: "PayPal error", description: String((e as any)?.message || e), variant: "destructive" })
                        }
                      />
                    </div>
                  ) : (
                    <Button
                      variant="gold"
                      size="lg"
                      className="w-full"
                      onClick={handleProceedToVerification}
                    >
                      {paymentMethod === "online" || paymentMethod === "wallet" || paymentMethod === "wallet_card"
                        ? `Proceed to Verification${useAdvancePayment ? ` - $${getAdvanceAmount().toFixed(2)}` : ""}`
                        : `Place Order - $${getFinalTotal().toFixed(2)}`}
                    </Button>
                  )}
                </motion.div>
              )}

              {step === "verification" && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-card rounded-lg border border-border p-6"
                >
                  <h2 className="font-display text-xl text-foreground mb-6 flex items-center gap-2">
                    <Lock className="w-5 h-5 text-gold" />
                    Secure Verification
                  </h2>

                  <p className="font-body text-muted-foreground mb-6">
                    For your security, we've sent a 6-digit verification code to your phone. 
                    Please enter it below to confirm your payment.
                  </p>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="verificationCode">Verification Code *</Label>
                      <Input
                        id="verificationCode"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                        placeholder="Enter 6-digit code"
                        className="text-center text-2xl tracking-widest"
                        maxLength={6}
                      />
                    </div>

                    <p className="text-sm text-muted-foreground text-center">
                      Didn't receive the code?{" "}
                      <button className="text-gold hover:underline">Resend</button>
                    </p>
                  </div>

                  <Button
                    variant="gold"
                    size="lg"
                    className="w-full mt-6"
                    onClick={handlePlaceOrder}
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Processing...
                      </>
                    ) : (
                      `Confirm & Pay $${useAdvancePayment ? getAdvanceAmount().toFixed(2) : getFinalTotal().toFixed(2)}`
                    )}
                  </Button>
                </motion.div>
              )}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="sticky top-28 bg-card rounded-lg border border-border p-6"
              >
                <h2 className="font-display text-xl text-foreground mb-6">
                  Order Summary
                </h2>

                {/* Items */}
                <div className="space-y-3 mb-6 max-h-60 overflow-y-auto">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-14 h-14 object-cover rounded-md"
                      />
                      <div className="flex-1">
                        <p className="font-body text-sm text-foreground line-clamp-1">
                          {item.name}
                        </p>
                        <p className="font-body text-xs text-muted-foreground">
                          Qty: {item.quantity}
                        </p>
                      </div>
                      <p className="font-body text-sm text-foreground">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Price Breakdown */}
                <div className="space-y-3 border-t border-border pt-4">
                  <div className="flex justify-between font-body text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="text-foreground">${subtotal.toFixed(2)}</span>
                  </div>
                  
                  {bulkDiscount > 0 && (
                    <div className="flex justify-between font-body text-sm">
                      <span className="text-gold">Bulk Discount (8%)</span>
                      <span className="text-gold">-${bulkDiscount.toFixed(2)}</span>
                    </div>
                  )}
                  
                  {isOnlinePayment && (
                    <div className="flex justify-between font-body text-sm">
                      <span className="text-gold">Online Discount (5%)</span>
                      <span className="text-gold">-${((subtotal >= 700 ? subtotal - bulkDiscount : subtotal) * 0.05).toFixed(2)}</span>
                    </div>
                  )}

                  {useAdvancePayment && (
                    <div className="flex justify-between font-body text-sm">
                      <span className="text-gold">Advance Discount (3%)</span>
                      <span className="text-gold">-${getAdvanceDiscount().toFixed(2)}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between font-body text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="text-foreground">Free</span>
                  </div>
                  
                  <div className="flex justify-between font-display text-lg pt-3 border-t border-border">
                    <span className="text-foreground">Total</span>
                    <span className="text-gold">
                      ${getFinalTotal().toFixed(2)}
                    </span>
                  </div>

                  {useAdvancePayment && (
                    <div className="flex justify-between font-body text-sm bg-gold/10 p-2 rounded">
                      <span className="text-gold font-medium">Pay Now (30%)</span>
                      <span className="text-gold font-semibold">${getAdvanceAmount().toFixed(2)}</span>
                    </div>
                  )}

                  {subtotal >= 700 && (
                    <p className="text-xs text-gold text-center mt-2">
                      🎉 You're saving ${(bulkDiscount + (useAdvancePayment ? getAdvanceDiscount() : 0)).toFixed(2)} with discounts!
                    </p>
                  )}
                </div>

                <p className="font-body text-xs text-muted-foreground text-center mt-4">
                  By placing your order, you agree to our Terms of Service and Privacy Policy
                </p>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default CheckoutPage;
