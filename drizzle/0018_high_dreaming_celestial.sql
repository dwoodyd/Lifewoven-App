CREATE TABLE `mood_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`log_date` varchar(10) NOT NULL,
	`score` int NOT NULL,
	`note` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `mood_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `idx_mood_logs_userId` ON `mood_logs` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_mood_logs_userId_date` ON `mood_logs` (`user_id`,`log_date`);