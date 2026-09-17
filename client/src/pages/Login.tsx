import { useEffect, useMemo } from "react";
import { useLocation } from "wouter";
import { getLoginUrl } from "@/const";

const PRICING_TIERS = new Set(["seeker", "oracle"]);

export function resolveReturnPath(search = window.location.search) {
  const params = new URLSearchParams(search);
  const requestedReturn = params.get("returnTo");
  const baseReturnPath = requestedReturn?.startsWith("/") ? requestedReturn : "/dashboard";
  const tier = params.get("tier");

  // A selected paid tier is purchase intent. An explicit pricing return stays
  // on pricing as well, while app-first entry points pass /dashboard directly.
  const [returnPathOnly, returnQuery = ""] = baseReturnPath.split("?");
  const innerTier = new URLSearchParams(returnQuery).get("tier");
  const chosenTier = tier && PRICING_TIERS.has(tier)
    ? tier
    : innerTier && PRICING_TIERS.has(innerTier)
      ? innerTier
      : null;
  const includesTierIntent = tier !== null || innerTier !== null;

  if (returnPathOnly === "/pricing") {
    return chosenTier
      ? `/pricing?tier=${chosenTier}`
      : includesTierIntent
        ? "/dashboard"
        : "/pricing";
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
