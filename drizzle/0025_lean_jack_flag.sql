CREATE TABLE `auth_handoff_codes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`code` varchar(64) NOT NULL,
	`open_id` varchar(64) NOT NULL,
	`name` text,
	`return_path` varchar(512) NOT NULL DEFAULT '/',
	`expires_at` timestamp NOT NULL,
	`used_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `auth_handoff_codes_id` PRIMARY KEY(`id`),
	CONSTRAINT `auth_handoff_codes_code_unique` UNIQUE(`code`)
);
