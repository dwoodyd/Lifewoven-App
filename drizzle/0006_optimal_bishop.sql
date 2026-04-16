CREATE TABLE `pathway_sessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`pathway` varchar(64) NOT NULL,
	`stepsCompleted` int NOT NULL,
	`totalSteps` int NOT NULL,
	`completedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `pathway_sessions_id` PRIMARY KEY(`id`)
);
