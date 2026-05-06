import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Globe, Check } from "lucide-react";
import { LANGUAGES } from "@/lib/i18n";

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const activeCode = i18n.resolvedLanguage || i18n.language;
  const current = LANGUAGES.find((l) => activeCode?.startsWith(l.code)) ?? LANGUAGES[0];

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        className="flex items-center gap-1 px-2 py-1.5 text-xs text-foreground/80 hover:text-gold transition-colors rounded-md"
        aria-label="Change language"
      >
        <Globe className="w-4 h-4" />
        <span className="hidden sm:inline">{current.flag} {current.code.toUpperCase()}</span>
      </button>
      {open && (
        <div className="absolute right-0 mt-1 z-50 min-w-[180px] bg-card border border-border rounded-lg shadow-xl py-1 max-h-80 overflow-y-auto">
          {LANGUAGES.map((l) => (
            <button
              key={l.code}
              onMouseDown={(e) => { e.preventDefault(); i18n.changeLanguage(l.code); setOpen(false); }}
              className={`w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-muted ${
                activeCode?.startsWith(l.code) ? "text-gold" : "text-foreground/80"
              }`}
            >
              <span>{l.flag} {l.label}</span>
              {activeCode?.startsWith(l.code) && <Check className="w-3.5 h-3.5" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;
