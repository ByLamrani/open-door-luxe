import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export type CurrencyCode = "USD" | "EUR" | "MAD" | "GBP" | "AED" | "SAR" | "CAD" | "JPY" | "CNY" | "RUB";

export const CURRENCIES: { code: CurrencyCode; symbol: string; name: string; suffix?: boolean }[] = [
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "MAD", symbol: "DH", name: "Moroccan Dirham", suffix: true },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "AED", symbol: "AED", name: "UAE Dirham", suffix: true },
  { code: "SAR", symbol: "SAR", name: "Saudi Riyal", suffix: true },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen" },
  { code: "CNY", symbol: "¥", name: "Chinese Yuan" },
  { code: "RUB", symbol: "₽", name: "Russian Ruble" },
];

const CACHE_KEY = "vanta_fx_cache_v1";
const CACHE_TTL_MS = 60 * 60 * 1000; // 1h

interface FxCache { rates: Record<string, number>; fetched_at: number }

interface Ctx {
  currency: CurrencyCode;
  setCurrency: (c: CurrencyCode) => void;
  rates: Record<string, number>;
  loading: boolean;
  // Convert a USD amount to the active currency
  convert: (usd: number) => number;
  // Format a USD amount in the active currency
  format: (usd: number) => string;
  symbol: string;
}

const CurrencyContext = createContext<Ctx | undefined>(undefined);

export const CurrencyProvider = ({ children }: { children: ReactNode }) => {
  const [currency, setCurrencyState] = useState<CurrencyCode>(
    (localStorage.getItem("vanta_currency") as CurrencyCode) || "USD"
  );
  const [rates, setRates] = useState<Record<string, number>>({ USD: 1 });
  const [loading, setLoading] = useState(true);

  const setCurrency = (c: CurrencyCode) => {
    setCurrencyState(c);
    localStorage.setItem("vanta_currency", c);
  };

  const refresh = useCallback(async () => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed: FxCache = JSON.parse(cached);
        if (Date.now() - parsed.fetched_at < CACHE_TTL_MS) {
          setRates(parsed.rates);
          setLoading(false);
          return;
        }
      }
      const { data, error } = await supabase.functions.invoke("exchange-rates");
      if (error) throw error;
      if (data?.rates) {
        setRates(data.rates);
        localStorage.setItem(CACHE_KEY, JSON.stringify({ rates: data.rates, fetched_at: Date.now() }));
      }
    } catch (e) {
      console.warn("FX fetch failed; using fallback rates", e);
      setRates({ USD: 1, EUR: 0.92, MAD: 10.0, GBP: 0.79, AED: 3.67, SAR: 3.75, CAD: 1.36, JPY: 155, CNY: 7.2, RUB: 92 });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const meta = CURRENCIES.find((c) => c.code === currency)!;
  const rate = rates[currency] ?? 1;

  const convert = (usd: number) => usd * rate;
  const format = (usd: number) => {
    const v = convert(usd);
    const num = currency === "JPY" ? v.toFixed(0) : v.toFixed(2);
    return meta.suffix ? `${num} ${meta.symbol}` : `${meta.symbol}${num}`;
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, rates, loading, convert, format, symbol: meta.symbol }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error("useCurrency must be used inside CurrencyProvider");
  return ctx;
};
