CREATE TABLE `llm_usage` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`feature` varchar(96) NOT NULL,
	`model` varchar(96) NOT NULL,
	`promptTokens` int NOT NULL DEFAULT 0,
	`completionTokens` int NOT NULL DEFAULT 0,
	`totalTokens` int NOT NULL DEFAULT 0,
	`costEstimateUsd` decimal(12,6) NOT NULL DEFAULT '0',
	CONSTRAINT `llm_usage_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `idx_llm_usage_user_created` ON `llm_usage` (`userId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `idx_llm_usage_feature_created` ON `llm_usage` (`feature`,`createdAt`);