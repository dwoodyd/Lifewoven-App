import { useEffect } from "react";
import { useLocation } from "wouter";
import { getLoginUrl } from "@/const";

/**
 * Stable public sign-in entry point for shared links and logged-out readers.
 * OAuth remains handled by the existing registered callback flow.
 */
export default function Login() {
  const [location] = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.split("?")[1] || "");
    const requestedReturn = params.get("returnTo");
    const returnPath = requestedReturn?.startsWith("/") ? requestedReturn : "/dashboard";
    window.location.replace(getLoginUrl(returnPath));
  }, [location]);

  return (
    <main className="min-h-screen bg-background text-foreground grid place-items-center px-6">
      <p className="text-sm text-muted-foreground">Taking you securely to sign in…</p>
    </main>
  );
}
