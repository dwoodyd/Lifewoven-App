CREATE TABLE `dimension_entries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`dimension` enum('identity','relationships','work','health','spirit','legacy') NOT NULL,
	`content` text NOT NULL,
	`becomingQuestion` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `dimension_entries_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `first_honest_week_entries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`dayNumber` int NOT NULL,
	`response` text NOT NULL,
	`completedAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `first_honest_week_entries_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `library_chunks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`resourceId` int NOT NULL,
	`userId` int NOT NULL,
	`chunkIndex` int NOT NULL,
	`content` text NOT NULL,
	`embedding` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `library_chunks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `library_highlights` (
	`id` int AUTO_INCREMENT NOT NULL,
	`resourceId` int NOT NULL,
	`userId` int NOT NULL,
	`content` text NOT NULL,
	`note` text,
	`pathwayTag` varchar(64),
	`chunkIndex` int,
	`sentToWeave` boolean NOT NULL DEFAULT false,
	`weaveEntryId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `library_highlights_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `library_messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sessionId` int NOT NULL,
	`resourceId` int NOT NULL,
	`userId` int NOT NULL,
	`role` enum('user','assistant') NOT NULL,
	`content` text NOT NULL,
	`sourceChunkIds` json DEFAULT ('[]'),
	`sentToWeave` boolean NOT NULL DEFAULT false,
	`weaveEntryId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `library_messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `library_resources` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`author` varchar(255),
	`sourceType` enum('pdf','url','text') NOT NULL,
	`fileKey` varchar(512),
	`fileUrl` text,
	`coverUrl` text,
	`wordCount` int NOT NULL DEFAULT 0,
	`chunkCount` int NOT NULL DEFAULT 0,
	`pathwayTags` json DEFAULT ('[]'),
	`status` enum('pending','processing','ready','error') NOT NULL DEFAULT 'pending',
	`errorMsg` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `library_resources_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `library_sessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`resourceId` int NOT NULL,
	`userId` int NOT NULL,
	`activePathway` varchar(64),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `library_sessions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `idx_dimension_entries_userId` ON `dimension_entries` (`userId`);--> statement-breakpoint
CREATE INDEX `idx_dimension_entries_userId_dim` ON `dimension_entries` (`userId`,`dimension`);--> statement-breakpoint
CREATE INDEX `idx_fhw_userId` ON `first_honest_week_entries` (`userId`);--> statement-breakpoint
CREATE INDEX `idx_fhw_userId_day` ON `first_honest_week_entries` (`userId`,`dayNumber`);--> statement-breakpoint
CREATE INDEX `idx_library_chunks_resourceId` ON `library_chunks` (`resourceId`);--> statement-breakpoint
CREATE INDEX `idx_library_chunks_userId` ON `library_chunks` (`userId`);--> statement-breakpoint
CREATE INDEX `idx_library_highlights_resourceId` ON `library_highlights` (`resourceId`);--> statement-breakpoint
CREATE INDEX `idx_library_highlights_userId` ON `library_highlights` (`userId`);--> statement-breakpoint
CREATE INDEX `idx_library_messages_sessionId` ON `library_messages` (`sessionId`);--> statement-breakpoint
CREATE INDEX `idx_library_messages_userId` ON `library_messages` (`userId`);--> statement-breakpoint
CREATE INDEX `idx_library_resources_userId` ON `library_resources` (`userId`);--> statement-breakpoint
CREATE INDEX `idx_library_sessions_resourceId` ON `library_sessions` (`resourceId`);--> statement-breakpoint
CREATE INDEX `idx_library_sessions_userId` ON `library_sessions` (`userId`);