CREATE TABLE `stripe_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`event_id` varchar(255) NOT NULL,
	`event_type` varchar(128) NOT NULL,
	`processed_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `stripe_events_id` PRIMARY KEY(`id`),
	CONSTRAINT `stripe_events_event_id_unique` UNIQUE(`event_id`)
);
