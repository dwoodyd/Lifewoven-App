CREATE TABLE `overflow_captures` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`content` text NOT NULL,
	`type` enum('idea','reminder','thought','task','worry','other') NOT NULL DEFAULT 'other',
	`isSorted` boolean NOT NULL DEFAULT false,
	`sortedTo` varchar(64),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `overflow_captures_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `habits` ADD `fullVersion` text;--> statement-breakpoint
ALTER TABLE `habits` ADD `smallVersion` text;--> statement-breakpoint
ALTER TABLE `habits` ADD `tinyVersion` text;--> statement-breakpoint
ALTER TABLE `habits` ADD `returnCount` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `habits` ADD `lastCompletedAt` timestamp;--> statement-breakpoint
ALTER TABLE `users` ADD `mindPatterns` json;--> statement-breakpoint
ALTER TABLE `users` ADD `supportPreferences` json;--> statement-breakpoint
ALTER TABLE `users` ADD `lowBandwidthMode` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `lastActiveAt` timestamp;--> statement-breakpoint
ALTER TABLE `users` ADD `returnCount` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `keptPromisesCount` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `avgResetSpeedDays` decimal(5,1);--> statement-breakpoint
ALTER TABLE `users` ADD `gentleConsistencyScore` int DEFAULT 0 NOT NULL;