ALTER TABLE `pet` ADD `status` text DEFAULT 'profile_created' NOT NULL;--> statement-breakpoint
CREATE INDEX `pet_user_status_idx` ON `pet` (`user_id`,`status`);
