CREATE TABLE `book_attachments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`book_id` int NOT NULL,
	`user_id` int NOT NULL,
	`file_name` varchar(255) NOT NULL,
	`file_url` varchar(2048) NOT NULL,
	`file_key` varchar(512) NOT NULL,
	`mime_type` varchar(128) NOT NULL DEFAULT 'application/octet-stream',
	`file_size` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `book_attachments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `idx_book_attachments_bookId` ON `book_attachments` (`book_id`);--> statement-breakpoint
CREATE INDEX `idx_book_attachments_userId` ON `book_attachments` (`user_id`);