import { bo } from "@/lib/backofficeI18n";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Check, Plus, Trash2, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { logAudit, sanitizeText } from "@/lib/audit";

/** Fulfilment pipeline — each stage must be completed in order. */
export const STAGES = [
  { key: "confirm", label: "1. Confirm the order", status: "processing" },
  { key: "receiver", label: "2. Verify receiver info", status: null },
  { key: "package", label: "3. Prepare & package", status: null },
  { key: "courier", label: "4. Assign delivery company", status: null },
  { key: "expenses", label: "5. Record expenses", status: null },
  { key: "handover", label: "6. Hand over to courier", status: "shipped" },
  { key: "delivered", label: "7. Delivered & paid", status: "delivered" },
] as const;
type StageKey = (typeof STAGES)[number]["key"];

const CHECKS: Record<string, [string, string][]> = {
  confirm: [["called", "Customer contacted (call / WhatsApp)"], ["accepted", "Customer confirmed the order"], ["stock", "Items available in stock"]],
  package: [["picked", "Items picked from stock"], ["quality", "Quality checked (no defects)"], ["wrapped", "Gift-wrapped / protected"], ["invoice", "Invoice / receipt inside"], ["labelled", "Shipping label attached"]],
  handover: [["picked_up", "Courier picked up the parcel"], ["customer_notified", "Customer notified with tracking"]],
  delivered: [["received", "Customer received the parcel"], ["paid", "Payment collected / settled"]],
};

const EXPENSE_TYPES = ["Packaging", "Fuel / transport", "Return fee", "COD fee", "Insurance", "Other"];

