CREATE TABLE `btw_daily_intentions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`intention` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `btw_daily_intentions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `idx_btw_daily_intentions_userId` ON `btw_daily_intentions` (`userId`);