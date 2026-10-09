import { bo } from "@/lib/backofficeI18n";
import { useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Trash2, FileText, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { logAudit, sanitizeText } from "@/lib/audit";

/* ---------- Permission catalogues ---------- */
export type Level = "none" | "view" | "manage";
export const AGENT_SECTIONS: [string, string][] = [
  ["overview", "Overview"], ["products", "Products"], ["payments", "Payments"], ["offers", "Special Offers"],
  ["orders", "Orders"], ["logistics", "Logistics"], ["users", "Users"], ["verification", "Verifications"],
  ["agents", "Agents"], ["history", "History"],
];
export const AGENT_ACTIONS: [string, string][] = [
  ["products.create", "Add products"], ["products.delete", "Delete products"],
  ["orders.status", "Change order status"], ["orders.create", "Create orders"],
  ["payments.export", "Export financial data (Excel)"], ["withdrawals.approve", "Approve / reject withdrawals"],
  ["deposits.view", "See client deposits"], ["users.edit", "Edit client info"], ["users.delete", "Delete clients"],
  ["verification.decide", "Approve / reject documents"], ["offers.manage", "Create / delete offers"],
  ["logistics.companies", "Manage delivery companies"],
];
export const CLIENT_PERMS: [string, string][] = [
  ["account_active", "Account active (can sign in)"], ["buy", "Place orders"], ["cod", "Pay cash on delivery"],
  ["online_pay", "Pay online (card / PayPal)"], ["wallet_pay", "Pay with wallet"], ["deposit", "Deposit (top up wallet)"],
  ["withdraw", "Request withdrawals"], ["transfer", "Wallet-to-wallet transfers"], ["favorites", "Save favorites"],
  ["referrals", "Invite & earn referral rewards"], ["ai", "Use Nova AI assistant"], ["companion", "WhatsApp companion"],
  ["reminders", "Gift reminders"],
];
export const defaultAgentPerms = () => ({
  sections: Object.fromEntries(AGENT_SECTIONS.map(([k]) => [k, "view" as Level])),
  actions: Object.fromEntries(AGENT_ACTIONS.map(([k]) => [k, false])),
});
export const defaultClientPerms = () => Object.fromEntries(CLIENT_PERMS.map(([k]) => [k, true]));

const emptyPerson = { email: "", password: "", full_name: "", phone: "", city: "", country: "Morocco", home_address: "", job_title: "" };

interface Common {
  profiles: any[];
  roles: any[];
  perms: any[];
  callAdminUsers: (body: Record<string, unknown>, okMsg: string) => Promise<any>;
  refresh: () => Promise<void> | void;
  format: (n: number) => string;
  currentUserId?: string;
}

const savePerms = async (user_id: string, kind: string, permissions: any, job_title?: string) => {
  const { error } = await supabase.from("account_permissions" as any).upsert({ user_id, kind, permissions, job_title: job_title || null } as any);
  if (!error) await logAudit("permissions.update", { entity: "account_permissions", entityId: user_id, details: { kind } });
  return error;
};

/* ---------- Shared editors ---------- */
const PersonFields = ({ v, set, withJob, withPassword = true }: { v: any; set: (x: any) => void; withJob?: boolean; withPassword?: boolean }) => (
  <div className="grid sm:grid-cols-2 gap-3">
    {bo(([["full_name", "Full name"], ["email", "Email"], ...(withPassword ? [["password", "Password (8+)"]] : []), ["phone", "Phone"],
      ["city", "City"], ["country", "Country"], ["home_address", "Address"], ...(withJob ? [["job_title", "Job title / role"]] : [])] as [string, string][]).map(([k, l]) => (
      <div key={k} className={k === "home_address" ? "sm:col-span-2" : ""}>
        <Label className="text-xs">{bo(l)}</Label>
        <Input type={k === "password" ? "password" : k === "email" ? "email" : "text"} value={v[k] ?? ""} onChange={(e) => set({ ...v, [k]: e.target.value })} />
      </div>
    )))}
  </div>
);

const AgentPermEditor = ({ p, set }: { p: any; set: (x: any) => void }) => (
  <div className="space-y-4">
    <div>
      <h4 className="text-sm font-semibold mb-2">{bo("Sections")}</h4>
      <div className="border border-border rounded-lg divide-y divide-border">
        {bo(AGENT_SECTIONS.map(([k, l]) => (
          <div key={k} className="flex items-center justify-between px-3 py-2 text-sm">
            <span>{bo(l)}</span>
            <div className="flex gap-1">
              {bo((["none", "view", "manage"] as Level[]).map((lv) => (
                <button key={lv} type="button" onClick={() => set({ ...p, sections: { ...p.sections, [k]: lv } })}
                  className={`px-2 py-0.5 rounded border text-xs ${p.sections?.[k] === lv ? "bg-foreground text-background border-foreground" : "border-border text-muted-foreground"}`}>
                  {bo(lv === "none" ? "No access" : lv === "view" ? "View only" : "Full control")}
                </button>
              )))}
            </div>
          </div>
        )))}
      </div>
    </div>
    <div>
      <h4 className="text-sm font-semibold mb-2">{bo("Specific actions")}</h4>
      <div className="grid sm:grid-cols-2 gap-2">
        {bo(AGENT_ACTIONS.map(([k, l]) => (
          <label key={k} className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={!!p.actions?.[k]} onChange={(e) => set({ ...p, actions: { ...p.actions, [k]: e.target.checked } })} />
            {bo(l)}
          </label>
        )))}
      </div>
    </div>
  </div>
);

const ClientPermEditor = ({ p, set }: { p: any; set: (x: any) => void }) => (
  <div className="grid sm:grid-cols-2 gap-2">
    {bo(CLIENT_PERMS.map(([k, l]) => (
      <label key={k} className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={p?.[k] !== false} onChange={(e) => set({ ...p, [k]: e.target.checked })} />
        {bo(l)}
      </label>
    )))}
  </div>
);

/* ---------- Agents ---------- */
export const AgentsSection = ({ profiles, roles, perms, callAdminUsers, refresh, currentUserId }: Common) => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyPerson);
  const [p, setP] = useState<any>(defaultAgentPerms());
  const [edit, setEdit] = useState<any | null>(null);
  const agentIds = new Set([...roles.filter((r) => r.role === "admin" || r.role === "moderator").map((r) => r.user_id), ...perms.filter((x) => x.kind === "agent").map((x) => x.user_id)]);
  const agents = profiles.filter((x) => agentIds.has(x.user_id));
  const roleOf = (id: string) => (roles.some((r) => r.user_id === id && r.role === "admin") ? "admin" : "moderator");

  const create = async () => {
    if (!form.email || form.password.length < 8) return toast({ title: "Email and an 8+ character password are required", variant: "destructive" });
    const { job_title, ...rest } = form;
    const res = await supabase.functions.invoke("admin-users", { body: { action: "create", ...Object.fromEntries(Object.entries(rest).map(([k, v]) => [k, k === "password" || k === "email" ? v : sanitizeText(v)])) } });
    const uid = (res.data as any)?.user_id;
    if (!uid) return toast({ title: "Could not create agent", description: (res.data as any)?.error ? JSON.stringify((res.data as any).error) : res.error?.message, variant: "destructive" });
    await supabase.from("user_roles").insert({ user_id: uid, role: "moderator" } as any);
    await savePerms(uid, "agent", p, sanitizeText(job_title));
    await logAudit("agent.create", { entity: "auth.users", entityId: uid });
    toast({ title: "Agent created" });
    setOpen(false); setForm(emptyPerson); setP(defaultAgentPerms()); refresh();
  };

  const saveEdit = async () => {
    const err = await savePerms(edit.user_id, "agent", edit.perms, sanitizeText(edit.job_title || ""));
    await callAdminUsers({ action: "update", user_id: edit.user_id, full_name: sanitizeText(edit.full_name || ""), phone: sanitizeText(edit.phone || ""), city: sanitizeText(edit.city || ""), home_address: sanitizeText(edit.home_address || ""), country: sanitizeText(edit.country || "") }, err ? "Info saved, permissions failed" : "Agent updated");
    setEdit(null);
  };

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>{bo("Agents (")}{bo(agents.length)}{bo(")")}</CardTitle>
        <Button onClick={() => setOpen(true)}><Plus className="h-4 w-4 mr-1" />{bo(" Add agent")}</Button>
      </CardHeader>
      <CardContent className="space-y-2">
        {bo(agents.length === 0 && <p className="text-sm text-muted-foreground">{bo("No agents yet.")}</p>)}
        {bo(agents.map((a) => {
          const row = perms.find((x) => x.user_id === a.user_id);
          const allowed = row ? AGENT_SECTIONS.filter(([k]) => row.permissions?.sections?.[k] && row.permissions.sections[k] !== "none").length : AGENT_SECTIONS.length;
          return (
            <div key={a.user_id} className="flex flex-wrap items-center justify-between gap-2 border border-border rounded-lg p-3 hover:border-foreground transition-colors">
              <div className="cursor-pointer flex-1" onClick={() => setEdit({ ...a, job_title: row?.job_title, perms: row?.permissions?.sections ? row.permissions : defaultAgentPerms() })}>
                <div className="font-medium">{bo(a.full_name || a.email)} <Badge variant="outline" className="ml-1">{bo(roleOf(a.user_id))}</Badge></div>
                <div className="text-xs text-muted-foreground">{bo(row?.job_title || "—")}{bo(" • ")}{bo(a.email)}{bo(" • ")}{bo(a.phone || "no phone")}{bo(" • ")}{bo(allowed)}{bo("/")}{bo(AGENT_SECTIONS.length)}{bo(" sections")}</div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => setEdit({ ...a, job_title: row?.job_title, perms: row?.permissions?.sections ? row.permissions : defaultAgentPerms() })}>{bo("Permissions & info")}</Button>
                <Button size="sm" variant="ghost" disabled={a.user_id === currentUserId || a.email?.toLowerCase() === "adil.lamrani.ejjouti@gmail.com"} onClick={() => confirm(`Delete ${a.email}?`) && callAdminUsers({ action: "delete", user_id: a.user_id }, "Agent deleted")}><Trash2 className="h-4 w-4 text-destructive" /></Button>
              </div>
            </div>
          );
        }))}
      </CardContent>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{bo("New agent")}</DialogTitle></DialogHeader>
          <h4 className="text-sm font-semibold">{bo("Personal & contact info")}</h4>
          <PersonFields v={form} set={setForm} withJob />
          <AgentPermEditor p={p} set={setP} />
          <Button onClick={create}>{bo("Create agent")}</Button>
        </DialogContent>
      </Dialog>

      <Dialog open={!!edit} onOpenChange={(o) => !o && setEdit(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{bo(edit?.email)}</DialogTitle></DialogHeader>
          {bo(edit && <>
            <PersonFields v={edit} set={setEdit} withJob withPassword={false} />
            <AgentPermEditor p={edit.perms} set={(x) => setEdit({ ...edit, perms: x })} />
            <Button onClick={saveEdit}>{bo("Save")}</Button>
          </>)}
        </DialogContent>
      </Dialog>
    </Card>
  );
};

