import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Loader2, Sparkles, Image as ImageIcon } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const AIDocumentAnalyzer = () => {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const analyze = async () => {
    if (!file) return;
    setBusy(true); setResult(null);
    try {
      const reader = new FileReader();
      const dataUrl: string = await new Promise((res, rej) => {
        reader.onload = () => res(reader.result as string);
        reader.onerror = rej;
        reader.readAsDataURL(file);
      });
      const { data, error } = await supabase.functions.invoke("seller-ai", {
        body: { type: "document_analysis", document: { name: file.name, mime: file.type, dataUrl } },
      });
      if (error) throw error;
      setResult(data?.insight || "No analysis available.");
    } catch (e: any) {
      toast({ title: "Analysis failed", description: e.message, variant: "destructive" });
    } finally { setBusy(false); }
  };

  return (
    <Card className="border-gold/30">
      <CardHeader><CardTitle className="flex items-center gap-2"><FileText className="w-5 h-5 text-gold" /> Document Analyzer</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        <p className="text-xs text-muted-foreground">Upload an invoice, contract, shipping label, or product spec sheet — AI will extract key data and flag risks.</p>
        <Input type="file" accept="image/*,application/pdf" onChange={e => setFile(e.target.files?.[0] || null)} />
        <Button variant="gold" disabled={!file || busy} onClick={analyze} className="w-full">
          {busy ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Analyzing...</> : <>Analyze Document</>}
        </Button>
        {result && <div className="text-sm bg-muted p-3 rounded whitespace-pre-wrap max-h-72 overflow-y-auto">{result}</div>}
      </CardContent>
    </Card>
  );
};

export const AIProductGenerator = () => {
  const { toast } = useToast();
  const [productName, setProductName] = useState("");
  const [details, setDetails] = useState("");
  const [busy, setBusy] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [description, setDescription] = useState<string | null>(null);

  const generate = async () => {
    if (!productName.trim()) return;
    setBusy(true); setImage(null); setDescription(null);
    try {
      const { data, error } = await supabase.functions.invoke("seller-ai", {
        body: { type: "product_generator", productName, details },
      });
      if (error) throw error;
      setImage(data?.imageUrl || null);
      setDescription(data?.description || null);
    } catch (e: any) {
      toast({ title: "Generation failed", description: e.message, variant: "destructive" });
    } finally { setBusy(false); }
  };

  return (
    <Card className="border-gold/30">
      <CardHeader><CardTitle className="flex items-center gap-2"><ImageIcon className="w-5 h-5 text-gold" /> AI Product Generator</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        <div>
          <Label>Product Name *</Label>
          <Input value={productName} onChange={e => setProductName(e.target.value)} placeholder="e.g. Oud Royale 50ml" />
        </div>
        <div>
          <Label>Style / Details</Label>
          <Textarea rows={2} value={details} onChange={e => setDetails(e.target.value)} placeholder="Luxury, dark wood backdrop, gold accents..." />
        </div>
        <Button variant="gold" disabled={!productName || busy} onClick={generate} className="w-full">
          {busy ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating photo + copy...</> : <><Sparkles className="w-4 h-4 mr-2" /> Generate</>}
        </Button>
        {image && <img src={image} alt={productName} className="w-full rounded-lg border border-border" />}
        {description && <div className="text-sm bg-muted p-3 rounded whitespace-pre-wrap">{description}</div>}
      </CardContent>
    </Card>
  );
};
