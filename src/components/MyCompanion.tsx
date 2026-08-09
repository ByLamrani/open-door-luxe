import { useEffect, useState } from "react";
import { Bot, Loader2, Save, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";

type Frequency = "daily" | "weekly" | "monthly";

interface CompanionSettings {
  enabled: boolean;
  frequency: Frequency;
  whatsapp_phone: string;
  notify_orders: boolean;
  notify_listings: boolean;
  notify_occasions: boolean;
}

const DEFAULTS: CompanionSettings = {
  enabled: false,
  frequency: "weekly",
  whatsapp_phone: "",
  notify_orders: true,
  notify_listings: true,
  notify_occasions: true,
};

export const SPECIAL_OCCASIONS = [
  "Eid al-Fitr",
  "Eid al-Adha",
  "Valentine's Day (14 February)",
  "Ramadan",
  "New Year",
  "Mother's Day",
];

const MyCompanion = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [settings, setSettings] = useState<CompanionSettings>(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("companion_settings" as any)
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      if (data) {
        const d = data as any;
        setSettings({
          enabled: d.enabled,
          frequency: d.frequency,
          whatsapp_phone: d.whatsapp_phone ?? "",
          notify_orders: d.notify_orders,
          notify_listings: d.notify_listings,
          notify_occasions: d.notify_occasions,
        });
      }
      setLoading(false);
    })();
  }, [user]);

  const save = async (next: CompanionSettings) => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("companion_settings" as any)
      .upsert({ user_id: user.id, ...next }, { onConflict: "user_id" });
    setSaving(false);
    if (error) {
      toast({ title: "Could not save", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "My Companion updated" });
  };

  const update = (patch: Partial<CompanionSettings>) => {
    const next = { ...settings, ...patch };
    setSettings(next);
    return next;
  };

  if (loading) {
    return (
      <div className="py-12 flex justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-xl text-foreground">My Companion</h2>
        <Bot className="w-5 h-5 text-gold" />
      </div>

      <p className="text-sm text-muted-foreground font-body mb-6">
        Your personal WhatsApp assistant. When it's on, you get updates about your purchases and
        about products we add or retire, at the rhythm you choose. Festive greetings for special
        occasions are always sent, even when it's off.
      </p>

      <div className="space-y-5">
        <div className="flex items-center justify-between p-4 rounded-lg border border-border">
          <div>
            <p className="font-display text-sm text-foreground">Activate My Companion</p>
            <p className="text-xs text-muted-foreground font-body">Receive WhatsApp updates</p>
          </div>
          <Switch
            checked={settings.enabled}
            onCheckedChange={(v) => save(update({ enabled: v }))}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="companion-phone">WhatsApp number</Label>
          <Input
            id="companion-phone"
            placeholder="+212 6 12 34 56 78"
            value={settings.whatsapp_phone}
            onChange={(e) => update({ whatsapp_phone: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label>How often?</Label>
          <div className="grid grid-cols-3 gap-2">
            {(["daily", "weekly", "monthly"] as Frequency[]).map((f) => (
              <button
                key={f}
                onClick={() => save(update({ frequency: f }))}
                className={`py-2 rounded-lg border text-sm font-body capitalize transition-colors ${
                  settings.frequency === f
                    ? "border-foreground bg-foreground text-background"
                    : "border-border text-muted-foreground hover:border-foreground/50"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {[
            { key: "notify_orders" as const, label: "Order updates", hint: "New purchases and delivery progress" },
            { key: "notify_listings" as const, label: "Catalogue updates", hint: "Products added or removed" },
            { key: "notify_occasions" as const, label: "Special occasions", hint: "Always sent, even when deactivated" },
          ].map((row) => (
            <div key={row.key} className="flex items-center justify-between p-3 rounded-lg border border-border">
              <div>
                <p className="font-body text-sm text-foreground">{row.label}</p>
                <p className="text-xs text-muted-foreground font-body">{row.hint}</p>
              </div>
              <Switch
                checked={row.key === "notify_occasions" ? true : settings[row.key]}
                disabled={row.key === "notify_occasions"}
                onCheckedChange={(v) => save(update({ [row.key]: v } as Partial<CompanionSettings>))}
              />
            </div>
          ))}
        </div>

        <div className="p-4 rounded-lg border border-border bg-muted/40">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-gold" />
            <p className="font-display text-sm text-foreground">Occasions we celebrate with you</p>
          </div>
          <p className="text-xs text-muted-foreground font-body">{SPECIAL_OCCASIONS.join(" • ")}</p>
        </div>

        <Button onClick={() => save(settings)} disabled={saving} className="w-full">
          {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          Save preferences
        </Button>
      </div>
    </>
  );
};

export default MyCompanion;
