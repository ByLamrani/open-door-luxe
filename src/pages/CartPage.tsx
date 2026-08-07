import { useState } from "react";
import { motion } from "framer-motion";
import { Minus, Plus, Trash2, CreditCard, Truck, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { Link } from "react-router-dom";

const CartPage = () => {
  const [paymentMethod, setPaymentMethod] = useState<"online" | "cod">("online");
  const { items, updateQuantity, removeItem, subtotal, onlineDiscount, total, clearCart } = useCart();

  const handleCheckout = () => {
    // Placeholder for checkout logic
    alert(`Checkout with ${paymentMethod === "online" ? "Online Payment (10% OFF)" : "Cash on Delivery"}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display text-3xl md:text-4xl text-foreground mb-8"
          >
            Shopping <span className="text-gradient-gold">Cart</span>
          </motion.h1>

          {items.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <p className="font-body text-muted-foreground text-lg mb-6">
                Your cart is empty
              </p>
              <Button variant="gold" asChild>
                <Link to="/">
                  Start Shopping
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                {items.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex gap-4 p-4 bg-card rounded-lg border border-border"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-24 h-24 object-cover rounded-md"
                    />
                    <div className="flex-1">
                      <p className="font-body text-xs text-gold uppercase tracking-wider">
                        {item.category}
                      </p>
                      <h3 className="font-display text-lg text-foreground">
                        {item.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="font-body font-semibold text-gold">
                          ${(item.price * 0.9).toFixed(2)}
                        </span>
                        <span className="font-body text-sm text-muted-foreground line-through">
                          ${item.price.toFixed(2)}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end justify-between">
                      <button
                        onClick={() => removeItem(item.id)}
                        className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <div className="flex items-center gap-2 border border-border rounded-md">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-2 hover:text-gold transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="font-body w-8 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-2 hover:text-gold transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="sticky top-28 bg-card rounded-lg border border-border p-6">
                  <h2 className="font-display text-xl text-foreground mb-6">
                    Order Summary
                  </h2>

                  {/* Payment Method Selection */}
                  <div className="space-y-3 mb-6">
                    <p className="font-body text-sm text-muted-foreground">
                      Payment Method
                    </p>
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
                          Get 10% OFF instantly
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
                          Pay when you receive
                        </p>
                      </div>
                    </button>
                  </div>

                  {/* Price Breakdown */}
                  <div className="space-y-3 border-t border-border pt-6">
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
                    asChild
                  >
                    <Link to="/checkout">
                      Proceed to Checkout
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Link>
                  </Button>

                  <p className="font-body text-xs text-muted-foreground text-center mt-4">
                    Secure checkout powered by Lamra Lux
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default CartPage;
