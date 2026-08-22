import Nav from "@/components/Nav";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { ArrowLeft, Download, FileText, Star, CheckCircle2, Mail, Loader2, ShoppingCart, Shield } from "lucide-react";
import { useRoute } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { useAdminPreview } from "@/contexts/AdminPreviewContext";
import { getLoginUrl } from "@/const";
import { useState } from "react";
import { toast } from "sonner";
import { PayPalButton } from "@/components/PayPalButton";

// SECURITY: No raw CDN/S3 URLs for paid deliverables are stored in the client bundle.
// All paid file downloads are served exclusively through /api/download/:token.

const PREVIEWS: Record<string, { label: string; excerpts: string[] }> = {
  "wisdom-card-deck": {
    label: "Sample Cards",
    excerpts: [
      "Card 1 · Mind Science — The quality of your inner life is not a response to your circumstances. It is the architect of them. What you hold consistently in consciousness tends to become the material of your experience.",
      "Card 6 · Interior Alignment — The next better-feeling thought is always available. Not joy from despair — the next small, genuine movement upward. Relief before arrival. Ease before evidence.",
      "Card 11 · Meaning-Centered Philosophy — The person who has a why to live can bear almost any how. This is not a principle about the virtue of suffering. It is an observation about the human capacity to endure.",
    ],
  },
  "morning-alignment-audio": {
    label: "From Day 1: Foundation",
    excerpts: [
      "Welcome to your Monday morning practice. This is fifteen minutes that belong entirely to you — before the week asks anything of you, before the calendar fills, before the first message arrives.",
      "Appreciation is not positive thinking. It is the deliberate, honest direction of your attention toward what is already genuinely good — the part of your life that anxiety and habit tend to make invisible.",
    ],
  },
  "belief-rewrite-workbook": {
    label: "Sample Prompts",
    excerpts: [
      "Day 1 — Complete the following sentence ten times without editing or pausing: I could never... Write whatever comes first. Do not evaluate it. Do not soften it. Let the belief speak in its own voice.",
      "Day 10 — Review Days 1–9. What is the single most important belief that has surfaced — the one that, if changed, would have the most significant effect on your life? This is your primary belief target.",
    ],
  },
  "identity-stack-workbook": {
    label: "From the Workbook",
    excerpts: [
      "Before you design a single habit, you will examine who you currently believe you are. Before you track a single behavior, you will decide who you are becoming.",
      "The Minimum Viable Habit is the floor — the smallest version of the habit that still qualifies. The version you can do on your worst day, when your motivation is zero and your energy is spent.",
    ],
  },
  "reset-audio": {
    label: "From the Reset Protocol",
    excerpts: [
      "You came back. Whatever brought you here — whatever happened, however long you were away — you came back. That matters more than you currently believe it does.",
      "The voice of judgment is almost certainly present right now. That voice is not telling you the truth. It is telling you a story — a story that feels like truth because it is spoken in your own voice.",
    ],
  },
  "alignment-workbook": {
    label: "From the Workbook",
    excerpts: [
      "This workbook asks you to practice — to apply the five dimensions of the 5S Framework to your actual daily life with enough consistency that they become the operating system of your living.",
      "The only rule: Write before you evaluate whether you are writing well. The quality of your thinking in this workbook is not the point. The quality of your attention is.",
    ],
  },
};