/* ---------- Users (clients) ---------- */
export const UsersSection = ({ profiles, roles, perms, callAdminUsers, refresh, format, topups, withdrawals, txns, wallets, docs, orders, onDecideWithdrawal, busy }:
  Common & { topups: any[]; withdrawals: any[]; txns: any[]; wallets: any[]; docs: any[]; orders: any[]; onDecideWithdrawal: (w: any, d: "approved" | "rejected") => void; busy: string | null }) => {
  const { toast } = useToast();
  const [sub, setSub] = useState<"clients" | "deposits" | "withdrawals">("clients");
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyPerson);
  const [cp, setCp] = useState<any>(defaultClientPerms());
  const [sel, setSel] = useState<any | null>(null);
  const [selTab, setSelTab] = useState<"info" | "documents" | "transactions" | "permissions">("info");

  const staff = new Set([...roles.filter((r) => r.role !== "user").map((r) => r.user_id), ...perms.filter((x) => x.kind === "agent").map((x) => x.user_id)]);
  const clients = profiles.filter((p) => !staff.has(p.user_id));
  const nameOf = (uid: string) => { const p = profiles.find((x) => x.user_id === uid); return p?.full_name || p?.email || uid.slice(0, 8); };
  const filtered = clients.filter((p) => `${p.full_name} ${p.email} ${p.city} ${p.phone}`.toLowerCase().includes(q.toLowerCase()));

  const create = async () => {
    if (!form.email || form.password.length < 8) return toast({ title: "Email and an 8+ character password are required", variant: "destructive" });
    const { job_title: _j, ...rest } = form;
    const res = await supabase.functions.invoke("admin-users", { body: { action: "create", ...Object.fromEntries(Object.entries(rest).map(([k, v]) => [k, k === "password" || k === "email" ? v : sanitizeText(v)])) } });
    const uid = (res.data as any)?.user_id;
    if (!uid) return toast({ title: "Could not create user", description: res.error?.message, variant: "destructive" });
    await savePerms(uid, "client", cp);
    toast({ title: "User created" });
    setOpen(false); setForm(emptyPerson); setCp(defaultClientPerms()); refresh();
  };

  const userTxns = useMemo(() => {
    if (!sel) return [];
    const wIds = new Set(wallets.filter((w) => w.user_id === sel.user_id).map((w) => w.id));
    const rows = [
      ...topups.filter((t) => t.user_id === sel.user_id).map((t) => ({ id: t.id, type: "Deposit", amount: Number(t.amount), status: t.status, date: t.created_at, note: t.paypal_order_id ? "PayPal" : "" })),
      ...withdrawals.filter((w) => w.user_id === sel.user_id).map((w) => ({ id: w.id, type: "Withdrawal", amount: -Number(w.amount), status: w.status, date: w.created_at, note: w.method })),
      ...txns.filter((t) => wIds.has(t.wallet_id)).map((t) => ({ id: t.id, type: t.transaction_type, amount: Number(t.amount), status: "done", date: t.created_at, note: t.description || "" })),
    ];
    return rows.sort((a, b) => +new Date(b.date) - +new Date(a.date));
  }, [sel, topups, withdrawals, txns, wallets]);

  const Tabs = ({ items, v, on }: { items: [string, string][]; v: string; on: (x: any) => void }) => (
    <div className="flex flex-wrap gap-2">{bo(items.map(([k, l]) => (
      <button key={k} onClick={() => on(k)} className={`px-3 py-1 rounded-full border text-xs ${v === k ? "bg-foreground text-background border-foreground" : "border-border text-muted-foreground"}`}>{bo(l)}</button>
    )))}</div>
  );

  const OpRow = ({ r, kind }: { r: any; kind: "deposit" | "withdrawal" }) => (
    <tr className="border-b border-border/50">
      <td className="py-2 pr-4">{bo(nameOf(r.user_id))}</td>
      <td className={`py-2 pr-4 font-medium ${kind === "withdrawal" ? "text-destructive" : ""}`}>{bo(kind === "withdrawal" ? "−" : "+")}{bo(format(Number(r.amount)))}</td>
      <td className="py-2 pr-4 text-muted-foreground">{bo(kind === "deposit" ? (r.paypal_order_id ? "PayPal" : "—") : r.method)}</td>
      <td className="py-2 pr-4"><Badge variant="outline">{bo(r.status)}</Badge></td>
      <td className="py-2 pr-4 text-muted-foreground">{bo(new Date(r.created_at).toLocaleString())}</td>
      <td className="py-2 pr-4">{bo(kind === "withdrawal" && r.status === "pending" && (
        <span className="flex gap-1"><Button size="sm" disabled={busy === r.id} onClick={() => onDecideWithdrawal(r, "approved")}>{bo("Approve")}</Button>
          <Button size="sm" variant="destructive" disabled={busy === r.id} onClick={() => onDecideWithdrawal(r, "rejected")}>{bo("Reject")}</Button></span>))}</td>
    </tr>
  );

  return (
    <Card>
      <CardHeader className="gap-3">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <CardTitle>{bo("Users (")}{bo(clients.length)}{bo(")")}</CardTitle>
          <Button onClick={() => setOpen(true)}><Plus className="h-4 w-4 mr-1" />{bo(" Add user")}</Button>
        </div>
        <Tabs items={[["clients", "Clients"], ["deposits", `Deposits (${topups.length})`], ["withdrawals", `Withdrawals (${withdrawals.length})`]]} v={sub} on={setSub} />
      </CardHeader>
      <CardContent className="overflow-x-auto">
        {bo(sub === "clients" && <>
          <Input placeholder={bo("Search name, email, phone, city…")} value={q} onChange={(e) => setQ(e.target.value)} className="max-w-sm mb-3" />
          <div className="space-y-2">
            {bo(filtered.slice(0, 300).map((p) => (
              <button key={p.user_id} onClick={() => { setSel(p); setSelTab("info"); }} className="w-full text-left flex items-center justify-between gap-2 border border-border rounded-lg p-3 hover:bg-muted">
                <div>
                  <div className="font-medium">{bo(p.full_name || "—")} {bo(p.is_verified && <Badge variant="outline" className="ml-1">{bo("Verified")}</Badge>)}</div>
                  <div className="text-xs text-muted-foreground">{bo(p.email)}{bo(" • ")}{bo(p.phone || "no phone")}{bo(" • ")}{bo(p.city || "—")}</div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </button>
            )))}
            {bo(filtered.length === 0 && <p className="text-sm text-muted-foreground">{bo("No users match.")}</p>)}
          </div>
        </>)}
        {bo(sub !== "clients" && (
          <table className="w-full text-sm min-w-[720px]">
            <thead><tr className="text-left text-xs uppercase tracking-wider text-muted-foreground border-b border-border">
              <th className="py-2 pr-4">{bo("User")}</th><th className="py-2 pr-4">{bo("Amount")}</th><th className="py-2 pr-4">{bo("Method")}</th><th className="py-2 pr-4">{bo("Status")}</th><th className="py-2 pr-4">{bo("Date")}</th><th /></tr></thead>
            <tbody>
              {bo((sub === "deposits" ? topups : withdrawals).map((r) => <OpRow key={r.id} r={r} kind={sub === "deposits" ? "deposit" : "withdrawal"} />))}
            </tbody>
          </table>
        ))}
      </CardContent>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{bo("New user")}</DialogTitle></DialogHeader>
          <h4 className="text-sm font-semibold">{bo("Personal & contact info")}</h4>
          <PersonFields v={form} set={setForm} />
          <h4 className="text-sm font-semibold">{bo("Permissions")}</h4>
          <ClientPermEditor p={cp} set={setCp} />
          <Button onClick={create}>{bo("Create user")}</Button>
        </DialogContent>
      </Dialog>

      <Dialog open={!!sel} onOpenChange={(o) => !o && setSel(null)}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{bo(sel?.full_name || sel?.email)}</DialogTitle></DialogHeader>
          {bo(sel && <>
            <Tabs items={[["info", "Personal & contact"], ["documents", "Documents"], ["transactions", "Transactions"], ["permissions", "Permissions"]]} v={selTab} on={setSelTab} />
            {bo(selTab === "info" && <div className="space-y-3">
              <PersonFields v={sel} set={setSel} withPassword={false} />
              <div className="text-xs text-muted-foreground">{bo("Joined ")}{bo(new Date(sel.created_at).toLocaleDateString())}{bo(" • Orders: ")}{bo(orders.filter((o) => o.user_id === sel.user_id).length)}{bo(" • Wallet: ")}{bo(format(Number(wallets.find((w) => w.user_id === sel.user_id)?.balance ?? 0)))}</div>
              <div className="flex gap-2">
                <Button onClick={async () => { await callAdminUsers({ action: "update", user_id: sel.user_id, full_name: sanitizeText(sel.full_name || ""), phone: sanitizeText(sel.phone || ""), city: sanitizeText(sel.city || ""), home_address: sanitizeText(sel.home_address || ""), country: sanitizeText(sel.country || "") }, "User updated"); }}>{bo("Save")}</Button>
                <Button variant="destructive" onClick={async () => { if (confirm(`Delete ${sel.email}?`) && await callAdminUsers({ action: "delete", user_id: sel.user_id }, "User deleted")) setSel(null); }}>{bo("Delete user")}</Button>
              </div>
            </div>)}
            {bo(selTab === "documents" && <div className="space-y-2">
              {bo(docs.filter((d) => d.user_id === sel.user_id).length === 0 && <p className="text-sm text-muted-foreground">{bo("No documents uploaded.")}</p>)}
              {bo(docs.filter((d) => d.user_id === sel.user_id).map((d) => (
                <div key={d.id} className="flex items-center justify-between border border-border rounded-lg p-3 text-sm">
                  <span>{bo(d.document_type)} <Badge variant="outline" className="ml-1">{bo(d.status)}</Badge></span>
                  <Button size="sm" variant="outline" onClick={async () => { const { data } = await supabase.storage.from("verification-docs").createSignedUrl(d.document_url, 60); if (data?.signedUrl) window.open(data.signedUrl, "_blank"); }}><FileText className="h-4 w-4 mr-1" />{bo(" View")}</Button>
                </div>
              )))}
            </div>)}
            {bo(selTab === "transactions" && <table className="w-full text-sm">
              <thead><tr className="text-left text-xs uppercase text-muted-foreground border-b border-border"><th className="py-2">{bo("Type")}</th><th>{bo("Amount")}</th><th>{bo("Status")}</th><th>{bo("Details")}</th><th>{bo("Date")}</th></tr></thead>
              <tbody>{bo(userTxns.map((t) => (
                <tr key={t.type + t.id} className="border-b border-border/50"><td className="py-2">{bo(t.type)}</td>
                  <td className={t.amount < 0 ? "text-destructive" : ""}>{bo(format(t.amount))}</td><td>{bo(t.status)}</td><td className="text-muted-foreground">{bo(t.note)}</td><td className="text-muted-foreground">{bo(new Date(t.date).toLocaleString())}</td></tr>)))}
                {bo(userTxns.length === 0 && <tr><td colSpan={5} className="py-3 text-muted-foreground">{bo("No transactions yet.")}</td></tr>)}
              </tbody>
            </table>)}
            {bo(selTab === "permissions" && <ClientPerms uid={sel.user_id} row={perms.find((x) => x.user_id === sel.user_id)} refresh={refresh} />)}
          </>)}
        </DialogContent>
      </Dialog>
    </Card>
  );
};

