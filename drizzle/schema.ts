import {
  boolean,
  decimal,
  index,
  int,
  json,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  uniqueIndex,
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
  paypalSubscriptionId: varchar("paypalSubscriptionId", { length: 255 }),
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
  // Founding member fields
  foundingMember: boolean("foundingMember").default(false).notNull(),
  foundingTier: mysqlEnum("foundingTier", ["explorer", "seeker", "oracle"]).default("explorer"),
  foundingRateLocked: boolean("foundingRateLocked").default(false).notNull(),
  needsIntro: boolean("needsIntro").default(false).notNull(),
  inviteCode: varchar("inviteCode", { length: 32 }),
  // Billing / subscription lifecycle
  billingStatus: mysqlEnum("billingStatus", [
    "trialing_no_card",           // founding member during 90-day beta (no card required)
    "explorer_tier_founding_rate_waiting", // post-beta founding member, dropped to Explorer, rate locked
    "explorer_tier",             // non-founding explorer (no subscription)
    "active",                    // paying subscriber (Seeker or Oracle)
    "cancelled",                 // cancelled subscription
  ]).default("trialing_no_card"),
  betaStartDate: timestamp("betaStartDate"),  // date founding member was admitted
  betaEndDate:   timestamp("betaEndDate"),    // betaStartDate + 90 days
  // Store access level — derived from tier, stored for fast reads
  // library_during_beta: founding member in beta (full library, no payment)
  storeAccess: mysqlEnum("storeAccess", ["standalone", "discount", "library", "library_during_beta"]).default("standalone").notNull(),
  // UI preferences
  luminEnabled: boolean("luminEnabled").default(true).notNull(),
  // Identity Sentence — LLM-generated monthly from behavior data
  identitySentence: text("identitySentence"),
  identitySentenceGeneratedAt: timestamp("identitySentenceGeneratedAt"),
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
}, (t) => [index("idx_audit_results_userId").on(t.userId)]);

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
}, (t) => [index("idx_check_ins_userId").on(t.userId)]);

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
}, (t) => [index("idx_journal_entries_userId").on(t.userId)]);

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
}, (t) => [index("idx_habits_userId").on(t.userId)]);

export const habitLogs = mysqlTable("habit_logs", {
  id: int("id").autoincrement().primaryKey(),
  habitId: int("habitId").notNull(),
  userId: int("userId").notNull(),
  completedAt: timestamp("completedAt").defaultNow().notNull(),
  note: text("note"),
  quality: int("quality"), // 1-5 self-rating
}, (t) => [
  index("idx_habit_logs_userId").on(t.userId),
  index("idx_habit_logs_habitId").on(t.habitId),
]);

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
}, (t) => [index("idx_scorecards_userId").on(t.userId)]);

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
}, (t) => [index("idx_beliefs_userId").on(t.userId)]);

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
}, (t) => [index("idx_decisions_userId").on(t.userId)]);

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
}, (t) => [index("idx_energy_audits_userId").on(t.userId)]);

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
}, (t) => [index("idx_oracle_insights_userId").on(t.userId)]);

export const oracleConversations = mysqlTable("oracle_conversations", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  messages: json("messages").notNull(), // { role, content, timestamp }[]
  context: json("context"),             // snapshot of user data used
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (t) => [index("idx_oracle_conversations_userId").on(t.userId)]);

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
}, (t) => [index("idx_user_pathways_userId").on(t.userId)]);

// ─── Pathway Sessions ───────────────────────────────────────────────────────

export const pathwaySessions = mysqlTable("pathway_sessions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  pathway: varchar("pathway", { length: 64 }).notNull(),
  stepsCompleted: int("stepsCompleted").notNull(),
  totalSteps: int("totalSteps").notNull(),
  completedAt: timestamp("completedAt").defaultNow().notNull(),
}, (t) => [index("idx_pathway_sessions_userId").on(t.userId)]);

export type PathwaySession = typeof pathwaySessions.$inferSelect;

// ─── Pathway Progress ──────────────────────────────────────────────────────────

export const pathwayProgress = mysqlTable("pathway_progress", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  pathway: varchar("pathway", { length: 64 }).notNull(),
  completedSteps: json("completedSteps").$type<number[]>().default([]).notNull(),
  sessionStarted: boolean("sessionStarted").default(false).notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (t) => [
  index("idx_pathway_progress_userId").on(t.userId),
  uniqueIndex("uq_pathway_progress_user_pathway").on(t.userId, t.pathway),
]);

