/**
 * Adaptive Intelligence Layer — Language System
 * LifeOS | Wave 1
 *
 * This file is the canonical source of truth for all copy used in the
 * Adaptive Intelligence Layer. Every string here was chosen deliberately.
 * The tone is: calm, clear, observant, compassionate, practical.
 *
 * Core principle: Do not punish interruption. Design for return.
 *
 * Before changing any copy here, ask:
 *   — Does this reduce shame or increase it?
 *   — Does this welcome the user back or remind them they were gone?
 *   — Is this honest without being harsh?
 *   — Would a person who is already struggling feel seen by this?
 */

// ─────────────────────────────────────────────
// RE-ENTRY LANGUAGE
// Used when a user returns after an absence of 2+ days.
// Principle: The first thing they read must not make them feel worse.
// ─────────────────────────────────────────────

export const REENTRY = {
  /** Headline shown on the re-entry card. Warm, not dramatic. */
  headline: "Welcome back.",

  /** Subheadline. Acknowledges the gap without dwelling on it. */
  subheadline: "You're here now. That's what matters.",

  /** Body copy for the re-entry flow. One paragraph, no guilt. */
  body: "Life gets full. You don't need to catch up on everything — just begin with one small thing. LifeOS will meet you exactly where you are.",

  /** Button label. Action-oriented but gentle. NOT "Resume" (implies failure to pause). */
  ctaLabel: "Begin with one small win",

  /** Secondary option. For users who need even less friction. */
  ctaSecondary: "Just check in",

  /** What still matters — section title */
  stillMattersTitle: "What still matters",

  /** What can wait — section title */
  canWaitTitle: "What can wait",

  /** Oracle re-entry greeting (shown in Oracle chat after absence) */
  oracleGreeting: (dayCount: number) =>
    dayCount === 1
      ? "Good to see you. How are you landing today?"
      : `It's been a little while. Welcome back — no recap needed. What feels most alive for you right now?`,

  /** Shown on Dashboard when user has been absent 2+ days */
  dashboardBanner: "You've been away for a bit. No pressure — let's start gently.",

  /** Button label on the dashboard banner */
  dashboardBannerCta: "Re-enter today",
} as const;

// ─────────────────────────────────────────────
// STREAK ALTERNATIVE LANGUAGE — THE BETTER MIRROR
// We do not track "streaks." We track what is actually true.
// Principle: Progress is not "never getting off track."
//            It is how gently and quickly you come back.
// ─────────────────────────────────────────────

export const BETTER_MIRROR = {
  /** Section title replacing "Streak" in the Standards module */
  sectionTitle: "Your Consistency Mirror",

  /** Subtitle explaining the philosophy */
  sectionSubtitle: "A more honest picture of how you show up over time.",

  /** Return Rate label */
  returnRateLabel: "Return Rate",
  returnRateDescription: "How often you come back after stepping away.",

  /** Reset Speed label */
  resetSpeedLabel: "Reset Speed",
  resetSpeedDescription: "How quickly you re-engage after a gap. Faster over time means growth.",

  /** Kept Promises label */
  keptPromisesLabel: "Kept Promises",
  keptPromisesDescription: "The number of times you showed up for yourself, even in a small way.",

  /** Gentle Consistency label */
  gentleConsistencyLabel: "Gentle Consistency",
  gentleConsistencyDescription: "Your overall pattern of engagement — not perfection, but presence.",

  /** Identity language shown after completing a habit */
  habitCompletionIdentity: "You're the kind of person who shows up.",

  /** Identity language shown after a re-entry */
  reentryIdentity: "You're the kind of person who comes back.",

  /** Identity language shown after a reset */
  resetIdentity: "Returning counts. Every time.",

  /** What used to say "You broke your streak" — now says: */
  gapAcknowledgement: "You stepped away for a bit. Welcome back.",

  /** What used to say "X day streak" — now says: */
  consistencyLabel: (returnCount: number) =>
    returnCount === 1
      ? "First return"
      : `${returnCount} returns`,

  /** Shown when user has a high return rate */
  highReturnRateMessage: "You return consistently. That's one of the most powerful things a person can do.",

  /** Shown when reset speed is improving */
  improvingResetSpeedMessage: "You're coming back faster than before. That's real growth.",

  /** Overcommitment warning — shown when user adds 5+ daily habits */
  overcommitWarning: "You're building a full day of commitments. That's great energy — and it's worth asking: which three of these matter most today? Fewer promises kept is better than many promises broken.",

  /** Minimum viable habit labels */
  habitFullLabel: "Full practice",
  habitSmallLabel: "Short version",
  habitTinyLabel: "Tiny version — just to stay connected",
} as const;

// ─────────────────────────────────────────────
// LOW BANDWIDTH MODE LANGUAGE
// Used when the user activates simplified view.
// Principle: No clutter. No guilt. One thing at a time.
// ─────────────────────────────────────────────

export const LOW_BANDWIDTH = {
  /** Toggle label in Dashboard */
  toggleLabel: "Simplify my view",

  /** Toggle description */
  toggleDescription: "One thing at a time. No clutter.",

  /** Headline shown in Low Bandwidth Mode */
  headline: "One thing at a time.",

  /** Subheadline */
  subheadline: "You don't have to do everything today. Here's what matters most right now.",

  /** Section: Next step */
  nextStepLabel: "Your one next step",

  /** Section: Grounding prompt */
  groundingLabel: "A moment to ground",

  /** Section: Unfinished priority */
  unfinishedLabel: "One thing still open",

  /** Section: Reset option */
  resetLabel: "Need a reset?",

  /** Exit label */
  exitLabel: "See full view",

  /** Shown when there's nothing urgent */
  allClearMessage: "Nothing urgent. This is a good day to rest, reflect, or do one small thing.",
} as const;

