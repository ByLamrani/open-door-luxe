import { supabase } from "@/integrations/supabase/client";
import type {
  CaptureResult,
  CreateOrderInput,
  CreateOrderResult,
  PaymentProvider,
} from "./types";

// Browser-side PayPal provider — delegates server work to edge functions
// so secrets never leave the backend. Future Stripe provider can implement
// the same interface and be swapped in PaymentService.
export class PayPalProvider implements PaymentProvider {
  readonly name = "paypal";

  async createOrder(input: CreateOrderInput): Promise<CreateOrderResult> {
    const { data, error } = await supabase.functions.invoke("paypal-create-order", {
      body: input,
    });
    if (error) throw error;
    return data as CreateOrderResult;
  }

  async captureOrder(providerOrderId: string): Promise<CaptureResult> {
    const { data, error } = await supabase.functions.invoke("paypal-capture-order", {
      body: { providerOrderId },
    });
    if (error) throw error;
    return data as CaptureResult;
  }
}

export const paymentProvider: PaymentProvider = new PayPalProvider();
