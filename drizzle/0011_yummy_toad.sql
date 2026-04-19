CREATE TABLE `referral_codes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`code` varchar(32) NOT NULL,
	`owner_id` int NOT NULL,
	`redeemed_by` int,
	`redeemed_at` int,
	`created_at` int NOT NULL,
	CONSTRAINT `referral_codes_id` PRIMARY KEY(`id`),
	CONSTRAINT `referral_codes_code_unique` UNIQUE(`code`)
);
