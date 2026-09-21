CREATE INDEX `idx_audit_results_user_created` ON `audit_results` (`userId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `idx_check_ins_user_created` ON `check_ins` (`userId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `idx_habit_logs_user_completed` ON `habit_logs` (`userId`,`completedAt`);--> statement-breakpoint
CREATE INDEX `idx_habits_user_active` ON `habits` (`userId`,`isActive`);--> statement-breakpoint
CREATE INDEX `idx_journal_entries_user_created` ON `journal_entries` (`userId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `idx_oracle_insights_user_read_created` ON `oracle_insights` (`userId`,`isRead`,`createdAt`);--> statement-breakpoint
CREATE INDEX `idx_user_pathways_user_status` ON `user_pathways` (`userId`,`status`);