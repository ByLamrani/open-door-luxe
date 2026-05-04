import { useState } from "react";
import { Coins, Check } from "lucide-react";
import { useCurrency, CURRENCIES, CurrencyCode } from "@/context/CurrencyContext";

const CurrencySwitcher = () => {
  const { currency, setCurrency } = useCurrency();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        className="flex items-center gap-1 px-2 py-1.5 text-xs text-foreground/80 hover:text-gold transition-colors rounded-md"
        aria-label="Change currency"
      >
        <Coins className="w-4 h-4" />
        <span className="hidden sm:inline">{currency}</span>
      </button>
      {open && (
        <div className="absolute right-0 mt-1 z-50 min-w-[180px] bg-card border border-border rounded-lg shadow-xl py-1 max-h-80 overflow-y-auto">
          {CURRENCIES.map((c) => (
            <button
              key={c.code}
              onMouseDown={(e) => { e.preventDefault(); setCurrency(c.code as CurrencyCode); setOpen(false); }}
              className={`w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-muted ${
                c.code === currency ? "text-gold" : "text-foreground/80"
              }`}
            >
              <span>{c.symbol} {c.code} <span className="text-xs text-muted-foreground">— {c.name}</span></span>
              {c.code === currency && <Check className="w-3.5 h-3.5" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default CurrencySwitcher;
