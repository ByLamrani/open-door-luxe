import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Package, Truck, Check, Clock, MapPin } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface OrderData {
  order_id: string;
  status: string;
  items: any[];
  total: number;
  created_at: string;
  shipping_info: {
    firstName: string;
    lastName: string;
    city: string;
    country: string;
  };
}

const statusSteps = [
  { key: "pending", label: "Order Placed", icon: Clock },
  { key: "processing", label: "Processing", icon: Package },
  { key: "shipped", label: "Shipped", icon: Truck },
  { key: "delivered", label: "Delivered", icon: Check },
];

const TrackOrderPage = () => {
  const { toast } = useToast();
  const [orderId, setOrderId] = useState("");
  const [order, setOrder] = useState<OrderData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId.trim()) {
      toast({
        title: "Enter Order ID",
        description: "Please enter your order ID to track",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setSearched(true);

    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("order_id", orderId.trim().toUpperCase())
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setOrder({
          order_id: data.order_id,
          status: data.status,
          items: data.items as any[],
          total: Number(data.total),
          created_at: data.created_at,
          shipping_info: data.shipping_info as OrderData['shipping_info'],
        });
      } else {
        setOrder(null);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Subscribe to realtime updates when an order is loaded
  useEffect(() => {
    if (!order) return;

    const channel = supabase
      .channel(`order-${order.order_id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `order_id=eq.${order.order_id}`,
        },
        (payload) => {
          const updated = payload.new as any;
          setOrder((prev) =>
            prev
              ? {
                  ...prev,
                  status: updated.status,
                  items: updated.items as any[],
                  total: Number(updated.total),
                  shipping_info: updated.shipping_info as OrderData['shipping_info'],
                }
              : prev
          );
          toast({
            title: "Order Updated",
            description: `Status changed to "${updated.status}"`,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [order?.order_id]);

  const getStatusIndex = (status: string) => {
    return statusSteps.findIndex((s) => s.key === status);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-16 bg-card">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="font-display text-4xl md:text-5xl text-foreground mb-6">
              Track Your <span className="text-gradient-gold">Order</span>
            </h1>
            <p className="font-body text-muted-foreground max-w-xl mx-auto mb-8">
              Enter your order ID to see the current status and delivery updates.
            </p>

            {/* Search Form */}
            <form onSubmit={handleSearch} className="flex gap-4 max-w-md mx-auto">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  placeholder="Enter Order ID (e.g., ALE-XXXXXX)"
                  className="pl-10"
                />
              </div>
              <Button variant="gold" type="submit" disabled={isLoading}>
                {isLoading ? "Searching..." : "Track"}
              </Button>
            </form>
          </motion.div>
        </div>
      </section>

      {/* Results */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {searched && !order && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12"
            >
              <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h2 className="font-display text-2xl text-foreground mb-2">Order Not Found</h2>
              <p className="font-body text-muted-foreground">
                We couldn't find an order with ID "{orderId}". Please check and try again.
              </p>
            </motion.div>
          )}

          {order && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              {/* Order Info Card */}
              <div className="bg-card rounded-xl border border-border p-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                  <div>
                    <p className="text-sm text-muted-foreground font-body">Order ID</p>
                    <p className="font-display text-2xl text-gold">{order.order_id}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground font-body">Order Date</p>
                    <p className="font-body text-foreground">
                      {new Date(order.created_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>

                {/* Status Timeline */}
                <div className="relative">
                  <div className="flex justify-between items-center">
                    {statusSteps.map((step, i) => {
                      const currentIndex = getStatusIndex(order.status);
                      const isCompleted = i <= currentIndex;
                      const isCurrent = i === currentIndex;

                      return (
                        <div key={step.key} className="flex flex-col items-center relative z-10">
                          <div
                            className={`w-12 h-12 rounded-full flex items-center justify-center ${
                              isCompleted
                                ? "bg-gold text-primary-foreground"
                                : "bg-muted text-muted-foreground"
                            } ${isCurrent ? "ring-4 ring-gold/30" : ""}`}
                          >
                            <step.icon className="w-5 h-5" />
                          </div>
                          <p
                            className={`mt-2 text-xs font-body ${
                              isCompleted ? "text-gold" : "text-muted-foreground"
                            }`}
                          >
                            {step.label}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                  {/* Progress Line */}
                  <div className="absolute top-6 left-6 right-6 h-0.5 bg-muted -z-0">
                    <div
                      className="h-full bg-gold transition-all duration-500"
                      style={{
                        width: `${(getStatusIndex(order.status) / (statusSteps.length - 1)) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Shipping & Items */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Shipping Info */}
                <div className="bg-card rounded-xl border border-border p-6">
                  <h3 className="font-display text-lg text-foreground mb-4 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-gold" />
                    Shipping To
                  </h3>
                  <p className="font-body text-foreground">
                    {order.shipping_info.firstName} {order.shipping_info.lastName}
                  </p>
                  <p className="font-body text-muted-foreground">
                    {order.shipping_info.city}, {order.shipping_info.country}
                  </p>
                </div>

                {/* Order Summary */}
                <div className="bg-card rounded-xl border border-border p-6">
                  <h3 className="font-display text-lg text-foreground mb-4 flex items-center gap-2">
                    <Package className="w-5 h-5 text-gold" />
                    Order Summary
                  </h3>
                  <p className="font-body text-muted-foreground mb-2">
                    {order.items.length} item{order.items.length > 1 ? "s" : ""}
                  </p>
                  <p className="font-display text-2xl text-gold">
                    ${order.total.toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Items List */}
              <div className="bg-card rounded-xl border border-border p-6">
                <h3 className="font-display text-lg text-foreground mb-4">Items in Order</h3>
                <div className="space-y-4">
                  {order.items.map((item: any, i: number) => (
                    <div key={i} className="flex gap-4 items-center">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <p className="font-body text-foreground">{item.name}</p>
                        <p className="font-body text-sm text-muted-foreground">
                          Qty: {item.quantity}
                        </p>
                      </div>
                      <p className="font-body text-gold">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default TrackOrderPage;
