import { useState } from "react";
import { Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const WHATSAPP = "212600000000"; // TODO: remplacer par le vrai numéro

const PrivateConcierge = ({ productName }: { productName?: string }) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [note, setNote] = useState("");

  const send = () => {
    const msg = `Concierge Privé Lamra Lux\nNom: ${name}\n${productName ? `Produit: ${productName}\n` : ""}Date souhaitée: ${date || "-"}\nDemande: ${note}`;
    window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`, "_blank");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="lg" className="w-full mb-6">
          <Crown className="w-4 h-4 mr-2" /> Concierge Privé
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">Concierge Privé</DialogTitle>
          <DialogDescription>Conseil personnalisé, emballage cadeau ou rendez-vous privé — un conseiller vous répond sur WhatsApp.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5"><Label>Nom</Label><Input value={name} onChange={(e) => setName(e.target.value.slice(0, 80))} /></div>
          <div className="space-y-1.5"><Label>Date souhaitée</Label><Input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></div>
          <div className="space-y-1.5"><Label>Votre demande</Label><Textarea value={note} onChange={(e) => setNote(e.target.value.slice(0, 500))} /></div>
          <Button className="w-full" disabled={!name.trim() || !note.trim()} onClick={send}>Envoyer</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PrivateConcierge;
