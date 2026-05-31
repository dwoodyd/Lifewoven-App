CREATE TABLE `pathway_progress` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`pathway` varchar(64) NOT NULL,
	`completedSteps` json NOT NULL DEFAULT ('[]'),
	`sessionStarted` boolean NOT NULL DEFAULT false,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `pathway_progress_id` PRIMARY KEY(`id`),
	CONSTRAINT `uq_pathway_progress_user_pathway` UNIQUE(`userId`,`pathway`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `identitySentence` text;--> statement-breakpoint
ALTER TABLE `users` ADD `identitySentenceGeneratedAt` timestamp;--> statement-breakpoint
CREATE INDEX `idx_pathway_progress_userId` ON `pathway_progress` (`userId`);