import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useBetaAccess } from "@/hooks/useBetaAccess";
import { useState, useEffect } from "react";
import { Sparkles, Clock, ArrowRight } from "lucide-react";

const DISMISSED_KEY = "lifewoven_beta_expired_dismissed";

export function BetaExpiredModal() {
  const { isExpired } = useBetaAccess();
  const [open, setOpen] = useState(false);
  const [, navigate] = useLocation();

  useEffect(() => {
    if (isExpired) {
      const dismissed = sessionStorage.getItem(DISMISSED_KEY);
      if (!dismissed) setOpen(true);
    }
  }, [isExpired]);

  if (!open) return null;

  function dismiss() {
    sessionStorage.setItem(DISMISSED_KEY, "1");
    setOpen(false);
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={dismiss} />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-md rounded-2xl overflow-hidden shadow-2xl"
        style={{ background: "linear-gradient(135deg, #0d0d1a 0%, #1a1025 50%, #0d1a0d 100%)" }}>

        {/* Glow */}
        <div className="absolute inset-0 opacity-20 pointer-events-none"
          style={{ background: "radial-gradient(ellipse at 50% 0%, #c9a84c 0%, transparent 70%)" }} />

        <div className="relative p-8 text-center">
          {/* Icon */}
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-6"
            style={{ background: "rgba(201,168,76,0.15)", border: "1px solid rgba(201,168,76,0.3)" }}>
            <Clock className="w-8 h-8 text-amber-400" />
          </div>

          {/* Headline */}
          <h2 className="text-2xl font-serif text-white mb-3">
            Your Beta Access Has Ended
          </h2>
          <p className="text-stone-300 text-sm leading-relaxed mb-8">
            Your 45-day beta trial is complete. We hope the journey has been transformative.
            To continue your practice — your pathways, journal, Oracle, and all courses — 
            choose a plan that fits where you are now.
          </p>

          {/* CTA */}
          <Button
            className="w-full h-12 text-base font-semibold rounded-xl mb-3"
            style={{ background: "linear-gradient(135deg, #c9a84c, #e8c96a)", color: "#0d0d1a" }}
            onClick={() => { dismiss(); navigate("/pricing"); }}
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Choose Your Plan
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>

          <button
            onClick={dismiss}
            className="text-xs text-stone-500 hover:text-stone-400 transition-colors"
          >
            Remind me later
          </button>
        </div>
      </div>
    </div>
  );
}
