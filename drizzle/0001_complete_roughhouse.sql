CREATE TABLE `audit_results` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`answers` json NOT NULL,
	`scores` json NOT NULL,
	`recommendedPathway` varchar(64) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `audit_results_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `beliefs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`limitingBelief` text NOT NULL,
	`empoweringBelief` text,
	`evidence` text,
	`affirmation` text,
	`category` enum('self','money','relationships','health','purpose','other') NOT NULL DEFAULT 'self',
	`isRewritten` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `beliefs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `check_ins` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`emotionalScore` int NOT NULL,
	`energyLevel` int NOT NULL,
	`clarityLevel` int NOT NULL,
	`note` text,
	`module` varchar(32),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `check_ins_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `community_comments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`postId` int NOT NULL,
	`userId` int NOT NULL,
	`content` text NOT NULL,
	`likesCount` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `community_comments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `community_likes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`postId` int,
	`commentId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `community_likes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `community_posts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(255),
	`content` text NOT NULL,
	`category` enum('share','question','win','support','workshop') NOT NULL DEFAULT 'share',
	`pathway` varchar(64),
	`module` varchar(32),
	`likesCount` int NOT NULL DEFAULT 0,
	`commentsCount` int NOT NULL DEFAULT 0,
	`isPinned` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `community_posts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `courses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slug` varchar(128) NOT NULL,
	`title` varchar(255) NOT NULL,
	`subtitle` text,
	`description` text,
	`instructor` varchar(255),
	`thumbnailUrl` text,
	`module` enum('state','story','standards','strategy','stewardship','all') NOT NULL DEFAULT 'all',
	`price` decimal(8,2) NOT NULL,
	`originalPrice` decimal(8,2),
	`lessonsCount` int DEFAULT 0,
	`durationHours` decimal(5,1),
	`level` enum('beginner','intermediate','advanced') NOT NULL DEFAULT 'beginner',
	`isPublished` boolean NOT NULL DEFAULT false,
	`isFeatured` boolean NOT NULL DEFAULT false,
	`sortOrder` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `courses_id` PRIMARY KEY(`id`),
	CONSTRAINT `courses_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `decisions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`context` text,
	`options` json,
	`chosenOption` text,
	`reasoning` text,
	`secondOrderEffects` text,
	`outcome` text,
	`outcomeRating` int,
	`status` enum('pending','decided','reviewing','closed') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `decisions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `energy_audits` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`date` varchar(10) NOT NULL,
	`sleepHours` decimal(4,1),
	`movementMinutes` int,
	`sunExposure` boolean DEFAULT false,
	`screenTimeHours` decimal(4,1),
	`dopamineAudit` json,
	`energyScore` int,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `energy_audits_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `enrollments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`courseId` int NOT NULL,
	`progress` int NOT NULL DEFAULT 0,
	`completedAt` timestamp,
	`enrolledAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `enrollments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `habit_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`habitId` int NOT NULL,
	`userId` int NOT NULL,
	`completedAt` timestamp NOT NULL DEFAULT (now()),
	`note` text,
	`quality` int,
	CONSTRAINT `habit_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `habits` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`module` enum('state','story','standards','strategy','stewardship') NOT NULL DEFAULT 'standards',
	`cue` text,
	`reward` text,
	`identityStatement` text,
	`frequency` enum('daily','weekly','custom') NOT NULL DEFAULT 'daily',
	`targetDays` json,
	`isActive` boolean NOT NULL DEFAULT true,
	`streak` int NOT NULL DEFAULT 0,
	`longestStreak` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `habits_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `journal_entries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(255),
	`content` text NOT NULL,
	`module` enum('state','story','standards','strategy','stewardship','free') NOT NULL DEFAULT 'free',
	`pathway` varchar(64),
	`tags` json,
	`emotionalScore` int,
	`aiReflection` text,
	`isPrivate` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `journal_entries_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `oracle_conversations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`messages` json NOT NULL,
	`context` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `oracle_conversations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `oracle_insights` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`type` enum('pattern','recommendation','reflection','nudge') NOT NULL,
	`module` varchar(32),
	`content` text NOT NULL,
	`sourceData` json,
	`isRead` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `oracle_insights_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`items` json NOT NULL,
	`total` decimal(8,2) NOT NULL,
	`status` enum('pending','completed','refunded') NOT NULL DEFAULT 'pending',
	`stripeSessionId` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `orders_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slug` varchar(128) NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`type` enum('workbook','card_deck','audio_bundle','planner','guide') NOT NULL,
	`price` decimal(8,2) NOT NULL,
	`thumbnailUrl` text,
	`downloadUrl` text,
	`isPublished` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `products_id` PRIMARY KEY(`id`),
	CONSTRAINT `products_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `resources` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`type` enum('audio','text','video','pdf','affirmation') NOT NULL,
	`module` enum('state','story','standards','strategy','stewardship','all') NOT NULL DEFAULT 'all',
	`pathway` varchar(64),
	`contentUrl` text,
	`thumbnailUrl` text,
	`duration` int,
	`author` varchar(255),
	`isPublicDomain` boolean DEFAULT false,
	`requiredTier` enum('free','core','premium') NOT NULL DEFAULT 'free',
	`sortOrder` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `resources_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `scorecards` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`date` varchar(10) NOT NULL,
	`standards` json NOT NULL,
	`overallScore` int,
	`wins` text,
	`improvements` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `scorecards_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_pathways` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`pathway` varchar(64) NOT NULL,
	`status` enum('active','completed','paused') NOT NULL DEFAULT 'active',
	`currentStep` int NOT NULL DEFAULT 0,
	`totalSteps` int NOT NULL DEFAULT 0,
	`startedAt` timestamp NOT NULL DEFAULT (now()),
	`completedAt` timestamp,
	CONSTRAINT `user_pathways_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `membershipTier` enum('free','core','premium') DEFAULT 'free' NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `membershipExpiresAt` timestamp;--> statement-breakpoint
ALTER TABLE `users` ADD `onboardingCompleted` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `primaryPathway` varchar(64);--> statement-breakpoint
ALTER TABLE `users` ADD `avatarUrl` text;--> statement-breakpoint
ALTER TABLE `users` ADD `bio` text;