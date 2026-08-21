CREATE TABLE `audit_claims` (
	`id` varchar(36) NOT NULL,
	`answers` json NOT NULL,
	`scores` json NOT NULL,
	`recommendedPathway` varchar(64) NOT NULL,
	`expiresAt` timestamp NOT NULL,
	`redeemedByUserId` int,
	`redeemedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `audit_claims_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `idx_audit_claims_expiresAt` ON `audit_claims` (`expiresAt`);