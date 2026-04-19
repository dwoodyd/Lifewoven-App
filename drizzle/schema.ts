import {
  boolean,
  decimal,
  int,
  json,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

// ─── Users ────────────────────────────────────────────────────────────────────

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  membershipTier: mysqlEnum("membershipTier", ["explorer", "seeker", "oracle"]).default("explorer").notNull(),
  membershipExpiresAt: timestamp("membershipExpiresAt"),
  stripeCustomerId: varchar("stripeCustomerId", { length: 255 }),
  stripeSubscriptionId: varchar("stripeSubscriptionId", { length: 255 }),
  onboardingCompleted: boolean("onboardingCompleted").default(false).notNull(),
  primaryPathway: varchar("primaryPathway", { length: 64 }),
  avatarUrl: text("avatarUrl"),
  bio: text("bio"),
  // Adaptive Intelligence Layer — Wave 1
  mindPatterns: json("mindPatterns"),           // PatternId[] — how my mind works
  supportPreferences: json("supportPreferences"), // SupportPreferenceId[]
  lowBandwidthMode: boolean("lowBandwidthMode").default(false).notNull(),
  lastActiveAt: timestamp("lastActiveAt"),       // for re-entry detection
  // Better Mirror metrics
  returnCount: int("returnCount").default(0).notNull(),
  keptPromisesCount: int("keptPromisesCount").default(0).notNull(),
  avgResetSpeedDays: decimal("avgResetSpeedDays", { precision: 5, scale: 1 }),
  gentleConsistencyScore: int("gentleConsistencyScore").default(0).notNull(), // 0-100
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ─── Alignment Audit ──────────────────────────────────────────────────────────

export const auditResults = mysqlTable("audit_results", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  answers: json("answers").notNull(), // { questionId: score }
  scores: json("scores").notNull(),   // { state: 0-100, story: 0-100, ... }
  recommendedPathway: varchar("recommendedPathway", { length: 64 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ─── Daily Check-ins ──────────────────────────────────────────────────────────

export const checkIns = mysqlTable("check_ins", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  emotionalScore: int("emotionalScore").notNull(), // 1-22 (Emotional Guidance Scale)
  energyLevel: int("energyLevel").notNull(),       // 1-10
  clarityLevel: int("clarityLevel").notNull(),     // 1-10
  note: text("note"),
  module: varchar("module", { length: 32 }),       // which 5S module triggered this
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ─── Journal Entries ──────────────────────────────────────────────────────────

export const journalEntries = mysqlTable("journal_entries", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  title: varchar("title", { length: 255 }),
  content: text("content").notNull(),
  module: mysqlEnum("module", ["state", "story", "standards", "strategy", "stewardship", "free"]).default("free").notNull(),
  pathway: varchar("pathway", { length: 64 }),
  tags: json("tags"),               // string[]
  emotionalScore: int("emotionalScore"), // linked check-in score
  aiReflection: text("aiReflection"),   // AI-generated reflection
  isPrivate: boolean("isPrivate").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// ─── Habits ───────────────────────────────────────────────────────────────────

export const habits = mysqlTable("habits", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  module: mysqlEnum("module", ["state", "story", "standards", "strategy", "stewardship"]).default("standards").notNull(),
  cue: text("cue"),
  reward: text("reward"),
  identityStatement: text("identityStatement"), // "I am the type of person who..."
  frequency: mysqlEnum("frequency", ["daily", "weekly", "custom"]).default("daily").notNull(),
  targetDays: json("targetDays"),  // [0,1,2,3,4,5,6] for custom
  isActive: boolean("isActive").default(true).notNull(),
  streak: int("streak").default(0).notNull(),
  longestStreak: int("longestStreak").default(0).notNull(),
  // Adaptive Intelligence Layer — Minimum Viable Habits
  fullVersion: text("fullVersion"),   // e.g. "15 min meditation"
  smallVersion: text("smallVersion"), // e.g. "5 min meditation"
  tinyVersion: text("tinyVersion"),   // e.g. "1 min breath reset"
  // Better Mirror
  returnCount: int("returnCount").default(0).notNull(),
  lastCompletedAt: timestamp("lastCompletedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const habitLogs = mysqlTable("habit_logs", {
  id: int("id").autoincrement().primaryKey(),
  habitId: int("habitId").notNull(),
  userId: int("userId").notNull(),
  completedAt: timestamp("completedAt").defaultNow().notNull(),
  note: text("note"),
  quality: int("quality"), // 1-5 self-rating
});

// ─── Daily Scorecard ──────────────────────────────────────────────────────────

export const scorecards = mysqlTable("scorecards", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  date: varchar("date", { length: 10 }).notNull(), // YYYY-MM-DD
  standards: json("standards").notNull(),          // { habitId: boolean }
  overallScore: int("overallScore"),               // 0-100
  wins: text("wins"),
  improvements: text("improvements"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ─── Beliefs (Story Module) ───────────────────────────────────────────────────

export const beliefs = mysqlTable("beliefs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  limitingBelief: text("limitingBelief").notNull(),
  empoweringBelief: text("empoweringBelief"),
  evidence: text("evidence"),
  affirmation: text("affirmation"),
  category: mysqlEnum("category", ["self", "money", "relationships", "health", "purpose", "other"]).default("self").notNull(),
  isRewritten: boolean("isRewritten").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// ─── Decisions (Strategy Module) ─────────────────────────────────────────────

export const decisions = mysqlTable("decisions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  context: text("context"),
  options: json("options"),           // { option: string, pros: string[], cons: string[], secondOrder: string }[]
  chosenOption: text("chosenOption"),
  reasoning: text("reasoning"),
  secondOrderEffects: text("secondOrderEffects"),
  outcome: text("outcome"),           // filled in later
  outcomeRating: int("outcomeRating"), // 1-10
  status: mysqlEnum("status", ["pending", "decided", "reviewing", "closed"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// ─── Energy Audits (Stewardship Module) ──────────────────────────────────────

export const energyAudits = mysqlTable("energy_audits", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  date: varchar("date", { length: 10 }).notNull(),
  sleepHours: decimal("sleepHours", { precision: 4, scale: 1 }),
  movementMinutes: int("movementMinutes"),
  sunExposure: boolean("sunExposure").default(false),
  screenTimeHours: decimal("screenTimeHours", { precision: 4, scale: 1 }),
  dopamineAudit: json("dopamineAudit"), // { trigger: string, rating: 1-5 }[]
  energyScore: int("energyScore"),      // 1-10
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ─── Oracle Insights ──────────────────────────────────────────────────────────

export const oracleInsights = mysqlTable("oracle_insights", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  type: mysqlEnum("type", ["pattern", "recommendation", "reflection", "nudge"]).notNull(),
  module: varchar("module", { length: 32 }),
  content: text("content").notNull(),
  sourceData: json("sourceData"), // what data triggered this insight
  isRead: boolean("isRead").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const oracleConversations = mysqlTable("oracle_conversations", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  messages: json("messages").notNull(), // { role, content, timestamp }[]
  context: json("context"),             // snapshot of user data used
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// ─── Pathways ─────────────────────────────────────────────────────────────────

export const userPathways = mysqlTable("user_pathways", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  pathway: varchar("pathway", { length: 64 }).notNull(),
  status: mysqlEnum("status", ["active", "completed", "paused"]).default("active").notNull(),
  currentStep: int("currentStep").default(0).notNull(),
  totalSteps: int("totalSteps").default(0).notNull(),
  startedAt: timestamp("startedAt").defaultNow().notNull(),
  completedAt: timestamp("completedAt"),
});

// ─── Pathway Sessions ───────────────────────────────────────────────────────

export const pathwaySessions = mysqlTable("pathway_sessions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  pathway: varchar("pathway", { length: 64 }).notNull(),
  stepsCompleted: int("stepsCompleted").notNull(),
  totalSteps: int("totalSteps").notNull(),
  completedAt: timestamp("completedAt").defaultNow().notNull(),
});

export type PathwaySession = typeof pathwaySessions.$inferSelect;

// ─── Resources ────────────────────────────────────────────────────────────────

export const resources = mysqlTable("resources", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  type: mysqlEnum("type", ["audio", "text", "video", "pdf", "affirmation"]).notNull(),
  module: mysqlEnum("module", ["state", "story", "standards", "strategy", "stewardship", "all"]).default("all").notNull(),
  pathway: varchar("pathway", { length: 64 }),
  contentUrl: text("contentUrl"),
  thumbnailUrl: text("thumbnailUrl"),
  duration: int("duration"),            // seconds for audio/video
  author: varchar("author", { length: 255 }),
  isPublicDomain: boolean("isPublicDomain").default(false),
  requiredTier: mysqlEnum("requiredTier", ["free", "core", "premium"]).default("free").notNull(),
  sortOrder: int("sortOrder").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ─── Courses ──────────────────────────────────────────────────────────────────

export const courses = mysqlTable("courses", {
  id: int("id").autoincrement().primaryKey(),
  slug: varchar("slug", { length: 128 }).notNull().unique(),
  title: varchar("title", { length: 255 }).notNull(),
  subtitle: text("subtitle"),
  description: text("description"),
  instructor: varchar("instructor", { length: 255 }),
  thumbnailUrl: text("thumbnailUrl"),
  module: mysqlEnum("module", ["state", "story", "standards", "strategy", "stewardship", "all"]).default("all").notNull(),
  price: decimal("price", { precision: 8, scale: 2 }).notNull(),
  originalPrice: decimal("originalPrice", { precision: 8, scale: 2 }),
  lessonsCount: int("lessonsCount").default(0),
  durationHours: decimal("durationHours", { precision: 5, scale: 1 }),
  level: mysqlEnum("level", ["beginner", "intermediate", "advanced"]).default("beginner").notNull(),
  isPublished: boolean("isPublished").default(false).notNull(),
  isFeatured: boolean("isFeatured").default(false).notNull(),
  sortOrder: int("sortOrder").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const enrollments = mysqlTable("enrollments", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  courseId: int("courseId").notNull(),
  progress: int("progress").default(0).notNull(), // 0-100
  completedAt: timestamp("completedAt"),
  enrolledAt: timestamp("enrolledAt").defaultNow().notNull(),
});

// ─── Digital Products ─────────────────────────────────────────────────────────

export const products = mysqlTable("products", {
  id: int("id").autoincrement().primaryKey(),
  slug: varchar("slug", { length: 128 }).notNull().unique(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  type: mysqlEnum("type", ["workbook", "card_deck", "audio_bundle", "planner", "guide"]).notNull(),
  price: decimal("price", { precision: 8, scale: 2 }).notNull(),
  thumbnailUrl: text("thumbnailUrl"),
  downloadUrl: text("downloadUrl"),
  isPublished: boolean("isPublished").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const orders = mysqlTable("orders", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  items: json("items").notNull(), // { type: 'course'|'product', id: number, price: number }[]
  total: decimal("total", { precision: 8, scale: 2 }).notNull(),
  status: mysqlEnum("status", ["pending", "completed", "refunded"]).default("pending").notNull(),
  stripeSessionId: varchar("stripeSessionId", { length: 255 }),
  stripeProductId: varchar("stripeProductId", { length: 255 }),
  stripePriceId: varchar("stripePriceId", { length: 255 }),
  paypalCaptureId: varchar("paypalCaptureId", { length: 255 }),
  productSlug: varchar("productSlug", { length: 128 }),
  downloadUrl: text("downloadUrl"),
  downloadToken: varchar("downloadToken", { length: 128 }),
  downloadExpiresAt: timestamp("downloadExpiresAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ─── Community ────────────────────────────────────────────────────────────────


// ─── Referrals ────────────────────────────────────────────────────────────────

export const referrals = mysqlTable("referrals", {
  id: int("id").autoincrement().primaryKey(),
  referrerId: int("referrer_id").notNull(),
  refereeId: int("referee_id"),
  code: varchar("code", { length: 16 }).notNull().unique(),
  creditCents: int("credit_cents").notNull().default(0),
  usedAt: timestamp("used_at"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const referralCredits = mysqlTable("referral_credits", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull().unique(),
  balanceCents: int("balance_cents").notNull().default(0),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const communityPosts = mysqlTable("community_posts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  title: varchar("title", { length: 255 }),
  content: text("content").notNull(),
  category: mysqlEnum("category", ["share", "question", "win", "support", "workshop"]).default("share").notNull(),
  pathway: varchar("pathway", { length: 64 }),
  module: varchar("module", { length: 32 }),
  likesCount: int("likesCount").default(0).notNull(),
  commentsCount: int("commentsCount").default(0).notNull(),
  isPinned: boolean("isPinned").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const communityComments = mysqlTable("community_comments", {
  id: int("id").autoincrement().primaryKey(),
  postId: int("postId").notNull(),
  userId: int("userId").notNull(),
  content: text("content").notNull(),
  likesCount: int("likesCount").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ─── Overflow Capture (Adaptive Intelligence Layer) ─────────────────────────

export const overflowCaptures = mysqlTable("overflow_captures", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  content: text("content").notNull(),
  type: mysqlEnum("type", ["idea", "reminder", "thought", "task", "worry", "other"]).default("other").notNull(),
  isSorted: boolean("isSorted").default(false).notNull(),
  sortedTo: varchar("sortedTo", { length: 64 }), // module or pathway it was moved to
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const communityLikes = mysqlTable("community_likes", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  postId: int("postId"),
  commentId: int("commentId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ─── Before the Words (BTW) ───────────────────────────────────────────────────

export const btwProfiles = mysqlTable("btw_profiles", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  preferredMode: mysqlEnum("preferredMode", ["text", "audio", "silent"]).default("text").notNull(),
  audioEnabled: boolean("audioEnabled").default(true).notNull(),
  faithLanguageConfirmed: boolean("faithLanguageConfirmed").default(false).notNull(),
  lastPrimaryState: varchar("lastPrimaryState", { length: 32 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const btwGroundChecks = mysqlTable("btw_ground_checks", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  stateResult: mysqlEnum("stateResult", ["bracing", "striving", "drifting", "depleted", "settled"]).notNull(),
  answersJson: json("answersJson").notNull(),
  recommendedPractice: varchar("recommendedPractice", { length: 64 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const btwDailySessions = mysqlTable("btw_daily_sessions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  sessionType: mysqlEnum("sessionType", ["morning", "midday", "evening", "return", "emergency"]).notNull(),
  durationSeconds: int("durationSeconds"),
  startedAt: timestamp("startedAt").defaultNow().notNull(),
  completedAt: timestamp("completedAt"),
  completed: boolean("completed").default(false).notNull(),
  stateBeforeId: varchar("stateBeforeId", { length: 32 }),
  stateAfterId: varchar("stateAfterId", { length: 32 }),
});

export const btwReturns = mysqlTable("btw_returns", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  returnType: mysqlEnum("returnType", ["30sec", "2min", "fear", "discouragement", "depletion"]).notNull(),
  triggerTag: varchar("triggerTag", { length: 64 }),
  beforeState: varchar("beforeState", { length: 32 }),
  afterState: varchar("afterState", { length: 32 }),
  nextAction: text("nextAction"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const btwPrayers = mysqlTable("btw_prayers", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  title: varchar("title", { length: 255 }),
  body: text("body").notNull(),
  toneTag: mysqlEnum("toneTag", ["trust", "fear", "striving", "grief", "gratitude", "honest", "mixed"]).default("honest").notNull(),
  topicTag: mysqlEnum("topicTag", ["long_wait", "fear", "provision", "relationship", "calling", "grief", "uncertainty", "gratitude", "not_yet", "answered", "still_carrying"]).default("still_carrying").notNull(),
  statusTag: mysqlEnum("statusTag", ["carrying", "released", "answered", "returning"]).default("carrying").notNull(),
  isPrivate: boolean("isPrivate").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const btwGratitudeEntries = mysqlTable("btw_gratitude_entries", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  entryText: text("entryText").notNull(),
  gratitudeType: mysqlEnum("gratitudeType", ["morning", "evening", "sparse_table", "hard_day", "specific_mercy"]).default("evening").notNull(),
  feltRealness: mysqlEnum("feltRealness", ["real", "forced", "mixed"]).default("real").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const btwAudioItems = mysqlTable("btw_audio_items", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  type: mysqlEnum("type", ["prayer", "declaration", "voice_note", "scripture"]).notNull(),
  title: varchar("title", { length: 255 }),
  sourceType: mysqlEnum("sourceType", ["recorded", "uploaded", "library"]).default("recorded").notNull(),
  fileUrlOrText: text("fileUrlOrText").notNull(),
  favorite: boolean("favorite").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const btwWeeklyReflections = mysqlTable("btw_weekly_reflections", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  summaryJson: json("summaryJson").notNull(),
  focusSuggestion: text("focusSuggestion"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ─── Beta Access ──────────────────────────────────────────────────────────────

export const betaCodes = mysqlTable("beta_codes", {
  id: int("id").autoincrement().primaryKey(),
  code: varchar("code", { length: 32 }).notNull().unique(),
  label: varchar("label", { length: 128 }),          // e.g. "Tester - Jane Smith"
  maxUses: int("maxUses").default(1).notNull(),
  usedCount: int("usedCount").default(0).notNull(),
  durationDays: int("durationDays").default(45).notNull(),
  createdBy: int("createdBy").notNull(),              // admin userId
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  expiresAt: timestamp("expiresAt"),                 // optional hard expiry for the code itself
});

export const betaAccess = mysqlTable("beta_access", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  betaCodeId: int("betaCodeId").notNull(),
  activatedAt: timestamp("activatedAt").defaultNow().notNull(),
  expiresAt: timestamp("expiresAt").notNull(),       // activatedAt + durationDays
  notifiedAt: timestamp("notifiedAt"),               // when expiry warning was shown
});

export const events = mysqlTable("events", {
  id:         int("id").autoincrement().primaryKey(),
  userId:     int("user_id"),
  event:      varchar("event", { length: 128 }).notNull(),
  properties: text("properties"),
  createdAt:  int("created_at").notNull(),
});
