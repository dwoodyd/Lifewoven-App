CREATE TABLE `book_notes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`bookId` int NOT NULL,
	`userId` int NOT NULL,
	`type` enum('note','quote','highlight','lesson') NOT NULL DEFAULT 'note',
	`content` text NOT NULL,
	`chapter` varchar(128),
	`pageRef` varchar(32),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `book_notes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `books` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`author` varchar(255),
	`coverUrl` text,
	`category` varchar(64),
	`status` enum('want_to_read','reading','completed','paused') NOT NULL DEFAULT 'want_to_read',
	`rating` int,
	`startedAt` timestamp,
	`finishedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `books_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `character_journal` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`bookId` int,
	`title` varchar(255),
	`content` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `character_journal_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `idx_book_notes_bookId` ON `book_notes` (`bookId`);--> statement-breakpoint
CREATE INDEX `idx_book_notes_userId` ON `book_notes` (`userId`);--> statement-breakpoint
CREATE INDEX `idx_books_userId` ON `books` (`userId`);--> statement-breakpoint
CREATE INDEX `idx_character_journal_userId` ON `character_journal` (`userId`);--> statement-breakpoint
CREATE INDEX `idx_character_journal_bookId` ON `character_journal` (`bookId`);