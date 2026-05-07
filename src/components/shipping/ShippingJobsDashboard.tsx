import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Truck, Plus, PackageCheck, Send, RotateCcw } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Job {
  id: string; order_id: string | null; buyer_name: string | null; destination: string | null;
  status: string; return_reason: string | null; notes: string | null;
  received_at: string | null; sent_at: string | null; delivered_at: string | null; returned_at: string | null;
}

const RETURN_REASONS = [
  "Buyer not available",
  "Buyer doesn't want the item",
  "Damaged on delivery",
  "Wrong address",
  "Other",
];

const ShippingJobsDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [tab, setTab] = useState<"received" | "sending" | "returned">("received");
  const [open, setOpen] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [buyer, setBuyer] = useState("");
  const [dest, setDest] = useState("");
  const [returnFor, setReturnFor] = useState<Job | null>(null);
  const [reason, setReason] = useState(RETURN_REASONS[0]);

  const refresh = async () => {
    if (!user) return;
    const { data } = await supabase.from("shipping_jobs" as any).select("*").eq("shipper_id", user.id).order("created_at", { ascending: false });
    setJobs((data as any) || []);
  };
  useEffect(() => { refresh(); }, [user]);

  const create = async () => {
    if (!user) return;
    const { error } = await supabase.from("shipping_jobs" as any).insert({
      shipper_id: user.id, order_id: orderId || null, buyer_name: buyer || null,
      destination: dest || null, status: "received",
    } as any);
    if (error) { toast({ title: "Failed", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Package received" });
    setOpen(false); setOrderId(""); setBuyer(""); setDest(""); refresh();
  };

  const updateStatus = async (job: Job, status: string, extra: Record<string, any> = {}) => {
    await supabase.from("shipping_jobs" as any).update({ status, ...extra }).eq("id", job.id);
    refresh();
  };

  const filtered = jobs.filter(j =>
    tab === "received" ? j.status === "received" :
    tab === "sending" ? j.status === "sending" :
    j.status === "returned" || j.status === "delivered"
  );

  const tabs = [
    { id: "received", label: "Received", icon: PackageCheck, color: "text-blue-400" },
    { id: "sending", label: "Sending", icon: Send, color: "text-yellow-500" },
    { id: "returned", label: "Returned / Delivered", icon: RotateCcw, color: "text-red-400" },
  ] as const;

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2"><Truck className="w-5 h-5 text-gold" /> Shipping Operations</CardTitle>
          <Button size="sm" variant="gold" onClick={() => setOpen(true)}><Plus className="w-4 h-4 mr-1" /> Log Received Package</Button>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4 border-b border-border overflow-x-auto">
            {tabs.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`flex items-center gap-2 px-4 py-2 text-sm whitespace-nowrap border-b-2 ${tab === t.id ? "border-gold text-gold" : "border-transparent text-muted-foreground"}`}>
                <t.icon className={`w-4 h-4 ${t.color}`} /> {t.label}
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No items in this category.</p>
          ) : (
            <div className="space-y-2">
              {filtered.map(j => (
                <div key={j.id} className="p-3 rounded-lg bg-muted">
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex-1">
                      <p className="font-body text-sm">{j.order_id || "(no order ref)"} • {j.buyer_name || "—"}</p>
                      <p className="text-xs text-muted-foreground">{j.destination || "No destination"}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {j.received_at && <>📦 {new Date(j.received_at).toLocaleDateString()}</>}
                        {j.sent_at && <> • 🚚 {new Date(j.sent_at).toLocaleDateString()}</>}
                        {j.delivered_at && <> • ✅ {new Date(j.delivered_at).toLocaleDateString()}</>}
                        {j.returned_at && <> • ↩ {new Date(j.returned_at).toLocaleDateString()}</>}
                      </p>
                      {j.return_reason && <p className="text-xs text-red-400 mt-1">Reason: {j.return_reason}</p>}
                    </div>
                    <div className="flex flex-col gap-1">
                      {j.status === "received" && (
                        <Button size="sm" variant="outline" onClick={() => updateStatus(j, "sending", { sent_at: new Date().toISOString() })}>Mark Sent</Button>
                      )}
                      {j.status === "sending" && (
                        <>
                          <Button size="sm" variant="gold" onClick={() => updateStatus(j, "delivered", { delivered_at: new Date().toISOString() })}>Delivered</Button>
                          <Button size="sm" variant="outline" onClick={() => { setReturnFor(j); setReason(RETURN_REASONS[0]); }}>Return</Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Log Received Package</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Order ID</Label><Input value={orderId} onChange={e => setOrderId(e.target.value)} /></div>
            <div><Label>Buyer Name</Label><Input value={buyer} onChange={e => setBuyer(e.target.value)} /></div>
            <div><Label>Destination</Label><Input value={dest} onChange={e => setDest(e.target.value)} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button variant="gold" onClick={create}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!returnFor} onOpenChange={(o) => !o && setReturnFor(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Mark as Returned</DialogTitle></DialogHeader>
          <div>
            <Label>Reason</Label>
            <select className="w-full bg-background border border-border rounded p-2 text-sm" value={reason} onChange={e => setReason(e.target.value)}>
              {RETURN_REASONS.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReturnFor(null)}>Cancel</Button>
            <Button variant="gold" onClick={async () => {
              if (!returnFor) return;
              await updateStatus(returnFor, "returned", { returned_at: new Date().toISOString(), return_reason: reason });
              setReturnFor(null);
            }}>Confirm Return</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ShippingJobsDashboard;
