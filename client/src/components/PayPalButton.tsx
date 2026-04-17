/**
 * PayPalButton — renders the PayPal Smart Payment Buttons for a single product.
 *
 * Flow:
 *  1. User clicks PayPal button
 *  2. createOrder → POST /api/paypal/create-order → returns orderId
 *  3. PayPal popup handles authentication & payment
 *  4. onApprove → POST /api/paypal/capture-order → returns downloadToken
 *  5. onSuccess(downloadToken) is called — parent opens /api/download/:token
 */
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";

interface PayPalButtonProps {
  productSlug: string;
  priceUsd: number;
  onSuccess?: (downloadToken: string, productTitle: string) => void;
  onError?: (msg: string) => void;
}

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    paypal?: any;
  }
}

export function PayPalButton({ productSlug, priceUsd, onSuccess, onError }: PayPalButtonProps) {
  const handleSuccess = onSuccess ?? ((token: string) => { window.location.href = `/api/download/${token}`; });
  const { user } = useAuth();
  const containerRef = useRef<HTMLDivElement>(null);
  const [sdkReady, setSdkReady] = useState(false);
  const [rendered, setRendered] = useState(false);

  // Load PayPal JS SDK once
  useEffect(() => {
    const clientId = import.meta.env.VITE_PAYPAL_CLIENT_ID;
    if (!clientId) {
      onError?.("PayPal is not configured.");
      return;
    }
    if (window.paypal) { setSdkReady(true); return; }

    const script = document.createElement("script");
    script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=USD&intent=capture`;
    script.async = true;
    script.onload = () => setSdkReady(true);
    script.onerror = () => onError?.("Failed to load PayPal.");
    document.body.appendChild(script);
    return () => { /* leave script in DOM for reuse */ };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Render buttons once SDK is ready
  useEffect(() => {
    if (!sdkReady || !containerRef.current || rendered) return;
    if (!window.paypal) return;

    setRendered(true);
    containerRef.current.innerHTML = "";

    window.paypal.Buttons({
      style: {
        layout: "vertical",
        color: "gold",
        shape: "rect",
        label: "pay",
        height: 45,
      },

      createOrder: async () => {
        const res = await fetch("/api/paypal/create-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productSlug, userId: user?.id }),
        });
        const data = await res.json() as { orderId?: string; error?: string };
        if (!data.orderId) throw new Error(data.error ?? "Failed to create order");
        return data.orderId;
      },

      onApprove: async (data: { orderID: string }) => {
        const res = await fetch("/api/paypal/capture-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId: data.orderID,
            productSlug,
            userId: user?.id,
          }),
        });
        const result = await res.json() as {
          status?: string;
          downloadToken?: string;
          productTitle?: string;
          error?: string;
        };
        if (result.status === "COMPLETED" && result.downloadToken) {
          handleSuccess(result.downloadToken, result.productTitle ?? productSlug);
        } else {
          onError?.(result.error ?? "Payment capture failed.");
        }
      },

      onError: (err: unknown) => {
        console.error("[PayPal] Button error:", err);
        onError?.("PayPal encountered an error. Please try again.");
      },

      onCancel: () => {
        // silently ignore cancellations
      },
    }).render(containerRef.current);
  }, [sdkReady, rendered, productSlug, priceUsd, user, onSuccess, onError]);

  return (
    <div className="w-full">
      {!sdkReady && (
        <div className="h-11 rounded bg-muted animate-pulse flex items-center justify-center text-sm text-muted-foreground">
          Loading PayPal…
        </div>
      )}
      <div ref={containerRef} className={sdkReady ? "block" : "hidden"} />
    </div>
  );
}
