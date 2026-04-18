CREATE TABLE `beta_access` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`betaCodeId` int NOT NULL,
	`activatedAt` timestamp NOT NULL DEFAULT (now()),
	`expiresAt` timestamp NOT NULL,
	`notifiedAt` timestamp,
	CONSTRAINT `beta_access_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `beta_codes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`code` varchar(32) NOT NULL,
	`label` varchar(128),
	`maxUses` int NOT NULL DEFAULT 1,
	`usedCount` int NOT NULL DEFAULT 0,
	`durationDays` int NOT NULL DEFAULT 45,
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`expiresAt` timestamp,
	CONSTRAINT `beta_codes_id` PRIMARY KEY(`id`),
	CONSTRAINT `beta_codes_code_unique` UNIQUE(`code`)
);