const PRODUCTS: Record<string, {
  id: string;
  icon: string;
  title: string;
  subtitle: string;
  price: string;
  priceInCents: number;
  category: string;
  description: string;
  longDescription: string;
  includes: string[];
  available: boolean; // true = purchasable; false = coming soon
  tags: string[];
}> = {
  "alignment-workbook": {
    id: "alignment-workbook",
    icon: "📓",
    category: "workbook",
    title: "The Alignment Workbook",
    subtitle: "A 90-Day Practice for Living in Coherence",
    price: "$27",
    priceInCents: 2700,
    description: "A beautifully designed 90-day guided journal with daily prompts, weekly reviews, and the full 5S framework woven throughout.",
    longDescription: `This workbook is not a journal. A journal asks you to record what happened. This workbook asks you to practice — to apply the five dimensions of the Lifewoven 5S Framework to your actual daily life with enough consistency that they become the operating system of your living, not a set of ideas you think about occasionally.\n\nNinety days. One prompt per day. Thirteen weekly reviews.\n\nThe daily prompts rotate through the five dimensions of the framework — State, Story, Standards, Strategy, Stewardship — so that over the course of three months, you develop a working relationship with each one. Some days the prompt will land immediately. Others will feel flat or difficult or like you have nothing to say. Write anyway. Resistance is usually the sign that something worth addressing is present.\n\nThe only rule: Write before you evaluate whether you are writing well. The quality of your thinking in this workbook is not the point. The quality of your attention is.`,
    includes: [
      "90 daily prompts across all 5S dimensions",
      "13 weekly integration reviews",
      "The complete 5S Framework orientation",
      "Printable PDF — 33 pages",
      "Immediate download after purchase"
    ],
    available: true,
    tags: ["Journal", "PDF", "90 days", "5S Framework"],
  },
  "wisdom-card-deck": {
    id: "wisdom-card-deck",
    icon: "🃏",
    category: "cards",
    title: "Wisdom Card Deck",
    subtitle: "52 Cards — One Per Week for a Year",
    price: "$34",
    priceInCents: 3400,
    description: "52 beautifully designed digital cards featuring distilled wisdom from the four wisdom traditions at the heart of the Lifewoven platform.",
    longDescription: `One card. One week. One practice.\n\nDo not rush through this deck. Each card is a single distilled insight from one of the four wisdom traditions at the heart of the Lifewoven platform. The instruction is to sit with each card for seven days — to let it work on you through the week rather than consuming it in a sitting.\n\nRead it on Monday. Return to it on Wednesday. Let it find you in a moment on Friday when it is suddenly more relevant than it was at the beginning of the week.\n\nA year of this practice is a year of quiet, cumulative formation — the kind that does not announce itself and does not require dramatic effort. It simply asks your attention, one week at a time.\n\nThe 52 cards draw from four wisdom lineages: Mind Science, Interior Alignment, Meaning-Centered Philosophy, and Behavioral Science.`,
    includes: [
      "52 wisdom cards — one per week for a year",
      "Cards from all four Lifewoven wisdom traditions",
      "Usage guide and practice instructions",
      "Digital Card Deck PDF — 12 pages",
      "Immediate download after purchase"
    ],
    available: true,
    tags: ["Cards", "PDF", "52 cards", "Year-long practice"],
  },
  "morning-alignment-audio": {
    id: "morning-alignment-audio",
    icon: "📝",
    category: "scripts",
    title: "Morning Alignment Series",
    subtitle: "7 Narrated Scripts",
    price: "$37",
    priceInCents: 3700,
    description: "Seven 15-minute narrated scripts — one for each day of the week — to start your day in alignment.",
    longDescription: `These fifteen minutes belong entirely to you — before the week asks anything of you, before the calendar fills, before the first message arrives.\n\nThe Morning Alignment Series is seven complete narrated scripts, one for each day of the week, each approximately fifteen minutes. Each script moves through five elements: Arrive, Acknowledge, Appreciate, Intend, and Release — a complete interior practice that sets the tone for everything that follows.\n\nUse them in sequence across a week, or choose the script that fits the day you are in. Monday's Foundation script establishes the week's ground. Each subsequent day builds on a specific dimension of the Lifewoven framework.\n\nEach script includes pacing notes, pause markers, and breath cues. Read it at your own pace, or record it in your own voice.`,
    includes: [
      "7 complete narrated scripts — one per day of the week",
      "Monday: State · Tuesday: Belief · Wednesday: Body & Energy",
      "Thursday: Clarity · Friday: Identity · Saturday: Appreciation · Sunday: Integration",
      "~15 minutes per script",
      "Audio Scripts PDF",
      "Immediate download after purchase"
    ],
    available: true,
    tags: ["Audio Scripts PDF", "Morning Practice", "7 scripts"],
  },
  "belief-rewrite-workbook": {
    id: "belief-rewrite-workbook",
    icon: "✍️",
    category: "workbook",
    title: "Belief Rewrite Workbook",
    subtitle: "Rewire Your Story in 30 Days",
    price: "$19",
    priceInCents: 1900,
    description: "The story you tell about yourself is not a description of reality. It is a set of instructions. This 30-day workbook is a structured process for surfacing the specific beliefs that are most actively constraining your experience — and rewriting them with evidence, not optimism.",
    longDescription: `The Story module of the 5S Framework begins with a single premise: the story you tell about yourself is not a description of reality. It is a set of instructions. The beliefs you hold about who you are, what you are capable of, and what is available to you are not passive observations — they are active directives that shape what you attempt, what you notice, and what you allow yourself to receive.\n\nThis workbook is a 30-day structured process for surfacing, examining, and rewriting the specific beliefs that are most actively constraining your experience. It is not a positive-thinking exercise. It is a rigorous inquiry into the actual content of your current story — followed by a deliberate, evidence-based process for writing a more accurate one.\n\nThe distinction matters: the goal is not to replace a constraining belief with an aspirational one. The goal is to replace a constraining belief with a true one — a belief that is supported by evidence you already have access to but have not yet organized into a coherent counter-narrative.`,
    includes: [
      "30-day structured belief rewrite process",
      "Belief surfacing and examination exercises",
      "Evidence-gathering and rewrite protocols",
      "Story module orientation from the 5S Framework",
      "Workbook PDF",
      "Immediate download after purchase"
    ],
    available: true,
    tags: ["Beliefs", "PDF", "30 days", "Story Module"],
  },
  "identity-stack-workbook": {
    id: "identity-stack-workbook",
    icon: "🧱",
    category: "workbook",
    title: "The Identity Stack Workbook",
    subtitle: "Design the Habits That Make You, You",
    price: "$22",
    priceInCents: 2200,
    description: "Who you are becoming shapes what you do. This workbook walks you through the complete identity-based habit design process — from surfacing your current identity architecture to writing a credible identity declaration to building the habit stack that carries it into daily life.",
    longDescription: `Most habit change fails not because of a lack of discipline but because of a mismatch between the desired behavior and the underlying identity. The Identity Stack Workbook addresses the root.\n\nThis workbook walks you through the complete identity-based habit design process: surfacing the current identity architecture, writing a credible identity declaration, designing the habit stack that carries that identity into daily life, and building the recovery protocols that make consistency possible over time.\n\nIt includes the Minimum Viable Habit framework — the practice of designing habits small enough to survive your worst days — and the Better Mirror tracking system, which counts returns as demonstrations rather than treating missed days as failures.\n\nThe workbook is designed to be used alongside the Identity in Motion course or as a standalone practice tool. It is printable, structured for weekly use, and built to be returned to across multiple cycles of habit design.`,
    includes: [
      "Complete identity-based habit design process",
      "Minimum Viable Habit framework",
      "Better Mirror tracking system",
      "Identity declaration templates",
      "Weekly review structure",
      "Workbook PDF",
      "Immediate download after purchase"
    ],
    available: true,
    tags: ["Habits", "Identity", "PDF", "Behavior Science"],
  },
  "reset-audio": {
    id: "reset-audio",
    icon: "🔄",
    category: "scripts",
    title: "The Reset Protocol",
    subtitle: "The Complete Return",
    price: "$27",
    priceInCents: 2700,
    description: "The complete guided script for the Reset protocol — a 45-minute practice you can read through at your own pace, or record in your own voice.",
    longDescription: `The Reset pathway is built on a single premise: returning is not failure. It is the practice.\n\nThis guided practice walks you through the complete Reset protocol — a 45-minute journey from wherever you are to a place of genuine re-ground. It is not a motivational session. It is not a pep talk. It is a structured, compassionate process for the specific experience of having lost your footing and needing to find it again.\n\nThe Reset Protocol is for the moments when you know something has shifted — when alignment feels distant, when the story has gone dark, when energy is low, and the path forward is unclear. It meets you there without judgment and walks you back.`,
    includes: [
      "Complete 45-minute Reset protocol script",
      "Read-through pacing notes",
      "Pause and breath markers",
      "Audio Scripts PDF",
      "Immediate download after purchase"
    ],
    available: true,
    tags: ["Audio Scripts PDF", "Resilience", "45 min", "Reset Pathway"],
  },
};

