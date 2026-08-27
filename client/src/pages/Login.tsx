import { useEffect, useMemo } from "react";
import { useLocation } from "wouter";
import { getLoginUrl } from "@/const";

const PRICING_TIERS = new Set(["seeker", "oracle"]);

export function resolveReturnPath(search = window.location.search) {
  const params = new URLSearchParams(search);
  const requestedReturn = params.get("returnTo");
  const baseReturnPath = requestedReturn?.startsWith("/") ? requestedReturn : "/dashboard";
  const tier = params.get("tier");

  // Marketing links use /signup?returnTo=/pricing&tier=seeker. Keep that
  // selection through OAuth while refusing arbitrary query-string injection.
  if (baseReturnPath === "/pricing" && tier && PRICING_TIERS.has(tier)) {
    return `/pricing?tier=${tier}`;
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
    // Sign-in is an operational recovery path. It should retain its immediate
    // redirect, whereas /signup presents Lifewoven consent before handoff.
    if (!isSignup) {
      window.location.replace(getLoginUrl(returnPath, "signIn"));
    }
  }, [isSignup, returnPath]);

  const continueToSignup = () => {
    window.location.assign(getLoginUrl(returnPath, "signUp"));
  };

  if (isSignup) {
    return (
      <main className="min-h-screen bg-background text-foreground grid place-items-center px-6 py-10">
        <section className="w-full max-w-md rounded-2xl border border-border/70 bg-card/80 p-8 text-center shadow-2xl">
          <img
            src="/manus-storage/lifewoven-original-mark_811eea16.png"
            alt="Lifewoven"
            className="mx-auto mb-5 h-14 w-14 rounded-2xl object-cover"
          />
          <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.26em] text-primary">Welcome to Lifewoven</p>
          <h1 className="font-serif text-3xl font-medium tracking-tight">Create your account</h1>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            Begin with a private, grounded space to understand what is carrying you and choose your next honest step.
          </p>
          <p className="mt-6 text-xs leading-relaxed text-muted-foreground">
            By continuing, you agree to Lifewoven&apos;s{" "}
            <a className="text-foreground underline underline-offset-4 hover:text-primary" href="/legal/terms">Terms of Service</a>{" "}
            and acknowledge its{" "}
            <a className="text-foreground underline underline-offset-4 hover:text-primary" href="/legal/privacy">Privacy Policy</a>.
          </p>
          <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
            Lifewoven&apos;s optional AI-guidance features are provided through Manus services and are explained in the Privacy Policy.
          </p>
          <button
            type="button"
            onClick={continueToSignup}
            className="mt-7 w-full rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Continue to account creation
          </button>
          <a href="/signin" className="mt-4 inline-block text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground">
            Already have an account? Sign in
          </a>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground grid place-items-center px-6">
      <p className="text-sm text-muted-foreground">Taking you securely to Lifewoven…</p>
    </main>
  );
}
