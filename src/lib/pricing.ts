export type PayMethod = "online" | "wallet" | "paypal" | "wallet_card" | "cod";

/**
 * Quantity-based offer tiers — single source of truth for every discount
 * shown across the store.
 *
 *  1 – 3 products : 0% offline / 2% online
 *  4 – 7 products : 3% offline / 5% online
 *  8+   products  : 6% offline / 8% online
 */
export const OFFER_TIERS = [
  { min: 1, max: 3, offline: 0, online: 0.02, label: "1–3 items" },
  { min: 4, max: 7, offline: 0.03, online: 0.05, label: "4–7 items" },
  { min: 8, max: Infinity, offline: 0.06, online: 0.08, label: "8+ items" },
] as const;

export const PRICING_RULES = {
  /** Discount for a single online (prepaid) item: card, wallet, wallet+card, PayPal */
  ONLINE_PCT: 0.02,
  /** Best online discount available (used for "up to X% off" badges) */
  MAX_ONLINE_PCT: 0.08,
  /** Extra discount when paying an advance deposit on a Cash-on-Delivery order */
  ADVANCE_PCT: 0.05,
  /** Share of the order paid up front with the advance option */
  ADVANCE_DEPOSIT_PCT: 0.2,
};

export const isOnlineMethod = (m: PayMethod) => m !== "cod";

export const getTier = (units: number) =>
  OFFER_TIERS.find((t) => units >= t.min && units <= t.max) ?? OFFER_TIERS[0];

/** Discount rate that applies to a basket of `units` items paid with `method`. */
export const getTierRate = (units: number, method: PayMethod) => {
  const tier = getTier(Math.max(1, units));
  return isOnlineMethod(method) ? tier.online : tier.offline;
};

export interface Quote {
  subtotal: number;
  units: number;
  tierRate: number;
  tierDiscount: number;
  /** Kept for backwards compatibility with existing UI copy */
  bulkDiscount: number;
  onlineDiscount: number;
  advanceDiscount: number;
  totalDiscount: number;
  /** Final price of the order after every discount */
  total: number;
  /** Amount charged right now */
  payNow: number;
  /** Amount collected on delivery (0 unless Hybrid COD) */
  dueOnDelivery: number;
}

/**
 * Discounts: subtotal -> quantity tier (offline/online rate) -> advance deposit (5%).
 */
export function getQuote(
  subtotal: number,
  method: PayMethod,
  advance = false,
  units = 1
): Quote {
  const tierRate = getTierRate(units, method);
  const tierDiscount = subtotal * tierRate;
  const afterTier = subtotal - tierDiscount;

  const useAdvance = method === "cod" && advance;
  const advanceDiscount = useAdvance ? afterTier * PRICING_RULES.ADVANCE_PCT : 0;

  const total = Math.max(0, afterTier - advanceDiscount);
  const payNow = useAdvance ? total * PRICING_RULES.ADVANCE_DEPOSIT_PCT : total;

  return {
    subtotal,
    units,
    tierRate,
    tierDiscount,
    bulkDiscount: 0,
    onlineDiscount: isOnlineMethod(method) ? tierDiscount : 0,
    advanceDiscount,
    totalDiscount: tierDiscount + advanceDiscount,
    total,
    payNow,
    dueOnDelivery: total - payNow,
  };
}
