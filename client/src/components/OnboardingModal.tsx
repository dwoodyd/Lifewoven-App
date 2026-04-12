import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { X, ArrowRight } from "lucide-react";

const STORAGE_KEY = "lifewoven_onboarded";

export default function OnboardingModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem(STORAGE_KEY);
    if (!seen) setOpen(true);
  }, []);

  function dismiss() {
    localStorage.setItem(STORAGE_KEY, "1");
    setOpen(false);
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-lg bg-card border border-border rounded-2xl shadow-2xl p-8">
        <button
          onClick={dismiss}
          aria-label="Close welcome modal"
          className="absolute top-4 right-4 p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        <p className="text-xs font-mono tracking-widest text-muted-foreground uppercase mb-4">Welcome to Lifewoven</p>
        <h2 className="font-serif text-3xl font-light text-foreground mb-3">
          You've arrived.
        </h2>
        <p className="text-base text-muted-foreground font-light leading-relaxed mb-6">
          Lifewoven is a personal transformation platform built around the 5S Framework — a five-dimensional approach to living in alignment. Here's where to begin.
        </p>

        <div className="space-y-3 mb-8">
          {[
            { step: "01", label: "Read the About page", desc: "Understand the framework and how the platform works.", href: "/about" },
            { step: "02", label: "Take the Alignment Audit", desc: "A 5-minute self-assessment to find your starting point.", href: "/dashboard" },
            { step: "03", label: "Explore the Pathways", desc: "Choose a guided journey based on where you are.", href: "/pathways" },
          ].map(({ step, label, desc, href }) => (
            <Link key={step} href={href} onClick={dismiss}>
              <div className="flex items-start gap-4 p-4 rounded-xl border border-border hover:border-foreground/30 hover:bg-secondary/30 transition-all cursor-pointer group">
                <span className="text-xs font-mono text-muted-foreground mt-0.5 w-5 shrink-0">{step}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground mb-0.5">{label}</p>
                  <p className="text-xs text-muted-foreground font-light">{desc}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors shrink-0 mt-0.5" />
              </div>
            </Link>
          ))}
        </div>

        <div className="flex gap-3">
          <Button className="flex-1" onClick={dismiss} asChild>
            <Link href="/about">Start with the About Page</Link>
          </Button>
          <Button variant="outline" onClick={dismiss} className="shrink-0">
            Explore on my own
          </Button>
        </div>
      </div>
    </div>
  );
}