export const OrderFulfillment = ({ order, companies, format, onStatus }: { order: any; companies: any[]; format: (n: number) => string; onStatus: (status: string) => void }) => {
  const { toast } = useToast();
  const s = order.shipping_info || {};
  const blank = {
    stage: "confirm" as StageKey | "done" | "returned", steps: {} as Record<string, any>,
    receiver: { name: s.fullName || s.name || [s.firstName, s.lastName].filter(Boolean).join(" "), phone: s.phone || "", address: s.address || "", city: s.city || "", landmark: "", slot: "" },
    package: { parcels: "1", weight: "", size: "" },
    delivery_company_id: order.delivery_company_id || "", tracking_number: "", delivery_cost: String(order.shipping_cost || ""),
    expenses: [] as { type: string; amount: string; note: string }[], cod_collected: String(order.due_on_delivery || (String(order.payment_method).startsWith("cod") ? order.total : 0) || 0),
    history: [] as any[], notes: "",
  };
  const [f, setF] = useState<any>(blank);
  const [busy, setBusy] = useState(false);
  const [returnReason, setReturnReason] = useState("");

  useEffect(() => {
    supabase.from("order_fulfillment").select("*").eq("order_id", order.order_id).maybeSingle().then(({ data }) => {
      if (data) setF({ ...blank, ...data, delivery_company_id: data.delivery_company_id || "", delivery_cost: String(data.delivery_cost ?? ""), cod_collected: String(data.cod_collected ?? 0), tracking_number: data.tracking_number || "", notes: data.notes || "" });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order.order_id]);

  const idx = STAGES.findIndex((x) => x.key === f.stage);
  const expTotal = (f.expenses as any[]).reduce((a, e) => a + Number(e.amount || 0), 0);
  const totalCost = Number(f.delivery_cost || 0) + expTotal;
  const setStep = (k: string, v: boolean) => setF({ ...f, steps: { ...f.steps, [k]: v } });

  const persist = async (next: any, event?: string, status?: string | null) => {
    setBusy(true);
    const history = event ? [...(next.history || []), { at: new Date().toISOString(), event }] : next.history;
    const row = {
      order_id: order.order_id, stage: next.stage, steps: next.steps, receiver: next.receiver, package: next.package,
      delivery_company_id: next.delivery_company_id || null, tracking_number: sanitizeText(next.tracking_number || "", 80) || null,
      delivery_cost: Number(next.delivery_cost || 0), expenses: next.expenses, cod_collected: Number(next.cod_collected || 0),
      history, notes: sanitizeText(next.notes || "", 1000) || null,
    };
    const { error } = await supabase.from("order_fulfillment").upsert(row as any);
    if (error) { setBusy(false); return toast({ title: "Could not save", description: error.message, variant: "destructive" }); }
    const orderPatch: any = { shipping_cost: Number(next.delivery_cost || 0) + (next.expenses as any[]).reduce((a: number, e: any) => a + Number(e.amount || 0), 0) };
    if (next.delivery_company_id) orderPatch.delivery_company_id = next.delivery_company_id;
    if (status) orderPatch.status = status;
    await supabase.from("orders").update(orderPatch).eq("id", order.id);
    if (status) onStatus(status);
    if (event) await logAudit("order.fulfillment", { entity: "orders", entityId: order.order_id, details: { event } });
    setF({ ...next, history });
    setBusy(false);
  };

  const canComplete = (k: StageKey) => {
    if (CHECKS[k]) return CHECKS[k].every(([c]) => f.steps[`${k}.${c}`]);
    if (k === "receiver") return f.receiver.name && f.receiver.phone && f.receiver.address && f.receiver.city;
    if (k === "courier") return !!f.delivery_company_id;
    return true;
  };
  const complete = (k: StageKey) => {
    if (!canComplete(k)) return toast({ title: "Complete every field / check of this step first", variant: "destructive" });
    const i = STAGES.findIndex((x) => x.key === k);
    const nextStage = STAGES[i + 1]?.key ?? "done";
    persist({ ...f, stage: nextStage }, `${STAGES[i].label} — done`, STAGES[i].status);
  };
  const markReturned = () => {
    if (!returnReason) return toast({ title: "Choose a return reason", variant: "destructive" });
    persist({ ...f, stage: "returned" }, `Returned — ${returnReason}`, "returned");
  };

  const Checks = ({ k }: { k: string }) => (
    <div className="space-y-1.5">{bo(CHECKS[k].map(([c, l]) => (
      <label key={c} className="flex items-center gap-2 text-sm cursor-pointer">
        <input type="checkbox" className="h-4 w-4 accent-foreground" checked={!!f.steps[`${k}.${c}`]} onChange={(e) => setStep(`${k}.${c}`, e.target.checked)} /> {bo(l)}
      </label>
    )))}</div>
  );

  const body = (k: StageKey) => {
    switch (k) {
      case "confirm": case "package": case "handover": case "delivered":
        return (
          <div className="space-y-3">
            <Checks k={k} />
            {bo(k === "package" && (
              <div className="grid grid-cols-3 gap-2">
                {bo([["parcels", "Parcels"], ["weight", "Weight (kg)"], ["size", "Size (cm)"]].map(([x, l]) => (
                  <div key={x}><Label className="text-xs">{bo(l)}</Label><Input value={f.package[x] || ""} onChange={(e) => setF({ ...f, package: { ...f.package, [x]: e.target.value } })} /></div>
                )))}
              </div>
            ))}
            {bo(k === "delivered" && (
              <div><Label className="text-xs">{bo("Amount collected on delivery")}</Label><Input type="number" value={f.cod_collected} onChange={(e) => setF({ ...f, cod_collected: e.target.value })} /></div>
            ))}
          </div>
        );
      case "receiver":
        return (
          <div className="grid sm:grid-cols-2 gap-2">
            {bo([["name", "Receiver name *"], ["phone", "Phone *"], ["address", "Address *"], ["city", "City *"], ["landmark", "Landmark / directions"], ["slot", "Preferred delivery time"]].map(([x, l]) => (
              <div key={x}><Label className="text-xs">{bo(l)}</Label><Input value={f.receiver[x] || ""} onChange={(e) => setF({ ...f, receiver: { ...f.receiver, [x]: e.target.value } })} /></div>
            )))}
          </div>
        );
      case "courier":
        return (
          <div className="grid sm:grid-cols-2 gap-2">
            <div className="sm:col-span-2"><Label className="text-xs">{bo("Delivery company *")}</Label>
              <select className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm" value={f.delivery_company_id}
                onChange={(e) => { const c = companies.find((x) => x.id === e.target.value); setF({ ...f, delivery_company_id: e.target.value, delivery_cost: c ? String(c.price_per_delivery) : f.delivery_cost }); }}>
                <option value="">{bo("Select a company")}</option>
                {bo(companies.map((c) => <option key={c.id} value={c.id}>{bo(c.name)}{bo(" — ")}{bo(format(Number(c.price_per_delivery)))}</option>))}
              </select>
              {bo(companies.length === 0 && <p className="text-xs text-muted-foreground mt-1">{bo("Add delivery companies in Logistics → Delivery companies.")}</p>)}
            </div>
            <div><Label className="text-xs">{bo("Tracking number")}</Label><Input value={f.tracking_number} onChange={(e) => setF({ ...f, tracking_number: e.target.value })} /></div>
            <div><Label className="text-xs">{bo("Delivery cost")}</Label><Input type="number" value={f.delivery_cost} onChange={(e) => setF({ ...f, delivery_cost: e.target.value })} /></div>
          </div>
        );
      case "expenses":
        return (
          <div className="space-y-2">
            <div className="flex justify-between text-sm"><span>{bo("Delivery cost")}</span><b>{bo(format(Number(f.delivery_cost || 0)))}</b></div>
            {bo((f.expenses as any[]).map((e, i) => (
              <div key={i} className="grid grid-cols-[1fr_100px_1fr_auto] gap-2">
                <select className="h-10 rounded-md border border-input bg-background px-2 text-sm" value={e.type} onChange={(ev) => { const x = [...f.expenses]; x[i] = { ...e, type: ev.target.value }; setF({ ...f, expenses: x }); }}>
                  {bo(EXPENSE_TYPES.map((t) => <option key={t}>{bo(t)}</option>))}
                </select>
                <Input type="number" placeholder={bo("Amount")} value={e.amount} onChange={(ev) => { const x = [...f.expenses]; x[i] = { ...e, amount: ev.target.value }; setF({ ...f, expenses: x }); }} />
                <Input placeholder={bo("Note")} value={e.note} onChange={(ev) => { const x = [...f.expenses]; x[i] = { ...e, note: ev.target.value }; setF({ ...f, expenses: x }); }} />
                <Button size="icon" variant="ghost" onClick={() => setF({ ...f, expenses: f.expenses.filter((_: any, j: number) => j !== i) })}><Trash2 className="h-4 w-4 text-destructive" /></Button>
              </div>
            )))}
            <Button size="sm" variant="outline" onClick={() => setF({ ...f, expenses: [...f.expenses, { type: "Packaging", amount: "", note: "" }] })}><Plus className="h-4 w-4 mr-1" />{bo(" Add expense")}</Button>
            <div className="flex justify-between text-sm border-t border-border pt-2"><span>{bo("Total order costs")}</span><b>{bo(format(totalCost))}</b></div>
          </div>
        );
    }
  };

  return (
    <div className="border border-border rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <p className="font-semibold text-sm">{bo("Order process")}</p>
        <span className="text-xs text-muted-foreground">{bo(f.stage === "done" ? "Completed" : f.stage === "returned" ? "Returned" : `Step ${idx + 1} of ${STAGES.length}`)}</span>
      </div>
      <div className="flex gap-1">{bo(STAGES.map((st, i) => (
        <div key={st.key} className={`h-1.5 flex-1 rounded-full ${f.stage === "returned" ? "bg-destructive/60" : f.stage === "done" || i < idx ? "bg-foreground" : i === idx ? "bg-foreground/40" : "bg-muted"}`} />
      )))}</div>

      <div className="space-y-2">
        {bo(STAGES.map((st, i) => {
          const done = f.stage === "done" || (idx >= 0 && i < idx);
          const current = i === idx;
          return (
            <div key={st.key} className={`rounded-md border p-3 ${current ? "border-foreground" : "border-border"}`}>
              <div className="flex items-center justify-between">
                <p className={`text-sm ${done ? "text-muted-foreground" : "font-medium"}`}>{bo(done && <Check className="inline h-4 w-4 mr-1" />)}{bo(st.label)}</p>
                {bo(current && <Button size="sm" disabled={busy} onClick={() => complete(st.key)}>{bo("Complete step")}</Button>)}
              </div>
              {bo(current && <div className="mt-3">{bo(body(st.key))}</div>)}
            </div>
          );
        }))}
      </div>

      {bo(f.stage !== "returned" && f.stage !== "done" && idx >= 5 && (
        <div className="flex flex-wrap items-end gap-2 border-t border-border pt-3">
          <div className="flex-1 min-w-[180px]"><Label className="text-xs">{bo("Return reason")}</Label>
            <select className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm" value={returnReason} onChange={(e) => setReturnReason(e.target.value)}>
              <option value="">{bo("Select…")}</option>
              {bo(["Customer unreachable", "Customer refused", "Wrong address", "Damaged parcel", "Other"].map((r) => <option key={r}>{bo(r)}</option>))}
            </select>
          </div>
          <Button variant="outline" disabled={busy} onClick={markReturned}><RotateCcw className="h-4 w-4 mr-1" />{bo(" Mark returned")}</Button>
        </div>
      ))}

      <div><Label className="text-xs">{bo("Internal notes")}</Label><Textarea value={f.notes} onChange={(e) => setF({ ...f, notes: e.target.value })} onBlur={() => persist(f)} /></div>

      {bo((f.history as any[]).length > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">{bo("Timeline")}</p>
          <ul className="text-xs space-y-1">{bo([...f.history].reverse().map((h: any, i: number) => (
            <li key={i}><span className="text-muted-foreground">{bo(new Date(h.at).toLocaleString())}</span>{bo(" — ")}{bo(h.event)}</li>
          )))}</ul>
        </div>
      ))}
    </div>
  );
};
