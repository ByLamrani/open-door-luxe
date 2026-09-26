import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Loader2,
  ShieldCheck,
  ShieldAlert,
  FileText,
  Download,
  Package,
  Truck,
  CreditCard,
  Users,
  BarChart3,
  Sparkles,
  Trash2,
  Plus,
  LayoutDashboard,
  ShoppingCart,
  Verified,
  Wallet,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useCurrency } from "@/context/CurrencyContext";
import { Link } from "react-router-dom";
import { LogOut, ScrollText, UserCog, Store } from "lucide-react";
import { logAudit, sanitizeText } from "@/lib/audit";
import * as XLSX from "xlsx";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { catalog } from "@/data/catalog";
import { products as staticProducts } from "@/data/products";
import { ImagePlus, ChevronRight } from "lucide-react";

const CATEGORIES = Array.from(new Set(catalog.flatMap((c) => c.items.map((i) => i.category))));
const subcategoriesOf = (cat: string) =>
  Array.from(new Set(catalog.flatMap((c) => c.items).filter((i) => i.category === cat && i.subcategory).map((i) => i.subcategory!)));
const ALL_SUBS = CATEGORIES.flatMap((c) => subcategoriesOf(c).map((s) => `${c} / ${s}`));
const ORDER_STATUSES = ["processing", "shipped", "delivered", "returned", "received"];
const selectCls = "w-full h-10 rounded-md border border-input bg-background px-3 text-sm";

const Chip = ({ active, onClick, children }: { active: boolean; onClick: () => void; children: any }) => (
  <button
    type="button"
    onClick={onClick}
    className={`px-3 py-1 rounded-full border text-xs transition-colors ${active ? "bg-foreground text-background border-foreground" : "border-border text-muted-foreground hover:text-foreground"}`}
  >
    {children}
  </button>
);

type Tab =
  | "overview"
  | "orders"
  | "logistics"
  | "payments"
  | "products"
  | "offers"
  | "users"
  | "verification"
  | "withdrawals"
  | "activity";

const TABS: { id: Tab; label: string; icon: any }[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "orders", label: "Orders", icon: ShoppingCart },
  { id: "logistics", label: "Logistics", icon: Truck },
  { id: "payments", label: "Payments", icon: CreditCard },
  { id: "products", label: "Products", icon: Package },
  { id: "offers", label: "Special Offers", icon: Sparkles },
  { id: "users", label: "Users & Access", icon: UserCog },
  { id: "verification", label: "Verification", icon: Verified },
  { id: "withdrawals", label: "Withdrawals", icon: Wallet },
  { id: "activity", label: "Activity log", icon: ScrollText },
];

const ORDER_BUCKETS: { key: string; label: string; statuses: string[] }[] = [
  { key: "stock", label: "In stock / preparing", statuses: ["pending", "processing", "paid", "confirmed"] },
  { key: "delivery", label: "On delivery", statuses: ["shipped", "on_delivery", "in_transit"] },
  { key: "received", label: "Received", statuses: ["delivered", "completed", "received"] },
  { key: "returned", label: "Returned", statuses: ["returned", "refunded", "cancelled"] },
];