// ─────────────────────────────────────────────
// NEURODIVERGENT-AWARE ONBOARDING LANGUAGE
// Used in the "How my mind works" step of the Alignment Audit.
// Principle: Non-clinical. No diagnosis. Just lived patterns.
// ─────────────────────────────────────────────

export const ONBOARDING_PATTERNS = {
  /** Step title */
  stepTitle: "How your mind works",

  /** Step subtitle — sets the tone before any options appear */
  stepSubtitle:
    "LifeOS works better when it knows how you actually function — not how you think you should. None of these are problems. They're just patterns. Select anything that feels true.",

  /** Reassurance note below the options */
  reassuranceNote:
    "Your selections stay private and help LifeOS adapt to you. You can change them anytime in your profile.",

  /** The pattern options — non-clinical, first-person language */
  patterns: [
    { id: "scattered", label: "I often feel scattered or overwhelmed", icon: "wind" },
    { id: "initiation", label: "Starting tasks is harder than finishing them", icon: "play" },
    { id: "time_blindness", label: "I lose track of time easily", icon: "clock" },
    { id: "inconsistent_energy", label: "My focus and energy are inconsistent day to day", icon: "zap" },
    { id: "reading_fatigue", label: "Reading or writing for long periods is tiring", icon: "book" },
    { id: "perfectionism", label: "I get stuck trying to do things perfectly", icon: "target" },
    { id: "shame_spirals", label: "I tend to disappear when I fall behind", icon: "arrow-down" },
    { id: "sensory_overload", label: "Busy or cluttered environments affect my focus", icon: "layers" },
    { id: "open_loops", label: "I carry a lot of unfinished thoughts and tasks", icon: "circle" },
    { id: "nonlinear", label: "I think and work in a nonlinear way", icon: "shuffle" },
  ] as const,

  /** Support preference options */
  supportPreferencesTitle: "How would you like LifeOS to support you?",
  supportPreferences: [
    { id: "fewer_words", label: "Fewer words, more clarity" },
    { id: "audio_first", label: "Audio over reading when possible" },
    { id: "one_step", label: "One step at a time, not a list" },
    { id: "gentle_reminders", label: "Gentle nudges, not alerts" },
    { id: "low_stimulation", label: "Calm, minimal interface" },
    { id: "voice_input", label: "I prefer speaking over typing" },
    { id: "accountability", label: "I want stronger accountability" },
    { id: "dyslexia_mode", label: "Easier-to-read text and spacing" },
  ] as const,
} as const;

// ─────────────────────────────────────────────
// SHAME INTERRUPT LANGUAGE
// Used when a user signals they are behind, overwhelmed, or in a spiral.
// Principle: Regulation first. Reality-based reframing. One next step.
// ─────────────────────────────────────────────

export const SHAME_INTERRUPT = {
  /** Headline */
  headline: "You're not behind. You're here.",

  /** Body */
  body: "Falling off is part of the process — not evidence that you can't do this. The only thing that matters right now is one small next step.",

  /** Reframe prompts shown as options */
  reframes: [
    "I fell behind, but I haven't quit.",
    "Returning is progress.",
    "Today is a new starting point.",
    "Small follow-through matters.",
    "Consistency includes repair.",
  ],

  /** CTA */
  ctaLabel: "Find my one next step",

  /** Oracle shame-interrupt opening */
  oracleOpening:
    "It sounds like you've been hard on yourself. Before we figure out what's next — how are you actually doing right now?",
} as const;

// ─────────────────────────────────────────────
// ORACLE ADAPTIVE LANGUAGE
// Tone guidelines for Oracle responses in the Adaptive Intelligence Layer.
// ─────────────────────────────────────────────

export const ORACLE_ADAPTIVE = {
  /** System prompt addition for neurodivergent-aware Oracle responses */
  systemPromptAddition: `
You are speaking with someone who may be dealing with executive function challenges, shame spirals, or inconsistency.
Your tone must be: calm, clear, observant, compassionate, and practical.
Never sound like you are scolding, disappointed, or correcting.
Never use productivity language that implies the user should be doing more.
If the user signals they are stuck, overwhelmed, or behind:
  1. Acknowledge their state first.
  2. Offer one small, concrete next step.
  3. Remind them that returning is the skill.
Do not celebrate streaks. Celebrate returns.
Do not measure success by output. Measure it by honest engagement.
`,

  /** "Why am I stuck?" mode opening */
  whyStuckOpening:
    "Let's figure this out together. What does 'stuck' feel like right now — is it more like fog, like dread, like too many things at once, or something else?",

  /** Pattern mirror observation examples */
  patternObservations: [
    "You tend to engage more deeply in the mornings — your journal entries from that time are longer and more reflective.",
    "When you set more than three daily habits, your return rate drops. Fewer commitments seem to work better for you.",
    "You've come back after every gap so far. That's a pattern worth noticing.",
    "Your writing flows more freely on days when you start with a voice note or a quick check-in.",
  ],
} as const;

export type PatternId = typeof ONBOARDING_PATTERNS.patterns[number]["id"];
export type SupportPreferenceId = typeof ONBOARDING_PATTERNS.supportPreferences[number]["id"];
