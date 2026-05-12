import Nav from "@/components/Nav";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ShoppingBag, BookOpen, Headphones, Layers, Star, Library, Lock, Percent, Check, Loader2 } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import { toast } from "sonner";

const PRODUCT_CATALOG = [
  {
    id: "alignment-fundamentals",
    category: "course",
    icon: "📐",
    title: "Alignment Fundamentals",
    subtitle: "The 5S Framework in Practice",
    price: 97,
    description: "Six weeks. Five dimensions. One coherent life. The complete introduction to the 5S Framework — State, Story, Standards, Strategy, Stewardship — built for people ready to move from insight to practice.",
    tags: ["5S Framework", "Foundations", "6 weeks"],
  },
  {
    id: "the-alignment-current",
    category: "course",
    icon: "🌀",
    title: "The Alignment Current",
    subtitle: "Advanced Alignment Practice",
    price: 147,
    description: "Most people touch alignment occasionally. This course teaches you to live there. A four-week deep-immersion in the daily practices and inner conditions that make sustained interior coherence a way of being.",
    tags: ["Interior Alignment", "Advanced", "4 weeks"],
  },
  {
    id: "identity-in-motion",
    category: "course",
    icon: "⚛️",
    title: "Identity in Motion",
    subtitle: "Habit Architecture for the Whole Self",
    price: 127,
    description: "Behavior change fails when built on willpower. Identity in Motion teaches you to build habits from the inside out — starting with who you are becoming, then designing the daily practices that make that identity real.",
    tags: ["Habits", "Identity", "Behavior Science"],
  },
  {
    id: "the-meaning-foundation",
    category: "course",
    icon: "🔍",
    title: "The Meaning Foundation",
    subtitle: "Purpose, Resilience & the Unshakeable Why",
    price: 97,
    description: "Meaning is not found — it is made. A four-week course in meaning-centered living: how to locate your deepest why, use it as an anchor through difficulty, and build a life that holds its shape under pressure.",
    tags: ["Meaning", "Purpose", "Resilience"],
  },
  {
    id: "belief-rewrite-workbook",
    category: "workbook",
    icon: "✍️",
    title: "Belief Rewrite Workbook",
    subtitle: "Rewire Your Story in 30 Days",
    price: 19,
    description: "The story you tell about yourself is not a description of reality — it is a set of instructions. A structured 30-day process for surfacing the beliefs most actively limiting your experience and rewriting them with evidence.",
    tags: ["Beliefs", "PDF", "30 days"],
  },
  {
    id: "identity-stack-workbook",
    category: "workbook",
    icon: "🧱",
    title: "The Identity Stack Workbook",
    subtitle: "Design the Habits That Make You, You",
    price: 22,
    description: "Who you are becoming shapes what you do. This workbook walks you through the complete identity-based habit design process — from surfacing your current identity architecture to building the habit stack that carries it into daily life.",
    tags: ["Habits", "Identity", "PDF"],
  },
  {
    id: "morning-alignment-audio",
    category: "audio",
    icon: "🎧",
    title: "Morning Alignment Series",
    subtitle: "7 Guided Morning Practices",
    price: 37,
    description: "Fifteen minutes, before the day asks anything of you. Seven complete guided sessions — one for each day of the week — moving through Arrive, Acknowledge, Appreciate, Intend, and Release.",
    tags: ["Audio", "Morning", "7 sessions"],
  },
  {
    id: "reset-audio",
    category: "audio",
    icon: "🔄",
    title: "Reset Audio",
    subtitle: "Guided Re-entry Practices",
    price: 27,
    description: "When you fall off — and you will — this is how you come back. Six guided audio sessions for re-entry: after a hard week, a broken streak, a season of drift. No shame. Just return.",
    tags: ["Audio", "Reset", "6 sessions"],
  },
  {
    id: "wisdom-card-deck",
    category: "cards",
    icon: "🃏",
    title: "Wisdom Card Deck",
    subtitle: "52 Principles for the Aligned Life",
    price: 34,
    description: "One card. One principle. One day. The Wisdom Card Deck is a year of daily practice distilled into 52 cards — each one a prompt for reflection, a lens for the day, a reminder of what you already know.",
    tags: ["Cards", "Daily Practice", "52 cards"],
  },
];

