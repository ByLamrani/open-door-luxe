// Modular payment provider abstraction.
// Future providers (Stripe Connect, Adyen, etc.) implement the same interface.

export type PaymentMode = "full" | "deposit_20" | "topup";

export interface PaymentLineItem {
  name: string;
  amount: number; // unit price
  quantity: number;
  vendorId?: string; // seller user_id (for split routing)
  vendorEmail?: string; // PayPal payee email
}

export interface CreateOrderInput {
  orderId: string;
  currency: string; // e.g. 'USD'
  items: PaymentLineItem[];
  totalAmount: number; // already-discounted total to charge now
  mode: PaymentMode;
  // For deposit mode, the full item price (used to compute due_on_delivery)
  fullPrice?: number;
  // Vendor split (defaults defined by provider)
  vendorEmail?: string;
}

export interface CreateOrderResult {
  providerOrderId: string;
  approveUrl?: string;
}

export interface CaptureResult {
  captureId: string;
  status: "COMPLETED" | "PENDING" | "FAILED";
  amount: number;
  currency: string;
}

export interface PaymentProvider {
  readonly name: string;
  createOrder(input: CreateOrderInput): Promise<CreateOrderResult>;
  captureOrder(providerOrderId: string): Promise<CaptureResult>;
}
