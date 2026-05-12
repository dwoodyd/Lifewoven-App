import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Sparkles, ShieldCheck, Clock, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import Nav from "@/components/Nav";

export default function BetaAccess() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      // After signing out, redirect to OAuth login and come back to this page
      // with the code pre-filled so the correct account can redeem it.
      window.location.href = getLoginUrl(currentReturnPath());
    },
  });

  // Auto-fill code from ?ref= or ?code= query param
  const initialCode = typeof window !== "undefined"
    ? new URLSearchParams(window.location.search).get("ref") ||
      new URLSearchParams(window.location.search).get("code") || ""
    : "";
  const [code, setCode] = useState(initialCode);
  const [success, setSuccess] = useState<{ expiresAt: Date; durationDays: number } | null>(null);

  // Build the return path so after OAuth the user lands back here with the code
  function currentReturnPath(): string {
    const params = new URLSearchParams();
    if (code.trim()) params.set("ref", code.trim());
    return `/beta${params.toString() ? `?${params.toString()}` : ""}`;
  }

  const redeemMutation = trpc.beta.redeemCode.useMutation({
    onSuccess: (data) => {
      setSuccess({ expiresAt: new Date(data.expiresAt), durationDays: data.durationDays });
      toast.success("Beta access activated!");
    },
    onError: (err) => toast.error(err.message),
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim()) return;
    redeemMutation.mutate({ code: code.trim() });
  }

  // Detect the "wrong account" scenario: a code is present in the URL AND
  // someone is already signed in. Warn them so they don't accidentally redeem
  // the code against the wrong (e.g. admin) account.
  const codeInUrl = typeof window !== "undefined"
    ? new URLSearchParams(window.location.search).get("ref") ||
      new URLSearchParams(window.location.search).get("code")
    : null;
  const wrongAccountWarning = !!user && !!codeInUrl;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Nav />
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] px-4 py-16">
        <div className="w-full max-w-md">

          {/* Card */}
          <div className="rounded-2xl overflow-hidden shadow-2xl"
            style={{ background: "linear-gradient(135deg, #0d0d1a 0%, #1a1025 60%, #0d1a0d 100%)", border: "1px solid rgba(201,168,76,0.2)" }}>

            {/* Glow */}
            <div className="h-1 w-full" style={{ background: "linear-gradient(90deg, transparent, #c9a84c, transparent)" }} />

            <div className="p-8">
              {/* Icon */}
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full mb-6"
                style={{ background: "rgba(201,168,76,0.12)", border: "1px solid rgba(201,168,76,0.25)" }}>
                <ShieldCheck className="w-7 h-7 text-amber-400" />
              </div>

              {success ? (
                /* ─── Success state ─── */
                <div className="text-center">
                  <div className="text-4xl mb-4">✨</div>
                  <h1 className="text-2xl font-serif text-white mb-3">You're In</h1>
                  <p className="text-stone-300 text-sm mb-2">
                    Your <strong className="text-amber-400">{success.durationDays}-day</strong> beta access is now active.
                  </p>
                  <p className="text-stone-400 text-xs mb-8">
                    Expires {success.expiresAt.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                  </p>
                  <Button
                    className="w-full h-11 font-semibold rounded-xl"
                    style={{ background: "linear-gradient(135deg, #c9a84c, #e8c96a)", color: "#0d0d1a" }}
                    onClick={() => navigate("/dashboard")}
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Begin Your Practice
                  </Button>
                </div>
              ) : !user ? (
                /* ─── Not signed in ─── */
                <div>
                  <h1 className="text-2xl font-serif text-white mb-3">Beta Access</h1>
                  <p className="text-stone-300 text-sm mb-6">
                    Sign in first, then return here to enter your beta code.
                  </p>
                  <Button
                    className="w-full h-11 font-semibold rounded-xl"
                    style={{ background: "linear-gradient(135deg, #c9a84c, #e8c96a)", color: "#0d0d1a" }}
                    onClick={() => { window.location.href = getLoginUrl(currentReturnPath()); }}
                  >
                    Sign In to Continue
                  </Button>
                </div>
              ) : (
                /* ─── Code entry ─── */
                <div>
                  <h1 className="text-2xl font-serif text-white mb-2">Enter Your Beta Code</h1>
                  <p className="text-stone-400 text-sm mb-5">
                    You received this code from the Lifewoven team. It unlocks all features for 45 days.
                  </p>

                  {/* ── Wrong-account warning ── */}
                  {wrongAccountWarning && (
                    <div className="mb-5 p-4 rounded-xl border border-amber-500/40 bg-amber-500/10">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-semibold text-amber-300 mb-1">
                            Signed in as {user.name || user.email || "your account"}
                          </p>
                          <p className="text-xs text-amber-200/80 mb-3">
                            If this code was sent to a <strong>different email address</strong>, sign out first so the correct account receives the access.
                          </p>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 text-xs border-amber-500/50 text-amber-300 hover:bg-amber-500/15 bg-transparent"
                            disabled={logoutMutation.isPending}
                            onClick={() => logoutMutation.mutate()}
                          >
                            {logoutMutation.isPending ? "Signing out…" : "Sign Out & Use a Different Account"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                      value={code}
                      onChange={(e) => setCode(e.target.value.toUpperCase())}
                      placeholder="LW-XXXX-XXXX"
                      className="h-12 text-center text-lg tracking-widest font-mono bg-white/5 border-white/20 text-white placeholder:text-stone-600"
                      autoFocus
                    />
                    <Button
                      type="submit"
                      disabled={!code.trim() || redeemMutation.isPending}
                      className="w-full h-12 text-base font-semibold rounded-xl"
                      style={{ background: "linear-gradient(135deg, #c9a84c, #e8c96a)", color: "#0d0d1a" }}
                    >
                      {redeemMutation.isPending ? "Activating…" : "Activate Beta Access"}
                    </Button>
                  </form>

                  {/* What's included */}
                  <div className="mt-8 space-y-2">
                    {[
                      "All 7 guided Pathways",
                      "AI Oracle — unlimited sessions",
                      "Full course & resource library",
                      "The Weave with voice input",
                      "Daily habits & check-ins",
                    ].map((item) => (
                      <div key={item} className="flex items-center gap-2 text-xs text-stone-400">
                        <Clock className="w-3 h-3 text-amber-500 shrink-0" />
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