const AdminPanel = () => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { format } = useCurrency();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [tab, setTab] = useState<Tab>("overview");
  const [busy, setBusy] = useState<string | null>(null);

  const [docs, setDocs] = useState<any[]>([]);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [topups, setTopups] = useState<any[]>([]);
  const [txns, setTxns] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [offers, setOffers] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [userSearch, setUserSearch] = useState("");
  const [newUser, setNewUser] = useState({ email: "", password: "", full_name: "" });

  const callAdminUsers = async (body: Record<string, unknown>, okMsg: string) => {
    const { data, error } = await supabase.functions.invoke("admin-users", { body });
    if (error || (data as any)?.error) {
      let msg = (data as any)?.error || error?.message;
      try { msg = (await (error as any)?.context?.json())?.error ?? msg; } catch { /* ignore */ }
      toast({ title: "Action failed", description: typeof msg === "string" ? msg : JSON.stringify(msg), variant: "destructive" });
      return false;
    }
    await logAudit(`user.${body.action}`, { entity: "auth.users", entityId: String(body.user_id ?? body.email ?? ""), details: {} });
    toast({ title: okMsg });
    refresh();
    return true;
  };
  const createUser = async () => {
    if (!newUser.email || newUser.password.length < 8) {
      toast({ title: "Email and a password of 8+ characters are required", variant: "destructive" });
      return;
    }
    if (await callAdminUsers({ action: "create", ...newUser, full_name: sanitizeText(newUser.full_name) }, "User created"))
      setNewUser({ email: "", password: "", full_name: "" });
  };
  const deleteUser = async (p: any) => {
    if (!confirm(`Permanently delete ${p.email}? This cannot be undone.`)) return;
    await callAdminUsers({ action: "delete", user_id: p.user_id }, "User deleted");
  };
  const editUser = async (p: any) => {
    const full_name = prompt("Full name", p.full_name || ""); if (full_name === null) return;
    const phone = prompt("Phone", p.phone || ""); if (phone === null) return;
    const city = prompt("City", p.city || ""); if (city === null) return;
    const home_address = prompt("Address", p.home_address || ""); if (home_address === null) return;
    await callAdminUsers({ action: "update", user_id: p.user_id, full_name: sanitizeText(full_name), phone: sanitizeText(phone), city: sanitizeText(city), home_address: sanitizeText(home_address) }, "Client updated");
  };

  const emptyProduct = { name: "", price: "", compare_price: "", category: "", subcategory: "", description: "" };
  const [newProduct, setNewProduct] = useState(emptyProduct);
  const [productFile, setProductFile] = useState<File | null>(null);
  const [newOffer, setNewOffer] = useState({ title: "", occasion: "", discount_pct: "", ends_at: "", description: "" });
  const [offerCats, setOfferCats] = useState<string[]>([]);
  const [offerSubs, setOfferSubs] = useState<string[]>([]);
  const [offerProds, setOfferProds] = useState<string[]>([]);
  const [offerProdSearch, setOfferProdSearch] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState("all");
  const [orderRange, setOrderRange] = useState<"all" | "day" | "week" | "month">("all");
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [confirmSignOut, setConfirmSignOut] = useState(false);
  const [paySub, setPaySub] = useState("summary");
  const [logSub, setLogSub] = useState("overview");
  const [companies, setCompanies] = useState<any[]>([]);
  const [newCompany, setNewCompany] = useState({ name: "", contact_phone: "", contact_email: "", price_per_delivery: "" });
  const toggleIn = (arr: string[], set: (v: string[]) => void, v: string) =>
    set(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate("/admin/login");
      return;
    }
    (async () => {
      const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", user.id);
      const admin = !!roles?.some((r: any) => r.role === "admin");
      setIsAdmin(admin);
      if (admin) await refresh();
    })();
  }, [user, loading]);

  const refresh = async () => {
    const [d, w, o, p, pr, t, tx, j, of, rl, al] = await Promise.all([
      supabase.from("verification_documents").select("*").eq("status", "pending").order("created_at", { ascending: false }),
      supabase.from("withdrawal_requests").select("*").order("created_at", { ascending: false }),
      supabase.from("orders").select("*").order("created_at", { ascending: false }),
      supabase.from("products").select("*").order("created_at", { ascending: false }),
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("wallet_topups").select("*").order("created_at", { ascending: false }),
      supabase.from("wallet_transactions").select("*").order("created_at", { ascending: false }).limit(500),
      supabase.from("shipping_jobs").select("*").order("created_at", { ascending: false }),
      supabase.from("special_offers" as any).select("*").order("created_at", { ascending: false }),
      supabase.from("user_roles").select("*"),
      supabase.from("audit_logs" as any).select("*").order("created_at", { ascending: false }).limit(200),
    ]);
    const { data: dc } = await supabase.from("delivery_companies" as any).select("*").order("created_at", { ascending: false });
    setCompanies((dc as any[]) ?? []);
    setRoles(rl.data ?? []);
    setAuditLogs((al.data as any[]) ?? []);
    setDocs(d.data ?? []);
    setWithdrawals(w.data ?? []);
    setOrders(o.data ?? []);
    setProducts(p.data ?? []);
    setProfiles(pr.data ?? []);
    setTopups(t.data ?? []);
    setTxns(tx.data ?? []);
    setJobs(j.data ?? []);
    setOffers((of.data as any[]) ?? []);
  };

  const stats = useMemo(() => {
    const revenue = orders.reduce((a, o) => a + Number(o.total || 0), 0);
    const paidOnline = orders.filter((o) => o.payment_method !== "cod");
    const now = Date.now();
    const last30 = orders.filter((o) => now - new Date(o.created_at).getTime() < 30 * 864e5);
    return {
      revenue,
      orders: orders.length,
      last30Revenue: last30.reduce((a, o) => a + Number(o.total || 0), 0),
      last30Orders: last30.length,
      customers: profiles.length,
      avgBasket: orders.length ? revenue / orders.length : 0,
      onlineShare: orders.length ? (paidOnline.length / orders.length) * 100 : 0,
      topups: topups.reduce((a, t) => a + Number(t.amount || 0), 0),
      products: products.length,
    };
  }, [orders, profiles, topups, products]);

  const bucketCount = (statuses: string[]) =>
    orders.filter((o) => statuses.includes(String(o.status || "").toLowerCase())).length;

  const exportExcel = () => {
    const wb = XLSX.utils.book_new();
    const sheets: [string, any[]][] = [
      [
        "Summary",
        [
          { Metric: "Total revenue", Value: stats.revenue },
          { Metric: "Total orders", Value: stats.orders },
          { Metric: "Revenue (30 days)", Value: stats.last30Revenue },
          { Metric: "Orders (30 days)", Value: stats.last30Orders },
          { Metric: "Customers", Value: stats.customers },
          { Metric: "Average basket", Value: stats.avgBasket },
          { Metric: "Online payment share (%)", Value: stats.onlineShare },
          { Metric: "Wallet top-ups", Value: stats.topups },
          { Metric: "Products listed", Value: stats.products },
          ...ORDER_BUCKETS.map((b) => ({ Metric: b.label, Value: bucketCount(b.statuses) })),
        ],
      ],
      [
        "Orders",
        orders.map((o) => ({
          order_id: o.order_id,
          date: o.created_at,
          status: o.status,
          payment_method: o.payment_method,
          subtotal: o.subtotal,
          discount: o.discount_amount,
          total: o.total,
          deposit: o.deposit_amount,
          due_on_delivery: o.due_on_delivery,
          items: JSON.stringify(o.items),
          shipping: JSON.stringify(o.shipping_info),
        })),
      ],
      ["Products", products],
      [
        "Customers",
        profiles.map((p) => ({
          full_name: p.full_name,
          email: p.email,
          phone: p.phone,
          city: p.city,
          country: p.country,
          verified: p.is_verified,
          created_at: p.created_at,
        })),
      ],
      ["Payments", topups],
      ["WalletTransactions", txns],
      ["Logistics", jobs],
      ["SpecialOffers", offers],
      ["Withdrawals", withdrawals],
    ];
    sheets.forEach(([name, rows]) => {
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows.length ? rows : [{}]), name);
    });
    XLSX.writeFile(wb, `lamra-lux-data-${new Date().toISOString().slice(0, 10)}.xlsx`);
    toast({ title: "Excel file downloaded", description: "Editable workbook with every dataset." });
  };

  const signedUrl = async (path: string) => {
    const { data } = await supabase.storage.from("verification-docs").createSignedUrl(path, 60);
    if (data?.signedUrl) window.open(data.signedUrl, "_blank");
  };

  const decideDoc = async (doc: any, decision: "approved" | "rejected") => {
    setBusy(doc.id);
    const { error } = await supabase
      .from("verification_documents")
      .update({ status: decision, reviewed_by: user!.id, reviewed_at: new Date().toISOString() })
      .eq("id", doc.id);
    if (!error && decision === "approved") {
      await supabase
        .from("profiles")
        .update({ is_verified: true, verified_at: new Date().toISOString() } as any)
        .eq("user_id", doc.user_id);
    }
    setBusy(null);
    await logAudit(`verification.${decision}`, { entity: "verification_documents", entityId: doc.id });
    toast({ title: `Document ${decision}` });
    refresh();
  };

  const decideWithdrawal = async (w: any, decision: "approved" | "rejected") => {
    setBusy(w.id);
    await supabase
      .from("withdrawal_requests")
      .update({ status: decision, processed_by: user!.id, processed_at: new Date().toISOString() })
      .eq("id", w.id);
    setBusy(null);
    await logAudit(`withdrawal.${decision}`, { entity: "withdrawal_requests", entityId: w.id, details: { amount: w.amount } });
    toast({ title: `Withdrawal ${decision}` });
    refresh();
  };

  const setOrderStatus = async (o: any, status: string) => {
    setBusy(o.id);
    const { error } = await supabase.from("orders").update({ status }).eq("id", o.id);
    setBusy(null);
    if (error) return toast({ title: "Could not update status", description: error.message, variant: "destructive" });
    await logAudit("order.status_change", { entity: "orders", entityId: o.order_id ?? o.id, details: { status } });
    if (selectedOrder?.id === o.id) setSelectedOrder({ ...o, status });
    toast({ title: `Order ${o.order_id} → ${status}` });
    refresh();
  };

  const updateOrder = async (o: any, patch: Record<string, unknown>) => {
    const { error } = await supabase.from("orders").update(patch as any).eq("id", o.id);
    if (error) return toast({ title: "Could not update order", description: error.message, variant: "destructive" });
    await logAudit("order.update", { entity: "orders", entityId: o.order_id ?? o.id, details: patch });
    refresh();
  };

  const addCompany = async () => {
    if (!newCompany.name.trim()) return toast({ title: "Company name is required", variant: "destructive" });
    const { error } = await supabase.from("delivery_companies" as any).insert({
      name: sanitizeText(newCompany.name, 120),
      contact_phone: sanitizeText(newCompany.contact_phone, 40) || null,
      contact_email: sanitizeText(newCompany.contact_email, 160) || null,
      price_per_delivery: Number(newCompany.price_per_delivery || 0),
    });
    if (error) return toast({ title: "Could not add company", description: error.message, variant: "destructive" });
    await logAudit("delivery_company.create", { entity: "delivery_companies", details: { name: newCompany.name } });
    setNewCompany({ name: "", contact_phone: "", contact_email: "", price_per_delivery: "" });
    refresh();
  };

  const deleteCompany = async (id: string) => {
    await supabase.from("delivery_companies" as any).delete().eq("id", id);
    await logAudit("delivery_company.delete", { entity: "delivery_companies", entityId: id });
    refresh();
  };

  const addProduct = async () => {
    if (!newProduct.category || !newProduct.name || !newProduct.price) {
      toast({ title: "Category, name and price are required", variant: "destructive" });
      return;
    }
    setBusy("new-product");
    let image: string | null = null;
    if (productFile) {
      const ext = productFile.name.split(".").pop() || "jpg";
      const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error: upErr } = await supabase.storage.from("product-images").upload(path, productFile);
      if (upErr) {
        setBusy(null);
        return toast({ title: "Image upload failed", description: upErr.message, variant: "destructive" });
      }
      const { data: signed } = await supabase.storage.from("product-images").createSignedUrl(path, 60 * 60 * 24 * 365 * 10);
      image = signed?.signedUrl ?? null;
    }
    const { error } = await supabase.from("products").insert({
      name: sanitizeText(newProduct.name, 160),
      price: Number(newProduct.price),
      compare_price: newProduct.compare_price ? Number(newProduct.compare_price) : null,
      category: newProduct.category,
      subcategory: newProduct.subcategory || null,
      image,
      description: sanitizeText(newProduct.description) || null,
    } as any);
    setBusy(null);
    if (error) return toast({ title: "Could not add product", description: error.message, variant: "destructive" });
    await logAudit("product.create", { entity: "products", details: { name: newProduct.name } });
    setNewProduct(emptyProduct);
    setProductFile(null);
    toast({ title: "Product added" });
    refresh();
  };

  const removeProduct = async (id: string) => {
    setBusy(id);
    await supabase.from("products").delete().eq("id", id);
    setBusy(null);
    await logAudit("product.delete", { entity: "products", entityId: id });
    refresh();
  };

  const addOffer = async () => {
    if (!newOffer.title) return toast({ title: "Title is required", variant: "destructive" });
    setBusy("new-offer");
    const { error } = await supabase.from("special_offers" as any).insert({
      title: sanitizeText(newOffer.title, 160),
      occasion: sanitizeText(newOffer.occasion, 80) || null,
      description: sanitizeText(newOffer.description) || null,
      discount_pct: Number(newOffer.discount_pct || 0),
      ends_at: newOffer.ends_at ? new Date(newOffer.ends_at).toISOString() : null,
      created_by: user!.id,
      target_categories: offerCats,
      target_subcategories: offerSubs,
      target_products: offerProds,
    });
    setBusy(null);
    if (error) return toast({ title: "Could not create offer", description: error.message, variant: "destructive" });
    setNewOffer({ title: "", occasion: "", discount_pct: "", ends_at: "", description: "" });
    setOfferCats([]); setOfferSubs([]); setOfferProds([]);
    toast({ title: "Offer created" });
    refresh();
  };

  const toggleOffer = async (o: any) => {
    await supabase.from("special_offers" as any).update({ is_active: !o.is_active }).eq("id", o.id);
    refresh();
  };

  const deleteOffer = async (id: string) => {
    await supabase.from("special_offers" as any).delete().eq("id", id);
    await logAudit("offer.delete", { entity: "special_offers", entityId: id });
    refresh();
  };

  const roleFor = (uid: string) => roles.find((r) => r.user_id === uid)?.role ?? "user";

  const changeRole = async (uid: string, role: "admin" | "moderator" | "user") => {
    setBusy(uid);
    const existing = roles.filter((r) => r.user_id === uid);
    for (const r of existing) {
      await supabase.from("user_roles").delete().eq("id", r.id);
    }
    const { error } = await supabase.from("user_roles").insert({ user_id: uid, role });
    setBusy(null);
    if (error) {
      toast({ title: "Could not update role", description: error.message, variant: "destructive" });
      return;
    }
    await logAudit("user.role_change", { entity: "user_roles", entityId: uid, details: { role } });
    toast({ title: `Role set to ${role}` });
    refresh();
  };

  const filteredProfiles = profiles.filter((p) => {
    const q = userSearch.trim().toLowerCase();
    if (!q) return true;
    return (
      (p.full_name || "").toLowerCase().includes(q) ||
      (p.email || "").toLowerCase().includes(q) ||
      (p.city || "").toLowerCase().includes(q)
    );
  });

  if (loading || isAdmin === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 text-center">
        <ShieldAlert className="h-12 w-12 mx-auto text-destructive mb-4" />
        <h1 className="text-2xl font-bold mb-2">Admin access required</h1>
        <p className="text-muted-foreground mb-6">You don't have permission to view this page.</p>
        <Button asChild variant="outline">
          <Link to="/">Back to store</Link>
        </Button>
      </div>
    );
  }

  const isCod = (o: any) => o.payment_method === "cod";
  const buyerName = (o: any) => {
    const s = o.shipping_info || {};
    return [s.firstName, s.lastName].filter(Boolean).join(" ") || s.full_name || s.name || "—";
  };
  const statusMatch = (o: any, f: string) => {
    const st = String(o.status || "").toLowerCase();
    if (f === "all") return true;
    if (f === "processing") return ["pending", "processing"].includes(st);
    return st === f;
  };
  const rangeMs = { all: Infinity, day: 864e5, week: 7 * 864e5, month: 30 * 864e5 }[orderRange];
  const filteredOrders = orders.filter(
    (o) => statusMatch(o, orderStatusFilter) && Date.now() - new Date(o.created_at).getTime() < rangeMs,
  );
  const goOrders = (status = "all") => { setOrderStatusFilter(status); setOrderRange("all"); setTab("orders"); };
  const sum = (arr: any[], k: string) => arr.reduce((a, x) => a + Number(x[k] || 0), 0);
  const companyName = (id?: string) => companies.find((c) => c.id === id)?.name ?? "—";

  const SubTabs = ({ value, onChange, items }: { value: string; onChange: (v: string) => void; items: [string, string][] }) => (
    <div className="flex flex-wrap gap-2 mb-6">
      {items.map(([k, l]) => <Chip key={k} active={value === k} onClick={() => onChange(k)}>{l}</Chip>)}
    </div>
  );
  const Stat = ({ label, value, onClick }: { label: string; value: any; onClick?: () => void }) => (
    <Card onClick={onClick} className={onClick ? "cursor-pointer hover:border-foreground transition-colors" : ""}>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
          {onClick && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
        </div>
        <p className="text-2xl font-bold mt-1">{value}</p>
      </CardContent>
    </Card>
  );

  const renderContent = () => {
    switch (tab) {
      case "overview":
        return (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Stat label="Total revenue" value={format(stats.revenue)} onClick={() => { setPaySub("summary"); setTab("payments"); }} />
              <Stat label="Orders" value={stats.orders} onClick={() => goOrders()} />
              <Stat label="Revenue (30 days)" value={format(stats.last30Revenue)} onClick={() => { setOrderRange("month"); setOrderStatusFilter("all"); setTab("orders"); }} />
              <Stat label="Orders (30 days)" value={stats.last30Orders} onClick={() => { setOrderRange("month"); setOrderStatusFilter("all"); setTab("orders"); }} />
              <Stat label="Customers" value={stats.customers} onClick={() => setTab("users")} />
              <Stat label="Average basket" value={format(stats.avgBasket)} onClick={() => { setPaySub("orders"); setTab("payments"); }} />
              <Stat label="Online payments" value={`${stats.onlineShare.toFixed(0)}%`} onClick={() => { setPaySub("online"); setTab("payments"); }} />
              <Stat label="Wallet top-ups" value={format(stats.topups)} onClick={() => { setPaySub("topups"); setTab("payments"); }} />
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Order pipeline</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-4">
                {ORDER_BUCKETS.map((b) => (
                  <button
                    key={b.key}
                    onClick={() => goOrders({ stock: "processing", delivery: "shipped", received: "delivered", returned: "returned" }[b.key] as string)}
                    className="text-left border border-border rounded-lg p-4 hover:border-foreground transition-colors"
                  >
                    <p className="text-sm text-muted-foreground flex justify-between">{b.label}<ChevronRight className="h-4 w-4" /></p>
                    <p className="text-2xl font-bold">{bucketCount(b.statuses)}</p>
                  </button>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Latest orders</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {orders.slice(0, 5).map((o) => (
                  <button key={o.id} onClick={() => setSelectedOrder(o)} className="w-full flex justify-between items-center border border-border rounded-lg p-3 text-sm hover:border-foreground">
                    <span className="font-semibold">{o.order_id}</span>
                    <span className="text-muted-foreground">{buyerName(o)}</span>
                    <span>{format(o.total)}</span>
                    <Badge variant="outline">{o.status}</Badge>
                  </button>
                ))}
                {orders.length === 0 && <p className="text-sm text-muted-foreground">No orders yet.</p>}
              </CardContent>
            </Card>
          </div>
        );

      case "orders":
        return (
          <Card>
            <CardHeader className="space-y-4">
              <CardTitle>Orders ({filteredOrders.length})</CardTitle>
              <div className="flex flex-wrap gap-2">
                {["all", ...ORDER_STATUSES].map((s) => (
                  <Chip key={s} active={orderStatusFilter === s} onClick={() => setOrderStatusFilter(s)}>
                    {s[0].toUpperCase() + s.slice(1)} ({orders.filter((o) => statusMatch(o, s)).length})
                  </Chip>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                {(["all", "day", "week", "month"] as const).map((r) => (
                  <Chip key={r} active={orderRange === r} onClick={() => setOrderRange(r)}>
                    {{ all: "All time", day: "Today", week: "This week", month: "This month" }[r]}
                  </Chip>
                ))}
              </div>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              {filteredOrders.length === 0 ? (
                <p className="text-sm text-muted-foreground">No orders match these filters.</p>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs uppercase text-muted-foreground border-b border-border">
                      <th className="py-2 pr-3">Order</th>
                      <th className="py-2 pr-3">Date</th>
                      <th className="py-2 pr-3">Buyer</th>
                      <th className="py-2 pr-3">Total</th>
                      <th className="py-2 pr-3">Type</th>
                      <th className="py-2 pr-3">Status</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map((o) => (
                      <tr key={o.id} className="border-b border-border hover:bg-muted/50 cursor-pointer" onClick={() => setSelectedOrder(o)}>
                        <td className="py-2 pr-3 font-semibold">{o.order_id}</td>
                        <td className="py-2 pr-3 whitespace-nowrap">{new Date(o.created_at).toLocaleString()}</td>
                        <td className="py-2 pr-3">{buyerName(o)}</td>
                        <td className="py-2 pr-3">{format(o.total)}</td>
                        <td className="py-2 pr-3">
                          <Badge variant={isCod(o) ? "outline" : "default"}>{isCod(o) ? "COD" : "Online"}</Badge>
                        </td>
                        <td className="py-2 pr-3" onClick={(e) => e.stopPropagation()}>
                          <select
                            className="h-8 rounded-md border border-input bg-background px-2 text-xs"
                            value={o.status === "pending" ? "processing" : o.status}
                            disabled={busy === o.id}
                            onChange={(e) => setOrderStatus(o, e.target.value)}
                          >
                            {[...ORDER_STATUSES, "cancelled"].map((s) => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </td>
                        <td className="py-2"><ChevronRight className="h-4 w-4 text-muted-foreground" /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>
        );

      case "logistics": {
        const shipped = orders.filter((o) => ["shipped", "delivered", "returned", "received"].includes(o.status));
        const codOrders = orders.filter((o) => isCod(o) && o.status === "delivered");
        const codToCollect = codOrders.filter((o) => !o.cod_settled).reduce((a, o) => a + Number(o.due_on_delivery ?? o.total ?? 0), 0);
        const codCollected = codOrders.filter((o) => o.cod_settled).reduce((a, o) => a + Number(o.due_on_delivery ?? o.total ?? 0), 0);
        return (
          <div>
            <SubTabs value={logSub} onChange={setLogSub} items={[["overview", "Overview"], ["shipments", "Shipments"], ["companies", "Delivery companies"], ["finance", "Shipping finance"], ["jobs", "Shipping jobs"]]} />
            {logSub === "overview" && (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Stat label="To prepare" value={orders.filter((o) => statusMatch(o, "processing")).length} onClick={() => goOrders("processing")} />
                <Stat label="On delivery" value={orders.filter((o) => o.status === "shipped").length} onClick={() => goOrders("shipped")} />
                <Stat label="Delivered" value={orders.filter((o) => o.status === "delivered").length} onClick={() => goOrders("delivered")} />
                <Stat label="Returned" value={orders.filter((o) => o.status === "returned").length} onClick={() => goOrders("returned")} />
                <Stat label="Return received" value={orders.filter((o) => o.status === "received").length} onClick={() => goOrders("received")} />
                <Stat label="Delivery companies" value={companies.length} onClick={() => setLogSub("companies")} />
                <Stat label="Shipping costs" value={format(sum(orders, "shipping_cost"))} onClick={() => setLogSub("finance")} />
                <Stat label="COD to collect" value={format(codToCollect)} onClick={() => setLogSub("finance")} />
              </div>
            )}
            {logSub === "shipments" && (
              <Card>
                <CardHeader><CardTitle>Shipments</CardTitle></CardHeader>
                <CardContent className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-xs uppercase text-muted-foreground border-b border-border">
                        <th className="py-2 pr-3">Order</th><th className="py-2 pr-3">Buyer / City</th><th className="py-2 pr-3">Status</th>
                        <th className="py-2 pr-3">Company</th><th className="py-2 pr-3">Shipping cost</th><th className="py-2 pr-3">COD settled</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((o) => (
                        <tr key={o.id} className="border-b border-border">
                          <td className="py-2 pr-3 font-semibold cursor-pointer underline-offset-2 hover:underline" onClick={() => setSelectedOrder(o)}>{o.order_id}</td>
                          <td className="py-2 pr-3">{buyerName(o)} • {o.shipping_info?.city || "—"}</td>
                          <td className="py-2 pr-3"><Badge variant="outline">{o.status}</Badge></td>
                          <td className="py-2 pr-3">
                            <select className="h-8 rounded-md border border-input bg-background px-2 text-xs" value={o.delivery_company_id ?? ""}
                              onChange={(e) => {
                                const c = companies.find((x) => x.id === e.target.value);
                                updateOrder(o, { delivery_company_id: e.target.value || null, ...(c && !Number(o.shipping_cost) ? { shipping_cost: c.price_per_delivery } : {}) });
                              }}>
                              <option value="">— none —</option>
                              {companies.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                          </td>
                          <td className="py-2 pr-3">
                            <Input type="number" className="h-8 w-24" defaultValue={o.shipping_cost ?? 0}
                              onBlur={(e) => Number(e.target.value) !== Number(o.shipping_cost) && updateOrder(o, { shipping_cost: Number(e.target.value || 0) })} />
                          </td>
                          <td className="py-2 pr-3">
                            {isCod(o) ? (
                              <Button size="sm" variant={o.cod_settled ? "default" : "outline"} onClick={() => updateOrder(o, { cod_settled: !o.cod_settled })}>
                                {o.cod_settled ? "Settled" : "Pending"}
                              </Button>
                            ) : <span className="text-xs text-muted-foreground">Online</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {orders.length === 0 && <p className="text-sm text-muted-foreground">No orders yet.</p>}
                </CardContent>
              </Card>
            )}
            {logSub === "companies" && (
              <div className="space-y-6">
                <Card>
                  <CardHeader><CardTitle>Add a delivery company</CardTitle></CardHeader>
                  <CardContent className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1"><Label>Name</Label><Input value={newCompany.name} onChange={(e) => setNewCompany({ ...newCompany, name: e.target.value })} /></div>
                    <div className="space-y-1"><Label>Price per delivery</Label><Input type="number" value={newCompany.price_per_delivery} onChange={(e) => setNewCompany({ ...newCompany, price_per_delivery: e.target.value })} /></div>
                    <div className="space-y-1"><Label>Phone</Label><Input value={newCompany.contact_phone} onChange={(e) => setNewCompany({ ...newCompany, contact_phone: e.target.value })} /></div>
                    <div className="space-y-1"><Label>Email</Label><Input value={newCompany.contact_email} onChange={(e) => setNewCompany({ ...newCompany, contact_email: e.target.value })} /></div>
                    <Button onClick={addCompany} className="sm:col-span-2"><Plus className="h-4 w-4 mr-2" /> Add company</Button>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader><CardTitle>Delivery companies ({companies.length})</CardTitle></CardHeader>
                  <CardContent className="space-y-2">
                    {companies.length === 0 && <p className="text-sm text-muted-foreground">No delivery companies yet.</p>}
                    {companies.map((c) => {
                      const co = orders.filter((o) => o.delivery_company_id === c.id);
                      return (
                        <div key={c.id} className="flex flex-wrap items-center justify-between gap-3 border border-border rounded-lg p-3">
                          <div>
                            <p className="font-semibold text-sm">{c.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {c.contact_phone || "—"} • {c.contact_email || "—"} • {format(c.price_per_delivery)} / delivery
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {co.length} shipments • {co.filter((o) => o.status === "delivered").length} delivered • {co.filter((o) => o.status === "returned").length} returned • owed {format(sum(co, "shipping_cost"))}
                            </p>
                          </div>
                          <Button size="sm" variant="destructive" onClick={() => deleteCompany(c.id)}><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              </div>
            )}
            {logSub === "finance" && (
              <div className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <Stat label="Total shipping costs" value={format(sum(orders, "shipping_cost"))} />
                  <Stat label="Shipments sent" value={shipped.length} />
                  <Stat label="COD to collect" value={format(codToCollect)} />
                  <Stat label="COD collected" value={format(codCollected)} />
                </div>
                <Card>
                  <CardHeader><CardTitle>By company</CardTitle></CardHeader>
                  <CardContent className="space-y-2">
                    {[...companies, { id: undefined, name: "Unassigned" }].map((c: any) => {
                      const co = orders.filter((o) => (o.delivery_company_id ?? undefined) === c.id);
                      const cod = co.filter((o) => isCod(o) && o.status === "delivered");
                      return (
                        <div key={c.id ?? "none"} className="grid grid-cols-2 sm:grid-cols-5 gap-2 border border-border rounded-lg p-3 text-sm">
                          <span className="font-semibold">{c.name}</span>
                          <span>{co.length} shipments</span>
                          <span>Costs {format(sum(co, "shipping_cost"))}</span>
                          <span>COD pending {format(cod.filter((o) => !o.cod_settled).reduce((a, o) => a + Number(o.due_on_delivery ?? o.total ?? 0), 0))}</span>
                          <span>COD settled {format(cod.filter((o) => o.cod_settled).reduce((a, o) => a + Number(o.due_on_delivery ?? o.total ?? 0), 0))}</span>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              </div>
            )}
            {logSub === "jobs" && (
              <Card>
                <CardHeader><CardTitle>Shipping jobs ({jobs.length})</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  {jobs.length === 0 && <p className="text-sm text-muted-foreground">No shipping jobs recorded.</p>}
                  {jobs.map((j) => (
                    <div key={j.id} className="border border-border rounded-lg p-3">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{j.order_id || "—"}</span>
                        <Badge variant="outline">{j.status}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {j.buyer_name || "—"} • {j.destination || "—"} • {new Date(j.created_at).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        );
      }

      case "payments": {
        const online = orders.filter((o) => !isCod(o));
        const cod = orders.filter(isCod);
        const paypal = orders.filter((o) => o.paypal_order_id || o.paypal_capture_id);
        const refunds = orders.filter((o) => ["returned", "received", "cancelled"].includes(o.status));
        const PayRow = ({ o }: { o: any }) => (
          <button onClick={() => setSelectedOrder(o)} className="w-full grid grid-cols-2 sm:grid-cols-5 gap-2 text-left border border-border rounded-lg p-3 text-sm hover:border-foreground">
            <span className="font-semibold">{o.order_id}</span>
            <span>{format(o.total)}</span>
            <span className="text-muted-foreground">{o.payment_method}</span>
            <span className="text-muted-foreground">{o.status}</span>
            <span className="text-muted-foreground">{new Date(o.created_at).toLocaleDateString()}</span>
          </button>
        );
        return (
          <div>
            <SubTabs value={paySub} onChange={setPaySub} items={[["summary", "Summary"], ["orders", "Order payments"], ["online", "Online"], ["cod", "Cash on delivery"], ["paypal", "PayPal"], ["refunds", "Returns & refunds"], ["topups", "Wallet top-ups"], ["wallet", "Wallet traffic"], ["withdrawals", "Withdrawals"]]} />
            {paySub === "summary" && (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Stat label="Gross revenue" value={format(stats.revenue)} onClick={() => setPaySub("orders")} />
                <Stat label="Online revenue" value={format(sum(online, "total"))} onClick={() => setPaySub("online")} />
                <Stat label="COD revenue" value={format(sum(cod, "total"))} onClick={() => setPaySub("cod")} />
                <Stat label="PayPal captured" value={format(sum(paypal, "total"))} onClick={() => setPaySub("paypal")} />
                <Stat label="Deposits collected" value={format(sum(orders, "deposit_amount"))} onClick={() => setPaySub("cod")} />
                <Stat label="Due on delivery" value={format(sum(orders, "due_on_delivery"))} onClick={() => setPaySub("cod")} />
                <Stat label="Discounts given" value={format(sum(orders, "discount_amount"))} onClick={() => setPaySub("orders")} />
                <Stat label="Returns / refunds" value={format(sum(refunds, "total"))} onClick={() => setPaySub("refunds")} />
                <Stat label="Shipping costs" value={format(sum(orders, "shipping_cost"))} onClick={() => { setLogSub("finance"); setTab("logistics"); }} />
                <Stat label="Net (revenue − refunds − shipping)" value={format(stats.revenue - sum(refunds, "total") - sum(orders, "shipping_cost"))} />
                <Stat label="Wallet top-ups" value={format(stats.topups)} onClick={() => setPaySub("topups")} />
                <Stat label="Withdrawals requested" value={format(sum(withdrawals, "amount"))} onClick={() => setPaySub("withdrawals")} />
              </div>
            )}
            {["orders", "online", "cod", "paypal", "refunds"].includes(paySub) && (
              <Card>
                <CardContent className="pt-6 space-y-2 max-h-[640px] overflow-y-auto">
                  {({ orders, online, cod, paypal, refunds } as Record<string, any[]>)[paySub].map((o) => <PayRow key={o.id} o={o} />)}
                  {({ orders, online, cod, paypal, refunds } as Record<string, any[]>)[paySub].length === 0 && (
                    <p className="text-sm text-muted-foreground">Nothing here yet.</p>
                  )}
                </CardContent>
              </Card>
            )}
            {paySub === "topups" && (
              <Card>
                <CardHeader><CardTitle>Wallet top-ups ({topups.length})</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  {topups.length === 0 && <p className="text-sm text-muted-foreground">No top-ups yet.</p>}
                  {topups.map((t) => (
                    <div key={t.id} className="flex justify-between border border-border rounded-lg p-3 text-sm">
                      <span>{format(t.amount)} {t.currency}</span>
                      <span className="text-muted-foreground">{t.status} • {new Date(t.created_at).toLocaleDateString()}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
            {paySub === "wallet" && (
              <Card>
                <CardHeader><CardTitle>Wallet traffic ({txns.length})</CardTitle></CardHeader>
                <CardContent className="space-y-2 max-h-[640px] overflow-y-auto">
                  {txns.length === 0 && <p className="text-sm text-muted-foreground">No wallet movements yet.</p>}
                  {txns.map((t) => (
                    <div key={t.id} className="flex justify-between border border-border rounded-lg p-3 text-sm">
                      <span>{t.transaction_type} <span className="text-muted-foreground">• {t.description || ""}</span></span>
                      <span className={Number(t.amount) < 0 ? "text-destructive" : ""}>{format(t.amount)}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
            {paySub === "withdrawals" && (
              <Card>
                <CardHeader><CardTitle>Withdrawals ({withdrawals.length})</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  {withdrawals.length === 0 && <p className="text-sm text-muted-foreground">No withdrawals yet.</p>}
                  {withdrawals.map((w) => (
                    <div key={w.id} className="flex justify-between border border-border rounded-lg p-3 text-sm">
                      <span>{format(w.amount)} • {w.method}</span>
                      <span className="text-muted-foreground">{w.status} • {new Date(w.created_at).toLocaleDateString()}</span>
                    </div>
                  ))}
                  <Button variant="outline" size="sm" onClick={() => setTab("withdrawals")}>Manage withdrawals</Button>
                </CardContent>
              </Card>
            )}
          </div>
        );
      }

      case "products": {
        const subs = subcategoriesOf(newProduct.category);
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Add a product</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label>Category</Label>
                  <select className={selectCls} value={newProduct.category}
                    onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value, subcategory: "" })}>
                    <option value="">Select a category</option>
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <Label>Sub-category</Label>
                  <select className={selectCls} value={newProduct.subcategory} disabled={subs.length === 0}
                    onChange={(e) => setNewProduct({ ...newProduct, subcategory: e.target.value })}>
                    <option value="">{subs.length ? "Select a sub-category" : "No sub-category"}</option>
                    {subs.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <Label>Name</Label>
                  <Input value={newProduct.name} onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <Label>Price</Label>
                  <Input type="number" value={newProduct.price} onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <Label>Comparative price (before discount)</Label>
                  <Input type="number" value={newProduct.compare_price} onChange={(e) => setNewProduct({ ...newProduct, compare_price: e.target.value })} />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <Label>Description</Label>
                  <Textarea value={newProduct.description} onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })} />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <Label>Picture</Label>
                  <label className="flex items-center gap-4 border border-dashed border-border rounded-lg p-4 cursor-pointer hover:border-foreground">
                    {productFile ? (
                      <img src={URL.createObjectURL(productFile)} alt="Preview" className="h-16 w-16 object-cover rounded" />
                    ) : (
                      <ImagePlus className="h-8 w-8 text-muted-foreground" />
                    )}
                    <span className="text-sm text-muted-foreground">{productFile ? productFile.name : "Click to upload a picture (JPG, PNG, WEBP — max 10 MB)"}</span>
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => setProductFile(e.target.files?.[0] ?? null)} />
                  </label>
                </div>
                <Button onClick={addProduct} disabled={busy === "new-product"} className="sm:col-span-2">
                  {busy === "new-product" ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />} Add product
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Catalogue ({products.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {products.length === 0 && <p className="text-sm text-muted-foreground">No products stored yet.</p>}
                {products.map((p) => (
                  <div key={p.id} className="flex items-center justify-between gap-3 border border-border rounded-lg p-3">
                    <div className="flex items-center gap-3">
                      {p.image && <img src={p.image} alt={p.name} className="h-12 w-12 object-cover rounded" />}
                      <div>
                        <p className="font-semibold text-sm">{p.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(p.price)}
                          {p.compare_price ? <span className="line-through ml-2">{format(p.compare_price)}</span> : null}
                          {" • "}{p.category || "uncategorised"}{p.subcategory ? ` / ${p.subcategory}` : ""}
                        </p>
                      </div>
                    </div>
                    <Button size="sm" variant="destructive" disabled={busy === p.id} onClick={() => removeProduct(p.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        );
      }

      case "offers": {
        const productPool = [
          ...staticProducts.map((p) => ({ id: p.id, name: p.name, category: p.category })),
          ...products.map((p) => ({ id: p.id, name: p.name, category: p.category || "" })),
        ];
        const q = offerProdSearch.trim().toLowerCase();
        const visibleProds = productPool.filter((p) => !q || p.name.toLowerCase().includes(q)).slice(0, 40);
        const scopeLabel = (o: any) => {
          const n = (o.target_categories?.length ?? 0) + (o.target_subcategories?.length ?? 0) + (o.target_products?.length ?? 0);
          if (!n) return "All products";
          return [
            o.target_categories?.length ? `${o.target_categories.length} categories` : "",
            o.target_subcategories?.length ? `${o.target_subcategories.length} sub-categories` : "",
            o.target_products?.length ? `${o.target_products.length} products` : "",
          ].filter(Boolean).join(", ");
        };
        const allSelected = !offerCats.length && !offerSubs.length && !offerProds.length;
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Create a special-occasion offer</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label>Title</Label>
                  <Input value={newOffer.title} onChange={(e) => setNewOffer({ ...newOffer, title: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <Label>Occasion</Label>
                  <Input placeholder="Eid al-Fitr, 14 February…" value={newOffer.occasion} onChange={(e) => setNewOffer({ ...newOffer, occasion: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <Label>Discount (%)</Label>
                  <Input type="number" value={newOffer.discount_pct} onChange={(e) => setNewOffer({ ...newOffer, discount_pct: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <Label>Ends on</Label>
                  <Input type="date" value={newOffer.ends_at} onChange={(e) => setNewOffer({ ...newOffer, ends_at: e.target.value })} />
                </div>

                <div className="sm:col-span-2 border border-border rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Applies to</Label>
                    <Chip active={allSelected} onClick={() => { setOfferCats([]); setOfferSubs([]); setOfferProds([]); }}>All products</Chip>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Categories</p>
                    <div className="flex flex-wrap gap-2">
                      {CATEGORIES.map((c) => <Chip key={c} active={offerCats.includes(c)} onClick={() => toggleIn(offerCats, setOfferCats, c)}>{c}</Chip>)}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Sub-categories</p>
                    <div className="flex flex-wrap gap-2">
                      {ALL_SUBS.map((s) => <Chip key={s} active={offerSubs.includes(s)} onClick={() => toggleIn(offerSubs, setOfferSubs, s)}>{s}</Chip>)}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Products {offerProds.length > 0 && `(${offerProds.length} selected)`}</p>
                    <Input placeholder="Search a product…" value={offerProdSearch} onChange={(e) => setOfferProdSearch(e.target.value)} className="mb-2" />
                    <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
                      {visibleProds.map((p) => <Chip key={p.id} active={offerProds.includes(p.id)} onClick={() => toggleIn(offerProds, setOfferProds, p.id)}>{p.name}</Chip>)}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {allSelected ? "Nothing selected — the offer applies to every product on the website." : "The offer applies only to the selected categories, sub-categories and products."}
                  </p>
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <Label>Description</Label>
                  <Textarea value={newOffer.description} onChange={(e) => setNewOffer({ ...newOffer, description: e.target.value })} />
                </div>
                <Button onClick={addOffer} disabled={busy === "new-offer"} className="sm:col-span-2">
                  <Sparkles className="h-4 w-4 mr-2" /> Create offer
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Offers ({offers.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {offers.length === 0 && <p className="text-sm text-muted-foreground">No offers yet.</p>}
                {offers.map((o) => (
                  <div key={o.id} className="flex flex-wrap items-center justify-between gap-3 border border-border rounded-lg p-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm">{o.title}</span>
                        <Badge variant={o.is_active ? "default" : "outline"}>{o.is_active ? "active" : "paused"}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {o.occasion || "—"} • {Number(o.discount_pct)}% • {scopeLabel(o)} •{" "}
                        {o.ends_at ? `until ${new Date(o.ends_at).toLocaleDateString()}` : "no end date"}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => toggleOffer(o)}>
                        {o.is_active ? "Pause" : "Activate"}
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => deleteOffer(o.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        );
      }

      case "verification":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Verification queue ({docs.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {docs.length === 0 && <p className="text-muted-foreground text-sm">No pending documents.</p>}
              {docs.map((d) => (
                <div key={d.id} className="flex flex-wrap items-center justify-between gap-3 border border-border rounded-lg p-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{d.account_type}</Badge>
                      <Badge variant="secondary">{d.document_type}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      User: {d.user_id} • {new Date(d.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => signedUrl(d.document_url)}>
                      <FileText className="h-4 w-4 mr-1" /> View
                    </Button>
                    <Button size="sm" onClick={() => decideDoc(d, "approved")} disabled={busy === d.id}>
                      Confirm
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => decideDoc(d, "rejected")} disabled={busy === d.id}>
                      Reject
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        );

      case "withdrawals":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Withdrawal requests ({withdrawals.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {withdrawals.length === 0 && <p className="text-muted-foreground text-sm">No withdrawals.</p>}
              {withdrawals.map((w) => (
                <div key={w.id} className="flex flex-wrap items-center justify-between gap-3 border border-border rounded-lg p-3">
                  <div>
                    <div className="font-semibold">
                      {format(w.amount)} {w.currency}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {w.method} • {w.status} • {new Date(w.created_at).toLocaleString()}
                    </div>
                  </div>
                  {w.status === "pending" && (
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => decideWithdrawal(w, "approved")} disabled={busy === w.id}>
                        Approve
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => decideWithdrawal(w, "rejected")} disabled={busy === w.id}>
                        Reject
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        );

      case "users":
        return (
          <Card>
            <CardHeader className="gap-3">
              <CardTitle>Users & access ({profiles.length})</CardTitle>
              <Input
                placeholder="Search by name, email or city…"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="max-w-sm"
              />
              <div className="flex flex-wrap gap-2 items-end border border-border rounded-lg p-3">
                <Input placeholder="Full name" value={newUser.full_name} onChange={(e) => setNewUser({ ...newUser, full_name: e.target.value })} className="max-w-[180px]" />
                <Input type="email" placeholder="Email" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} className="max-w-[220px]" />
                <Input type="password" placeholder="Password (8+)" value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} className="max-w-[180px]" />
                <Button onClick={createUser}><Plus className="h-4 w-4 mr-1" /> Add user</Button>
              </div>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="w-full text-sm min-w-[720px]">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground border-b border-border">
                    <th className="py-2 pr-4">Name</th>
                    <th className="py-2 pr-4">Email</th>
                    <th className="py-2 pr-4">Joined</th>
                    <th className="py-2 pr-4">Verified</th>
                    <th className="py-2 pr-4">Phone / City</th>
                    <th className="py-2 pr-4">Role</th>
                    <th className="py-2 pr-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProfiles.slice(0, 200).map((p) => (
                    <tr key={p.id} className="border-b border-border/50">
                      <td className="py-2 pr-4 font-medium">{p.full_name || "—"}</td>
                      <td className="py-2 pr-4 text-muted-foreground">{p.email}</td>
                      <td className="py-2 pr-4 text-muted-foreground">{new Date(p.created_at).toLocaleDateString()}</td>
                      <td className="py-2 pr-4">
                        {p.is_verified ? <Badge variant="outline">Verified</Badge> : <span className="text-muted-foreground">—</span>}
                      </td>
                      <td className="py-2 pr-4 text-muted-foreground">{p.phone || "—"} / {p.city || "—"}</td>
                      <td className="py-2 pr-4">
                        <select
                          value={roleFor(p.user_id)}
                          disabled={busy === p.user_id}
                          onChange={(e) => changeRole(p.user_id, e.target.value as any)}
                          className="bg-background border border-border rounded-md px-2 py-1 text-sm"
                        >
                          <option value="user">user</option>
                          <option value="moderator">moderator</option>
                          <option value="admin">admin</option>
                        </select>
                      </td>
                      <td className="py-2 pr-4 whitespace-nowrap">
                        <Button size="sm" variant="outline" onClick={() => editUser(p)}>Edit</Button>{" "}
                        <Button size="sm" variant="ghost" disabled={p.user_id === user?.id} onClick={() => deleteUser(p)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredProfiles.length === 0 && <p className="text-sm text-muted-foreground py-4">No users match this search.</p>}
            </CardContent>
          </Card>
        );

      case "activity":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Activity log ({auditLogs.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {auditLogs.length === 0 && <p className="text-sm text-muted-foreground">No admin activity recorded yet.</p>}
              {auditLogs.map((l) => (
                <div key={l.id} className="flex flex-wrap items-center justify-between gap-2 border border-border rounded-lg p-3">
                  <div>
                    <div className="font-medium text-sm">{l.action}</div>
                    <div className="text-xs text-muted-foreground">
                      {l.actor_email || l.actor_id} • {l.entity || "—"} {l.entity_id ? `#${String(l.entity_id).slice(0, 12)}` : ""}
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">{new Date(l.created_at).toLocaleString()}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="hidden md:flex w-64 flex-col border-r border-border bg-card sticky top-0 h-screen">
          <div className="p-6 border-b border-border">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-gold/10 rounded-lg">
                <BarChart3 className="h-5 w-5 text-gold" />
              </div>
              <div>
                <h2 className="font-display text-lg font-semibold">Back Office</h2>
                <p className="text-xs text-muted-foreground">Lamra Lux</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 p-3 space-y-1">
            {TABS.map((t) => {
              const Icon = t.icon;
              const active = tab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-body transition-colors ${
                    active
                      ? "bg-foreground text-background"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {t.label}
                </button>
              );
            })}
          </nav>

          <div className="p-4 border-t border-border space-y-2">
            <Button onClick={exportExcel} className="w-full" variant="outline">
              <Download className="h-4 w-4 mr-2" /> Download Excel
            </Button>
            <Button asChild variant="ghost" className="w-full justify-start">
              <Link to="/">
                <Store className="h-4 w-4 mr-2" /> View store
              </Link>
            </Button>
            <Button variant="ghost" className="w-full justify-start" onClick={() => signOut()}>
              <LogOut className="h-4 w-4 mr-2" /> Sign out
            </Button>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 min-w-0">
          <header className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border px-6 py-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-6 w-6 text-gold" />
                <div>
                  <h1 className="text-2xl font-bold font-display">Lamra Lux Dashboard</h1>
                  <p className="text-xs text-muted-foreground">Manage traffic, orders, products, payments and offers.</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="font-body">Admin</Badge>
                <Button onClick={exportExcel} className="hidden sm:flex" variant="outline">
                  <Download className="h-4 w-4 mr-2" /> Download Excel
                </Button>
              </div>
            </div>
          </header>

          {/* Mobile tab selector */}
          <div className="md:hidden p-4 border-b border-border overflow-x-auto">
            <div className="flex gap-2 min-w-max">
              {TABS.map((t) => {
                const Icon = t.icon;
                return (
                  <button
                    key={t.id}
                    onClick={() => setTab(t.id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm whitespace-nowrap ${
                      tab === t.id
                        ? "border-foreground bg-foreground text-background"
                        : "border-border text-muted-foreground"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {t.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="p-4 sm:p-6 lg:p-8 max-w-7xl">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminPanel;
