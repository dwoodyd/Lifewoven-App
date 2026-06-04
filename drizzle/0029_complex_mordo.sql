CREATE TABLE `goal_milestones` (
	`id` int AUTO_INCREMENT NOT NULL,
	`goalId` int NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`isCompleted` boolean NOT NULL DEFAULT false,
	`completedAt` timestamp,
	`sortOrder` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `goal_milestones_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `goals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`module` enum('state','story','standards','strategy','stewardship','free') NOT NULL DEFAULT 'free',
	`status` enum('active','completed','paused','abandoned') NOT NULL DEFAULT 'active',
	`targetDate` timestamp,
	`completedAt` timestamp,
	`sortOrder` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `goals_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `idx_goal_milestones_goalId` ON `goal_milestones` (`goalId`);--> statement-breakpoint
CREATE INDEX `idx_goal_milestones_userId` ON `goal_milestones` (`userId`);--> statement-breakpoint
CREATE INDEX `idx_goals_userId` ON `goals` (`userId`);