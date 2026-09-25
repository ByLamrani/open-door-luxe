import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { products } from "@/data/products";

const QuickSearch = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <button onClick={() => setOpen(true)} aria-label="Rechercher" className="p-2 text-foreground/80 hover:text-foreground transition-colors">
        <Search className="w-5 h-5" />
      </button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Rechercher un produit, une catégorie…" />
        <CommandList>
          <CommandEmpty>Aucun résultat.</CommandEmpty>
          <CommandGroup heading="Produits">
            {products.map((p) => (
              <CommandItem
                key={p.id}
                value={`${p.name} ${p.category} ${p.subcategory ?? ""}`}
                onSelect={() => { setOpen(false); navigate(`/product/${p.id}`); }}
              >
                <img src={p.image} alt="" className="w-8 h-8 object-cover mr-3" />
                <span className="flex-1">{p.name}</span>
                <span className="text-xs text-muted-foreground">{p.category}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
};

export default QuickSearch;
