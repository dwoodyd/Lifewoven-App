/**
 * useHaptics — Lifewoven haptic feedback hook
 *
 * Uses the Vibration API (Android Chrome / some iOS PWA) with graceful fallback.
 * Respects the user's haptics preference stored in localStorage.
 *
 * Usage:
 *   const haptics = useHaptics();
 *   haptics.light();    // button tap
 *   haptics.medium();   // habit complete, toggle
 *   haptics.heavy();    // milestone, pathway complete
 *   haptics.success();  // double-tap pattern — positive reinforcement
 *   haptics.error();    // triple short — error / destructive action
 */

import { useCallback } from "react";

const HAPTICS_KEY = "lifewoven_haptics_enabled";

function isHapticsEnabled(): boolean {
  try {
    const stored = localStorage.getItem(HAPTICS_KEY);
    // Default to enabled if not set
    return stored === null ? true : stored === "true";
  } catch {
    return false;
  }
}

function vibrate(pattern: number | number[]) {
  if (typeof navigator === "undefined") return;
  if (!isHapticsEnabled()) return;
  if (!("vibrate" in navigator)) return;
  try {
    navigator.vibrate(pattern);
  } catch {
    // Silently ignore — some browsers throw on vibrate()
  }
}

export function useHaptics() {
  const light = useCallback(() => vibrate(8), []);
  const medium = useCallback(() => vibrate(18), []);
  const heavy = useCallback(() => vibrate(35), []);
  const success = useCallback(() => vibrate([12, 60, 20]), []);
  const error = useCallback(() => vibrate([10, 40, 10, 40, 10]), []);
  const tick = useCallback(() => vibrate(4), []);

  return { light, medium, heavy, success, error, tick };
}

/** Standalone helpers for use outside React components */
export const haptics = {
  light: () => vibrate(8),
  medium: () => vibrate(18),
  heavy: () => vibrate(35),
  success: () => vibrate([12, 60, 20]),
  error: () => vibrate([10, 40, 10, 40, 10]),
  tick: () => vibrate(4),
};

/** Toggle haptics on/off — call from Settings */
export function setHapticsEnabled(enabled: boolean) {
  try {
    localStorage.setItem(HAPTICS_KEY, String(enabled));
  } catch {
    // ignore
  }
}

export function getHapticsEnabled(): boolean {
  return isHapticsEnabled();
}
