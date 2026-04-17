import Nav from "@/components/Nav";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Download, ShoppingBag, RefreshCw, Clock, CheckCircle2, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { toast } from "sonner";
import PageSkeleton from "@/components/PageSkeleton";

// Product title map (slug → display title)
const PRODUCT_TITLES: Record<string, string> = {
  "alignment-fundamentals": "Alignment Fundamentals",
  "the-alignment-current": "The Alignment Current",
  "identity-in-motion": "Identity in Motion",
  "the-meaning-foundation": "The Meaning Foundation",
  "belief-rewrite-workbook": "Belief Rewrite Workbook",
  "identity-stack-workbook": "The Identity Stack Workbook",
  "morning-alignment-audio": "Morning Alignment Series",
  "reset-protocol-audio": "Reset Audio",
  "wisdom-card-deck": "Wisdom Card Deck",
};

const PRODUCT_ICONS: Record<string, string> = {
  "alignment-fundamentals": "📐",
  "the-alignment-current": "🌀",
  "identity-in-motion": "⚛️",
  "the-meaning-foundation": "🔍",
  "belief-rewrite-workbook": "✍️",
  "identity-stack-workbook": "🧱",
  "morning-alignment-audio": "🎧",
  "reset-protocol-audio": "🔄",
  "wisdom-card-deck": "🃏",
};

export default function Downloads() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { data: orders, isLoading: ordersLoading, refetch } = trpc.stripe.getMyOrders.useQuery(undefined, {
    enabled: !!user,
  });

  const reissue = trpc.stripe.reissueDownload.useMutation({
    onSuccess: (data: { token: string }) => {
      refetch();
      toast.success("New download link generated", {
        description: "Your fresh download link is active for 72 hours.",
        duration: 6000,
      });
      window.open(`/api/download/${data.token}`, "_blank");
    },
    onError: () => {
      toast.error("Could not re-issue link", { description: "Please contact support if this persists." });
    },
  });

  if (authLoading || (isAuthenticated && ordersLoading)) return <PageSkeleton />;

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Nav />
        <div className="container pt-32 pb-24 max-w-xl mx-auto px-4 text-center">
          <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-6 opacity-40" />
          <h1 className="font-serif text-3xl font-light text-foreground mb-4">My Downloads</h1>
          <p className="text-muted-foreground mb-8">Sign in to view your purchased products and download links.</p>
          <Button onClick={() => { window.location.href = getLoginUrl(); }}>Sign In</Button>
        </div>
      </div>
    );
  }

  const completedOrders = orders?.filter(o => o.status === "completed") ?? [];

  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <div className="container pt-20 pb-24 max-w-3xl mx-auto px-4 sm:px-6">
        <div className="mb-10">
          <p className="text-xs font-mono tracking-widest text-muted-foreground uppercase mb-3">Account</p>
          <h1 className="font-serif text-3xl sm:text-4xl font-light text-foreground mb-2">My Downloads</h1>
          <p className="text-muted-foreground text-base font-light">
            Your purchased products. Download links are valid for 72 hours — use the re-send button to generate a fresh link anytime.
          </p>
        </div>

        {completedOrders.length === 0 ? (
          <div className="p-10 rounded-2xl border border-border bg-card text-center">
            <ShoppingBag className="h-10 w-10 text-muted-foreground mx-auto mb-4 opacity-30" />
            <p className="text-muted-foreground text-base mb-6">You haven't purchased anything yet.</p>
            <Link href="/store">
              <Button variant="outline" className="gap-2">
                <ShoppingBag className="h-4 w-4" /> Browse the Store
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {completedOrders.map(order => {
              const title = PRODUCT_TITLES[order.productSlug ?? ""] ?? order.productSlug ?? "Product";
              const icon = PRODUCT_ICONS[order.productSlug ?? ""] ?? "📄";
              const token = order.downloadToken;
              const expiresAt = order.downloadExpiresAt ? new Date(order.downloadExpiresAt) : null;
              const isExpired = expiresAt ? expiresAt < new Date() : true;
              const purchasedAt = order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "—";

              return (
                <div key={order.id} className="p-5 sm:p-6 rounded-2xl border border-border bg-card flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="text-3xl shrink-0">{icon}</div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-serif text-lg font-light text-foreground mb-0.5">{title}</h3>
                    <p className="text-sm text-muted-foreground">Purchased {purchasedAt}</p>
                    {!isExpired && expiresAt && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                        <Clock className="h-3 w-3" />
                        Link expires {expiresAt.toLocaleString()}
                      </p>
                    )}
                    {isExpired && (
                      <p className="text-xs text-amber-500 flex items-center gap-1 mt-1">
                        <Clock className="h-3 w-3" />
                        Download link expired — generate a new one below
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2 shrink-0 flex-wrap">
                    {token && !isExpired ? (
                      <a href={`/api/download/${token}`} target="_blank" rel="noopener noreferrer">
                        <Button size="sm" className="gap-2">
                          <Download className="h-3.5 w-3.5" /> Download
                        </Button>
                      </a>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-2"
                        onClick={() => reissue.mutate({ productSlug: order.productSlug ?? "" })}
                        disabled={reissue.isPending}
                      >
                        {reissue.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
                        {isExpired ? "Re-send Link" : "Download"}
                      </Button>
                    )}
                    <Link href={`/product/${order.productSlug}`}>
                      <Button size="sm" variant="ghost" className="gap-2 text-muted-foreground">
                        View Product
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-10 p-5 rounded-2xl border border-border bg-card/50 flex items-start gap-3">
          <CheckCircle2 className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
          <p className="text-sm text-muted-foreground font-light">
            Download links expire after 72 hours as a security measure. You can generate a fresh link at any time — there is no limit on re-downloads for products you own. If you experience any issues, contact us at <a href="mailto:hello@lifewoven.com" className="underline underline-offset-2">hello@lifewoven.com</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
