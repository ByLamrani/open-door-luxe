import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Trash2, ImagePlus, Loader2, ChevronRight, Plug, Eye, EyeOff, Crown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { logAudit, sanitizeText } from "@/lib/audit";
import { catalog } from "@/data/catalog";
import { products as staticProducts } from "@/data/products";

const selectCls = "w-full h-10 rounded-md border border-input bg-background px-3 text-sm";
export const OWNER_EMAIL = "adil.lamrani.ejjouti@gmail.com";

/* Cluster (shown as "Category") -> catalog item (shown as "Sub-category").
   Products are still saved with the storefront's own category/subcategory values. */
const itemKey = (i: { category: string; subcategory?: string }) => `${i.category}|${i.subcategory ?? ""}`;
const clusterOfProduct = (category?: string, sub?: string) =>
  catalog.find((c) => c.items.some((i) => i.category === category && (i.subcategory ?? "") === (sub ?? "")))?.cluster
  ?? catalog.find((c) => c.items.some((i) => i.category === category))?.cluster ?? "";

const uploadImage = async (file: File) => {
  const ext = file.name.split(".").pop() || "jpg";
  const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await supabase.storage.from("product-images").upload(path, file);
  if (error) throw error;
  const { data } = await supabase.storage.from("product-images").createSignedUrl(path, 60 * 60 * 24 * 365 * 10);
  return data?.signedUrl ?? null;
};

/* ---------------- Products ---------------- */
const emptyForm = { cluster: "", item: "", name: "", price: "", compare_price: "", buying_price: "", quantity: "", description: "" };

const ProductForm = ({ v, set, file, setFile, currentImage }: { v: any; set: (x: any) => void; file: File | null; setFile: (f: File | null) => void; currentImage?: string | null }) => {
  const cluster = catalog.find((c) => c.cluster === v.cluster);
  const price = Number(v.price || 0), cost = Number(v.buying_price || 0);
  const margin = price - cost;
  const onlineMargin = price * 0.92 - cost;
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div className="space-y-1">
        <Label>Category</Label>
        <select className={selectCls} value={v.cluster} onChange={(e) => set({ ...v, cluster: e.target.value, item: "" })}>
          <option value="">Select a category</option>
          {catalog.map((c) => <option key={c.cluster} value={c.cluster}>{c.cluster}</option>)}
        </select>
      </div>
      <div className="space-y-1">
        <Label>Sub-category</Label>
        <select className={selectCls} value={v.item} disabled={!cluster} onChange={(e) => set({ ...v, item: e.target.value })}>
          <option value="">{cluster ? "Select a sub-category" : "Choose a category first"}</option>
          {cluster?.items.map((i) => <option key={i.path} value={itemKey(i)}>{i.name}</option>)}
        </select>
      </div>
      <div className="space-y-1 sm:col-span-2"><Label>Name</Label><Input value={v.name} onChange={(e) => set({ ...v, name: e.target.value })} /></div>
      <div className="space-y-1"><Label>Buying price (cost)</Label><Input type="number" value={v.buying_price} onChange={(e) => set({ ...v, buying_price: e.target.value })} /></div>
      <div className="space-y-1"><Label>Selling price</Label><Input type="number" value={v.price} onChange={(e) => set({ ...v, price: e.target.value })} /></div>
      <div className="space-y-1"><Label>Comparative price (before discount)</Label><Input type="number" value={v.compare_price} onChange={(e) => set({ ...v, compare_price: e.target.value })} /></div>
      <div className="space-y-1"><Label>Quantity in stock <span className="text-muted-foreground text-xs">(Back Office only)</span></Label><Input type="number" value={v.quantity} onChange={(e) => set({ ...v, quantity: e.target.value })} /></div>
      {price > 0 && (
        <div className="sm:col-span-2 text-xs rounded-md bg-muted p-3 grid sm:grid-cols-2 gap-1">
          <span>Profit per item (cash on delivery): <b>{margin.toFixed(2)}</b></span>
          <span>Profit per item (online, −8% discount): <b className={onlineMargin < 0 ? "text-destructive" : ""}>{onlineMargin.toFixed(2)}</b></span>
        </div>
      )}
      <div className="space-y-1 sm:col-span-2"><Label>Description</Label><Textarea value={v.description} onChange={(e) => set({ ...v, description: e.target.value })} /></div>
      <div className="space-y-1 sm:col-span-2">
        <Label>Picture</Label>
        <label className="flex items-center gap-4 border border-dashed border-border rounded-lg p-4 cursor-pointer hover:border-foreground">
          {file ? <img src={URL.createObjectURL(file)} alt="Preview" className="h-16 w-16 object-cover rounded" />
            : currentImage ? <img src={currentImage} alt="Current" className="h-16 w-16 object-cover rounded" />
            : <ImagePlus className="h-8 w-8 text-muted-foreground" />}
          <span className="text-sm text-muted-foreground">{file ? file.name : "Click to upload a picture (JPG, PNG, WEBP)"}</span>
          <input type="file" accept="image/*" className="hidden" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
        </label>
      </div>
    </div>
  );
};

