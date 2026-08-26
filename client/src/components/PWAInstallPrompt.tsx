/**
 * PWAInstallPrompt — custom install prompt for Lifewoven PWA
 *
 * - Android/Chrome: intercepts the beforeinstallprompt event and shows a branded prompt
 * - iOS Safari: detects standalone mode absence and shows "Add to Home Screen" instructions
 * - Respects user dismissal (stored in localStorage for 30 days)
 *
 * Place once in App.tsx — it manages its own visibility.
 */

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Download, Share } from "lucide-react";
import { Button } from "@/components/ui/button";
import { gentleSpring } from "@/lib/springs";
import { BrandMark } from "@/components/BrandMark";

const DISMISS_KEY = "lifewoven_pwa_prompt_dismissed";
const DISMISS_DAYS = 30;

function isDismissed(): boolean {
  try {
    const raw = localStorage.getItem(DISMISS_KEY);
    if (!raw) return false;
    const ts = parseInt(raw, 10);
    return Date.now() - ts < DISMISS_DAYS * 24 * 60 * 60 * 1000;
  } catch {
    return false;
  }
}

function dismiss() {
  try {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
  } catch {
    // ignore
  }
}

function isIOS(): boolean {
  return (
    typeof navigator !== "undefined" &&
    /iphone|ipad|ipod/i.test(navigator.userAgent) &&
    !(window.navigator as Navigator & { standalone?: boolean }).standalone
  );
}

function isInStandaloneMode(): boolean {
  return (
    typeof window !== "undefined" &&
    (window.matchMedia("(display-mode: standalone)").matches ||
      !!(window.navigator as Navigator & { standalone?: boolean }).standalone)
  );
}

export function PWAInstallPrompt() {
  const [show, setShow] = useState(false);
  const [isIOSDevice, setIsIOSDevice] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    if (isDismissed() || isInStandaloneMode()) return;

    // iOS — show manual instructions after 30s
    if (isIOS()) {
      setIsIOSDevice(true);
      const timer = setTimeout(() => setShow(true), 30_000);
      return () => clearTimeout(timer);
    }

    // Android/Chrome — intercept beforeinstallprompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Show after 20s of use
      setTimeout(() => setShow(true), 20_000);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setShow(false);
        dismiss();
      }
    }
  };

  const handleDismiss = () => {
    setShow(false);
    dismiss();
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 120, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 120, opacity: 0 }}
          transition={gentleSpring}
          className="fixed bottom-0 left-0 right-0 z-50 pb-safe"
        >
          <div className="mx-4 mb-4 rounded-2xl border border-border/60 bg-card/95 backdrop-blur-xl shadow-2xl p-5">
            <button
              onClick={handleDismiss}
              className="absolute top-3 right-3 p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-start gap-4 pr-6">
              <BrandMark className="shrink-0 w-12 h-12" />
              <div className="flex-1 min-w-0">
                <p className="font-serif text-base font-light text-foreground">Add Lifewoven to your home screen</p>
                {isIOSDevice ? (
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    Tap <Share className="inline h-3 w-3 mx-0.5" /> then <strong>"Add to Home Screen"</strong> for the full app experience.
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    Install for offline access, faster load times, and a native app feel.
                  </p>
                )}
              </div>
            </div>

            {!isIOSDevice && (
              <div className="mt-4 flex gap-2">
                <Button
                  onClick={handleInstall}
                  size="sm"
                  className="flex-1 gap-2"
                >
                  <Download className="h-3.5 w-3.5" />
                  Install App
                </Button>
                <Button
                  onClick={handleDismiss}
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground"
                >
                  Not now
                </Button>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