export default function ProductDetail() {
  const [, params] = useRoute("/product/:id");
  const productId = params?.id ?? "";
  const product = PRODUCTS[productId];
  const { user, loading: authLoading } = useAuth();
  const [, navigate] = useLocation();
  const [notifyEmail, setNotifyEmail] = useState("");
  const [notifySent, setNotifySent] = useState(false);
  const joinWaitlist = trpc.paypalOrders.joinWaitlist.useMutation({
    onSuccess: () => setNotifySent(true),
    onError: () => setNotifySent(true),
  });

  // Check for post-purchase success redirect
  const urlParams = new URLSearchParams(window.location.search);
  const purchaseSuccess = urlParams.get("purchase") === "success";

  // Fetch user's existing orders to check if already purchased
  const { data: myOrders, refetch: refetchOrders } = trpc.paypalOrders.getMyOrders.useQuery(undefined, {
    enabled: !!user,
  });
  const { data: storeProducts } = trpc.store.getProducts.useQuery();
  const existingOrder = myOrders?.find((o: { productSlug: string | null }) => o.productSlug === productId);
  const alreadyPurchased = !!existingOrder;
  const includedWithMembership = storeProducts?.some((item) => item.slug === productId && item.isIncluded) ?? false;

  // Token state — re-issued on demand via server
  const [downloadToken, setDownloadToken] = useState<string | null>(null);
  const canDownloadNow = alreadyPurchased || includedWithMembership || purchaseSuccess || downloadToken !== null;

  const reissue = trpc.paypalOrders.reissueDownload.useMutation({
    onSuccess: (data) => {
      setDownloadToken(data.token);
      window.open(`/api/download/${data.token}`, "_blank");
    },
    onError: () => toast.error("Could not generate download link. Please try again."),
  });

  function handleDownload() {
    const token = downloadToken ?? existingOrder?.downloadToken ?? null;
    if (token) {
      window.open(`/api/download/${token}`, "_blank");
      return;
    }
    // Token missing or expired — re-issue via server
    reissue.mutate({ productSlug: productId });
  }

  function handlePayPalSuccess(_token: string, title: string) {
    // Server does not return the download token in the capture response (security C4).
    // Redirect to /downloads where getMyOrders fetches the token from the database.
    refetchOrders();
    toast.success(`Purchase complete — ${title} is ready!`, {
      description: "Redirecting to your downloads…",
      duration: 3000,
    });
    setTimeout(() => navigate("/downloads"), 1500);
  }

  function handlePayPalError(msg: string) {
    toast.error("Payment failed", { description: msg });
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Nav />
        <div className="container pt-20 pb-24 max-w-3xl mx-auto px-4 sm:px-6">
          <Link href="/store">
            <p className="text-base text-muted-foreground mb-6 hover:text-foreground transition-colors cursor-pointer flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" /> Back to Store
            </p>
          </Link>
          <h1 className="font-serif text-4xl font-light text-foreground mb-3">Product Coming Soon</h1>
          <p className="text-muted-foreground font-light text-base mb-8">This product is currently in development. Check back soon.</p>
          <Button asChild variant="outline"><Link href="/store">Browse All Products</Link></Button>
        </div>
      </div>
    );
  }

  const CategoryIcon = product.category === "cards" ? Star : FileText;
  const isAvailable = product.available;
  const isAdmin = false;
  const { previewAsUser, togglePreview } = useAdminPreview();
  const effectiveAdmin = isAdmin && !previewAsUser;
  const canDownload = effectiveAdmin || canDownloadNow;

  // Download button used in multiple places
  const DownloadButton = ({ size = "lg", label }: { size?: "lg" | "default"; label?: string }) => (
    <Button size={size} className="gap-2" onClick={handleDownload} disabled={reissue.isPending}>
      {reissue.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
      {label ?? `Download ${product.title}`}
    </Button>
  );

  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <div className="container pt-20 pb-24 max-w-3xl mx-auto px-4 sm:px-6">
        <Link href="/store">
          <p className="text-base text-muted-foreground mb-8 hover:text-foreground transition-colors cursor-pointer flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" /> Back to Store
          </p>
        </Link>

        {/* Post-purchase success banner */}
        {canDownload && (
          <div className="mb-8 p-5 rounded-2xl border border-green-500/30 bg-green-500/10 flex items-start gap-4">
            <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-base font-medium text-foreground mb-1">Purchase complete — your download is ready.</p>
              <p className="text-sm text-muted-foreground mb-3">Thank you for your purchase. Click below to download your file.</p>
              <DownloadButton size="default" />
            </div>
          </div>
        )}

        {/* Admin Preview Badge + Toggle */}
        {isAdmin && (
          <div className="mb-6 flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-amber-500/30 bg-amber-500/10">
              <Shield className="h-3.5 w-3.5 text-amber-500" />
              <span className="text-xs font-mono tracking-widest text-amber-500 uppercase">
                {previewAsUser ? "Previewing as User" : "Admin Preview — Full Access"}
              </span>
            </div>
            <button
              onClick={togglePreview}
              aria-label={previewAsUser ? "Restore admin access" : "Preview as regular user"}
              className="text-xs font-mono tracking-widest text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors"
            >
              {previewAsUser ? "Restore Admin Access" : "Preview as User"}
            </button>
          </div>
        )}

        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <CategoryIcon className="h-4 w-4 text-muted-foreground" />
            <p className="text-xs font-mono tracking-widest text-muted-foreground uppercase">{product.category}</p>
          </div>
          <div className="text-4xl mb-4">{product.icon}</div>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-light text-foreground mb-3 break-words">{product.title}</h1>
          <p className="text-lg sm:text-xl text-muted-foreground font-light mb-5">{product.subtitle}</p>
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <span className="text-2xl font-light text-foreground">{includedWithMembership ? "Included with Oracle" : product.price}</span>
            <div className="flex flex-wrap gap-1.5">
              {product.tags.map(tag => (
                <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">{tag}</span>
              ))}
            </div>
          </div>

          {/* Primary CTA */}
          {isAvailable ? (
            canDownload ? (
              <DownloadButton label="Download Now" />
            ) : user ? (
              <div className="max-w-xs">
                <p className="text-xs text-muted-foreground mb-2 font-light">Secure checkout via PayPal</p>
                <PayPalButton
                  productSlug={product.id}
                  priceUsd={product.priceInCents / 100}
                  onSuccess={handlePayPalSuccess}
                  onError={handlePayPalError}
                />
              </div>
            ) : (
              <Button size="lg" className="gap-2" onClick={() => { window.location.href = getLoginUrl(window.location.pathname + window.location.search); }}>
                <ShoppingCart className="h-4 w-4" /> Sign in to Purchase
              </Button>
            )
          ) : (
            <Button size="lg" disabled className="gap-2 opacity-60">
              <Download className="h-4 w-4" /> Coming Soon
            </Button>
          )}
        </div>

        {/* Description */}
        <div className="mb-8 p-4 sm:p-6 rounded-2xl border border-border bg-card">
          <h2 className="font-serif text-2xl font-light text-foreground mb-4">
            About This {product.category === "audio" ? "Series" : product.category === "cards" ? "Deck" : "Workbook"}
          </h2>
          {product.longDescription.split("\n\n").map((p, i) => (
            <p key={i} className="text-base text-muted-foreground font-light leading-relaxed mb-3 last:mb-0">{p}</p>
          ))}
        </div>

        {/* What's Included */}
        <div className="mb-8 p-4 sm:p-6 rounded-2xl border border-border bg-secondary/20">
          <h2 className="font-serif text-2xl font-light text-foreground mb-4">What's Included</h2>
          <ul className="space-y-2">
            {product.includes.map((item, i) => (
              <li key={i} className="flex items-start gap-3 text-base text-foreground/80 font-light">
                <CheckCircle2 className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Preview Excerpts */}
        {PREVIEWS[productId] && (
          <div className="mb-8 p-4 sm:p-6 rounded-2xl border border-border bg-secondary/10">
            <h2 className="font-serif text-2xl font-light text-foreground mb-5">{PREVIEWS[productId].label}</h2>
            <div className="space-y-4">
              {PREVIEWS[productId].excerpts.map((excerpt, i) => (
                <blockquote key={i} className="border-l-2 border-muted-foreground/30 pl-4 text-base text-muted-foreground font-light leading-relaxed italic">
                  {excerpt}
                </blockquote>
              ))}
            </div>
          </div>
        )}

        {/* Bottom CTA */}
        <div className="p-6 sm:p-8 rounded-2xl border border-border bg-card text-center">
          <h3 className="font-serif text-2xl font-light text-foreground mb-3">
            {isAvailable ? "Ready to Begin?" : "Be the First to Know"}
          </h3>
          {isAvailable ? (
            <>
              <p className="text-base text-muted-foreground font-light mb-6 max-w-md mx-auto">
                {canDownload
                  ? "Your purchase is confirmed. Download your file below."
                  : "Secure checkout via PayPal. Instant download after payment."}
              </p>
              {canDownload ? (
                <DownloadButton />
              ) : user ? (
                <div className="max-w-xs mx-auto">
                  <p className="text-xs text-muted-foreground mb-2 font-light">Secure checkout via PayPal</p>
                  <PayPalButton
                    productSlug={product.id}
                    priceUsd={product.priceInCents / 100}
                    onSuccess={handlePayPalSuccess}
                    onError={handlePayPalError}
                  />
                </div>
              ) : (
                <Button size="lg" className="gap-2" onClick={() => { window.location.href = getLoginUrl(window.location.pathname + window.location.search); }}>
                  <ShoppingCart className="h-4 w-4" /> Sign in to Purchase
                </Button>
              )}
            </>
          ) : (
            <>
              <p className="text-base text-muted-foreground font-light mb-6 max-w-md mx-auto">
                This product is in development. Enter your email and we'll notify you the moment it's available.
              </p>
              {notifySent ? (
                <div className="flex items-center justify-center gap-2 text-base text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  You're on the list. We'll be in touch.
                </div>
              ) : (
                <form
                  className="flex flex-col sm:flex-row gap-3 max-w-sm mx-auto"
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (notifyEmail) joinWaitlist.mutate({ email: notifyEmail, productName: product.title });
                  }}
                >
                  <input
                    type="email"
                    required
                    placeholder="your@email.com"
                    value={notifyEmail}
                    onChange={e => setNotifyEmail(e.target.value)}
                    className="flex-1 px-4 py-2 rounded-lg border border-border bg-background text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                  <Button type="submit" className="gap-2 shrink-0">
                    <Mail className="h-4 w-4" /> Notify Me
                  </Button>
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
