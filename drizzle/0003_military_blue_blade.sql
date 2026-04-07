CREATE TABLE `btw_audio_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`type` enum('prayer','declaration','voice_note','scripture') NOT NULL,
	`title` varchar(255),
	`sourceType` enum('recorded','uploaded','library') NOT NULL DEFAULT 'recorded',
	`fileUrlOrText` text NOT NULL,
	`favorite` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `btw_audio_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `btw_daily_sessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`sessionType` enum('morning','midday','evening','return','emergency') NOT NULL,
	`durationSeconds` int,
	`startedAt` timestamp NOT NULL DEFAULT (now()),
	`completedAt` timestamp,
	`completed` boolean NOT NULL DEFAULT false,
	`stateBeforeId` varchar(32),
	`stateAfterId` varchar(32),
	CONSTRAINT `btw_daily_sessions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `btw_gratitude_entries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`entryText` text NOT NULL,
	`gratitudeType` enum('morning','evening','sparse_table','hard_day','specific_mercy') NOT NULL DEFAULT 'evening',
	`feltRealness` enum('real','forced','mixed') NOT NULL DEFAULT 'real',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `btw_gratitude_entries_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `btw_ground_checks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`stateResult` enum('bracing','striving','drifting','depleted','settled') NOT NULL,
	`answersJson` json NOT NULL,
	`recommendedPractice` varchar(64) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `btw_ground_checks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `btw_prayers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(255),
	`body` text NOT NULL,
	`toneTag` enum('trust','fear','striving','grief','gratitude','honest','mixed') NOT NULL DEFAULT 'honest',
	`topicTag` enum('long_wait','fear','provision','relationship','calling','grief','uncertainty','gratitude','not_yet','answered','still_carrying') NOT NULL DEFAULT 'still_carrying',
	`statusTag` enum('carrying','released','answered','returning') NOT NULL DEFAULT 'carrying',
	`isPrivate` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `btw_prayers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `btw_profiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`preferredMode` enum('text','audio','silent') NOT NULL DEFAULT 'text',
	`audioEnabled` boolean NOT NULL DEFAULT true,
	`faithLanguageConfirmed` boolean NOT NULL DEFAULT false,
	`lastPrimaryState` varchar(32),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `btw_profiles_id` PRIMARY KEY(`id`),
	CONSTRAINT `btw_profiles_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `btw_returns` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`returnType` enum('30sec','2min','fear','discouragement','depletion') NOT NULL,
	`triggerTag` varchar(64),
	`beforeState` varchar(32),
	`afterState` varchar(32),
	`nextAction` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `btw_returns_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `btw_weekly_reflections` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`summaryJson` json NOT NULL,
	`focusSuggestion` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `btw_weekly_reflections_id` PRIMARY KEY(`id`)
);
