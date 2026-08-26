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
    const pathname = location.split("?")[0];
    const intent = pathname === "/signup" ? "signUp" : "signIn";
    window.location.replace(getLoginUrl(returnPath, intent));
  }, [location]);

  return (
    <main className="min-h-screen bg-background text-foreground grid place-items-center px-6">
      <p className="text-sm text-muted-foreground">Taking you securely to Lifewoven…</p>
    </main>
  );
}
