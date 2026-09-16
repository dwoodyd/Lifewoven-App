import { useEffect, useMemo } from "react";
import { useLocation } from "wouter";
import { getLoginUrl } from "@/const";

const PRICING_TIERS = new Set(["seeker", "oracle"]);

export function resolveReturnPath(search = window.location.search) {
  const params = new URLSearchParams(search);
  const requestedReturn = params.get("returnTo");
  const baseReturnPath = requestedReturn?.startsWith("/") ? requestedReturn : "/dashboard";
  const tier = params.get("tier");

  // Only a selected paid tier is purchase intent. Pricing browsing itself
  // should enter the app, where a new member's beta and onboarding begin.
  const [returnPathOnly, returnQuery = ""] = baseReturnPath.split("?");
  const innerTier = new URLSearchParams(returnQuery).get("tier");
  const chosenTier = tier && PRICING_TIERS.has(tier)
    ? tier
    : innerTier && PRICING_TIERS.has(innerTier)
      ? innerTier
      : null;

  if (returnPathOnly === "/pricing") {
    return chosenTier ? `/pricing?tier=${chosenTier}` : "/dashboard";
  }

  return baseReturnPath;
}

/**
 * Stable public sign-in entry point for shared links and logged-out readers.
 * OAuth remains handled by the existing registered callback flow.
 */
export default function Login() {
  const [location] = useLocation();
  const pathname = location.split("?")[0];
  const isSignup = pathname === "/signup";
  const returnPath = useMemo(() => resolveReturnPath(), []);

  useEffect(() => {
    // Both entry intents hand off directly. Public CTAs keep the necessary legal
    // context adjacent to the action, avoiding a second decision screen before OAuth.
    window.location.replace(getLoginUrl(returnPath, isSignup ? "signUp" : "signIn"));
  }, [isSignup, returnPath]);

  return (
    <main className="min-h-screen bg-background text-foreground grid place-items-center px-6">
      <p className="text-sm text-muted-foreground">Taking you securely to Lifewoven…</p>
    </main>
  );
}
