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
  const { user, loading } = useAuth();
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

  const [newProduct, setNewProduct] = useState({ name: "", price: "", category: "", image: "", description: "" });
  const [newOffer, setNewOffer] = useState({ title: "", occasion: "", discount_pct: "", ends_at: "", description: "" });

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate("/auth");
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
    toast({ title: `Withdrawal ${decision}` });
    refresh();
  };

  const setOrderStatus = async (o: any, status: string) => {
    setBusy(o.id);
    await supabase.from("orders").update({ status }).eq("id", o.id);
    setBusy(null);
    refresh();
  };

  const addProduct = async () => {
    if (!newProduct.name || !newProduct.price) {
      toast({ title: "Name and price are required", variant: "destructive" });
      return;
    }
    setBusy("new-product");
    const { error } = await supabase.from("products").insert({
      name: newProduct.name,
      price: Number(newProduct.price),
      category: newProduct.category || null,
      image: newProduct.image || null,
      description: newProduct.description || null,
    });
    setBusy(null);
    if (error) return toast({ title: "Could not add product", description: error.message, variant: "destructive" });
    setNewProduct({ name: "", price: "", category: "", image: "", description: "" });
    toast({ title: "Product added" });
    refresh();
  };

  const removeProduct = async (id: string) => {
    setBusy(id);
    await supabase.from("products").delete().eq("id", id);
    setBusy(null);
    refresh();
  };

  const addOffer = async () => {
    if (!newOffer.title) return toast({ title: "Title is required", variant: "destructive" });
    setBusy("new-offer");
    const { error } = await supabase.from("special_offers" as any).insert({
      title: newOffer.title,
      occasion: newOffer.occasion || null,
      description: newOffer.description || null,
      discount_pct: Number(newOffer.discount_pct || 0),
      ends_at: newOffer.ends_at ? new Date(newOffer.ends_at).toISOString() : null,
      created_by: user!.id,
    });
    setBusy(null);
    if (error) return toast({ title: "Could not create offer", description: error.message, variant: "destructive" });
    setNewOffer({ title: "", occasion: "", discount_pct: "", ends_at: "", description: "" });
    toast({ title: "Offer created" });
    refresh();
  };

  const toggleOffer = async (o: any) => {
    await supabase.from("special_offers" as any).update({ is_active: !o.is_active }).eq("id", o.id);
    refresh();
  };

  const deleteOffer = async (id: string) => {
    await supabase.from("special_offers" as any).delete().eq("id", id);
    refresh();
  };

  if (loading || isAdmin === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <ShieldAlert className="h-12 w-12 mx-auto text-destructive mb-4" />
          <h1 className="text-2xl font-bold mb-2">Admin access required</h1>
          <p className="text-muted-foreground">You don't have permission to view this page.</p>
        </div>
        <Footer />
      </div>
    );
  }

  const renderContent = () => {
    switch (tab) {
      case "overview":
        return (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { label: "Total revenue", value: format(stats.revenue) },
                { label: "Orders", value: stats.orders },
                { label: "Revenue (30 days)", value: format(stats.last30Revenue) },
                { label: "Orders (30 days)", value: stats.last30Orders },
                { label: "Customers", value: stats.customers },
                { label: "Average basket", value: format(stats.avgBasket) },
                { label: "Online payments", value: `${stats.onlineShare.toFixed(0)}%` },
                { label: "Wallet top-ups", value: format(stats.topups) },
              ].map((s) => (
                <Card key={s.label}>
                  <CardContent className="pt-6">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">{s.label}</p>
                    <p className="text-2xl font-bold mt-1">{s.value}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Order pipeline</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-4">
                {ORDER_BUCKETS.map((b) => (
                  <div key={b.key} className="border border-border rounded-lg p-4">
                    <p className="text-sm text-muted-foreground">{b.label}</p>
                    <p className="text-2xl font-bold">{bucketCount(b.statuses)}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        );

      case "orders":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Orders ({orders.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {orders.length === 0 && <p className="text-sm text-muted-foreground">No orders yet.</p>}
              {orders.map((o) => (
                <div key={o.id} className="flex flex-wrap items-center justify-between gap-3 border border-border rounded-lg p-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{o.order_id}</span>
                      <Badge variant="outline">{o.status}</Badge>
                      <Badge variant="secondary">{o.payment_method}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {format(o.total)} • {new Date(o.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {["processing", "shipped", "delivered", "returned"].map((s) => (
                      <Button
                        key={s}
                        size="sm"
                        variant={o.status === s ? "default" : "outline"}
                        disabled={busy === o.id}
                        onClick={() => setOrderStatus(o, s)}
                      >
                        {s}
                      </Button>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        );

      case "logistics":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Logistics ({jobs.length})</CardTitle>
            </CardHeader>
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
        );

      case "payments":
        return (
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Wallet top-ups ({topups.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {topups.length === 0 && <p className="text-sm text-muted-foreground">No top-ups yet.</p>}
                {topups.map((t) => (
                  <div key={t.id} className="flex justify-between border border-border rounded-lg p-3 text-sm">
                    <span>
                      {format(t.amount)} {t.currency}
                    </span>
                    <span className="text-muted-foreground">
                      {t.status} • {new Date(t.created_at).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Wallet traffic ({txns.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 max-h-[520px] overflow-y-auto">
                {txns.map((t) => (
                  <div key={t.id} className="flex justify-between border border-border rounded-lg p-3 text-sm">
                    <span>{t.transaction_type}</span>
                    <span className={Number(t.amount) < 0 ? "text-destructive" : ""}>{format(t.amount)}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        );

      case "products":
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Add a product</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label>Name</Label>
                  <Input value={newProduct.name} onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <Label>Price</Label>
                  <Input
                    type="number"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <Label>Category</Label>
                  <Input
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <Label>Image URL</Label>
                  <Input value={newProduct.image} onChange={(e) => setNewProduct({ ...newProduct, image: e.target.value })} />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <Label>Description</Label>
                  <Textarea
                    value={newProduct.description}
                    onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  />
                </div>
                <Button onClick={addProduct} disabled={busy === "new-product"} className="sm:col-span-2">
                  <Plus className="h-4 w-4 mr-2" /> Add product
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
                  <div key={p.id} className="flex items-center justify-between border border-border rounded-lg p-3">
                    <div>
                      <p className="font-semibold text-sm">{p.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(p.price)} • {p.category || "uncategorised"}
                      </p>
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

      case "offers":
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
                  <Input
                    placeholder="Eid al-Fitr, 14 February…"
                    value={newOffer.occasion}
                    onChange={(e) => setNewOffer({ ...newOffer, occasion: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <Label>Discount (%)</Label>
                  <Input
                    type="number"
                    value={newOffer.discount_pct}
                    onChange={(e) => setNewOffer({ ...newOffer, discount_pct: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <Label>Ends on</Label>
                  <Input
                    type="date"
                    value={newOffer.ends_at}
                    onChange={(e) => setNewOffer({ ...newOffer, ends_at: e.target.value })}
                  />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <Label>Description</Label>
                  <Textarea
                    value={newOffer.description}
                    onChange={(e) => setNewOffer({ ...newOffer, description: e.target.value })}
                  />
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
                        {o.occasion || "—"} • {Number(o.discount_pct)}% •{" "}
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

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex min-h-[calc(100vh-80px)] pt-32">
        {/* Sidebar */}
        <aside className="hidden md:flex w-64 flex-col border-r border-border bg-card">
          <div className="p-6 border-b border-border">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-gold/10 rounded-lg">
                <BarChart3 className="h-5 w-5 text-gold" />
              </div>
              <div>
                <h2 className="font-display text-lg font-semibold">Admin</h2>
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

          <div className="p-4 border-t border-border">
            <Button onClick={exportExcel} className="w-full" variant="outline">
              <Download className="h-4 w-4 mr-2" /> Download Excel
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
      <Footer />
    </div>
  );
};

export default AdminPanel;
