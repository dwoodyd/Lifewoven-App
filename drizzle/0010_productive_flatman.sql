CREATE TABLE `events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int,
	`event` varchar(128) NOT NULL,
	`properties` text,
	`created_at` int NOT NULL,
	CONSTRAINT `events_id` PRIMARY KEY(`id`)
);
