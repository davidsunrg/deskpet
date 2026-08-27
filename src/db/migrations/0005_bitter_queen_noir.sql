CREATE TABLE `pet` (
	`id` text PRIMARY KEY NOT NULL,
	`handle` text,
	`name` text NOT NULL,
	`breed` text NOT NULL,
	`species` text DEFAULT 'cat' NOT NULL,
	`sex` text,
	`avatar` text,
	`is_preset` integer DEFAULT false NOT NULL,
	`creation_status` text DEFAULT 'profile_created' NOT NULL,
	`creator_recognition` text,
	`template_id` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `pet_handle_idx` ON `pet` (`handle`);--> statement-breakpoint
CREATE INDEX `pet_breed_idx` ON `pet` (`breed`);--> statement-breakpoint
CREATE INDEX `pet_creation_status_idx` ON `pet` (`creation_status`);--> statement-breakpoint
CREATE INDEX `pet_template_id_idx` ON `pet` (`template_id`);--> statement-breakpoint
CREATE TABLE `user_pet` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`pet_id` text NOT NULL,
	`enabled` integer DEFAULT false NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`pet_id`) REFERENCES `pet`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `user_pet_user_id_idx` ON `user_pet` (`user_id`);--> statement-breakpoint
CREATE INDEX `user_pet_pet_id_idx` ON `user_pet` (`pet_id`);--> statement-breakpoint
CREATE INDEX `user_pet_user_pet_uidx` ON `user_pet` (`user_id`,`pet_id`);