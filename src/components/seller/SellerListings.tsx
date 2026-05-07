import { useEffect, useState } from "react";
import { Package, Plus, Layers, Trash2, Clock, ChevronDown, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useCurrency } from "@/context/CurrencyContext";

type ListingType = "normal" | "collection";
const FEE: Record<ListingType, number> = { normal: 0.10, collection: 2.0 };

interface Listing {
  id: string;
  title: string | null;
  listing_type: string;
  status: string;
  price: number | null;
  expires_at: string;
  listing_fee: number;
  parent_listing_id?: string | null;
  bundle_price?: number | null;
}

const SellerListings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { format } = useCurrency();
  const [listings, setListings] = useState<Listing[]>([]);
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<ListingType>("normal");
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState<number>(0);
  const [bundlePrice, setBundlePrice] = useState<number>(0);
  const [description, setDescription] = useState("");
  const [busy, setBusy] = useState(false);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [addItemFor, setAddItemFor] = useState<Listing | null>(null);
  const [childTitle, setChildTitle] = useState("");
  const [childPrice, setChildPrice] = useState(0);
  const [childDesc, setChildDesc] = useState("");

  const refresh = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("seller_listings" as any)
      .select("*")
      .eq("seller_id", user.id)
      .order("created_at", { ascending: false });
    setListings((data as any) ?? []);
  };

  useEffect(() => { refresh(); }, [user]);

  const create = async () => {
    if (!user || !title.trim()) {
      toast({ title: "Missing title", variant: "destructive" });
      return;
    }
    setBusy(true);
    const payload: any = {
      seller_id: user.id,
      listing_type: type,
      listing_fee: FEE[type],
      title,
      description,
      price: type === "collection" ? null : price,
      bundle_price: type === "collection" ? bundlePrice : null,
      status: "active",
    };
    const { error } = await supabase.from("seller_listings" as any).insert(payload);
    setBusy(false);
    if (error) {
      toast({ title: "Failed", description: error.message, variant: "destructive" });
      return;
    }
    toast({
      title: type === "collection" ? "Collection created 🎉" : "Listing created 🎉",
      description: `Fee: $${FEE[type].toFixed(2)} • Active for 4 months`,
    });
    setOpen(false);
    setTitle(""); setPrice(0); setBundlePrice(0); setDescription("");
    refresh();
  };

  const addChildItem = async () => {
    if (!user || !addItemFor || !childTitle.trim()) return;
    const { error } = await supabase.from("seller_listings" as any).insert({
      seller_id: user.id,
      listing_type: "normal",
      listing_fee: 0, // children share parent collection fee
      title: childTitle,
      description: childDesc,
      price: childPrice,
      parent_listing_id: addItemFor.id,
      status: "active",
    } as any);
    if (error) { toast({ title: "Failed", description: error.message, variant: "destructive" }); return; }
    setChildTitle(""); setChildPrice(0); setChildDesc("");
    refresh();
  };

  const remove = async (id: string) => {
    await supabase.from("seller_listings" as any).delete().eq("id", id);
    refresh();
  };

  const daysLeft = (iso: string) => Math.max(0, Math.ceil((new Date(iso).getTime() - Date.now()) / 86400000));

  const parents = listings.filter(l => !l.parent_listing_id);
  const childrenOf = (id: string) => listings.filter(l => l.parent_listing_id === id);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2"><Package className="w-5 h-5 text-gold" /> My Listings</CardTitle>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => { setType("normal"); setOpen(true); }}>
            <Plus className="w-4 h-4 mr-1" /> List New Item <span className="ml-1 text-xs text-muted-foreground">($0.10)</span>
          </Button>
          <Button size="sm" variant="gold" onClick={() => { setType("collection"); setOpen(true); }}>
            <Layers className="w-4 h-4 mr-1" /> Add Collection <span className="ml-1 text-xs">($2)</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {parents.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">No listings yet. Each listing is active for 4 months.</p>
        ) : (
          <div className="space-y-2">
            {parents.map((l) => {
              const kids = l.listing_type === "collection" ? childrenOf(l.id) : [];
              const sumChildren = kids.reduce((s, k) => s + Number(k.price || 0), 0);
              const savings = l.bundle_price && sumChildren > 0 ? Math.max(0, sumChildren - Number(l.bundle_price)) : 0;
              const savingsPct = sumChildren > 0 ? Math.round((savings / sumChildren) * 100) : 0;
              const isOpen = !!expanded[l.id];
              return (
                <div key={l.id} className="rounded-lg bg-muted">
                  <div className="flex items-center justify-between p-3">
                    <div className="flex items-center gap-2">
                      {l.listing_type === "collection" && (
                        <button onClick={() => setExpanded({ ...expanded, [l.id]: !isOpen })}>
                          {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                        </button>
                      )}
                      <div>
                        <p className="font-body text-sm text-foreground flex items-center gap-2">
                          {l.title || "Untitled"}
                          <span className={`text-[10px] px-1.5 py-0.5 rounded ${l.listing_type === "collection" ? "bg-gold/20 text-gold" : "bg-blue-500/10 text-blue-400"}`}>
                            {l.listing_type}
                          </span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded ${l.status === "active" ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"}`}>
                            {l.status}
                          </span>
                        </p>
                        <p className="text-xs text-muted-foreground flex items-center gap-2">
                          {l.listing_type === "collection"
                            ? <>Bundle: {l.bundle_price ? format(Number(l.bundle_price)) : "—"} • Items total: {format(sumChildren)}{savingsPct > 0 && <span className="text-green-500"> • Save {savingsPct}%</span>}</>
                            : <>{l.price ? format(Number(l.price)) : "—"}</>
                          }
                          {" "}• Fee ${Number(l.listing_fee).toFixed(2)}
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {daysLeft(l.expires_at)}d left</span>
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      {l.listing_type === "collection" && (
                        <Button variant="outline" size="sm" onClick={() => setAddItemFor(l)}>
                          <Plus className="w-3 h-3 mr-1" /> Add Item
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" onClick={() => remove(l.id)}>
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                  {isOpen && kids.length > 0 && (
                    <div className="px-6 pb-3 space-y-1">
                      {kids.map(k => (
                        <div key={k.id} className="flex items-center justify-between p-2 rounded bg-background/40">
                          <p className="text-xs">{k.title} <span className="text-muted-foreground">— {format(Number(k.price || 0))}</span></p>
                          <Button size="icon" variant="ghost" onClick={() => remove(k.id)}><Trash2 className="w-3 h-3 text-red-500" /></Button>
                        </div>
                      ))}
                    </div>
                  )}
                  {isOpen && kids.length === 0 && (
                    <p className="px-6 pb-3 text-xs text-muted-foreground">No items yet. Add at least 2 items to make this a real bundle.</p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{type === "collection" ? "Add New Collection ($2)" : "List New Item ($0.10)"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Title *</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={type === "collection" ? "Spring Drop 2026" : "Oud Royale Perfume"} />
            </div>
            {type === "normal" ? (
              <div>
                <Label>Price (USD)</Label>
                <Input type="number" min={0} step={0.01} value={price} onChange={(e) => setPrice(Number(e.target.value) || 0)} />
              </div>
            ) : (
              <div>
                <Label>Bundle Price (USD) — must be lower than the sum of items</Label>
                <Input type="number" min={0} step={0.01} value={bundlePrice} onChange={(e) => setBundlePrice(Number(e.target.value) || 0)} />
                <p className="text-xs text-muted-foreground mt-1">After creating, add items individually — each can also be sold alone at its own price.</p>
              </div>
            )}
            <div>
              <Label>Description</Label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
            </div>
            <p className="text-xs text-muted-foreground">
              By publishing you agree to the <a href="/terms" className="text-gold underline">Listing Conditions</a>: 4-month active period, then auto-archived. Fee is non-refundable.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button variant="gold" disabled={busy} onClick={create}>{busy ? "Creating..." : `Pay $${FEE[type].toFixed(2)} & Publish`}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!addItemFor} onOpenChange={(o) => !o && setAddItemFor(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Item to "{addItemFor?.title}"</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div><Label>Item Title *</Label><Input value={childTitle} onChange={e => setChildTitle(e.target.value)} /></div>
            <div><Label>Item Price (USD) — sold alone at this price</Label><Input type="number" min={0} step={0.01} value={childPrice} onChange={e => setChildPrice(Number(e.target.value) || 0)} /></div>
            <div><Label>Description</Label><Textarea value={childDesc} onChange={e => setChildDesc(e.target.value)} rows={2} /></div>
            <p className="text-xs text-muted-foreground">Bundle price (collection): {addItemFor?.bundle_price ? format(Number(addItemFor.bundle_price)) : "—"}. Buyers save when they buy the whole collection.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddItemFor(null)}>Close</Button>
            <Button variant="gold" onClick={addChildItem}>Add Item</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default SellerListings;
