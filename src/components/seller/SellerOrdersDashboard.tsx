import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Clock, RotateCcw, Package } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useCurrency } from "@/context/CurrencyContext";

interface Order {
  id: string; order_id: string; total: number; status: string; created_at: string;
  updated_at: string; items: any[];
}

const SellerOrdersDashboard = () => {
  const { user } = useAuth();
  const { format } = useCurrency();
  const [orders, setOrders] = useState<Order[]>([]);
  const [tab, setTab] = useState<"sold" | "pending" | "returned">("sold");

  useEffect(() => {
    if (!user) return;
    supabase.from("orders").select("*").eq("vendor_id", user.id).order("created_at", { ascending: false })
      .then(({ data }) => setOrders((data as any) || []));
  }, [user]);

  const groupMap: Record<typeof tab, string[]> = {
    sold: ["completed", "delivered", "sold", "paid"],
    pending: ["pending", "processing", "shipped"],
    returned: ["returned", "refunded", "cancelled"],
  };
  const filtered = orders.filter(o => groupMap[tab].includes(o.status));

  const tabs = [
    { id: "sold", label: "Sold", icon: CheckCircle2, color: "text-green-500" },
    { id: "pending", label: "Pending", icon: Clock, color: "text-yellow-500" },
    { id: "returned", label: "Returned", icon: RotateCcw, color: "text-red-500" },
  ] as const;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Package className="w-5 h-5 text-gold" /> Orders Management</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 mb-4 border-b border-border">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2 text-sm transition-all border-b-2 ${tab === t.id ? "border-gold text-gold" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
              <t.icon className={`w-4 h-4 ${t.color}`} /> {t.label}
              <span className="text-xs px-1.5 py-0.5 rounded bg-muted">{orders.filter(o => groupMap[t.id].includes(o.status)).length}</span>
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No {tab} orders.</p>
        ) : (
          <div className="space-y-2">
            {filtered.map(o => (
              <div key={o.id} className="p-3 rounded-lg bg-muted">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-body text-sm">#{o.order_id}</p>
                    <p className="text-xs text-muted-foreground">
                      Created: {new Date(o.created_at).toLocaleString()} • Updated: {new Date(o.updated_at).toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {Array.isArray(o.items) ? `${o.items.length} item(s)` : ""}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-display text-lg text-gold">{format(Number(o.total))}</p>
                    <span className="text-[10px] uppercase text-muted-foreground">{o.status}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SellerOrdersDashboard;
