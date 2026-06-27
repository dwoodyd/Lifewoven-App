CREATE TABLE `reading_bridge_notes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`chapterId` varchar(32) NOT NULL,
	`content` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `reading_bridge_notes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `idx_rb_notes_userId` ON `reading_bridge_notes` (`userId`);--> statement-breakpoint
CREATE INDEX `idx_rb_notes_chapterId` ON `reading_bridge_notes` (`chapterId`);