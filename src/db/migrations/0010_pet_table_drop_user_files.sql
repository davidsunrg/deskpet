DROP TABLE IF EXISTS `user_files`;--> statement-breakpoint
CREATE TABLE `pet` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`name` text NOT NULL,
	`species` text NOT NULL,
	`breed` text NOT NULL,
	`sex` text,
	`avatar` text,
	`photo_keys` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `pet_user_id_idx` ON `pet` (`user_id`);
