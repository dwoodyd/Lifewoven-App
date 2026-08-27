import Nav from "@/components/Nav";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { Download, ShoppingBag, RefreshCw, Clock, CheckCircle2, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { toast } from "sonner";
import PageSkeleton from "@/components/PageSkeleton";
import { useState } from "react";
import { redeemAndOpenDownload } from "@/lib/secureDownload";

// Product title map (slug → display title)
const PRODUCT_TITLES: Record<string, string> = {
  "alignment-fundamentals": "Alignment Fundamentals",
  "the-alignment-current": "The Alignment Current",
  "identity-in-motion": "Identity in Motion",
  "the-meaning-foundation": "The Meaning Foundation",
  "belief-rewrite-workbook": "Belief Rewrite Workbook",
  "identity-stack-workbook": "The Identity Stack Workbook",
  "morning-alignment-audio": "Morning Alignment Series",
  "reset-audio": "The Reset Protocol",
  "wisdom-card-deck": "Wisdom Card Deck",
};

const PRODUCT_ICONS: Record<string, string> = {
  "alignment-fundamentals": "📐",
  "the-alignment-current": "🌀",
  "identity-in-motion": "⚛️",
  "the-meaning-foundation": "🔍",
  "belief-rewrite-workbook": "✍️",
  "identity-stack-workbook": "🧱",
  "morning-alignment-audio": "📝",
  "reset-audio": "🔄",
  "wisdom-card-deck": "🃏",
};

export default function Downloads() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [, navigate] = useLocation();
  const [activeDownloadSlug, setActiveDownloadSlug] = useState<string | null>(null);
  const [recoverySlug, setRecoverySlug] = useState<string | null>(null);
  const { data: orders, isLoading: ordersLoading, refetch } = trpc.paypalOrders.getMyOrders.useQuery(undefined, {
    enabled: !!user,
  });

  const reissue = trpc.paypalOrders.reissueDownload.useMutation();

  async function startSecureDownload(productSlug: string, token?: string | null, forceFresh = false) {
    setActiveDownloadSlug(productSlug);
    try {
      const activeToken = forceFresh || !token
        ? (await reissue.mutateAsync({ productSlug })).token
        : token;
      await redeemAndOpenDownload(activeToken);
      setRecoverySlug(null);
      await refetch();
    } catch (error) {
      setRecoverySlug(productSlug);
      toast.error("Your download could not be prepared", {
        description: error instanceof Error ? error.message : "Generate a fresh link and try again.",
      });
    } finally {
      setActiveDownloadSlug(null);
    }
  }

  if (authLoading || (isAuthenticated && ordersLoading)) return <PageSkeleton />;

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Nav />
        <div className="container pt-32 pb-24 max-w-xl mx-auto px-4 text-center">
          <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-6 opacity-40" />
          <h1 className="font-serif text-3xl font-light text-foreground mb-4">My Downloads</h1>
          <p className="text-muted-foreground mb-8">Sign in to view your purchased products and download links.</p>
          <Button onClick={() => { window.location.href = getLoginUrl(window.location.pathname + window.location.search); }}>Sign In</Button>
        </div>
      </div>
    );
  }

  const completedOrders = orders?.filter((o: { status: string }) => o.status === "completed") ?? [];

  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <div className="container pt-20 pb-24 max-w-3xl mx-auto px-4 sm:px-6">
        <div className="mb-10">
          <p className="text-xs font-mono tracking-widest text-muted-foreground uppercase mb-3">Account</p>
          <h1 className="font-serif text-3xl sm:text-4xl font-light text-foreground mb-2">My Downloads</h1>
          <p className="text-muted-foreground text-base font-light">
            Your Wisdom Tools. Included member access and purchases both receive secure download access for 72 hours.
          </p>
        </div>

        {completedOrders.length === 0 ? (
          <div className="p-10 rounded-2xl border border-border bg-card text-center">
            <ShoppingBag className="h-10 w-10 text-muted-foreground mx-auto mb-4 opacity-30" />
            <p className="text-muted-foreground text-base mb-6">You do not have any Wisdom Tools available yet.</p>
            <Link href="/store">
              <Button variant="outline" className="gap-2">
                <ShoppingBag className="h-4 w-4" /> Browse the Store
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {completedOrders.map((order: { id: number; productSlug: string | null; downloadToken: string | null; downloadExpiresAt: Date | null; createdAt: Date; accessSource?: "membership" | "purchase" }) => {
              const title = PRODUCT_TITLES[order.productSlug ?? ""] ?? order.productSlug ?? "Product";
              const icon = PRODUCT_ICONS[order.productSlug ?? ""] ?? "📄";
              const token = order.downloadToken;
              const expiresAt = order.downloadExpiresAt ? new Date(order.downloadExpiresAt) : null;
              const hasIssuedLink = Boolean(token && expiresAt);
              const isExpired = hasIssuedLink && expiresAt ? expiresAt < new Date() : false;
              const isIncluded = order.accessSource === "membership";
              const purchasedAt = order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "—";

              return (
                <div key={order.id} className="p-5 sm:p-6 rounded-2xl border border-border bg-card flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="text-3xl shrink-0">{icon}</div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-serif text-lg font-light text-foreground mb-0.5">{title}</h3>
                    <p className="text-sm text-muted-foreground">{isIncluded ? "Included with Oracle" : `Purchased ${purchasedAt}`}</p>
                    {!isExpired && expiresAt && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                        <Clock className="h-3 w-3" />
                        Download access expires {expiresAt.toLocaleString()}
                      </p>
                    )}
                    {!hasIssuedLink && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                        <Download className="h-3 w-3" /> Secure download link ready to generate
                      </p>
                    )}
                    {isExpired && (
                      <p className="text-xs text-amber-500 flex items-center gap-1 mt-1">
                        <Clock className="h-3 w-3" />
                        Download link expired — generate a new one below
                      </p>
                    )}
                    {recoverySlug === order.productSlug && (
                      <p role="alert" className="text-xs text-amber-500 mt-2">
                        The secure file link could not be prepared. Generate a fresh link below and try again.
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2 shrink-0 flex-wrap">
                    {token && !isExpired ? (
                      <Button
                        size="sm"
                        className="gap-2"
                        onClick={() => startSecureDownload(order.productSlug ?? "", token)}
                        disabled={activeDownloadSlug === order.productSlug}
                      >
                        {activeDownloadSlug === order.productSlug ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />} Download
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        type="button"
                        className="gap-2"
                        onClick={() => startSecureDownload(order.productSlug ?? "", null, true)}
                        disabled={activeDownloadSlug === order.productSlug}
                      >
                        {activeDownloadSlug === order.productSlug ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
                        {isExpired ? "Generate fresh link" : "Generate download link"}
                      </Button>
                    )}
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="gap-2 text-muted-foreground"
                      onClick={() => navigate(`/product/${order.productSlug}`)}
                    >
                      View Product
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-10 p-5 rounded-2xl border border-border bg-card/50 flex items-start gap-3">
          <CheckCircle2 className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
          <p className="text-sm text-muted-foreground font-light">
            Download access expires after 72 hours as a security measure. Each click prepares a fresh short-lived file link, and you can generate a fresh 72-hour access link at any time — there is no limit on re-downloads for products you own. If you experience any issues, contact us at <a href="mailto:hello@lifewoven.click" className="underline underline-offset-2">hello@lifewoven.click</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