export type PathwayProgress = typeof pathwayProgress.$inferSelect;

// ─── Resources ─────────────────

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
}, (t) => [
  index("idx_enrollments_userId").on(t.userId),
  index("idx_enrollments_courseId").on(t.courseId),
]);

// ─── Digital Products ─────────────────────────────────────────────────────────

export const products = mysqlTable("products", {
  id: int("id").autoincrement().primaryKey(),
  slug: varchar("slug", { length: 128 }).notNull().unique(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  type: mysqlEnum("type", ["course", "workbook", "card_deck", "audio_bundle", "planner", "guide"]).notNull(),
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
}, (t) => [index("idx_orders_userId").on(t.userId)]);

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
}, (t) => [index("idx_referrals_referrerId").on(t.referrerId)]);

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
}, (t) => [index("idx_community_posts_userId").on(t.userId)]);

export const communityComments = mysqlTable("community_comments", {
  id: int("id").autoincrement().primaryKey(),
  postId: int("postId").notNull(),
  userId: int("userId").notNull(),
  content: text("content").notNull(),
  likesCount: int("likesCount").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (t) => [
  index("idx_community_comments_postId").on(t.postId),
  index("idx_community_comments_userId").on(t.userId),
]);

// ─── Overflow Capture (Adaptive Intelligence Layer) ─────────────────────────

export const overflowCaptures = mysqlTable("overflow_captures", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  content: text("content").notNull(),
  type: mysqlEnum("type", ["idea", "reminder", "thought", "task", "worry", "other"]).default("other").notNull(),
  isSorted: boolean("isSorted").default(false).notNull(),
  sortedTo: varchar("sortedTo", { length: 64 }), // module or pathway it was moved to
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (t) => [index("idx_overflow_captures_userId").on(t.userId)]);

export const communityLikes = mysqlTable("community_likes", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  postId: int("postId"),
  commentId: int("commentId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (t) => [
  index("idx_community_likes_userId").on(t.userId),
  index("idx_community_likes_postId").on(t.postId),
]);

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
}, (t) => [index("idx_btw_ground_checks_userId").on(t.userId)]);

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
}, (t) => [index("idx_btw_daily_sessions_userId").on(t.userId)]);

export const btwReturns = mysqlTable("btw_returns", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  returnType: mysqlEnum("returnType", ["30sec", "2min", "fear", "discouragement", "depletion"]).notNull(),
  triggerTag: varchar("triggerTag", { length: 64 }),
  beforeState: varchar("beforeState", { length: 32 }),
  afterState: varchar("afterState", { length: 32 }),
  nextAction: text("nextAction"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (t) => [index("idx_btw_returns_userId").on(t.userId)]);

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
}, (t) => [index("idx_btw_prayers_userId").on(t.userId)]);

export const btwGratitudeEntries = mysqlTable("btw_gratitude_entries", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  entryText: text("entryText").notNull(),
  gratitudeType: mysqlEnum("gratitudeType", ["morning", "evening", "sparse_table", "hard_day", "specific_mercy"]).default("evening").notNull(),
  feltRealness: mysqlEnum("feltRealness", ["real", "forced", "mixed"]).default("real").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (t) => [index("idx_btw_gratitude_userId").on(t.userId)]);

export const btwAudioItems = mysqlTable("btw_audio_items", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  type: mysqlEnum("type", ["prayer", "declaration", "voice_note", "scripture"]).notNull(),
  title: varchar("title", { length: 255 }),
  sourceType: mysqlEnum("sourceType", ["recorded", "uploaded", "library"]).default("recorded").notNull(),
  fileUrlOrText: text("fileUrlOrText").notNull(),
  favorite: boolean("favorite").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (t) => [index("idx_btw_audio_items_userId").on(t.userId)]);

export const btwWeeklyReflections = mysqlTable("btw_weekly_reflections", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  summaryJson: json("summaryJson").notNull(),
  focusSuggestion: text("focusSuggestion"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (t) => [index("idx_btw_weekly_reflections_userId").on(t.userId)]);

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
  betaCodeId: int("betaCodeId"),  // L4: nullable for referral-based access (no beta code)
  activatedAt: timestamp("activatedAt").defaultNow().notNull(),
  expiresAt: timestamp("expiresAt").notNull(),       // activatedAt + durationDays
  notifiedAt: timestamp("notifiedAt"),               // when expiry warning was shown
}, (t) => [index("idx_beta_access_userId").on(t.userId)]);

