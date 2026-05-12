/**
 * /invite/:code — Founding Member Invite Redemption Page
 * Validates the code, prompts login if needed, then redeems the code.
 */
import { useEffect, useState } from "react";
import { useParams, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, XCircle, Lock } from "lucide-react";
import { Link } from "wouter";

const TIER_COLORS: Record<string, string> = {
  oracle:   "#a78bfa",
  seeker:   "#c9a84c",
  explorer: "#60a5fa",
};

const TIER_LABELS: Record<string, string> = {
  oracle:   "Oracle",
  seeker:   "Seeker",
  explorer: "Explorer",
};

export default function InviteRedeem() {
  const { code } = useParams<{ code: string }>();
  const { user, loading: authLoading } = useAuth();
  const [, navigate] = useLocation();
  const [redeemed, setRedeemed] = useState(false);

  const { data: validation, isLoading: validating } = trpc.applications.validateCode.useQuery(
    { code: code?.toUpperCase() ?? "" },
    { enabled: !!code, retry: false }
  );

  const redeem = trpc.applications.redeemCode.useMutation({
    onSuccess: () => {
      setRedeemed(true);
      // Invalidate auth.me so founding member flags refresh
      utils.auth.me.invalidate();
    },
  });
  const utils = trpc.useUtils();

  // Auto-redeem once user is logged in and code is valid
  useEffect(() => {
    if (!authLoading && user && validation?.valid && !redeemed && !redeem.isPending && !redeem.isSuccess) {
      redeem.mutate({ code: code?.toUpperCase() ?? "" });
    }
  }, [authLoading, user, validation, redeemed]);

  const tier = validation?.valid ? (validation.tier as string) : null;
  const tierColor = tier ? TIER_COLORS[tier] : "#c9a84c";
  const tierLabel = tier ? TIER_LABELS[tier] : "";

  // ── Loading state ──────────────────────────────────────────────────────────
  if (validating || authLoading) {
    return (
      <div className="min-h-screen bg-[#0e0e0e] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-amber-400" />
      </div>
    );
  }

  // ── Invalid code ───────────────────────────────────────────────────────────
  if (!validation?.valid) {
    const reason = validation?.reason;
    const msg =
      reason === "already_redeemed" ? "This invite link has already been used." :
      reason === "expired"          ? "This invite link has expired." :
                                      "This invite link is invalid or doesn't exist.";
    return (
      <div className="min-h-screen bg-[#0e0e0e] flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center space-y-6">
          <XCircle className="h-14 w-14 text-red-400 mx-auto" />
          <h1 className="text-2xl font-serif text-[#f0ead8]">Link Not Valid</h1>
          <p className="text-[#b8b0a0] leading-relaxed">{msg}</p>
          <p className="text-sm text-[#555]">
            If you believe this is an error, reply to your approval email and I'll sort it out.
          </p>
          <Link href="/">
            <Button variant="outline" className="border-[#2a2a2a] text-[#b8b0a0] hover:bg-[#1a1a1a]">
              Return Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // ── Redeemed successfully ──────────────────────────────────────────────────
  if (redeemed || redeem.isSuccess) {
    return (
      <div className="min-h-screen bg-[#0e0e0e] flex items-center justify-center px-4">
        <div className="max-w-lg w-full text-center space-y-6">
          <CheckCircle2 className="h-14 w-14 mx-auto" style={{ color: tierColor }} />
          <p className="text-xs tracking-[4px] uppercase" style={{ color: tierColor }}>
            Founding Member · {tierLabel}
          </p>
          <h1 className="text-3xl font-serif text-[#f0ead8]">Welcome to the weave.</h1>
          <p className="text-[#b8b0a0] text-lg leading-relaxed">
            Your founding access is active. Your rate is locked for life.
            Lumin is ready when you are.
          </p>
          <Button
            className="h-12 px-8 text-base font-semibold"
            style={{ background: `linear-gradient(135deg, ${tierColor}, ${tierColor}cc)`, color: "#0d0d1a" }}
            onClick={() => navigate("/dashboard")}
          >
            Enter Lifewoven →
          </Button>
        </div>
      </div>
    );
  }

  // ── Redemption error ───────────────────────────────────────────────────────
  if (redeem.isError) {
    return (
      <div className="min-h-screen bg-[#0e0e0e] flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center space-y-6">
          <XCircle className="h-14 w-14 text-red-400 mx-auto" />
          <h1 className="text-2xl font-serif text-[#f0ead8]">Something went wrong</h1>
          <p className="text-[#b8b0a0] leading-relaxed">{redeem.error?.message}</p>
          <Button
            variant="outline"
            className="border-[#2a2a2a] text-[#b8b0a0] hover:bg-[#1a1a1a]"
            onClick={() => redeem.mutate({ code: code?.toUpperCase() ?? "" })}
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  // ── Not logged in — prompt login ───────────────────────────────────────────
  if (!user) {
    const loginUrl = getLoginUrl(`/invite/${code}`);
    return (
      <div className="min-h-screen bg-[#0e0e0e] flex items-center justify-center px-4">
        <div className="max-w-lg w-full">
          <div className="rounded-2xl border border-[#2a2a2a] bg-[#141414] p-10 text-center space-y-6"
               style={{ borderColor: `${tierColor}33` }}>
            <Lock className="h-10 w-10 mx-auto" style={{ color: tierColor }} />
            <p className="text-xs tracking-[4px] uppercase" style={{ color: tierColor }}>
              Founding Member · {tierLabel}
            </p>
            <h1 className="text-3xl font-serif text-[#f0ead8]">Your invite is ready.</h1>
            <p className="text-[#b8b0a0] leading-relaxed">
              Sign in to claim your founding access. Your rate will be locked the moment you do.
            </p>
            <a href={loginUrl}>
              <Button
                className="w-full h-12 text-base font-semibold"
                style={{ background: `linear-gradient(135deg, ${tierColor}, ${tierColor}cc)`, color: "#0d0d1a" }}
              >
                Sign In to Claim Access →
              </Button>
            </a>
            <p className="text-xs text-[#555]">
              New to Lifewoven? Signing in will create your account automatically.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ── Logged in, auto-redeeming ──────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#0e0e0e] flex items-center justify-center">
      <div className="text-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin mx-auto" style={{ color: tierColor }} />
        <p className="text-[#888]">Activating your founding access…</p>
      </div>
    </div>
  );
}
