CREATE TABLE `referral_credits` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`balance_cents` int NOT NULL DEFAULT 0,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `referral_credits_id` PRIMARY KEY(`id`),
	CONSTRAINT `referral_credits_user_id_unique` UNIQUE(`user_id`)
);
--> statement-breakpoint
CREATE TABLE `referrals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`referrer_id` int NOT NULL,
	`referee_id` int,
	`code` varchar(16) NOT NULL,
	`credit_cents` int NOT NULL DEFAULT 0,
	`used_at` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `referrals_id` PRIMARY KEY(`id`),
	CONSTRAINT `referrals_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
ALTER TABLE `orders` ADD `paypalCaptureId` varchar(255);