const CATEGORIES = [
  { id: "all", label: "All", icon: ShoppingBag },
  { id: "course", label: "Courses", icon: Layers },
  { id: "workbook", label: "Workbooks", icon: BookOpen },
  { id: "audio", label: "Audio", icon: Headphones },
  { id: "cards", label: "Card Decks", icon: Star },
];

export default function Store() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [purchasingId, setPurchasingId] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();

  const { data: access } = trpc.store.getAccess.useQuery();
  const { data: serverProducts } = trpc.store.getProducts.useQuery();

  const accessLevel = access?.level ?? "standalone";

  const products = PRODUCT_CATALOG.map(p => {
    const sp = serverProducts?.find(s => s.slug === p.id);
    // Server returns prices in dollars (e.g. 97.00), not cents
    return {
      ...p,
      effectivePrice: sp?.effectivePrice ?? p.price,
      originalPrice: p.price,
      isIncluded: sp?.isIncluded ?? false,
      hasDiscount: sp?.hasDiscount ?? false,
    };
  });

  const filtered = activeCategory === "all" ? products : products.filter(p => p.category === activeCategory);

  async function handlePurchase(productId: string, priceUsd: number) {
    if (!isAuthenticated) {
      window.location.href = getLoginUrl();
      return;
    }
    setPurchasingId(productId);
    try {
      const res = await fetch("/api/paypal/product/checkout", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          priceUsd,
          returnUrl: `${window.location.origin}/store?purchased=${productId}`,
          cancelUrl: `${window.location.origin}/store`,
        }),
      });
      const data = await res.json() as { approvalUrl?: string; error?: string };
      if (!data.approvalUrl) {
        toast.error(data.error ?? "Could not start checkout. Please try again.");
        return;
      }
      toast.info("Redirecting to PayPal…");
      window.open(data.approvalUrl, "_blank");
    } catch {
      toast.error("Checkout failed. Please try again.");
    } finally {
      setPurchasingId(null);
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Nav />
      <div className="max-w-6xl mx-auto px-4 py-16 sm:py-24">

        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-xs tracking-[0.2em] uppercase text-amber-400/80 mb-4 font-light">Store</p>
          <h1 className="font-serif text-4xl sm:text-5xl font-light text-foreground mb-5">Wisdom Tools</h1>

          {accessLevel === "library" ? (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-violet-400/30 bg-violet-400/10 text-violet-300 text-sm mb-4">
              <Library className="h-4 w-4" />
              All items included with your Oracle membership
            </div>
          ) : accessLevel === "discount" ? (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-amber-400/30 bg-amber-400/10 text-amber-300 text-sm mb-4">
              <Percent className="h-4 w-4" />
              Seeker discount — 30% off all items
            </div>
          ) : (
            <p className="text-muted-foreground text-base sm:text-lg max-w-xl mx-auto">
              Courses, workbooks, audio programs, and card decks — each one an original Lifewoven creation.
            </p>
          )}
        </div>

        {/* Category filter */}
        <div className="flex flex-wrap gap-2 justify-center mb-8">
          {CATEGORIES.map(cat => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm transition-colors ${
                  activeCategory === cat.id
                    ? "border-foreground bg-foreground text-background"
                    : "border-border text-muted-foreground hover:border-muted-foreground"
                }`}
              >
                <Icon className="h-3.5 w-3.5" /> {cat.label}
              </button>
            );
          })}
        </div>

        {/* Product grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-14">
          {filtered.map(product => {
            const discountedPrice = product.effectivePrice;
            const originalPrice = product.originalPrice;
            const hasDiscount = product.hasDiscount;

            return (
              <div
                key={product.id}
                className={`relative p-5 sm:p-6 rounded-2xl border flex flex-col gap-4 transition-all ${
                  product.isIncluded
                    ? "border-violet-400/30 bg-violet-400/5"
                    : "border-border bg-card hover:border-muted-foreground"
                }`}
              >
                {product.isIncluded && (
                  <div className="absolute -top-2.5 left-4 px-2.5 py-0.5 rounded-full text-xs bg-violet-500/20 text-violet-300 border border-violet-400/30 flex items-center gap-1">
                    <Library className="h-3 w-3" /> Included
                  </div>
                )}

                <div className="text-3xl">{product.icon}</div>

                <div>
                  <h3 className="font-serif text-lg font-light text-foreground mb-0.5">{product.title}</h3>
                  <p className="text-sm text-muted-foreground">{product.subtitle}</p>
                </div>

                <p className="text-sm text-muted-foreground leading-relaxed flex-1">{product.description}</p>

                <div className="flex flex-wrap gap-1.5">
                  {product.tags.map(tag => (
                    <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Price + CTA */}
                {product.isIncluded ? (
                  <div className="flex items-center justify-between pt-2 border-t border-violet-400/20">
                    <div className="flex items-center gap-1.5 text-violet-300 text-sm">
                      <Check className="h-3.5 w-3.5" /> In your library
                    </div>
                    <Button size="sm" variant="outline" className="border-violet-400/30 text-violet-300 hover:bg-violet-400/10" asChild>
                      <Link href={`/course/${product.id}`}>Open</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between pt-2 border-t border-border">
                    <div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-lg font-light text-foreground">${discountedPrice}</span>
                        {hasDiscount && (
                          <span className="text-sm text-muted-foreground/60 line-through">${originalPrice}</span>
                        )}
                      </div>
                      {hasDiscount && (
                        <span className="text-xs text-amber-400">Seeker rate</span>
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handlePurchase(product.id, discountedPrice)}
                      disabled={purchasingId === product.id}
                    >
                      {purchasingId === product.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : isAuthenticated ? (
                        "Buy"
                      ) : (
                        <span className="flex items-center gap-1"><Lock className="h-3 w-3" />Sign in</span>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Oracle upsell footer (only for non-Oracle users) */}
        {accessLevel !== "library" && (
          <div className="rounded-2xl border border-violet-400/30 bg-violet-400/5 p-6 sm:p-10 text-center">
            <Library className="h-8 w-8 text-violet-400 mx-auto mb-4" />
            <h2 className="font-serif text-2xl sm:text-3xl font-light text-foreground mb-3">
              Get everything. Pay once a month.
            </h2>
            <p className="text-muted-foreground text-base max-w-2xl mx-auto mb-2 leading-relaxed">
              Oracle members get the complete Lifewoven library — all 4 courses, both workbooks, all audio programs, and the Wisdom Card Deck — included with their membership. Combined retail value: $607.
            </p>
            <p className="text-violet-300 text-sm mb-8">
              Founding rate: $25/mo (retail $49/mo). Locked for life.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button asChild className="border-violet-400/40 text-violet-300 hover:bg-violet-400/10" variant="outline">
                <Link href="/pricing">See Oracle plan →</Link>
              </Button>
              {!isAuthenticated && (
                <Button asChild variant="ghost" className="text-muted-foreground">
                  <a href={getLoginUrl()}>Sign in first</a>
                </Button>
              )}
            </div>
          </div>
        )}

        <p className="text-center text-xs text-muted-foreground/50 mt-10 max-w-2xl mx-auto">
          All Lifewoven courses, workbooks, and audio programs are original creations. They are informed by wisdom traditions and personal development ideas but are independently produced and not affiliated with, endorsed by, or licensed by any named author, teacher, or publisher.
        </p>
      </div>
    </div>
  );
}
