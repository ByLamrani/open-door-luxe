import { useEffect, useState } from "react";

/** English → French dictionary for the BackOffice. Text not listed stays in English. */
const FR: Record<string, string> = {
  "Overview": "Vue d'ensemble", "Products": "Produits", "Payments": "Paiements", "Special Offers": "Offres spéciales",
  "Orders": "Commandes", "Logistics": "Logistique", "Expenses": "Dépenses", "Users": "Utilisateurs",
  "Verifications": "Vérifications", "APIs & Connections": "APIs & Connexions", "Administration": "Administration",
  "History": "Historique", "Back Office": "Back Office", "Download Excel": "Télécharger Excel", "View store": "Voir la boutique",
  "Sign out": "Se déconnecter", "Lamra Lux Dashboard": "Tableau de bord Lamra Lux",
  "Manage traffic, orders, products, payments and offers.": "Gérez le trafic, les commandes, les produits, les paiements et les offres.",
  "Admin": "Admin", "Company": "Société", "Agents": "Agents", "All": "Tout", "Day": "Jour", "Week": "Semaine", "Month": "Mois",
  "Processing": "En traitement", "Shipped": "Expédiée", "Delivered": "Livrée", "Returned": "Retournée", "Received": "Reçue",
  "pending": "en attente", "processing": "en traitement", "shipped": "expédiée", "delivered": "livrée", "returned": "retournée",
  "received": "reçue", "cancelled": "annulée", "Add a product": "Ajouter un produit", "Add product": "Ajouter le produit",
  "Category": "Catégorie", "Sub-category": "Sous-catégorie", "Name": "Nom", "Price": "Prix", "Selling price": "Prix de vente",
  "Buying price (cost)": "Prix d'achat (coût)", "Comparative price (before discount)": "Prix comparatif (avant remise)",
  "Description": "Description", "Picture": "Photo", "Select a category": "Choisir une catégorie",
  "Select a sub-category": "Choisir une sous-catégorie", "Choose a category first": "Choisissez d'abord une catégorie",
  "Save": "Enregistrer", "Cancel": "Annuler", "Delete": "Supprimer", "Edit": "Modifier", "Search": "Rechercher",
  "Title": "Titre", "Occasion": "Occasion", "Discount (%)": "Remise (%)", "Ends on": "Se termine le",
  "Create offer": "Créer l'offre", "Create a special-occasion offer": "Créer une offre spéciale", "Applies to": "S'applique à",
  "All products": "Tous les produits", "Categories": "Catégories", "Sub-categories": "Sous-catégories",
  "Search a product…": "Rechercher un produit…", "Buyer": "Acheteur", "Phone": "Téléphone", "Email": "E-mail",
  "Address": "Adresse", "City": "Ville", "Postal code": "Code postal", "Country": "Pays", "Notes": "Notes",
  "Payment": "Paiement", "Subtotal": "Sous-total", "Discount": "Remise", "Total": "Total", "Deposit paid": "Acompte payé",
  "Due on delivery": "À payer à la livraison", "Delivery company": "Société de livraison", "Shipping cost": "Frais de livraison",
  "Placed on": "Passée le", "Cash on delivery": "Paiement à la livraison", "Order process": "Processus de commande",
  "1. Confirm the order": "1. Confirmer la commande", "2. Verify receiver info": "2. Vérifier les infos du destinataire",
  "3. Prepare & package": "3. Préparer & emballer", "4. Assign delivery company": "4. Attribuer la société de livraison",
  "5. Record expenses": "5. Enregistrer les dépenses", "6. Hand over to courier": "6. Remettre au livreur",
  "7. Delivered & paid": "7. Livrée & payée", "Complete step": "Valider l'étape", "Completed": "Terminé",
  "Customer contacted (call / WhatsApp)": "Client contacté (appel / WhatsApp)", "Customer confirmed the order": "Le client a confirmé la commande",
  "Items available in stock": "Articles disponibles en stock", "Items picked from stock": "Articles prélevés du stock",
  "Quality checked (no defects)": "Qualité vérifiée (aucun défaut)", "Gift-wrapped / protected": "Emballage cadeau / protégé",
  "Invoice / receipt inside": "Facture / reçu inclus", "Shipping label attached": "Étiquette d'expédition collée",
  "Courier picked up the parcel": "Le livreur a récupéré le colis", "Customer notified with tracking": "Client notifié avec le suivi",
  "Customer received the parcel": "Le client a reçu le colis", "Payment collected / settled": "Paiement encaissé / réglé",
  "Receiver name *": "Nom du destinataire *", "Phone *": "Téléphone *", "Address *": "Adresse *", "City *": "Ville *",
  "Landmark / directions": "Repère / indications", "Preferred delivery time": "Heure de livraison souhaitée",
  "Delivery company *": "Société de livraison *", "Tracking number": "Numéro de suivi", "Delivery cost": "Coût de livraison",
  "Add expense": "Ajouter une dépense", "Total order costs": "Coût total de la commande", "Return reason": "Motif du retour",
  "Mark returned": "Marquer comme retournée", "Internal notes": "Notes internes", "Timeline": "Chronologie",
  "Parcels": "Colis", "Weight (kg)": "Poids (kg)", "Size (cm)": "Dimensions (cm)", "Amount collected on delivery": "Montant encaissé à la livraison",
  "Select a company": "Choisir une société", "Net profits": "Bénéfices nets", "Sales": "Ventes", "Discounts given": "Remises accordées",
  "Buying cost": "Coût d'achat", "Shipping": "Livraison", "Net profit": "Bénéfice net", "Today": "Aujourd'hui",
  "This week": "Cette semaine", "This month": "Ce mois", "All time": "Depuis le début", "Save company info": "Enregistrer les infos société",
  "Identity": "Identité", "Address & contact": "Adresse & contact", "Social media": "Réseaux sociaux", "Banking": "Banque",
  "Add agent": "Ajouter un agent", "No agents yet.": "Aucun agent pour l'instant.", "Permissions & info": "Permissions & infos",
  "Shipments": "Expéditions", "Delivery companies": "Sociétés de livraison", "Shipping finance": "Finances livraison",
  "Shipping jobs": "Missions de livraison", "Deposits": "Dépôts", "Withdrawals": "Retraits", "Transactions": "Transactions",
  "Users History": "Historique utilisateurs", "Clients History": "Historique clients", "Revenue": "Chiffre d'affaires",
  "Customers": "Clients", "Catalogue": "Catalogue", "Quantity in stock": "Quantité en stock", "Amount": "Montant", "Date": "Date",
  "Status": "Statut", "Order": "Commande", "Items": "Articles", "Approve": "Approuver", "Reject": "Rejeter",
  "Set a new connection": "Créer une nouvelle connexion", "Label (optional)": "Libellé (optionnel)", "Platform name": "Nom de la plateforme",
  "Online": "En ligne", "Profit": "Bénéfice", "Cost": "Coût", "Sale": "Vente",
};