const ClientPerms = ({ uid, row, refresh }: { uid: string; row: any; refresh: () => any }) => {
  const { toast } = useToast();
  const [p, setP] = useState<any>(row?.permissions && Object.keys(row.permissions).length ? row.permissions : defaultClientPerms());
  return (
    <div className="space-y-3">
      <ClientPermEditor p={p} set={setP} />
      <Button onClick={async () => { const e = await savePerms(uid, "client", p); toast({ title: e ? "Could not save" : "Permissions saved", variant: e ? "destructive" : undefined }); refresh(); }}>{bo("Save permissions")}</Button>
    </div>
  );
};

/* ---------- History ---------- */
export const HistorySection = ({ auditLogs, profiles, orders, topups, withdrawals, format }: { auditLogs: any[]; profiles: any[]; orders: any[]; topups: any[]; withdrawals: any[]; format: (n: number) => string }) => {
  const [v, setV] = useState<"agents" | "clients">("agents");
  const nameOf = (uid: string) => { const p = profiles.find((x) => x.user_id === uid); return p?.full_name || p?.email || (uid || "").slice(0, 8); };
  const clientEvents = useMemo(() => [
    ...orders.map((o) => ({ id: "o" + o.id, who: o.user_id ? nameOf(o.user_id) : (o.shipping_info?.fullName || "Guest"), what: `Order ${o.order_id} • ${o.status} • ${o.payment_method}`, amount: Number(o.total), date: o.created_at })),
    ...topups.map((t) => ({ id: "t" + t.id, who: nameOf(t.user_id), what: `Deposit • ${t.status}`, amount: Number(t.amount), date: t.created_at })),
    ...withdrawals.map((w) => ({ id: "w" + w.id, who: nameOf(w.user_id), what: `Withdrawal • ${w.status}`, amount: -Number(w.amount), date: w.created_at })),
    ...profiles.map((p) => ({ id: "p" + p.id, who: p.full_name || p.email, what: "Account created", amount: null as number | null, date: p.created_at })),
  ].sort((a, b) => +new Date(b.date) - +new Date(a.date)).slice(0, 300), [orders, topups, withdrawals, profiles]);

  return (
    <Card>
      <CardHeader className="gap-3">
        <CardTitle>{bo("History")}</CardTitle>
        <div className="flex gap-2">
          {bo(([["agents", "Users History"], ["clients", "Clients History"]] as const).map(([k, l]) => (
            <button key={k} onClick={() => setV(k)} className={`px-3 py-1 rounded-full border text-xs ${v === k ? "bg-foreground text-background border-foreground" : "border-border text-muted-foreground"}`}>{bo(l)}</button>
          )))}
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {bo(v === "agents" && <>
          {bo(auditLogs.length === 0 && <p className="text-sm text-muted-foreground">{bo("No back-office activity yet.")}</p>)}
          {bo(auditLogs.map((l) => (
            <div key={l.id} className="flex flex-wrap justify-between gap-2 border border-border rounded-lg p-3 text-sm">
              <div><div className="font-medium">{bo(l.action)}</div><div className="text-xs text-muted-foreground">{bo(l.actor_email || l.actor_id)}{bo(" • ")}{bo(l.entity || "—")}</div></div>
              <span className="text-xs text-muted-foreground">{bo(new Date(l.created_at).toLocaleString())}</span>
            </div>
          )))}
        </>)}
        {bo(v === "clients" && clientEvents.map((e) => (
          <div key={e.id} className="flex flex-wrap justify-between gap-2 border border-border rounded-lg p-3 text-sm">
            <div><div className="font-medium">{bo(e.who)}</div><div className="text-xs text-muted-foreground">{bo(e.what)}</div></div>
            <div className="text-right">{bo(e.amount !== null && <div className={e.amount < 0 ? "text-destructive" : ""}>{bo(format(e.amount))}</div>)}<span className="text-xs text-muted-foreground">{bo(new Date(e.date).toLocaleString())}</span></div>
          </div>
        )))}
      </CardContent>
    </Card>
  );
};
