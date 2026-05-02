// PayPal Client ID is a PUBLIC value (it's exposed in the browser SDK).
// Replace this with your live or sandbox client ID.
// For sandbox testing, get one at https://developer.paypal.com
export const PAYPAL_CLIENT_ID =
  (import.meta as any).env?.VITE_PAYPAL_CLIENT_ID ||
  "sb"; // 'sb' = PayPal sandbox demo client

export const PAYPAL_CURRENCY = "USD";

// Smart-pricing constants (single source of truth)
export const PRICING = {
  ONLINE_DISCOUNT_PCT: 0.08, // 8% off when paying online (PayPal/Wallet)
  HYBRID_COD_DISCOUNT_PCT: 0.05, // 5% off full item price
  HYBRID_COD_DEPOSIT_PCT: 0.2, // 20% advance deposit
  PLATFORM_FEE_PCT: 0.1, // 10% platform fee
  VENDOR_SHARE_PCT: 0.9, // 90% vendor share
};
