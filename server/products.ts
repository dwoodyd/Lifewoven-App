/**
 * Lifewoven Product Catalog
 * S3 URLs are permanent CDN links (uploaded via manus-upload-file --webdev).
 * Prices are in USD cents for PayPal.
 */

export interface LWProduct {
  slug: string;
  title: string;
  subtitle: string;
  type: "course" | "workbook" | "script" | "deck" | "bundle";
  priceUsd: number;       // display price
  priceCents: number;     // PayPal amount in cents
  description: string;
  s3Key: string;          // relative S3 key — used to generate a short-lived presigned download URL
  paypalProductId?: string; // PayPal product ID if needed
}

export const LIFEWOVEN_PRODUCTS: LWProduct[] = [
  {
    slug: "alignment-fundamentals",
    title: "Alignment Fundamentals",
    subtitle: "The 5S Framework Foundation Course",
    type: "course",
    priceUsd: 97,
    priceCents: 9700,
    description: "A foundational course introducing the 5S Framework — State, Story, Standards, Strategy, and Stewardship — as an integrated system for personal transformation. Includes guided exercises, reflection prompts, and a complete framework overview.",
    s3Key: "01-alignment-fundamentals_acd0d3be.pdf",
  },
  {
    slug: "the-alignment-current",
    title: "The Alignment Current",
    subtitle: "Advanced Alignment Practice",
    type: "course",
    priceUsd: 147,
    priceCents: 14700,
    description: "A deeper dive into living in continuous alignment — moving beyond the fundamentals into daily practice, energy management, and the art of returning to center when life disrupts your flow.",
    s3Key: "02-alignment-current_7c705453.pdf",
  },
  {
    slug: "identity-in-motion",
    title: "Identity in Motion",
    subtitle: "Who You Are Becoming",
    type: "course",
    priceUsd: 127,
    priceCents: 12700,
    description: "A course on identity-level change — how to move from behavior modification to becoming the person who naturally produces the results you want. Grounded in the Story module and the science of identity-based habits.",
    s3Key: "03-identity-in-motion_a97650c6.pdf",
  },
  {
    slug: "the-meaning-foundation",
    title: "The Meaning Foundation",
    subtitle: "Purpose, Why, and the Story You Tell",
    type: "course",
    priceUsd: 97,
    priceCents: 9700,
    description: "A course on finding and building meaning — drawing on Frankl's logotherapy, the Stewardship module, and the Lifewoven approach to purpose-driven living. Includes the Meaning Audit and guided journaling sequences.",
    s3Key: "04-meaning-foundation_d6836a6a.pdf",
  },
  {
    slug: "belief-rewrite-workbook",
    title: "Belief Rewrite Workbook",
    subtitle: "Rewrite the Stories Holding You Back",
    type: "workbook",
    priceUsd: 19,
    priceCents: 1900,
    description: "A printable and digital workbook for surfacing, examining, and rewriting limiting beliefs. Structured around the Story module's Belief Rewrite process — 30+ prompts, worksheets, and a step-by-step rewrite protocol.",
    s3Key: "05-belief-rewrite-workbook_d99a06fc.pdf",
  },
  {
    slug: "identity-stack-workbook",
    title: "The Identity Stack Workbook",
    subtitle: "Build Your Identity from the Inside Out",
    type: "workbook",
    priceUsd: 22,
    priceCents: 2200,
    description: "A structured workbook for building a layered identity architecture — values, beliefs, standards, and identity statements — using the Lifewoven Identity Stack methodology. Designed for deep, one-time work that anchors everything else.",
    s3Key: "06-identity-stack-workbook_329c7c09.pdf",
  },
  {
    slug: "morning-alignment-audio",
    title: "Morning Alignment Series",
    subtitle: "7 Narrated Scripts",
    type: "script",
    priceUsd: 37,
    priceCents: 3700,
    description: "Seven narrated morning-practice scripts — each approximately 15 minutes — designed to set your state, anchor your identity, and align your energy before the day begins.",
    s3Key: "07-morning-alignment-series_de6182e4.pdf",
  },
  {
    slug: "reset-audio",
    title: "The Reset Protocol",
    subtitle: "The 45-Minute Guided Script",
    type: "script",
    priceUsd: 27,
    priceCents: 2700,
    description: "The complete guided script for the Reset protocol — a 45-minute practice you can read through at your own pace, or record in your own voice.",
    s3Key: "08-reset-audio_fe10df5d.pdf",
  },
  {
    slug: "wisdom-card-deck",
    title: "Wisdom Card Deck",
    subtitle: "52 Cards — One Year of Practice",
    type: "deck",
    priceUsd: 34,
    priceCents: 3400,
    description: "A 52-card digital deck drawing from Mind Science, Vibrational Alignment, Meaning-Centered Philosophy, and Behavioral Science. One card per week for a year — each with a reflection prompt, a practice, and a quote from the Lifewoven lineage.",
    s3Key: "09-wisdom-card-deck_9cbb5215.pdf",
  },
  {
    slug: "complete-bundle",
    title: "Complete Lifewoven Bundle",
    subtitle: "All 9 Products — Courses, Workbooks, Guided Scripts & Card Deck",
    type: "bundle",
    priceUsd: 297,
    priceCents: 29700,
    description: "Every Lifewoven product in one purchase: 4 courses, 2 workbooks, 2 guided scripts, and the Wisdom Card Deck.",
    s3Key: "",
  },
];

export function getAllProducts(): LWProduct[] {
  return LIFEWOVEN_PRODUCTS;
}

export function getProductBySlug(slug: string): LWProduct | undefined {
  return LIFEWOVEN_PRODUCTS.find(p => p.slug === slug);
}
