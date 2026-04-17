import { useState } from "react";
import Nav from "@/components/Nav";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Copy, Gift, Users, DollarSign } from "lucide-react";
import { getLoginUrl } from "@/const";

export default function Referrals() {
  const { user, isAuthenticated } = useAuth();
  const [applyCode, setApplyCode] = useState("");

  const { data: codeData } = trpc.referral.getMyCode.useQuery(undefined, { enabled: isAuthenticated });
  const { data: balanceData } = trpc.referral.getBalance.useQuery(undefined, { enabled: isAuthenticated });
  const { data: history } = trpc.referral.getHistory.useQuery(undefined, { enabled: isAuthenticated });

  const applyMutation = trpc.referral.applyCode.useMutation({
    onSuccess: (res) => {
      if (res.success) toast.success(res.message);
      else toast.error(res.message);
      setApplyCode("");
    },
  });

  const referralUrl = codeData ? `${window.location.origin}?ref=${codeData.code}` : "";
  const usedCount = history?.filter(r => r.usedAt).length ?? 0;
  const balanceDollars = ((balanceData?.balanceCents ?? 0) / 100).toFixed(2);

  const copyLink = () => {
    navigator.clipboard.writeText(referralUrl);
    toast.success("Referral link copied!");
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <Nav />
        <div className="container pt-32 pb-20 max-w-lg mx-auto px-4 text-center">
          <Gift className="h-12 w-12 text-accent mx-auto mb-4" />
          <h1 className="font-serif text-3xl font-light mb-4">Refer & Earn</h1>
          <p className="text-muted-foreground mb-6">Sign in to get your personal referral link and earn $10 store credit for every friend who makes a purchase.</p>
          <Button asChild><a href={getLoginUrl()}>Sign In</a></Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <div className="container pt-24 pb-20 max-w-2xl mx-auto px-4 sm:px-6">
        <div className="mb-8">
          <p className="text-xs font-mono tracking-widest text-muted-foreground uppercase mb-1">Grow Together</p>
          <h1 className="font-serif text-3xl sm:text-4xl font-light text-foreground">Refer &amp; Earn</h1>
          <p className="text-muted-foreground mt-2">Share Lifewoven with someone ready to do the work. You earn $10 store credit for every friend who purchases.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
          {[
            { icon: Users, label: "Friends Referred", value: usedCount },
            { icon: DollarSign, label: "Store Credit", value: `$${balanceDollars}` },
            { icon: Gift, label: "Per Referral", value: "$10" },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="p-4 rounded-xl border border-border bg-card text-center">
              <Icon className="h-5 w-5 text-accent mx-auto mb-2" />
              <p className="text-xl font-semibold text-foreground">{value}</p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>

        {/* Your referral link */}
        <div className="p-5 rounded-xl border border-accent/30 bg-accent/5 mb-6">
          <h2 className="font-serif text-lg font-light mb-3">Your Referral Link</h2>
          <div className="flex gap-2">
            <Input value={referralUrl} readOnly className="text-sm font-mono bg-background" />
            <Button onClick={copyLink} size="icon" variant="outline"><Copy className="h-4 w-4" /></Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">Code: <span className="font-mono font-semibold text-foreground">{codeData?.code}</span></p>
        </div>

        {/* Apply a code */}
        <div className="p-5 rounded-xl border border-border bg-card mb-6">
          <h2 className="font-serif text-lg font-light mb-3">Apply a Referral Code</h2>
          <p className="text-sm text-muted-foreground mb-3">Were you referred by a friend? Enter their code to credit them.</p>
          <div className="flex gap-2">
            <Input
              placeholder="Enter code (e.g. A1B2C3D4E5F6)"
              value={applyCode}
              onChange={e => setApplyCode(e.target.value.toUpperCase())}
              className="font-mono"
            />
            <Button
              onClick={() => applyMutation.mutate({ code: applyCode })}
              disabled={!applyCode || applyMutation.isPending}
            >
              Apply
            </Button>
          </div>
        </div>

        {/* History */}
        {history && history.length > 0 && (
          <div className="p-5 rounded-xl border border-border bg-card">
            <h2 className="font-serif text-lg font-light mb-3">Referral History</h2>
            <div className="space-y-2">
              {history.map(r => (
                <div key={r.id} className="flex items-center justify-between text-sm py-2 border-b border-border last:border-0">
                  <span className="font-mono text-muted-foreground">{r.code}</span>
                  <span className={r.usedAt ? "text-green-500" : "text-muted-foreground"}>
                    {r.usedAt ? `+$${(r.creditCents / 100).toFixed(2)} earned` : "Pending"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