export const events = mysqlTable("events", {
  id:         int("id").autoincrement().primaryKey(),
  userId:     int("user_id"),
  event:      varchar("event", { length: 128 }).notNull(),
  properties: text("properties"),
  createdAt:  int("created_at").notNull(),
}, (t) => [index("idx_events_userId").on(t.userId)]);

// Referral codes — generated by converted beta users, grant 30-day trial to new users
export const referralCodes = mysqlTable("referral_codes", {
  id:          int("id").autoincrement().primaryKey(),
  code:        varchar("code", { length: 32 }).notNull().unique(),
  ownerId:     int("owner_id").notNull(),   // the converted user who owns this code
  redeemedBy:  int("redeemed_by"),          // user who redeemed it (null if unused)
  redeemedAt:  int("redeemed_at"),          // unix ms
  createdAt:   int("created_at").notNull(),
}, (t) => [index("idx_referral_codes_ownerId").on(t.ownerId)]);

// NOTE: stripeEvents table removed — billing is 100% PayPal. No Stripe integration exists.
// If Stripe is ever added in the future, re-add an idempotency ledger table here.

// ─── Character & Growth ───────────────────────────────────────────────────────
// Books the user is reading / has read — the personal growth library

export const books = mysqlTable("books", {
  id:          int("id").autoincrement().primaryKey(),
  userId:      int("userId").notNull(),
  title:       varchar("title", { length: 255 }).notNull(),
  author:      varchar("author", { length: 255 }),
  coverUrl:    text("coverUrl"),                                   // S3 URL or external
  category:    varchar("category", { length: 64 }),                // e.g. "Mindset", "Leadership"
  status:      mysqlEnum("status", ["want_to_read", "reading", "completed", "paused"]).default("want_to_read").notNull(),
  rating:      int("rating"),                                      // 1-5 stars, nullable
  startedAt:   timestamp("startedAt"),
  finishedAt:  timestamp("finishedAt"),
  createdAt:   timestamp("createdAt").defaultNow().notNull(),
  updatedAt:   timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (t) => [index("idx_books_userId").on(t.userId)]);

export type Book = typeof books.$inferSelect;
export type InsertBook = typeof books.$inferInsert;

// Notes, quotes, and highlights attached to a book
export const bookNotes = mysqlTable("book_notes", {
  id:        int("id").autoincrement().primaryKey(),
  bookId:    int("bookId").notNull(),
  userId:    int("userId").notNull(),
  type:      mysqlEnum("type", ["note", "quote", "highlight", "lesson"]).default("note").notNull(),
  content:   text("content").notNull(),
  chapter:   varchar("chapter", { length: 128 }),                  // optional chapter / page ref
  pageRef:   varchar("pageRef", { length: 32 }),                   // e.g. "p.47"
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (t) => [
  index("idx_book_notes_bookId").on(t.bookId),
  index("idx_book_notes_userId").on(t.userId),
]);

export type BookNote = typeof bookNotes.$inferSelect;
export type InsertBookNote = typeof bookNotes.$inferInsert;

// Free-form reading journal entries — reflections tied to a book (or standalone)
export const characterJournal = mysqlTable("character_journal", {
  id:        int("id").autoincrement().primaryKey(),
  userId:    int("userId").notNull(),
  bookId:    int("bookId"),                                        // nullable — can be standalone
  title:     varchar("title", { length: 255 }),
  content:   text("content").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (t) => [
  index("idx_character_journal_userId").on(t.userId),
  index("idx_character_journal_bookId").on(t.bookId),
]);

export type CharacterJournal = typeof characterJournal.$inferSelect;
export type InsertCharacterJournal = typeof characterJournal.$inferInsert;

// ─── Book Attachments ─────────────────────────────────────────────────────────
// Files uploaded by the user and linked to a book (PDFs, images, Word docs, etc.)
export const bookAttachments = mysqlTable("book_attachments", {
  id:        int("id").autoincrement().primaryKey(),
  bookId:    int("book_id").notNull(),
  userId:    int("user_id").notNull(),
  fileName:  varchar("file_name", { length: 255 }).notNull(),
  fileUrl:   varchar("file_url", { length: 2048 }).notNull(),
  fileKey:   varchar("file_key", { length: 512 }).notNull(),
  mimeType:  varchar("mime_type", { length: 128 }).notNull().default("application/octet-stream"),
  fileSize:  int("file_size").notNull().default(0),   // bytes
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (t) => [
  index("idx_book_attachments_bookId").on(t.bookId),
  index("idx_book_attachments_userId").on(t.userId),
]);

export type BookAttachment = typeof bookAttachments.$inferSelect;
export type InsertBookAttachment = typeof bookAttachments.$inferInsert;

// ─── Mood Rhythm / Emotional Cycle Tracker ───────────────────────────────────
// One entry per day — a simple 1-10 mood score logged each evening.
// Used to detect the user's personal emotional cycle length (Hersey/Dewey research).
export const moodLogs = mysqlTable("mood_logs", {
  id:        int("id").autoincrement().primaryKey(),
  userId:    int("user_id").notNull(),
  logDate:   varchar("log_date", { length: 10 }).notNull(), // YYYY-MM-DD (user's local date)
  score:     int("score").notNull(),                        // 1-10 (1=very low, 10=elated)
  note:      text("note"),                                  // optional evening reflection
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
}, (t) => [
  index("idx_mood_logs_userId").on(t.userId),
  index("idx_mood_logs_userId_date").on(t.userId, t.logDate),
]);

export type MoodLog = typeof moodLogs.$inferSelect;
export type InsertMoodLog = typeof moodLogs.$inferInsert;

// ─── Founding Member Applications ────────────────────────────────────────────
// Applications submitted via the /apply form on the marketing site.

export const applications = mysqlTable("applications", {
  id:          int("id").autoincrement().primaryKey(),
  name:        varchar("name", { length: 255 }).notNull(),
  email:       varchar("email", { length: 320 }).notNull(),
  answer:      text("answer").notNull(),          // 200-char qualifying answer
  ipAddress:   varchar("ip_address", { length: 64 }),
  userAgent:   text("user_agent"),
  status:      mysqlEnum("status", ["new", "reviewing", "approved", "declined"]).default("new").notNull(),
  reviewedAt:  timestamp("reviewed_at"),
  reviewedBy:  int("reviewed_by"),               // admin userId
  inviteCodeId: int("invite_code_id"),           // FK to inviteCodes.id after approval
  tier:        mysqlEnum("tier", ["explorer", "seeker", "oracle"]).default("seeker").notNull(),
  createdAt:   timestamp("created_at").defaultNow().notNull(),
}, (t) => [
  index("idx_applications_email").on(t.email),
  index("idx_applications_status").on(t.status),
]);

export type Application = typeof applications.$inferSelect;
export type InsertApplication = typeof applications.$inferInsert;

// ─── Founding Member Invite Codes ─────────────────────────────────────────────
// Single-use magic-link codes generated on approval.

export const inviteCodes = mysqlTable("invite_codes", {
  id:           int("id").autoincrement().primaryKey(),
  code:         varchar("code", { length: 32 }).notNull().unique(),
  email:        varchar("email", { length: 320 }).notNull(),
  tier:         mysqlEnum("tier", ["explorer", "seeker", "oracle"]).default("seeker").notNull(),
  applicationId: int("application_id"),          // FK to applications.id
  redeemedBy:   int("redeemed_by"),              // userId after redemption
  redeemedAt:   timestamp("redeemed_at"),
  expiresAt:    timestamp("expires_at").notNull(), // 30 days from creation
  createdAt:    timestamp("created_at").defaultNow().notNull(),
}, (t) => [
  index("idx_invite_codes_code").on(t.code),
  index("idx_invite_codes_email").on(t.email),
]);

export type InviteCode = typeof inviteCodes.$inferSelect;
export type InsertInviteCode = typeof inviteCodes.$inferInsert;

// ─── Subscription Plans ───────────────────────────────────────────────────────
// Admin-managed subscription plan definitions (PayPal-only).
// These are the source of truth for pricing displayed on the Pricing page.

export const subscriptionPlans = mysqlTable("subscription_plans", {
  id:              int("id").autoincrement().primaryKey(),
  name:            varchar("name", { length: 128 }).notNull(),          // e.g. "Seeker Founding Monthly"
  tier:            mysqlEnum("tier", ["explorer", "seeker", "oracle"]).notNull(),
  billingInterval: mysqlEnum("billingInterval", ["monthly", "annual"]).notNull(),
  priceUsd:        decimal("price_usd", { precision: 8, scale: 2 }).notNull(),
  retailPriceUsd:  decimal("retail_price_usd", { precision: 8, scale: 2 }),  // shown as crossed-out
  paypalPlanId:    varchar("paypal_plan_id", { length: 64 }),           // PayPal billing plan ID
  isFoundingRate:  boolean("is_founding_rate").default(false).notNull(),
  isActive:        boolean("is_active").default(true).notNull(),
  features:        json("features").notNull().$type<string[]>(),         // feature bullet list
  sortOrder:       int("sort_order").default(0).notNull(),
  createdAt:       timestamp("created_at").defaultNow().notNull(),
  updatedAt:       timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type SubscriptionPlan = typeof subscriptionPlans.$inferSelect;
export type InsertSubscriptionPlan = typeof subscriptionPlans.$inferInsert;

// ─── Auth Handoff Codes ───────────────────────────────────────────────────────
// Short-lived one-time codes used for cross-domain OAuth handoff.
// The manus.space callback domain creates a code + stores user info here,
// then the custom domain (app.lifewoven.click) exchanges it for a fresh JWT.
export const authHandoffCodes = mysqlTable("auth_handoff_codes", {
  id:          int("id").autoincrement().primaryKey(),
  code:        varchar("code", { length: 64 }).notNull().unique(),
  openId:      varchar("open_id", { length: 64 }).notNull(),
  name:        text("name"),
  returnPath:  varchar("return_path", { length: 512 }).default("/").notNull(),
  expiresAt:   timestamp("expires_at").notNull(),
  usedAt:      timestamp("used_at"),
  createdAt:   timestamp("created_at").defaultNow().notNull(),
});
export type AuthHandoffCode = typeof authHandoffCodes.$inferSelect;

// ─── Admin Audit Log ──────────────────────────────────────────────────────────
// Records admin mutations: role changes, beta code mint/delete, plan edits, etc.
export const adminAuditLogs = mysqlTable("admin_audit_logs", {
  id:          int("id").autoincrement().primaryKey(),
  adminId:     int("admin_id").notNull(),          // user.id of the admin who performed the action
  action:      varchar("action", { length: 64 }).notNull(),  // e.g. "role_change", "code_mint", "code_delete", "plan_edit"
  targetId:    varchar("target_id", { length: 64 }),         // affected entity ID (user ID, code, plan ID, etc.)
  targetType:  varchar("target_type", { length: 32 }),       // "user", "beta_code", "plan", "product"
  detail:      text("detail"),                               // JSON string with before/after or extra context
  createdAt:   timestamp("created_at").defaultNow().notNull(),
});
export type AdminAuditLog = typeof adminAuditLogs.$inferSelect;
export type InsertAdminAuditLog = typeof adminAuditLogs.$inferInsert;

// ─── Goals ────────────────────────────────────────────────────────────────────
// User-defined goals tied to the 5S framework. Each goal can have milestones.
export const goals = mysqlTable("goals", {
  id:          int("id").autoincrement().primaryKey(),
  userId:      int("userId").notNull(),
  title:       varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  module:      mysqlEnum("module", ["state", "story", "standards", "strategy", "stewardship", "free"]).default("free").notNull(),
  status:      mysqlEnum("status", ["active", "completed", "paused", "abandoned"]).default("active").notNull(),
  targetDate:  timestamp("targetDate"),
  completedAt: timestamp("completedAt"),
  sortOrder:   int("sortOrder").default(0).notNull(),
  createdAt:   timestamp("createdAt").defaultNow().notNull(),
  updatedAt:   timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (t) => [index("idx_goals_userId").on(t.userId)]);

export type Goal = typeof goals.$inferSelect;
export type InsertGoal = typeof goals.$inferInsert;

// ─── Goal Milestones ──────────────────────────────────────────────────────────
// Sub-tasks / checkpoints within a goal.
export const goalMilestones = mysqlTable("goal_milestones", {
  id:          int("id").autoincrement().primaryKey(),
  goalId:      int("goalId").notNull(),
  userId:      int("userId").notNull(),
  title:       varchar("title", { length: 255 }).notNull(),
  isCompleted: boolean("isCompleted").default(false).notNull(),
  completedAt: timestamp("completedAt"),
  sortOrder:   int("sortOrder").default(0).notNull(),
  createdAt:   timestamp("createdAt").defaultNow().notNull(),
}, (t) => [
  index("idx_goal_milestones_goalId").on(t.goalId),
  index("idx_goal_milestones_userId").on(t.userId),
]);

export type GoalMilestone = typeof goalMilestones.$inferSelect;
export type InsertGoalMilestone = typeof goalMilestones.$inferInsert;
