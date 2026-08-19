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
      utils.auth.me.invalidate();
    },
  });
  const utils = trpc.useUtils();

  useEffect(() => {
    if (!authLoading && user && validation?.valid && !redeemed && !redeem.isPending && !redeem.isSuccess) {
      redeem.mutate({ code: code?.toUpperCase() ?? "" });
    }
  }, [authLoading, user, validation, redeemed]);

  const tier = validation?.valid ? (validation.tier as string) : null;
  const tierLabel = tier ? ({ oracle: "Oracle", seeker: "Seeker", explorer: "Explorer" }[tier] ?? tier) : "";

  // ── Loading state ──────────────────────────────────────────────────────────
  if (validating || authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
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
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center space-y-6">
          <XCircle className="h-14 w-14 text-destructive mx-auto" />
          <h1 className="text-2xl font-serif text-foreground">Link Not Valid</h1>
          <p className="text-muted-foreground leading-relaxed">{msg}</p>
          <p className="text-sm text-muted-foreground/50">
            If you believe this is an error, reply to your approval email and I'll sort it out.
          </p>
          <Link href="/">
            <Button variant="outline">Return Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  // ── Redeemed successfully ──────────────────────────────────────────────────
  if (redeemed || redeem.isSuccess) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="max-w-lg w-full text-center space-y-6">
          <CheckCircle2 className="h-14 w-14 mx-auto text-accent" />
          <p className="text-xs tracking-[4px] uppercase text-accent">
            Founding Member · {tierLabel}
          </p>
          <h1 className="text-3xl font-serif text-foreground">Welcome to the weave.</h1>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Your founding access is active. Your rate is locked for life.
            Lumen is ready when you are.
          </p>
          <Button
            className="h-12 px-8 text-base font-semibold bg-accent text-accent-foreground hover:bg-accent/90"
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
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center space-y-6">
          <XCircle className="h-14 w-14 text-destructive mx-auto" />
          <h1 className="text-2xl font-serif text-foreground">Something went wrong</h1>
          <p className="text-muted-foreground leading-relaxed">{redeem.error?.message}</p>
          <Button
            variant="outline"
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
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="max-w-lg w-full">
          <div className="rounded-2xl border border-border bg-card p-10 text-center space-y-6">
            <Lock className="h-10 w-10 mx-auto text-accent" />
            <p className="text-xs tracking-[4px] uppercase text-accent">
              Founding Member · {tierLabel}
            </p>
            <h1 className="text-3xl font-serif text-foreground">Your invite is ready.</h1>
            <p className="text-muted-foreground leading-relaxed">
              Sign in to claim your founding access. Your rate will be locked the moment you do.
            </p>
            <a href={loginUrl}>
              <Button className="w-full h-12 text-base font-semibold bg-accent text-accent-foreground hover:bg-accent/90">
                Sign In to Claim Access →
              </Button>
            </a>
            <p className="text-xs text-muted-foreground/50">
              New to Lifewoven? Signing in will create your account automatically.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ── Logged in, auto-redeeming ──────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-accent" />
        <p className="text-muted-foreground">Activating your founding access…</p>
      </div>
    </div>
  );
}
