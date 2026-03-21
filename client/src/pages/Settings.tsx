import Nav from "@/components/Nav";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/_core/hooks/useAuth";
import { Link } from "wouter";
import { getLoginUrl } from "@/const";
import { Settings2, Shield, Bell, User, Sparkles, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function Settings() {
  const { isAuthenticated, user } = useAuth();
  const [oracleConsent, setOracleConsent] = useState(
    () => localStorage.getItem("oracle_consent") === "true"
  );
  const [lowBandwidth, setLowBandwidth] = useState(
    () => localStorage.getItem("lifeos_low_bandwidth") === "true"
  );
  const [showProfile, setShowProfile] = useState(
    () => localStorage.getItem("lifeos_show_profile") !== "false"
  );

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Nav />
        <div className="container pt-24 pb-6 max-w-2xl mx-auto flex flex-col flex-1 items-center justify-center text-center py-16">
          <Settings2 className="h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="font-serif text-2xl font-light text-foreground mb-3">Settings</h2>
          <p className="text-muted-foreground text-sm mb-8">Sign in to manage your preferences.</p>
          <Button asChild><a href={getLoginUrl()}>Sign In</a></Button>
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

  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <div className="container pt-24 pb-16 max-w-2xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-2">Preferences</p>
          <h1 className="font-serif text-3xl font-light text-foreground">Settings</h1>
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
          </div>
        </div>

        {/* Oracle Preferences */}
        <div className="rounded-xl border border-border bg-card p-6 mb-5">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="h-4 w-4 text-accent" />
            <h2 className="font-medium text-sm text-foreground">Oracle Preferences</h2>
          </div>
          <p className="text-xs text-muted-foreground mb-4">Control how the Oracle uses your data to personalize guidance.</p>

          <div className="flex items-start justify-between gap-4 py-4 border-b border-border/50">
            <div>
              <p className="text-sm font-medium text-foreground mb-0.5">Personalized guidance</p>
              <p className="text-xs text-muted-foreground font-light leading-relaxed max-w-sm">
                Allow the Oracle to draw on your journal entries, emotional check-ins, and habit history to provide more relevant responses.
              </p>
            </div>
            <button
              onClick={() => handleOracleConsent(!oracleConsent)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0 mt-0.5 ${oracleConsent ? "bg-accent" : "bg-muted"}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${oracleConsent ? "translate-x-6" : "translate-x-1"}`} />
            </button>
          </div>

          <div className="flex items-start justify-between gap-4 py-4">
            <div>
              <p className="text-sm font-medium text-foreground mb-0.5">Pattern Mirror</p>
              <p className="text-xs text-muted-foreground font-light leading-relaxed max-w-sm">
                Allow the Oracle to surface recurring themes and patterns it notices across your entries.
              </p>
            </div>
            <button
              onClick={() => handleOracleConsent(!oracleConsent)}
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

          <div className="flex items-start justify-between gap-4 py-4 border-b border-border/50">
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

          <div className="flex items-start justify-between gap-4 py-4">
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
            Notification preferences will be available in a future update. For now, LifeOS communicates through your dashboard.
          </p>
        </div>

      </div>
    </div>
  );
}