const KEY = "lamralux_bo_lang";
export type BoLang = "en" | "fr";

export const useBackofficeLang = () => {
  const [lang, setLang] = useState<BoLang>(() => (localStorage.getItem(KEY) as BoLang) || "fr");
  useEffect(() => {
    localStorage.setItem(KEY, lang);
    const originals = new WeakMap<Node, string>();
    const phOriginals = new WeakMap<Element, string>();
    const translateNode = (n: Node) => {
      if (n.nodeType === Node.TEXT_NODE) {
        const orig = originals.get(n) ?? n.nodeValue ?? "";
        const key = orig.trim();
        const fr = FR[key];
        if (!fr) return;
        originals.set(n, orig);
        const target = lang === "fr" ? orig.replace(key, fr) : orig;
        if (n.nodeValue !== target) n.nodeValue = target;
      } else if (n instanceof Element) {
        if (n.tagName === "SCRIPT" || n.tagName === "STYLE") return;
        const ph = n.getAttribute("placeholder");
        if (ph !== null) {
          const orig = phOriginals.get(n) ?? ph;
          if (FR[orig]) { phOriginals.set(n, orig); const t = lang === "fr" ? FR[orig] : orig; if (ph !== t) n.setAttribute("placeholder", t); }
        }
        n.childNodes.forEach(translateNode);
      }
    };
    translateNode(document.body);
    const obs = new MutationObserver((muts) => {
      muts.forEach((m) => {
        if (m.type === "characterData") { originals.delete(m.target); translateNode(m.target); }
        m.addedNodes.forEach(translateNode);
      });
    });
    obs.observe(document.body, { childList: true, subtree: true, characterData: true });
    return () => obs.disconnect();
  }, [lang]);
  return { lang, setLang };
};
