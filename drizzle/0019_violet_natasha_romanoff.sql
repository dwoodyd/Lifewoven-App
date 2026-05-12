CREATE TABLE `applications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(320) NOT NULL,
	`answer` text NOT NULL,
	`ip_address` varchar(64),
	`user_agent` text,
	`status` enum('new','reviewing','approved','declined') NOT NULL DEFAULT 'new',
	`reviewed_at` timestamp,
	`reviewed_by` int,
	`invite_code_id` int,
	`tier` enum('explorer','seeker','oracle') NOT NULL DEFAULT 'seeker',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `applications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `invite_codes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`code` varchar(32) NOT NULL,
	`email` varchar(320) NOT NULL,
	`tier` enum('explorer','seeker','oracle') NOT NULL DEFAULT 'seeker',
	`application_id` int,
	`redeemed_by` int,
	`redeemed_at` timestamp,
	`expires_at` timestamp NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `invite_codes_id` PRIMARY KEY(`id`),
	CONSTRAINT `invite_codes_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `foundingMember` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `foundingTier` enum('explorer','seeker','oracle') DEFAULT 'explorer';--> statement-breakpoint
ALTER TABLE `users` ADD `foundingRateLocked` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `needsIntro` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `inviteCode` varchar(32);--> statement-breakpoint
CREATE INDEX `idx_applications_email` ON `applications` (`email`);--> statement-breakpoint
CREATE INDEX `idx_applications_status` ON `applications` (`status`);--> statement-breakpoint
CREATE INDEX `idx_invite_codes_code` ON `invite_codes` (`code`);--> statement-breakpoint
CREATE INDEX `idx_invite_codes_email` ON `invite_codes` (`email`);