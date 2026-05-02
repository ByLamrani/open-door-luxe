import { useEffect, useRef, useState } from "react";
import { PAYPAL_CLIENT_ID, PAYPAL_CURRENCY } from "@/lib/payments/config";
import { paymentProvider } from "@/lib/payments/paypalProvider";
import type { CreateOrderInput, CaptureResult } from "@/lib/payments/types";
import { Loader2 } from "lucide-react";

let sdkPromise: Promise<void> | null = null;

function loadPayPalSdk(currency: string): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if ((window as any).paypal) return Promise.resolve();
  if (sdkPromise) return sdkPromise;
  sdkPromise = new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(
      PAYPAL_CLIENT_ID
    )}&currency=${currency}&intent=capture`;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Failed to load PayPal SDK"));
    document.body.appendChild(s);
  });
  return sdkPromise;
}

interface PayPalButtonProps {
  buildOrderInput: () => CreateOrderInput | Promise<CreateOrderInput>;
  onApproved: (result: CaptureResult) => void;
  onError?: (e: unknown) => void;
  disabled?: boolean;
}

const PayPalButton = ({
  buildOrderInput,
  onApproved,
  onError,
  disabled,
}: PayPalButtonProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    loadPayPalSdk(PAYPAL_CURRENCY)
      .then(() => {
        if (cancelled || !ref.current) return;
        const paypal = (window as any).paypal;
        if (!paypal) return;
        ref.current.innerHTML = "";
        paypal
          .Buttons({
            style: { shape: "pill", color: "blue", layout: "horizontal" },
            createOrder: async () => {
              const input = await buildOrderInput();
              const res = await paymentProvider.createOrder(input);
              return res.providerOrderId;
            },
            onApprove: async (data: any) => {
              try {
                const result = await paymentProvider.captureOrder(data.orderID);
                onApproved(result);
              } catch (e) {
                onError?.(e);
              }
            },
            onError: (err: unknown) => onError?.(err),
          })
          .render(ref.current)
          .then(() => setLoading(false));
      })
      .catch((e) => onError?.(e));
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="relative">
      {loading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading PayPal…
        </div>
      )}
      <div ref={ref} className={disabled ? "pointer-events-none opacity-50" : ""} />
    </div>
  );
};

export default PayPalButton;
