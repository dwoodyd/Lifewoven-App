import Nav from "@/components/Nav";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ShoppingBag, BookOpen, Headphones, Layers, Star } from "lucide-react";

const PRODUCTS = [
  { id: "alignment-fundamentals", category: "course", icon: "📐", title: "Alignment Fundamentals", subtitle: "The 5S Framework in Practice", price: "$97", description: "A 6-week immersive course that walks you through each of the 5S modules with daily practices, video lessons, and journaling exercises. Build the foundation of your LifeOS.", tags: ["5S Framework", "Foundations", "6 weeks"] },
  { id: "living-in-the-vortex", category: "course", icon: "🌀", title: "Living in the Vortex", subtitle: "Advanced Vibrational Alignment", price: "$147", description: "Go deep into the Abraham-Hicks teachings. Master the Emotional Guidance Scale, the Art of Allowing, and the daily practices that keep you in the Vortex consistently.", tags: ["Abraham-Hicks", "Advanced", "4 weeks"] },
  { id: "atomic-habits-for-the-soul", category: "course", icon: "⚛️", title: "Atomic Habits for the Soul", subtitle: "Identity-Based Transformation", price: "$127", description: "James Clear's Atomic Habits framework meets spiritual identity work. Build habits that are aligned with your highest self, not just your goals.", tags: ["Habits", "Identity", "James Clear"] },
  { id: "finding-your-why", category: "course", icon: "🔍", title: "Finding Your Why", subtitle: "Meaning, Purpose & Resilience", price: "$97", description: "Based on Viktor Frankl's logotherapy and the Why pathway. Discover your deepest purpose and use it as an unshakeable foundation for everything you do.", tags: ["Meaning", "Viktor Frankl", "Purpose"] },
  { id: "alignment-workbook", category: "workbook", icon: "📓", title: "The Alignment Workbook", subtitle: "90-Day Transformation Journal", price: "$27", description: "A beautifully designed 90-day guided journal with daily prompts, weekly reviews, and the full 5S framework woven throughout. Available as a printable PDF.", tags: ["Journal", "PDF", "90 days"] },
  { id: "belief-rewrite-workbook", category: "workbook", icon: "✍️", title: "Belief Rewrite Workbook", subtitle: "Rewire Your Story in 30 Days", price: "$19", description: "A focused 30-day workbook for identifying and rewriting the limiting beliefs that are holding you back. Rooted in the Story module of the 5S Framework.", tags: ["Beliefs", "PDF", "30 days"] },
  { id: "morning-alignment-audio", category: "audio", icon: "🎧", title: "Morning Alignment Series", subtitle: "7 Guided Morning Practices", price: "$37", description: "Seven 15-minute guided audio sessions — one for each day of the week — to start your day in alignment. Includes Vortex meditation, appreciation activation, and intention setting.", tags: ["Audio", "Morning", "7 sessions"] },
  { id: "reset-protocol-audio", category: "audio", icon: "🔄", title: "Reset After Setback Audio", subtitle: "The Full Resilience Protocol", price: "$27", description: "A guided audio experience walking you through the complete Reset After Setback pathway. For the moments when you need to return to yourself.", tags: ["Audio", "Resilience", "45 min"] },
  { id: "wisdom-card-deck", category: "cards", icon: "🃏", title: "Wisdom Card Deck", subtitle: "52 Cards of Timeless Insight", price: "$34", description: "52 beautifully designed digital cards featuring the most powerful teachings from Holmes, Hicks, Frankl, and Clear. One card per week for a year of transformation.", tags: ["Cards", "PDF", "52 cards"] },
];

const CATEGORIES = [
  { id: "all", label: "All Products", icon: ShoppingBag },
  { id: "course", label: "Courses", icon: Layers },
  { id: "workbook", label: "Workbooks", icon: BookOpen },
  { id: "audio", label: "Audio", icon: Headphones },
  { id: "cards", label: "Card Decks", icon: Star },
];

import { useState } from "react";

export default function Store() {
  const [activeCategory, setActiveCategory] = useState("all");
  const filtered = activeCategory === "all" ? PRODUCTS : PRODUCTS.filter(p => p.category === activeCategory);

  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <div className="container pt-24 pb-20 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-xs font-mono tracking-widest text-muted-foreground uppercase mb-4">Store</p>
          <h1 className="font-serif text-4xl md:text-5xl font-light text-foreground mb-4">Wisdom Tools</h1>
          <p className="text-muted-foreground text-lg font-light max-w-xl mx-auto">Courses, workbooks, audio programs, and card decks — each one a distillation of timeless wisdom, made practical for modern life.</p>
        </div>
        <div className="flex flex-wrap gap-2 justify-center mb-10">
          {CATEGORIES.map(cat => {
            const Icon = cat.icon;
            return (
              <button key={cat.id} onClick={() => setActiveCategory(cat.id)} className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm transition-colors ${activeCategory === cat.id ? "border-foreground bg-foreground text-background" : "border-border text-muted-foreground hover:border-muted-foreground"}`}>
                <Icon className="h-3.5 w-3.5" /> {cat.label}
              </button>
            );
          })}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(product => (
            <Link key={product.id} href={`/course/${product.id}`}>
              <div className="p-6 rounded-2xl border border-border bg-card hover:border-muted-foreground transition-all cursor-pointer h-full flex flex-col">
                <div className="text-3xl mb-4">{product.icon}</div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-serif text-lg font-light text-foreground">{product.title}</h3>
                  <span className="text-sm font-medium text-foreground flex-shrink-0">{product.price}</span>
                </div>
                <p className="text-xs text-muted-foreground mb-3">{product.subtitle}</p>
                <p className="text-sm text-muted-foreground font-light leading-relaxed flex-1 mb-4">{product.description}</p>
                <div className="flex flex-wrap gap-1.5">
                  {product.tags.map(tag => <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">{tag}</span>)}
                </div>
              </div>
            </Link>
          ))}
        </div>
        <div className="mt-16 p-8 rounded-2xl border border-border bg-card text-center">
          <h2 className="font-serif text-2xl font-light text-foreground mb-3">Bundle & Save</h2>
          <p className="text-muted-foreground text-sm mb-6 max-w-md mx-auto">Get the complete LifeOS toolkit — all courses, workbooks, audio programs, and card decks — at one transformational price.</p>
          <div className="flex items-center justify-center gap-3 mb-6">
            <span className="text-muted-foreground line-through text-lg">$613</span>
            <span className="text-3xl font-light text-foreground">$297</span>
            <span className="text-xs px-2 py-1 rounded-full bg-secondary text-muted-foreground">Save 52%</span>
          </div>
          <Button size="lg" className="gap-2"><ShoppingBag className="h-4 w-4" /> Get the Complete Bundle</Button>
        </div>
      </div>
    </div>
  );
}