export const ProductsSection = ({ products, inventory, refresh, format }: { products: any[]; inventory: any[]; refresh: () => any; format: (n: number) => string }) => {
  const { toast } = useToast();
  const [form, setForm] = useState<any>(emptyForm);
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [edit, setEdit] = useState<any | null>(null);
  const [editFile, setEditFile] = useState<File | null>(null);
  const inv = (id: string) => inventory.find((i) => i.product_id === id);

  const toRow = (v: any) => {
    const [category, subcategory] = String(v.item).split("|");
    return {
      name: sanitizeText(v.name, 160), price: Number(v.price),
      compare_price: v.compare_price ? Number(v.compare_price) : null,
      category, subcategory: subcategory || null, description: sanitizeText(v.description || "") || null,
    };
  };
  const saveInv = (id: string, v: any) =>
    supabase.from("product_inventory" as any).upsert({ product_id: id, quantity: Number(v.quantity || 0), buying_price: Number(v.buying_price || 0), updated_at: new Date().toISOString() } as any);

  const add = async () => {
    if (!form.item || !form.name || !form.price) return toast({ title: "Category, sub-category, name and price are required", variant: "destructive" });
    setBusy(true);
    try {
      const image = file ? await uploadImage(file) : null;
      const { data, error } = await supabase.from("products").insert({ ...toRow(form), image } as any).select("id").single();
      if (error) throw error;
      await saveInv(data.id, form);
      await logAudit("product.create", { entity: "products", entityId: data.id, details: { name: form.name } });
      setForm(emptyForm); setFile(null);
      toast({ title: "Product added" });
      refresh();
    } catch (e: any) { toast({ title: "Could not add product", description: e.message, variant: "destructive" }); }
    setBusy(false);
  };

  const open = (p: any) => {
    const i = inv(p.id);
    const cl = clusterOfProduct(p.category, p.subcategory);
    setEditFile(null);
    setEdit({ id: p.id, image: p.image, cluster: cl, item: `${p.category}|${p.subcategory ?? ""}`, name: p.name, price: String(p.price ?? ""), compare_price: p.compare_price ? String(p.compare_price) : "", buying_price: i ? String(i.buying_price) : "", quantity: i ? String(i.quantity) : "", description: p.description ?? "" });
  };

  const saveEdit = async () => {
    setBusy(true);
    try {
      const image = editFile ? await uploadImage(editFile) : edit.image;
      const { error } = await supabase.from("products").update({ ...toRow(edit), image } as any).eq("id", edit.id);
      if (error) throw error;
      await saveInv(edit.id, edit);
      await logAudit("product.update", { entity: "products", entityId: edit.id });
      toast({ title: "Product updated" }); setEdit(null); refresh();
    } catch (e: any) { toast({ title: "Could not save", description: e.message, variant: "destructive" }); }
    setBusy(false);
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    await supabase.from("products").delete().eq("id", id);
    await supabase.from("product_inventory" as any).delete().eq("product_id", id);
    await logAudit("product.delete", { entity: "products", entityId: id });
    setEdit(null); refresh();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle>Add a product</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <ProductForm v={form} set={setForm} file={file} setFile={setFile} />
          <Button onClick={add} disabled={busy} className="w-full">{busy ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />} Add product</Button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Catalogue ({products.length})</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {products.length === 0 && <p className="text-sm text-muted-foreground">No products stored yet.</p>}
          {products.map((p) => {
            const i = inv(p.id);
            return (
              <button key={p.id} onClick={() => open(p)} className="w-full text-left flex items-center justify-between gap-3 border border-border rounded-lg p-3 hover:bg-muted">
                <div className="flex items-center gap-3">
                  {p.image && <img src={p.image} alt={p.name} className="h-12 w-12 object-cover rounded" />}
                  <div>
                    <p className="font-semibold text-sm">{p.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(p.price)} • {clusterOfProduct(p.category, p.subcategory) || p.category} / {catalog.flatMap((c) => c.items).find((x) => x.category === p.category && (x.subcategory ?? "") === (p.subcategory ?? ""))?.name ?? p.subcategory ?? p.category}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={i && i.quantity > 0 ? "outline" : "destructive"}>{i ? `${i.quantity} in stock` : "No stock set"}</Badge>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </button>
            );
          })}
        </CardContent>
      </Card>
      <Dialog open={!!edit} onOpenChange={(o) => !o && setEdit(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Edit product</DialogTitle></DialogHeader>
          {edit && <>
            <ProductForm v={edit} set={setEdit} file={editFile} setFile={setEditFile} currentImage={edit.image} />
            <div className="flex gap-2">
              <Button onClick={saveEdit} disabled={busy} className="flex-1">{busy && <Loader2 className="h-4 w-4 mr-2 animate-spin" />} Save changes</Button>
              <Button variant="destructive" onClick={() => remove(edit.id)}><Trash2 className="h-4 w-4 mr-1" /> Delete</Button>
            </div>
          </>}
        </DialogContent>
      </Dialog>
    </div>
  );
};

/* ---------------- Offer targeting (organized) ---------------- */
const Chip = ({ active, onClick, children }: { active: boolean; onClick: () => void; children: any }) => (
  <button type="button" onClick={onClick}
    className={`px-2.5 py-1 rounded-full border text-xs transition-colors ${active ? "bg-foreground text-background border-foreground" : "border-border text-muted-foreground hover:text-foreground"}`}>{children}</button>
);

export const OfferTargets = ({ cats, setCats, subs, setSubs, prods, setProds, dbProducts }: {
  cats: string[]; setCats: (v: string[]) => void; subs: string[]; setSubs: (v: string[]) => void; prods: string[]; setProds: (v: string[]) => void; dbProducts: any[];
}) => {
  const [q, setQ] = useState("");
  const toggle = (arr: string[], set: (v: string[]) => void, v: string) => set(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);
  const pool = [...staticProducts.map((p) => ({ id: p.id, name: p.name, category: p.category })), ...dbProducts.map((p) => ({ id: p.id, name: p.name, category: p.category || "" }))];
  const all = !cats.length && !subs.length && !prods.length;
  const filtered = pool.filter((p) => !q || p.name.toLowerCase().includes(q.toLowerCase()));
  const byCat = filtered.reduce<Record<string, typeof pool>>((m, p) => { (m[p.category || "Other"] ||= []).push(p); return m; }, {});
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label>Applies to</Label>
        <Chip active={all} onClick={() => { setCats([]); setSubs([]); setProds([]); }}>All products</Chip>
      </div>
      <div className="grid lg:grid-cols-3 gap-3">
        <div className="border border-border rounded-lg p-3">
          <p className="text-xs font-semibold uppercase tracking-wider mb-3">1 · Categories {cats.length > 0 && `(${cats.length})`}</p>
          <div className="space-y-3">
            {catalog.map((c) => {
              const cs = Array.from(new Set(c.items.map((i) => i.category)));
              return (
                <div key={c.cluster}>
                  <p className="text-[11px] text-muted-foreground mb-1">{c.cluster}</p>
                  <div className="flex flex-wrap gap-1.5">{cs.map((x) => <Chip key={x} active={cats.includes(x)} onClick={() => toggle(cats, setCats, x)}>{x}</Chip>)}</div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="border border-border rounded-lg p-3">
          <p className="text-xs font-semibold uppercase tracking-wider mb-3">2 · Sub-categories {subs.length > 0 && `(${subs.length})`}</p>
          <div className="space-y-3">
            {catalog.map((c) => {
              const items = c.items.filter((i) => i.subcategory);
              if (!items.length) return null;
              return (
                <div key={c.cluster}>
                  <p className="text-[11px] text-muted-foreground mb-1">{c.cluster}</p>
                  <div className="flex flex-wrap gap-1.5">{items.map((i) => {
                    const key = `${i.category} / ${i.subcategory}`;
                    return <Chip key={key} active={subs.includes(key)} onClick={() => toggle(subs, setSubs, key)}>{i.name}</Chip>;
                  })}</div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="border border-border rounded-lg p-3">
          <p className="text-xs font-semibold uppercase tracking-wider mb-3">3 · Products {prods.length > 0 && `(${prods.length})`}</p>
          <Input placeholder="Search a product…" value={q} onChange={(e) => setQ(e.target.value)} className="mb-2 h-8" />
          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {Object.entries(byCat).map(([cat, list]) => (
              <div key={cat}>
                <p className="text-[11px] text-muted-foreground mb-1">{cat}</p>
                <div className="flex flex-wrap gap-1.5">{list.map((p) => <Chip key={p.id} active={prods.includes(p.id)} onClick={() => toggle(prods, setProds, p.id)}>{p.name}</Chip>)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <p className="text-xs text-muted-foreground">{all ? "Nothing selected — the offer applies to every product on the website." : "The offer applies only to the selected categories, sub-categories and products."}</p>
    </div>
  );
};

/* ---------------- Profit helpers ---------------- */
export const orderProfit = (o: any, inventory: any[]) => {
  const items: any[] = Array.isArray(o.items) ? o.items : [];
  const cost = items.reduce((a, i) => a + Number(inventory.find((x) => x.product_id === String(i.id))?.buying_price ?? 0) * Number(i.quantity || 1), 0);
  const revenue = Number(o.total || 0);
  const shipping = Number(o.shipping_cost || 0);
  const discount = Number(o.discount_amount || 0);
  return { revenue, cost, shipping, discount, net: revenue - cost - shipping };
};

/* ---------------- Expenses ---------------- */
const EXP_CATS = ["Salaries", "Rent", "Bills (electricity, water, internet)", "Marketing", "Shipping", "Stock purchase", "Taxes", "Software", "Other"];
export const ExpensesSection = ({ format, onChange }: { format: (n: number) => string; onChange?: () => void }) => {
  const { toast } = useToast();
  const [rows, setRows] = useState<any[]>([]);
  const [f, setF] = useState({ category: "Salaries", label: "", amount: "", spent_on: new Date().toISOString().slice(0, 10), notes: "" });
  const [filter, setFilter] = useState("all");
  const load = async () => { const { data } = await supabase.from("expenses" as any).select("*").order("spent_on", { ascending: false }); setRows((data as any[]) ?? []); };
  useEffect(() => { load(); }, []);
  const add = async () => {
    if (!f.label || !f.amount) return toast({ title: "Label and amount are required", variant: "destructive" });
    const { data: u } = await supabase.auth.getUser();
    const { error } = await supabase.from("expenses" as any).insert({ ...f, label: sanitizeText(f.label, 160), notes: sanitizeText(f.notes) || null, amount: Number(f.amount), created_by: u.user?.id } as any);
    if (error) return toast({ title: "Could not save", description: error.message, variant: "destructive" });
    await logAudit("expense.create", { entity: "expenses", details: { amount: f.amount, category: f.category } });
    setF({ ...f, label: "", amount: "", notes: "" }); load(); onChange?.();
  };
  const del = async (id: string) => { if (!confirm("Delete this expense?")) return; await supabase.from("expenses" as any).delete().eq("id", id); load(); onChange?.(); };
  const shown = rows.filter((r) => filter === "all" || r.category === filter);
  const total = shown.reduce((a, r) => a + Number(r.amount), 0);
  const byCat = EXP_CATS.map((c) => [c, rows.filter((r) => r.category === c).reduce((a, r) => a + Number(r.amount), 0)] as const).filter(([, v]) => v > 0);
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle>Register an expense</CardTitle></CardHeader>
        <CardContent className="grid sm:grid-cols-2 gap-3">
          <div className="space-y-1"><Label>Type</Label><select className={selectCls} value={f.category} onChange={(e) => setF({ ...f, category: e.target.value })}>{EXP_CATS.map((c) => <option key={c}>{c}</option>)}</select></div>
          <div className="space-y-1"><Label>Label</Label><Input placeholder="e.g. Salary — Fatima, October" value={f.label} onChange={(e) => setF({ ...f, label: e.target.value })} /></div>
          <div className="space-y-1"><Label>Amount</Label><Input type="number" value={f.amount} onChange={(e) => setF({ ...f, amount: e.target.value })} /></div>
          <div className="space-y-1"><Label>Date</Label><Input type="date" value={f.spent_on} onChange={(e) => setF({ ...f, spent_on: e.target.value })} /></div>
          <div className="space-y-1 sm:col-span-2"><Label>Notes</Label><Textarea value={f.notes} onChange={(e) => setF({ ...f, notes: e.target.value })} /></div>
          <Button onClick={add} className="sm:col-span-2"><Plus className="h-4 w-4 mr-1" /> Add expense</Button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="gap-3">
          <CardTitle>Expenses — total {format(total)}</CardTitle>
          <div className="flex flex-wrap gap-2">
            <Chip active={filter === "all"} onClick={() => setFilter("all")}>All</Chip>
            {EXP_CATS.map((c) => <Chip key={c} active={filter === c} onClick={() => setFilter(c)}>{c}</Chip>)}
          </div>
          {byCat.length > 0 && <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">{byCat.map(([c, v]) => <span key={c}>{c}: <b className="text-foreground">{format(v)}</b></span>)}</div>}
        </CardHeader>
        <CardContent className="space-y-2">
          {shown.length === 0 && <p className="text-sm text-muted-foreground">No expenses recorded.</p>}
          {shown.map((r) => (
            <div key={r.id} className="flex items-center justify-between gap-2 border border-border rounded-lg p-3 text-sm">
              <div><div className="font-medium">{r.label}</div><div className="text-xs text-muted-foreground">{r.category} • {r.spent_on}{r.notes ? ` • ${r.notes}` : ""}</div></div>
              <div className="flex items-center gap-2"><span className="font-semibold text-destructive">−{format(Number(r.amount))}</span>
                <Button size="sm" variant="ghost" onClick={() => del(r.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button></div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

/* ---------------- APIs & Connections ---------------- */
type Preset = { id: string; name: string; group: string; fields: [string, string, boolean?][] };
const PRESETS: Preset[] = [
  { id: "supabase", name: "Supabase", group: "Database", fields: [["url", "Project URL"], ["anon_key", "Anon / publishable key"], ["service_key", "Service role key", true]] },
  { id: "whatsapp", name: "WhatsApp Business API", group: "Messaging", fields: [["phone_number_id", "Phone number ID"], ["business_account_id", "Business account ID"], ["access_token", "Access token", true]] },
  { id: "twilio", name: "Twilio (SMS)", group: "Messaging", fields: [["account_sid", "Account SID"], ["auth_token", "Auth token", true], ["from_number", "From number"]] },
  { id: "email_smtp", name: "Email (SMTP)", group: "Messaging", fields: [["host", "SMTP host"], ["port", "Port"], ["username", "Username"], ["password", "Password", true]] },
  { id: "meta", name: "Facebook / Instagram", group: "Social media", fields: [["page_id", "Page ID"], ["instagram_id", "Instagram account ID"], ["access_token", "Access token", true]] },
  { id: "tiktok", name: "TikTok", group: "Social media", fields: [["app_id", "App ID"], ["access_token", "Access token", true]] },
  { id: "x", name: "X (Twitter)", group: "Social media", fields: [["api_key", "API key"], ["api_secret", "API secret", true], ["access_token", "Access token", true]] },
  { id: "amana", name: "Amana", group: "Shipping", fields: [["account_id", "Account ID"], ["api_key", "API key", true], ["endpoint", "API URL"]] },
  { id: "aramex", name: "Aramex", group: "Shipping", fields: [["account_number", "Account number"], ["username", "Username"], ["password", "Password", true], ["pin", "Account PIN", true]] },
  { id: "dhl", name: "DHL Express", group: "Shipping", fields: [["account_number", "Account number"], ["api_key", "API key"], ["api_secret", "API secret", true]] },
  { id: "shipping_custom", name: "Other delivery company", group: "Shipping", fields: [["company", "Company name"], ["endpoint", "API URL"], ["api_key", "API key", true]] },
  { id: "paypal", name: "PayPal", group: "Payments", fields: [["client_id", "Client ID"], ["secret", "Secret", true]] },
  { id: "stripe", name: "Stripe", group: "Payments", fields: [["publishable_key", "Publishable key"], ["secret_key", "Secret key", true]] },
  { id: "cmi", name: "CMI (Moroccan cards)", group: "Payments", fields: [["merchant_id", "Merchant ID"], ["store_key", "Store key", true]] },
  { id: "ga4", name: "Google Analytics", group: "Analytics & ads", fields: [["measurement_id", "Measurement ID (G-…)"], ["api_secret", "API secret", true]] },
  { id: "meta_pixel", name: "Meta Pixel", group: "Analytics & ads", fields: [["pixel_id", "Pixel ID"], ["conversions_token", "Conversions API token", true]] },
  { id: "webhook", name: "Webhook", group: "Automation", fields: [["url", "Webhook URL"], ["secret", "Signing secret", true]] },
  { id: "n8n", name: "n8n / Zapier / Make", group: "Automation", fields: [["url", "Webhook URL"], ["api_key", "API key", true]] },
];

export const ConnectionsSection = () => {
  const { toast } = useToast();
  const [rows, setRows] = useState<any[]>([]);
  const [open, setOpen] = useState<Preset | "custom" | null>(null);
  const [label, setLabel] = useState("");
  const [vals, setVals] = useState<Record<string, string>>({});
  const [custom, setCustom] = useState<{ k: string; v: string }[]>([{ k: "", v: "" }]);
  const [customName, setCustomName] = useState("");
  const [reveal, setReveal] = useState<string | null>(null);
  const load = async () => { const { data } = await supabase.from("api_connections" as any).select("*").order("created_at", { ascending: false }); setRows((data as any[]) ?? []); };
  useEffect(() => { load(); }, []);
  const groups = Array.from(new Set(PRESETS.map((p) => p.group)));

  const save = async () => {
    let provider: string, category: string, fields: Record<string, string>;
    if (open === "custom") {
      if (!customName.trim()) return toast({ title: "Give the connection a name", variant: "destructive" });
      provider = sanitizeText(customName, 80); category = "custom";
      fields = Object.fromEntries(custom.filter((c) => c.k.trim()).map((c) => [sanitizeText(c.k, 80), c.v.trim()]));
    } else if (open) {
      provider = open.id; category = open.group; fields = Object.fromEntries(Object.entries(vals).map(([k, v]) => [k, v.trim()]));
    } else return;
    const { error } = await supabase.from("api_connections" as any).insert({ provider, category, label: sanitizeText(label, 80) || null, fields } as any);
    if (error) return toast({ title: "Could not save", description: error.message, variant: "destructive" });
    await logAudit("connection.create", { entity: "api_connections", details: { provider } });
    toast({ title: "Connection saved" });
    setOpen(null); setLabel(""); setVals({}); setCustom([{ k: "", v: "" }]); setCustomName(""); load();
  };
  const toggle = async (r: any) => { await supabase.from("api_connections" as any).update({ is_active: !r.is_active } as any).eq("id", r.id); load(); };
  const del = async (r: any) => { if (!confirm("Remove this connection?")) return; await supabase.from("api_connections" as any).delete().eq("id", r.id); await logAudit("connection.delete", { entity: "api_connections", entityId: r.id }); load(); };
  const nameOf = (id: string) => PRESETS.find((p) => p.id === id)?.name ?? id;
  const mask = (v: string) => (v.length <= 6 ? "••••" : `${v.slice(0, 3)}••••${v.slice(-3)}`);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2"><Plug className="h-5 w-5" /> APIs & Connections</CardTitle>
          <Button onClick={() => setOpen("custom")}><Plus className="h-4 w-4 mr-1" /> Set a new connection</Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {groups.map((g) => (
            <div key={g}>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">{g}</p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-2">
                {PRESETS.filter((p) => p.group === g).map((p) => {
                  const n = rows.filter((r) => r.provider === p.id).length;
                  return (
                    <button key={p.id} onClick={() => { setOpen(p); setVals({}); }} className="text-left border border-border rounded-lg p-3 hover:border-foreground">
                      <div className="font-medium text-sm">{p.name}</div>
                      <div className="text-xs text-muted-foreground">{n ? `${n} connected` : "Connect"}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Saved connections ({rows.length})</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {rows.length === 0 && <p className="text-sm text-muted-foreground">Nothing connected yet.</p>}
          {rows.map((r) => (
            <div key={r.id} className="border border-border rounded-lg p-3 text-sm">
              <div className="flex items-center justify-between gap-2">
                <div><span className="font-medium">{nameOf(r.provider)}</span>{r.label && <span className="text-muted-foreground"> — {r.label}</span>} <Badge variant="outline" className="ml-1">{r.category}</Badge></div>
                <div className="flex items-center gap-1">
                  <Button size="sm" variant="ghost" onClick={() => setReveal(reveal === r.id ? null : r.id)}>{reveal === r.id ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</Button>
                  <Button size="sm" variant="outline" onClick={() => toggle(r)}>{r.is_active ? "Active" : "Paused"}</Button>
                  <Button size="sm" variant="ghost" onClick={() => del(r)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              </div>
              <div className="mt-2 grid sm:grid-cols-2 gap-x-4 text-xs text-muted-foreground">
                {Object.entries(r.fields || {}).map(([k, v]) => <span key={k}>{k}: <span className="font-mono">{reveal === r.id ? String(v) : mask(String(v))}</span></span>)}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
      <Dialog open={!!open} onOpenChange={(o) => !o && setOpen(null)}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{open === "custom" ? "Set a new connection" : `Connect ${open ? (open as Preset).name : ""}`}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            {open === "custom" && <div className="space-y-1"><Label>Platform name</Label><Input value={customName} onChange={(e) => setCustomName(e.target.value)} placeholder="e.g. Glovo, Jumia, Odoo…" /></div>}
            <div className="space-y-1"><Label>Label (optional)</Label><Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="e.g. Production" /></div>
            {open && open !== "custom" && open.fields.map(([k, l, secret]) => (
              <div key={k} className="space-y-1"><Label>{l}</Label><Input type={secret ? "password" : "text"} value={vals[k] ?? ""} onChange={(e) => setVals({ ...vals, [k]: e.target.value })} /></div>
            ))}
            {open === "custom" && <>
              {custom.map((c, i) => (
                <div key={i} className="flex gap-2">
                  <Input placeholder="Field (e.g. api_key)" value={c.k} onChange={(e) => setCustom(custom.map((x, j) => (j === i ? { ...x, k: e.target.value } : x)))} />
                  <Input placeholder="Value" value={c.v} onChange={(e) => setCustom(custom.map((x, j) => (j === i ? { ...x, v: e.target.value } : x)))} />
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={() => setCustom([...custom, { k: "", v: "" }])}><Plus className="h-4 w-4 mr-1" /> Add field</Button>
            </>}
            <p className="text-xs text-muted-foreground">Only admins can read saved connections.</p>
            <Button onClick={save} className="w-full">Save connection</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

/* ---------------- Administration: Admin + Company ---------------- */
export const AdminOwnerPanel = ({ profiles, orders, inventory, format }: { profiles: any[]; orders: any[]; inventory: any[]; format: (n: number) => string }) => {
  const owner = profiles.find((p) => p.email?.toLowerCase() === OWNER_EMAIL);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [range, setRange] = useState<"all" | "month" | "week" | "day">("month");
  useEffect(() => { supabase.from("expenses" as any).select("*").then(({ data }) => setExpenses((data as any[]) ?? [])); }, []);
  const since = range === "all" ? 0 : Date.now() - ({ day: 1, week: 7, month: 30 } as const)[range] * 864e5;
  const os = orders.filter((o) => new Date(o.created_at).getTime() >= since && !["returned", "refunded", "cancelled"].includes(String(o.status)));
  const rows = os.map((o) => ({ o, ...orderProfit(o, inventory) }));
  const sum = (k: "revenue" | "cost" | "shipping" | "discount" | "net") => rows.reduce((a, r) => a + r[k], 0);
  const exp = expenses.filter((e) => new Date(e.spent_on).getTime() >= since).reduce((a, e) => a + Number(e.amount), 0);
  const net = sum("net") - exp;
  const Stat = ({ l, v, neg }: { l: string; v: number; neg?: boolean }) => (
    <div className="border border-border rounded-lg p-4"><p className="text-xs uppercase tracking-wider text-muted-foreground">{l}</p><p className={`text-xl font-bold ${neg ? "text-destructive" : ""}`}>{format(v)}</p></div>
  );
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Crown className="h-5 w-5" /> Admin</CardTitle></CardHeader>
        <CardContent className="text-sm space-y-1">
          <p className="font-medium">{owner?.full_name || "Adil Lamrani"} <Badge className="ml-1">Owner — cannot be removed</Badge></p>
          <p className="text-muted-foreground">{OWNER_EMAIL}{owner?.phone ? ` • ${owner.phone}` : ""}{owner?.city ? ` • ${owner.city}` : ""}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="gap-3">
          <CardTitle>Net profits</CardTitle>
          <div className="flex gap-2">{(["day", "week", "month", "all"] as const).map((r) => <Chip key={r} active={range === r} onClick={() => setRange(r)}>{r === "all" ? "All time" : r === "day" ? "Today" : `This ${r}`}</Chip>)}</div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <Stat l="Sales" v={sum("revenue")} />
            <Stat l="Discounts given" v={sum("discount")} neg />
            <Stat l="Buying cost" v={sum("cost")} neg />
            <Stat l="Shipping" v={sum("shipping")} neg />
            <Stat l="Expenses" v={exp} neg />
            <Stat l="Net profit" v={net} neg={net < 0} />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[640px]">
              <thead><tr className="text-left text-xs uppercase text-muted-foreground border-b border-border"><th className="py-2">Order</th><th>Payment</th><th>Sale</th><th>Discount</th><th>Cost</th><th>Shipping</th><th>Profit</th></tr></thead>
              <tbody>{rows.map((r) => (
                <tr key={r.o.id} className="border-b border-border/50"><td className="py-2">{r.o.order_id}</td><td>{String(r.o.payment_method).startsWith("cod") ? "COD" : "Online"}</td>
                  <td>{format(r.revenue)}</td><td className="text-muted-foreground">−{format(r.discount)}</td><td className="text-muted-foreground">−{format(r.cost)}</td><td className="text-muted-foreground">−{format(r.shipping)}</td>
                  <td className={r.net < 0 ? "text-destructive font-medium" : "font-medium"}>{format(r.net)}</td></tr>))}
                {rows.length === 0 && <tr><td colSpan={7} className="py-3 text-muted-foreground">No sales in this period.</td></tr>}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted-foreground">Profit = sale (after online/quantity discounts) − buying price × quantity − shipping. Returned and cancelled orders are excluded. Set each product's buying price in Products for accurate figures.</p>
        </CardContent>
      </Card>
    </div>
  );
};

const COMPANY_FIELDS: [string, string][] = [
  ["name", "Company name"], ["legal_name", "Legal name"], ["ice", "ICE"], ["rc", "RC (trade register)"], ["if", "IF (tax ID)"], ["patente", "Patente"],
  ["address", "Address"], ["city", "City"], ["country", "Country"], ["phone", "Phone"], ["whatsapp", "WhatsApp"], ["email", "Email"], ["website", "Website"],
  ["instagram", "Instagram"], ["facebook", "Facebook"], ["tiktok", "TikTok"], ["x", "X (Twitter)"], ["youtube", "YouTube"], ["linkedin", "LinkedIn"],
  ["bank_name", "Bank"], ["rib", "RIB / IBAN"],
];
export const CompanyPanel = () => {
  const { toast } = useToast();
  const [d, setD] = useState<Record<string, string>>({});
  useEffect(() => { supabase.from("company_settings" as any).select("data").eq("id", 1).maybeSingle().then(({ data }) => setD(((data as any)?.data as any) ?? { name: "Lamra Lux", country: "Morocco" })); }, []);
  const save = async () => {
    const clean = Object.fromEntries(Object.entries(d).map(([k, v]) => [k, sanitizeText(String(v ?? ""), 300)]));
    const { error } = await supabase.from("company_settings" as any).upsert({ id: 1, data: clean, updated_at: new Date().toISOString() } as any);
    if (error) return toast({ title: "Could not save", description: error.message, variant: "destructive" });
    await logAudit("company.update", { entity: "company_settings" });
    toast({ title: "Company info saved" });
  };
  const groups: [string, string[]][] = [
    ["Identity", ["name", "legal_name", "ice", "rc", "if", "patente"]],
    ["Address & contact", ["address", "city", "country", "phone", "whatsapp", "email", "website"]],
    ["Social media", ["instagram", "facebook", "tiktok", "x", "youtube", "linkedin"]],
    ["Banking", ["bank_name", "rib"]],
  ];
  const labelOf = (k: string) => COMPANY_FIELDS.find(([x]) => x === k)?.[1] ?? k;
  return (
    <Card>
      <CardHeader><CardTitle>Company</CardTitle></CardHeader>
      <CardContent className="space-y-5">
        {groups.map(([g, ks]) => (
          <div key={g}>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">{g}</p>
            <div className="grid sm:grid-cols-2 gap-3">{ks.map((k) => (
              <div key={k} className="space-y-1"><Label className="text-xs">{labelOf(k)}</Label><Input value={d[k] ?? ""} onChange={(e) => setD({ ...d, [k]: e.target.value })} /></div>
            ))}</div>
          </div>
        ))}
        <Button onClick={save}>Save company info</Button>
      </CardContent>
    </Card>
  );
};

export const useInventory = () => {
  const [inv, setInv] = useState<any[]>([]);
  const load = async () => { const { data } = await supabase.from("product_inventory" as any).select("*"); setInv((data as any[]) ?? []); };
  useEffect(() => { load(); }, []);
  return useMemo(() => ({ inventory: inv, reloadInventory: load }), [inv]);
};
