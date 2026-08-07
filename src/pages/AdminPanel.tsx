import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, ShieldCheck, ShieldAlert, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface VerificationDoc {
  id: string;
  user_id: string;
  document_type: string;
  document_url: string;
  status: string;
  account_type: string;
  created_at: string;
  reject_reason: string | null;
}

interface Withdrawal {
  id: string;
  user_id: string;
  amount: number;
  currency: string;
  method: string;
  destination: any;
  status: string;
  created_at: string;
}

const AdminPanel = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [docs, setDocs] = useState<VerificationDoc[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate("/auth");
      return;
    }
    (async () => {
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);
      const admin = !!roles?.some((r: any) => r.role === "admin");
      setIsAdmin(admin);
      if (admin) await refresh();
    })();
  }, [user, loading]);

  const refresh = async () => {
    const [{ data: d }, { data: w }] = await Promise.all([
      supabase
        .from("verification_documents")
        .select("*")
        .eq("status", "pending")
        .order("created_at", { ascending: false }),
      supabase
        .from("withdrawal_requests")
        .select("*")
        .eq("status", "pending")
        .order("created_at", { ascending: false }),
    ]);
    setDocs((d as VerificationDoc[]) ?? []);
    setWithdrawals((w as Withdrawal[]) ?? []);
  };

  const signedUrl = async (path: string) => {
    const { data } = await supabase.storage
      .from("verification-docs")
      .createSignedUrl(path, 60);
    if (data?.signedUrl) window.open(data.signedUrl, "_blank");
  };

  const decideDoc = async (
    doc: VerificationDoc,
    decision: "approved" | "rejected"
  ) => {
    setBusy(doc.id);
    const { error } = await supabase
      .from("verification_documents")
      .update({
        status: decision,
        reviewed_by: user!.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", doc.id);
    if (!error && decision === "approved") {
      const table =
        doc.account_type === "shipping_company"
          ? "shipping_company_profiles"
          : "seller_profiles";
      await supabase
        .from(table as any)
        .update({ is_verified: true, verification_status: "approved" })
        .eq("user_id", doc.user_id);
      // Flip the unified profile verification flag for the blue badge
      await supabase
        .from("profiles")
        .update({ is_verified: true, verified_at: new Date().toISOString() } as any)
        .eq("user_id", doc.user_id);
    }
    setBusy(null);
    toast({ title: `Document ${decision}` });
    refresh();
  };

  const decideWithdrawal = async (
    w: Withdrawal,
    decision: "approved" | "rejected"
  ) => {
    setBusy(w.id);
    await supabase
      .from("withdrawal_requests")
      .update({
        status: decision,
        processed_by: user!.id,
        processed_at: new Date().toISOString(),
      })
      .eq("id", w.id);
    setBusy(null);
    toast({ title: `Withdrawal ${decision}` });
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
          <p className="text-muted-foreground">
            You don't have permission to view this page.
          </p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-10 space-y-8">
        <header className="flex items-center gap-3">
          <ShieldCheck className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Lamra Lux Admin Panel</h1>
        </header>

        <Card>
          <CardHeader>
            <CardTitle>Verification queue ({docs.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {docs.length === 0 && (
              <p className="text-muted-foreground text-sm">No pending documents.</p>
            )}
            {docs.map((d) => (
              <div
                key={d.id}
                className="flex flex-wrap items-center justify-between gap-3 border border-border rounded-lg p-3"
              >
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
                  <Button
                    size="sm"
                    onClick={() => decideDoc(d, "approved")}
                    disabled={busy === d.id}
                  >
                    Confirm
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => decideDoc(d, "rejected")}
                    disabled={busy === d.id}
                  >
                    Reject
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Withdrawal requests ({withdrawals.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {withdrawals.length === 0 && (
              <p className="text-muted-foreground text-sm">No pending withdrawals.</p>
            )}
            {withdrawals.map((w) => (
              <div
                key={w.id}
                className="flex flex-wrap items-center justify-between gap-3 border border-border rounded-lg p-3"
              >
                <div>
                  <div className="font-semibold">
                    ${Number(w.amount).toFixed(2)} {w.currency}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {w.method} • {new Date(w.created_at).toLocaleString()}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => decideWithdrawal(w, "approved")}>
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => decideWithdrawal(w, "rejected")}
                  >
                    Reject
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default AdminPanel;
