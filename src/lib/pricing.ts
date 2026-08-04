export type PayMethod = "online" | "wallet" | "paypal" | "wallet_card" | "cod";

/** Single source of truth for every discount shown across the store. */
export const PRICING_RULES = {
  /** Bulk discount applied on the subtotal above this threshold */
  BULK_THRESHOLD: 700,
  BULK_PCT: 0.08,
  /** Discount for any online (prepaid) method: card, wallet, wallet+card, PayPal */
  ONLINE_PCT: 0.05,
  /** Extra discount when paying an advance deposit on a Cash-on-Delivery order */
  ADVANCE_PCT: 0.05,
  /** Share of the order paid up front with the advance option */
  ADVANCE_DEPOSIT_PCT: 0.2,
};

export const isOnlineMethod = (m: PayMethod) => m !== "cod";

export interface Quote {
  subtotal: number;
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
 * Discounts are applied in a fixed order so every payment method is comparable:
 * subtotal -> bulk (8% over $700) -> online (5%) -> advance deposit (5%).
 */
export function getQuote(subtotal: number, method: PayMethod, advance = false): Quote {
  const bulkDiscount = subtotal >= PRICING_RULES.BULK_THRESHOLD ? subtotal * PRICING_RULES.BULK_PCT : 0;
  const afterBulk = subtotal - bulkDiscount;

  const onlineDiscount = isOnlineMethod(method) ? afterBulk * PRICING_RULES.ONLINE_PCT : 0;
  const afterOnline = afterBulk - onlineDiscount;

  const useAdvance = method === "cod" && advance;
  const advanceDiscount = useAdvance ? afterOnline * PRICING_RULES.ADVANCE_PCT : 0;

  const total = Math.max(0, afterOnline - advanceDiscount);
  const payNow = useAdvance ? total * PRICING_RULES.ADVANCE_DEPOSIT_PCT : total;

  return {
    subtotal,
    bulkDiscount,
    onlineDiscount,
    advanceDiscount,
    totalDiscount: bulkDiscount + onlineDiscount + advanceDiscount,
    total,
    payNow,
    dueOnDelivery: total - payNow,
  };
}
