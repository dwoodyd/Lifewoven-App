// Steadora Stripe Products & Prices
// These are created dynamically on first use via the Stripe API.
// Price IDs are stored in env after first creation, or looked up by product metadata.

export const PLANS = {
  explorer: {
    name: "Explorer",
    tier: "explorer" as const,
    price: 0,
    description: "Free access to core Steadora features.",
  },
  seeker: {
    name: "Seeker",
    tier: "seeker" as const,
    price: 1900, // cents
    interval: "month" as const,
    description: "Full access including Ground Guide AI and weekly reflections.",
    features: [
      "All 5S Modules",
      "Before the Words full suite",
      "Ground Guide AI reflection",
      "Weekly AI reflection (Closing the Gap)",
      "Unlimited journal entries",
      "All Pathways",
    ],
  },
  oracle: {
    name: "Oracle",
    tier: "oracle" as const,
    price: 4900, // cents
    interval: "month" as const,
    description: "Everything in Seeker plus Oracle AI, priority support, and early access.",
    features: [
      "Everything in Seeker",
      "Oracle AI (unlimited sessions)",
      "Priority support",
      "Early access to new features",
      "Alignment Audit deep analysis",
    ],
  },
} as const;

export type PlanTier = "explorer" | "seeker" | "oracle";

export function tierCanAccessGroundGuide(tier: PlanTier | null | undefined): boolean {
  return tier === "seeker" || tier === "oracle";
}

export function tierCanAccessWeeklyReflection(tier: PlanTier | null | undefined): boolean {
  return tier === "seeker" || tier === "oracle";
}

export function tierCanAccessOracle(tier: PlanTier | null | undefined): boolean {
  return tier === "oracle";
}
