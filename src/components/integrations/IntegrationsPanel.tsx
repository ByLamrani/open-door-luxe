import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plug, Plus, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Key {
  id: string;
  provider: string;
  label: string | null;
  is_active: boolean;
  meta: any;
  created_at: string;
}

const PRESETS: { id: string; name: string; help: string; metaFields?: { key: string; label: string }[] }[] = [
  { id: "stripe", name: "Stripe", help: "Secret key (sk_live_...) used for Stripe Checkout & subscriptions." },
  { id: "paypal", name: "PayPal", help: "REST API client secret for routing extra splits." },
  { id: "google_analytics", name: "Google Analytics", help: "GA4 Measurement Protocol API secret.", metaFields: [{ key: "measurement_id", label: "Measurement ID (G-XXXX)" }] },
  { id: "custom", name: "Custom API", help: "Any other third-party API key.", metaFields: [{ key: "endpoint", label: "Base URL / Endpoint" }] },
];

const IntegrationsPanel = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [keys, setKeys] = useState<Key[]>([]);
  const [open, setOpen] = useState(false);
  const [provider, setProvider] = useState("stripe");
  const [label, setLabel] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [meta, setMeta] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  const refresh = async () => {
    if (!user) return;
    const { data } = await supabase.from("integration_keys" as any).select("*").eq("user_id", user.id).order("created_at", { ascending: false });
    setKeys((data as any) || []);
  };
  useEffect(() => { refresh(); }, [user]);

  const save = async () => {
    if (!user || !apiKey.trim()) { toast({ title: "API key is required", variant: "destructive" }); return; }
    setBusy(true);
    const { error } = await supabase.from("integration_keys" as any).insert({
      user_id: user.id, provider, label: label || null, api_key: apiKey, meta, is_active: true,
    } as any);
    setBusy(false);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "API saved", description: `${provider} key stored securely.` });
    setOpen(false); setLabel(""); setApiKey(""); setMeta({});
    refresh();
  };

  const toggle = async (k: Key) => {
    await supabase.from("integration_keys" as any).update({ is_active: !k.is_active }).eq("id", k.id);
    refresh();
  };
  const remove = async (id: string) => {
    await supabase.from("integration_keys" as any).delete().eq("id", id);
    refresh();
  };

  const preset = PRESETS.find(p => p.id === provider) || PRESETS[3];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2"><Plug className="w-5 h-5 text-gold" /> APIs & Integrations</CardTitle>
        <Button size="sm" variant="gold" onClick={() => setOpen(true)}><Plus className="w-4 h-4 mr-1" /> Add API</Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {PRESETS.map(p => (
            <button key={p.id} onClick={() => { setProvider(p.id); setOpen(true); }}
              className="p-3 border border-border rounded-lg hover:border-gold/50 transition-all text-left">
              <p className="font-display text-sm">{p.name}</p>
              <p className="text-[10px] text-muted-foreground line-clamp-2">{p.help}</p>
            </button>
          ))}
        </div>

        <div className="space-y-2">
          {keys.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No APIs connected yet.</p>
          ) : keys.map(k => (
            <div key={k.id} className="flex items-center justify-between p-3 rounded-lg bg-muted">
              <div>
                <p className="font-body text-sm capitalize">{k.provider} {k.label && <span className="text-muted-foreground">— {k.label}</span>}</p>
                <p className="text-xs text-muted-foreground">Added {new Date(k.created_at).toLocaleDateString()}</p>
              </div>
              <div className="flex items-center gap-1">
                <Button size="icon" variant="ghost" onClick={() => toggle(k)}>
                  {k.is_active ? <ToggleRight className="w-5 h-5 text-green-500" /> : <ToggleLeft className="w-5 h-5 text-muted-foreground" />}
                </Button>
                <Button size="icon" variant="ghost" onClick={() => remove(k.id)}>
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add API Key — {preset.name}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Provider</Label>
              <select className="w-full bg-background border border-border rounded p-2 text-sm" value={provider} onChange={e => setProvider(e.target.value)}>
                {PRESETS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <Label>Label (optional)</Label>
              <Input value={label} onChange={e => setLabel(e.target.value)} placeholder="e.g. Production" />
            </div>
            <div>
              <Label>API Key / Secret *</Label>
              <Input type="password" value={apiKey} onChange={e => setApiKey(e.target.value)} placeholder="sk_live_..." />
            </div>
            {preset.metaFields?.map(f => (
              <div key={f.key}>
                <Label>{f.label}</Label>
                <Input value={meta[f.key] || ""} onChange={e => setMeta({ ...meta, [f.key]: e.target.value })} />
              </div>
            ))}
            <p className="text-xs text-muted-foreground">{preset.help}</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button variant="gold" onClick={save} disabled={busy}>{busy ? "Saving..." : "Save Key"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default IntegrationsPanel;
