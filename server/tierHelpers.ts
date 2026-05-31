/**
 * Tier access helpers — PayPal-only membership tier access control.
 * These functions determine what features each membership tier can access.
 */

export type PlanTier = "explorer" | "seeker" | "oracle";

export const PLAN_DEFINITIONS = {
  explorer: {
    name: "Explorer",
    tier: "explorer" as const,
    priceMonthly: 0,
    priceAnnual: 0,
    description: "Free access to core Lifewoven features.",
  },
  seeker: {
    name: "Seeker",
    tier: "seeker" as const,
    priceMonthly: 19,
    priceAnnual: 190,
    description: "Full access including Ground Guide AI and weekly reflections.",
    features: [
      "All 5S Modules",
      "The Ground full suite",
      "Ground Guide AI reflection",
      "Weekly AI reflection (Closing the Gap)",
      "Unlimited journal entries",
      "All Pathways",
    ],
  },
  oracle: {
    name: "Oracle",
    tier: "oracle" as const,
    priceMonthly: 49,
    priceAnnual: 490,
    description: "Everything in Seeker plus Oracle AI, priority support, and early access.",
    features: [
      "Everything in Seeker",
      "Oracle AI (unlimited sessions)",
      "Priority support",
      "Early access to new features",
      "Alignment Audit deep analysis",
      "Full product library included",
    ],
  },
} as const;

export function tierCanAccessGroundGuide(tier: PlanTier | null | undefined): boolean {
  return tier === "seeker" || tier === "oracle";
}

export function tierCanAccessWeeklyReflection(tier: PlanTier | null | undefined): boolean {
  return tier === "seeker" || tier === "oracle";
}

export function tierCanAccessOracle(tier: PlanTier | null | undefined): boolean {
  return tier === "oracle";
}
