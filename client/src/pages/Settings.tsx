import Nav from "@/components/Nav";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/_core/hooks/useAuth";
import { Link } from "wouter";
import { getLoginUrl } from "@/const";
import { Settings2, Shield, Bell, User, Sparkles, Eye, CreditCard, ExternalLink, Moon, Sun, RefreshCw } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { Badge } from "@/components/ui/badge";
import { LUMIN_VIDEOS } from "@/data/lumin";

const TIER_LABELS: Record<string, { label: string; color: string; desc: string }> = {
  explorer: { label: "Explorer", color: "bg-secondary text-foreground", desc: "Free tier — core tools included." },
  seeker:   { label: "Seeker",   color: "bg-accent/20 text-accent",     desc: "Full access — every tool unlocked." },
  oracle:   { label: "Oracle",   color: "bg-primary/20 text-primary",   desc: "Lumin and the Oracle work continuously on your behalf." },
};

// ── Post-upgrade Oracle animation overlay ─────────────────────────────────────
function OracleUpgradeAnimation({ onDone }: { onDone: () => void }) {
  const bouncingUrl = LUMIN_VIDEOS.find(v => v.id === "bouncing_joyfully")?.url ?? "";
  const coreUrl     = LUMIN_VIDEOS.find(v => v.id === "core_unfurls")?.url ?? "";
  const [phase, setPhase] = useState<"celebrate" | "settle">("celebrate");

  useEffect(() => {
    // After 3.2s switch to settle, then fade out after another 1.5s
    const t1 = setTimeout(() => setPhase("settle"), 3200);
    const t2 = setTimeout(() => onDone(), 4800);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [onDone]);

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        background: "rgba(10,9,8,0.88)",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        animation: phase === "settle" ? "fadeOut 1.5s ease forwards" : undefined,
      }}
    >
      <style>{`@keyframes fadeOut { to { opacity: 0; pointer-events: none; } }`}</style>

      {/* Lumin — celebrating then settling */}
      <div style={{ width: "min(52vw, 380px)", marginBottom: "1.5rem" }}>
        <video
          key={phase}
          src={phase === "celebrate" ? bouncingUrl : coreUrl}
          autoPlay muted playsInline loop={phase === "settle"}
          style={{ width: "100%", mixBlendMode: "screen" }}
        />
      </div>

      <p style={{
        fontFamily: "Georgia, serif",
        fontSize: "clamp(1.5rem, 3.5vw, 2.2rem)",
        fontWeight: 400,
        color: "#f5f0e8",
        textAlign: "center",
        marginBottom: "0.5rem",
        lineHeight: 1.3,
      }}>
        The weave is open.
      </p>
      <p style={{
        color: "rgba(216,184,120,0.75)",
        fontSize: "0.9rem",
        fontStyle: "italic",
        textAlign: "center",
      }}>
        Lumin and the Oracle are with you now.
      </p>
    </div>
  );
}

