import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Upload, ShieldCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Props {
  accountType: "seller" | "shipping_company";
}

const VerificationUpload = ({ accountType }: Props) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [docs, setDocs] = useState<any[]>([]);
  const [busy, setBusy] = useState(false);
  const [docType, setDocType] = useState<"national_id" | "passport">("national_id");
  const inputRef = useRef<HTMLInputElement>(null);

  const refresh = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("verification_documents")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setDocs(data ?? []);
  };

  useEffect(() => {
    refresh();
  }, [user]);

  const upload = async (file: File) => {
    if (!user) return;
    setBusy(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${user.id}/${docType}-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("verification-docs")
        .upload(path, file, { upsert: false });
      if (upErr) throw upErr;
      const { error: insErr } = await supabase.from("verification_documents").insert({
        user_id: user.id,
        document_type: docType,
        document_url: path,
        account_type: accountType,
        status: "pending",
      });
      if (insErr) throw insErr;
      toast({ title: "Submitted for review", description: "We'll confirm within 24h." });
      refresh();
    } catch (e: any) {
      toast({ title: "Upload failed", description: e.message, variant: "destructive" });
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const latest = docs[0];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-primary" /> Identity Verification
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {latest && (
          <div className="flex items-center justify-between bg-muted/40 rounded-lg p-3">
            <div className="text-sm">
              Latest:{" "}
              <span className="font-medium">{latest.document_type}</span>
            </div>
            <Badge
              variant={
                latest.status === "approved"
                  ? "default"
                  : latest.status === "rejected"
                  ? "destructive"
                  : "secondary"
              }
            >
              {latest.status}
            </Badge>
          </div>
        )}

        <div className="flex gap-2">
          <Button
            size="sm"
            variant={docType === "national_id" ? "default" : "outline"}
            onClick={() => setDocType("national_id")}
          >
            National ID
          </Button>
          <Button
            size="sm"
            variant={docType === "passport" ? "default" : "outline"}
            onClick={() => setDocType("passport")}
          >
            Passport
          </Button>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/*,.pdf"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) upload(f);
          }}
        />
        <Button onClick={() => inputRef.current?.click()} disabled={busy}>
          {busy ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
          Upload {docType === "national_id" ? "National ID" : "Passport"}
        </Button>
        <p className="text-xs text-muted-foreground">
          Documents are stored privately. Only an Admin can review them. Withdrawals are
          locked until your verification is approved.
        </p>
      </CardContent>
    </Card>
  );
};

export default VerificationUpload;
