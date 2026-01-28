import { useState } from "react";
import { motion } from "framer-motion";
import { CreditCard, Truck, ArrowLeft, Check, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/hooks/use-toast";

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

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { items, subtotal, onlineDiscount, total, clearCart } = useCart();
  const [paymentMethod, setPaymentMethod] = useState<"online" | "cod">("online");
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setShippingInfo((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = (): boolean => {
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

  const handlePlaceOrder = async () => {
    if (!validateForm()) return;
    
    setIsProcessing(true);
    
    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    // Generate order ID
    const generatedOrderId = `ALE-${Date.now().toString(36).toUpperCase()}`;
    setOrderId(generatedOrderId);
    
    // Clear cart and show success
    clearCart();
    setOrderComplete(true);
    setIsProcessing(false);
    
    toast({
      title: "Order Placed Successfully! 🎉",
      description: `Your order ${generatedOrderId} has been confirmed.`,
    });
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
                {paymentMethod === "cod" && (
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-gold flex-shrink-0 mt-0.5" />
                    <span>Please have <span className="text-gold font-semibold">${total(false).toFixed(2)}</span> ready for cash payment upon delivery</span>
                  </li>
                )}
              </ul>
            </motion.div>
            
            <Button variant="gold" onClick={() => navigate("/")} size="lg">
              Continue Shopping
            </Button>
          </div>
        </section>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => navigate("/cart")}
            className="flex items-center gap-2 text-muted-foreground hover:text-gold transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="font-body">Back to Cart</span>
          </button>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display text-3xl md:text-4xl text-foreground mb-8"
          >
            Checkout
          </motion.h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Shipping Form */}
            <div className="lg:col-span-2 space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
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
                      onChange={handleInputChange}
                      placeholder="John"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      value={shippingInfo.lastName}
                      onChange={handleInputChange}
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
                      onChange={handleInputChange}
                      placeholder="john@example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone *</Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={shippingInfo.phone}
                      onChange={handleInputChange}
                      placeholder="+212 6XX XXX XXX"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="address">Address *</Label>
                    <Input
                      id="address"
                      name="address"
                      value={shippingInfo.address}
                      onChange={handleInputChange}
                      placeholder="123 Street Name, Building, Apt"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      name="city"
                      value={shippingInfo.city}
                      onChange={handleInputChange}
                      placeholder="Casablanca"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="postalCode">Postal Code</Label>
                    <Input
                      id="postalCode"
                      name="postalCode"
                      value={shippingInfo.postalCode}
                      onChange={handleInputChange}
                      placeholder="20000"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      name="country"
                      value={shippingInfo.country}
                      onChange={handleInputChange}
                      disabled
                    />
                  </div>
                </div>
              </motion.div>

              {/* Payment Method */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-card rounded-lg border border-border p-6"
              >
                <h2 className="font-display text-xl text-foreground mb-6">
                  Payment Method
                </h2>

                <div className="space-y-3">
                  <button
                    onClick={() => setPaymentMethod("online")}
                    className={`w-full flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${
                      paymentMethod === "online"
                        ? "border-gold bg-gold/10"
                        : "border-border hover:border-gold/50"
                    }`}
                  >
                    <CreditCard className={`w-5 h-5 ${paymentMethod === "online" ? "text-gold" : "text-muted-foreground"}`} />
                    <div className="flex-1 text-left">
                      <p className={`font-body font-medium ${paymentMethod === "online" ? "text-gold" : "text-foreground"}`}>
                        Online Payment
                      </p>
                      <p className="font-body text-xs text-muted-foreground">
                        Pay securely with card - Get 10% OFF instantly
                      </p>
                    </div>
                    <span className="px-2 py-1 bg-gold text-primary-foreground text-xs font-bold rounded">
                      10% OFF
                    </span>
                  </button>

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
                        Pay when you receive your order
                      </p>
                    </div>
                  </button>
                </div>
              </motion.div>
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
                  {paymentMethod === "online" && (
                    <div className="flex justify-between font-body text-sm">
                      <span className="text-gold">Online Discount (10%)</span>
                      <span className="text-gold">-${onlineDiscount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-body text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="text-foreground">Free</span>
                  </div>
                  <div className="flex justify-between font-display text-lg pt-3 border-t border-border">
                    <span className="text-foreground">Total</span>
                    <span className="text-gold">
                      ${total(paymentMethod === "online").toFixed(2)}
                    </span>
                  </div>
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
                    `Place Order - $${total(paymentMethod === "online").toFixed(2)}`
                  )}
                </Button>

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
