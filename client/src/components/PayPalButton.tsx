/**
 * PayPalButton — renders the PayPal Smart Payment Buttons for a single product.
 *
 * Flow:
 *  1. User clicks PayPal button
 *  2. createOrder → POST /api/paypal/create-order → returns orderId
 *  3. PayPal popup handles authentication & payment
 *  4. onApprove → POST /api/paypal/capture-order → returns COMPLETED status
 *  5. onSuccess("", productTitle) is called — parent redirects to /downloads
 *     (Server intentionally omits downloadToken from response for security.
 *      Token is fetched via authenticated getMyOrders on the Downloads page.)
 *
 * Security: The PayPal client ID is fetched from the server via tRPC so no
 * sensitive credentials are ever bundled into the client build.
 */
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";

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
  // Default: redirect to /downloads so the user can fetch their token via getMyOrders.
  // Server does not return the token in the capture response (security measure C4).
  const handleSuccess = onSuccess ?? ((_token: string) => { window.location.href = "/downloads"; });
  const { user } = useAuth();
  const containerRef = useRef<HTMLDivElement>(null);
  const [sdkReady, setSdkReady] = useState(false);
  const [rendered, setRendered] = useState(false);
  const [creditSaving, setCreditSaving] = useState(0);

  // Fetch PayPal client ID from server — never from a VITE_ env var
  const { data: paypalConfig } = trpc.paypal.config.useQuery();

  // Load PayPal JS SDK once we have the client ID from the server
  useEffect(() => {
    const clientId = paypalConfig?.clientId;
    if (!clientId) return;
    if (window.paypal) { setSdkReady(true); return; }

    const script = document.createElement("script");
    script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=USD&intent=capture`;
    script.async = true;
    script.onload = () => setSdkReady(true);
    script.onerror = () => onError?.("Failed to load PayPal.");
    document.body.appendChild(script);
    return () => { /* leave script in DOM for reuse */ };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paypalConfig?.clientId]);

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
          body: JSON.stringify({ productSlug, userId: user?.id, useCredit: true }),
        });
        const data = await res.json() as { orderId?: string; creditApplied?: number; error?: string };
        if (!data.orderId) throw new Error(data.error ?? "Failed to create order");
        if (data.creditApplied && data.creditApplied > 0) setCreditSaving(data.creditApplied);
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
        if (result.status === "COMPLETED") {
          // Token is not returned in the response (server security design C4).
          // Parent should redirect to /downloads to fetch the token via getMyOrders.
          handleSuccess(result.downloadToken ?? "", result.productTitle ?? productSlug);
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
      {creditSaving > 0 && (
        <p className="text-xs text-emerald-400 mb-2 text-center">
          🎉 ${(creditSaving / 100).toFixed(2)} referral credit applied!
        </p>
      )}
      {!sdkReady && (
        <div className="h-11 rounded bg-muted animate-pulse flex items-center justify-center text-sm text-muted-foreground">
          Loading PayPal…
        </div>
      )}
      <div ref={containerRef} className={sdkReady ? "block" : "hidden"} />
    </div>
  );
}