// ── Billing section ────────────────────────────────────────────────────────────
function BillingSection() {
  const [sub, setSub] = useState<{
    tier: string;
    subscriptionId: string | null;
    status: string;
    nextBillingDate?: string | null;
    foundingMember?: boolean;
    betaEndDate?: string | null;
    billingStatus?: string | null;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) { setIsLoading(false); return; }
    fetch("/api/paypal/subscription/status", { credentials: "include" })
      .then(r => r.json())
      .then(d => setSub(d))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [user]);

  async function handleUpgrade(plan: string) {
    const origin = window.location.origin;
    try {
      const res = await fetch("/api/paypal/subscription/create", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, returnUrl: `${origin}/subscription/success?plan=${plan}`, cancelUrl: `${origin}/settings?tab=billing` }),
      });
      const data = await res.json() as { approvalUrl?: string; error?: string };
      if (data.approvalUrl) { toast.info("Redirecting to PayPal…"); window.open(data.approvalUrl, "_blank"); }
      else toast.error(data.error ?? "Could not start checkout.");
    } catch { toast.error("Checkout failed. Please try again."); }
  }

  async function handleCancel() {
    if (!confirm("Cancel your subscription? You will revert to the Explorer plan immediately.")) return;
    setCancelling(true);
    try {
      const res = await fetch("/api/paypal/subscription/cancel", { method: "POST", credentials: "include" });
      const data = await res.json() as { ok?: boolean; error?: string };
      if (data.ok) { toast.success("Subscription cancelled."); setSub(s => s ? { ...s, tier: "explorer", subscriptionId: null, status: "CANCELLED" } : s); }
      else toast.error(data.error ?? "Cancellation failed.");
    } catch { toast.error("Cancellation failed."); }
    finally { setCancelling(false); }
  }

  const tier = sub?.tier ?? "explorer";
  const tierInfo = TIER_LABELS[tier] ?? TIER_LABELS.explorer;
  const isBetaMember = sub?.foundingMember && sub?.billingStatus === "beta";
  const betaEndDate = sub?.betaEndDate;

  return (
    <div className="rounded-xl border border-border bg-card p-6 mb-5">
      <div className="flex items-center gap-2 mb-4">
        <CreditCard className="h-4 w-4 text-muted-foreground" />
        <h2 className="font-medium text-sm text-foreground">Subscription & Billing</h2>
      </div>

      {isLoading ? (
        <div className="h-10 bg-secondary animate-pulse rounded-lg" />
      ) : isBetaMember ? (
        // ── State 1: Founding member in 90-day beta (no subscription yet) ──
        <div className="space-y-4">
          <div className="flex items-center justify-between py-2 border-b border-border/50">
            <div>
              <p className="text-sm text-foreground font-medium">Founding Member — Beta Access</p>
              <p className="text-xs text-muted-foreground">Full Oracle Library included during your 90-day founding period.</p>
              {betaEndDate && (
                <p className="text-xs text-amber-400/80 mt-0.5">
                  Beta ends {new Date(betaEndDate).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })} — choose your plan before then to keep your founding rate.
                </p>
              )}
            </div>
            <Badge className="text-xs font-medium bg-amber-500/15 text-amber-300 border-amber-400/30">Founding</Badge>
          </div>
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground font-medium">Lock in your founding rate — available only to this cohort:</p>
            <div className="flex gap-2 flex-wrap">
              <Button size="sm" className="gap-1.5 bg-amber-600 hover:bg-amber-700 text-white border-0" onClick={() => handleUpgrade("oracle-founding-monthly")}>
                Oracle — $25/mo (founding)
              </Button>
              <Button size="sm" variant="outline" className="gap-1.5 bg-transparent" onClick={() => handleUpgrade("oracle-founding-annual")}>
                Oracle Annual — $250/yr (founding)
              </Button>
              <Button size="sm" variant="outline" className="gap-1.5 bg-transparent" onClick={() => handleUpgrade("seeker-founding-monthly")}>
                Seeker — $12/mo (founding)
              </Button>
            </div>
          </div>
        </div>
      ) : (
        // ── State 2 & 3: Active subscriber or Explorer ──
        <div className="space-y-4">
          <div className="flex items-center justify-between py-2 border-b border-border/50">
            <div>
              <p className="text-sm text-foreground font-medium">Current plan</p>
              <p className="text-xs text-muted-foreground">{tierInfo.desc}</p>
              {sub?.nextBillingDate && (
                <p className="text-xs text-muted-foreground mt-0.5">Next billing: {new Date(sub.nextBillingDate).toLocaleDateString()}</p>
              )}
            </div>
            <Badge className={`text-xs font-medium ${tierInfo.color}`}>{tierInfo.label}</Badge>
          </div>

          {tier === "explorer" ? (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">Upgrade to unlock Oracle AI, weekly reflections, and the full Oracle suite.</p>
              <div className="flex gap-2 flex-wrap">
                <Button size="sm" className="gap-1.5" onClick={() => handleUpgrade("seeker")}>
                  Upgrade to Seeker — $19/mo
                </Button>
                <Button size="sm" variant="outline" className="gap-1.5 bg-transparent" onClick={() => handleUpgrade("oracle")}>
                  Oracle — $49/mo
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex gap-2 flex-wrap">
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5 bg-transparent"
                onClick={handleCancel}
                disabled={cancelling}
              >
                {cancelling ? "Cancelling…" : "Cancel subscription"}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main Settings page ─────────────────────────────────────────────────────────
export default function Settings() {
  const { isAuthenticated, user } = useAuth();
  const [oracleConsent, setOracleConsent] = useState(
    () => localStorage.getItem("oracle_consent") === "true"
  );
  const [lowBandwidth, setLowBandwidth] = useState(
    () => localStorage.getItem("lifeos_low_bandwidth") === "true"
  );
  const [showProfile, setShowProfile] = useState(() => localStorage.getItem("showProfile") !== "false");
  const [screenshotMode, setScreenshotMode] = useState(
    () => localStorage.getItem("lifeos_screenshot_mode") === "true"
  );
  const [luminEnabled, setLuminEnabled] = useState(() => {
    const stored = localStorage.getItem("lifeos_lumin_enabled");
    // Default to user's server preference if not yet stored locally
    return stored !== null ? stored !== "false" : true;
  });
  const setLuminEnabledMutation = trpc.profile.setLuminEnabled.useMutation();
  const { theme, toggleTheme } = useTheme();

  // ── Post-upgrade Oracle animation ──────────────────────────────────────────
  const [showUpgradeAnim, setShowUpgradeAnim] = useState(false);
  const animShownRef = useRef(false);

  useEffect(() => {
    if (animShownRef.current) return;
    const params = new URLSearchParams(window.location.search);
    const isSuccess = params.get("success") === "1";
    const plan = params.get("plan") ?? "";
    if (isSuccess && plan === "oracle") {
      animShownRef.current = true;
      setShowUpgradeAnim(true);
      // Clean URL so refreshing doesn't replay
      window.history.replaceState({}, "", "/settings?tab=billing");
    }
  }, []);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Nav />
        <div className="container pt-20 pb-6 max-w-2xl mx-auto flex flex-col flex-1 items-center justify-center text-center py-12 px-4 sm:px-6">
          <Settings2 className="h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="font-serif text-2xl font-light text-foreground mb-3">Settings</h2>
          <p className="text-muted-foreground text-sm mb-8">Sign in to manage your preferences.</p>
          <Button asChild><a href={getLoginUrl('/settings')}>Sign In</a></Button>
        </div>
      </div>
    );
  }

  const handleOracleConsent = (value: boolean) => {
    localStorage.setItem("oracle_consent", value ? "true" : "false");
    setOracleConsent(value);
    toast.success(value ? "Oracle personalization enabled." : "Oracle personalization disabled.");
  };

  const handleLowBandwidth = (value: boolean) => {
    localStorage.setItem("lifeos_low_bandwidth", value ? "true" : "false");
    setLowBandwidth(value);
    toast.success(value ? "Simplified view enabled." : "Full view restored.");
  };

  const handleShowProfile = (value: boolean) => {
    localStorage.setItem("lifeos_show_profile", value ? "true" : "false");
    setShowProfile(value);
    toast.success("Preference saved.");
  };

  const handleReplayOnboarding = () => {
    localStorage.removeItem("lifeos_onboarding_done");
    toast.success("Onboarding reset. Reload the page to replay the intro.");
    setTimeout(() => window.location.reload(), 800);
  };

  const handleLuminEnabled = (value: boolean) => {
    localStorage.setItem("lifeos_lumin_enabled", value ? "true" : "false");
    window.dispatchEvent(new StorageEvent("storage", { key: "lifeos_lumin_enabled", newValue: value ? "true" : "false" }));
    setLuminEnabled(value);
    setLuminEnabledMutation.mutate({ enabled: value });
    toast.success(value ? "Lumin restored." : "Lumin hidden across all pages.");
  };

  const handleScreenshotMode = (value: boolean) => {
    localStorage.setItem("lifeos_screenshot_mode", value ? "true" : "false");
    // Dispatch a storage event so LuminAmbient and LuminCorner can react immediately
    window.dispatchEvent(new StorageEvent("storage", { key: "lifeos_screenshot_mode", newValue: value ? "true" : "false" }));
    setScreenshotMode(value);
    toast.success(value ? "Screenshot mode on — Lumin hidden." : "Screenshot mode off — Lumin restored.");
  };

  return (
    <>
      {/* Post-upgrade Oracle animation overlay */}
      {showUpgradeAnim && (
        <OracleUpgradeAnimation onDone={() => setShowUpgradeAnim(false)} />
      )}

      <div className="min-h-screen bg-background">
        <Nav />
        <div className="container pt-20 pb-20 max-w-2xl mx-auto px-4 sm:px-6">

          {/* Header */}
          <div className="mb-8">
            <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-2">Preferences</p>
            <h1 className="font-serif text-2xl sm:text-3xl font-light text-foreground">Settings</h1>
          </div>

          {/* Account */}
          <div className="rounded-xl border border-border bg-card p-6 mb-5">
            <div className="flex items-center gap-2 mb-4">
              <User className="h-4 w-4 text-muted-foreground" />
              <h2 className="font-medium text-sm text-foreground">Account</h2>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-border/50">
                <div>
                  <p className="text-sm text-foreground">{user?.name || "Your Name"}</p>
                  <p className="text-xs text-muted-foreground">{user?.email || "your@email.com"}</p>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/profile">View Profile</Link>
                </Button>
              </div>

              {/* Replay onboarding */}
              <div className="flex items-start justify-between gap-3 py-3">
                <div>
                  <p className="text-sm font-medium text-foreground mb-0.5">Replay the intro</p>
                  <p className="text-xs text-muted-foreground font-light leading-relaxed max-w-sm">
                    Re-experience the Lifewoven introduction — Lumin's first appearance, the 5S Framework, and the Reset pathway.
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 bg-transparent flex-shrink-0"
                  onClick={handleReplayOnboarding}
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Replay
                </Button>
              </div>
            </div>
          </div>

          {/* Billing */}
          <BillingSection />

          {/* Oracle Preferences */}
          <div className="rounded-xl border border-border bg-card p-6 mb-5">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="h-4 w-4 text-accent" />
              <h2 className="font-medium text-sm text-foreground">Oracle Preferences</h2>
            </div>
            <p className="text-xs text-muted-foreground mb-4">Control how the Oracle uses your data to personalize guidance.</p>

            <div className="flex items-start justify-between gap-3 py-4 border-b border-border/50">
              <div>
                <p className="text-sm font-medium text-foreground mb-0.5">Personalized guidance</p>
                <p className="text-xs text-muted-foreground font-light leading-relaxed max-w-sm">
                  Allow the Oracle to draw on your journal entries, emotional check-ins, and habit history to provide more relevant responses.
                </p>
              </div>
              <button
                onClick={() => handleOracleConsent(!oracleConsent)}
                aria-label={oracleConsent ? "Disable Oracle personalization" : "Enable Oracle personalization"}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0 mt-0.5 ${oracleConsent ? "bg-accent" : "bg-muted"}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${oracleConsent ? "translate-x-6" : "translate-x-1"}`} />
              </button>
            </div>

            <div className="flex items-start justify-between gap-3 py-4">
              <div>
                <p className="text-sm font-medium text-foreground mb-0.5">Pattern Mirror</p>
                <p className="text-xs text-muted-foreground font-light leading-relaxed max-w-sm">
                  Allow the Oracle to surface recurring themes and patterns it notices across your entries.
                </p>
              </div>
              <button
                onClick={() => handleOracleConsent(!oracleConsent)}
                aria-label={oracleConsent ? "Disable Pattern Mirror" : "Enable Pattern Mirror"}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0 mt-0.5 ${oracleConsent ? "bg-accent" : "bg-muted"}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${oracleConsent ? "translate-x-6" : "translate-x-1"}`} />
              </button>
            </div>
          </div>

          {/* Display Preferences */}
          <div className="rounded-xl border border-border bg-card p-6 mb-5">
            <div className="flex items-center gap-2 mb-1">
              <Eye className="h-4 w-4 text-muted-foreground" />
              <h2 className="font-medium text-sm text-foreground">Display Preferences</h2>
            </div>
            <p className="text-xs text-muted-foreground mb-4">Adjust how the platform presents information to you.</p>

            <div className="flex items-start justify-between gap-3 py-4 border-b border-border/50">
              <div>
                <p className="text-sm font-medium text-foreground mb-0.5">Appearance</p>
                <p className="text-xs text-muted-foreground font-light leading-relaxed max-w-sm">
                  Switch between light and dark mode.
                </p>
              </div>
              <button
                onClick={toggleTheme}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-border text-xs text-muted-foreground hover:text-foreground hover:border-muted-foreground transition-colors flex-shrink-0"
              >
                {theme === "dark" ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
                {theme === "dark" ? "Light" : "Dark"}
              </button>
            </div>

            <div className="flex items-start justify-between gap-3 py-4 border-b border-border/50">
              <div>
                <p className="text-sm font-medium text-foreground mb-0.5">Simplified view</p>
                <p className="text-xs text-muted-foreground font-light leading-relaxed max-w-sm">
                  Reduce the dashboard to one next step at a time. Helpful on low-energy days or when you need less visual complexity.
                </p>
              </div>
              <button
                onClick={() => handleLowBandwidth(!lowBandwidth)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0 mt-0.5 ${lowBandwidth ? "bg-accent" : "bg-muted"}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${lowBandwidth ? "translate-x-6" : "translate-x-1"}`} />
              </button>
            </div>

            <div className="flex items-start justify-between gap-3 py-4 border-b border-border/50">
              <div>
                <p className="text-sm font-medium text-foreground mb-0.5">Show profile in navigation</p>
                <p className="text-xs text-muted-foreground font-light leading-relaxed max-w-sm">
                  Display your name and avatar in the navigation bar.
                </p>
              </div>
              <button
                onClick={() => handleShowProfile(!showProfile)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0 mt-0.5 ${showProfile ? "bg-accent" : "bg-muted"}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${showProfile ? "translate-x-6" : "translate-x-1"}`} />
              </button>
            </div>

            {/* Lumin Toggle */}
            <div className="flex items-start justify-between gap-3 py-4 border-b border-border/50">
              <div>
                <p className="text-sm font-medium text-foreground mb-0.5">Show Lumin</p>
                <p className="text-xs text-muted-foreground font-light leading-relaxed max-w-sm">
                  Show Lumin's ambient video presence across the app. Disable if you prefer a cleaner, distraction-free interface.
                </p>
              </div>
              <button
                onClick={() => handleLuminEnabled(!luminEnabled)}
                aria-label={luminEnabled ? "Hide Lumin" : "Show Lumin"}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0 mt-0.5 ${luminEnabled ? "bg-accent" : "bg-muted"}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${luminEnabled ? "translate-x-6" : "translate-x-1"}`} />
              </button>
            </div>

            {/* Screenshot Mode */}
            <div className="flex items-start justify-between gap-3 py-4">
              <div>
                <p className="text-sm font-medium text-foreground mb-0.5">Screenshot mode</p>
                <p className="text-xs text-muted-foreground font-light leading-relaxed max-w-sm">
                  Hide Lumin's video backgrounds across all pages so you can take clean UI screenshots for marketing or sharing.
                </p>
              </div>
              <button
                onClick={() => handleScreenshotMode(!screenshotMode)}
                aria-label={screenshotMode ? "Disable screenshot mode" : "Enable screenshot mode"}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0 mt-0.5 ${screenshotMode ? "bg-accent" : "bg-muted"}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${screenshotMode ? "translate-x-6" : "translate-x-1"}`} />
              </button>
            </div>
          </div>

          {/* Privacy */}
          <div className="rounded-xl border border-border bg-card p-6 mb-5">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="h-4 w-4 text-muted-foreground" />
              <h2 className="font-medium text-sm text-foreground">Privacy & Legal</h2>
            </div>
            <div className="space-y-2">
              <Link href="/legal/privacy" className="block text-sm text-accent hover:underline py-1">Privacy Policy</Link>
              <Link href="/legal/terms" className="block text-sm text-accent hover:underline py-1">Terms of Service</Link>
              <Link href="/legal/refunds" className="block text-sm text-accent hover:underline py-1">Refund Policy</Link>
              <Link href="/support" className="block text-sm text-accent hover:underline py-1">Contact Support</Link>
            </div>
          </div>

          {/* Notifications placeholder */}
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <Bell className="h-4 w-4 text-muted-foreground" />
              <h2 className="font-medium text-sm text-foreground">Notifications</h2>
            </div>
            <p className="text-sm text-muted-foreground font-light">
              Notification preferences will be available in a future update. For now, Lifewoven communicates through your dashboard.
            </p>
          </div>

        </div>
      </div>
    </>
  );
}
