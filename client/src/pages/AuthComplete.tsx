/**
 * AuthComplete — client-side fallback for /api/auth/complete
 *
 * The primary handler is the Express GET /api/auth/complete route in
 * server/_core/oauth.ts. That route exchanges the one-time code for a
 * session JWT and sets the cookie, then redirects to the return path.
 *
 * This React component is a safety-net for cases where the reverse proxy
 * or CDN serves index.html instead of forwarding the request to Express
 * (e.g. when the platform routes all non-asset requests through the SPA).
 *
 * Flow:
 *  1. Read ?code= from the URL
 *  2. POST to /api/auth/exchange with the code
 *  3. On success: redirect to the return path (from server response)
 *  4. On error: redirect to /?login_error=...
 */
import { useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";

export default function AuthComplete() {
  const attempted = useRef(false);

  useEffect(() => {
    if (attempted.current) return;
    attempted.current = true;

    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");

    if (!code) {
      window.location.replace("/?login_error=missing_code");
      return;
    }

    // Call the server-side exchange endpoint directly.
    // The server will set the session cookie and return the redirect path.
    fetch("/api/auth/exchange", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ code }),
    })
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          const errCode = data?.error ?? "exchange_failed";
          window.location.replace(`/?login_error=${encodeURIComponent(errCode)}`);
          return;
        }
        const data = await res.json();
        const returnPath = data?.returnPath ?? "/";
        // Ensure we only redirect to relative paths (security)
        const safePath =
          returnPath.startsWith("/") && !returnPath.startsWith("//")
            ? returnPath
            : "/";
        window.location.replace(safePath);
      })
      .catch(() => {
        window.location.replace("/?login_error=network_error");
      });
  }, []);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mx-auto mb-4" />
        <p className="font-serif text-lg font-light text-foreground">
          Completing sign in…
        </p>
      </div>
    </div>
  );
}
