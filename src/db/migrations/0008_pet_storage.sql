CREATE TABLE `pet_file` (
	`id` text PRIMARY KEY NOT NULL,
	`pet_id` text NOT NULL,
	`created_by` text NOT NULL,
	`kind` text NOT NULL,
	`purpose` text NOT NULL,
	`file` text NOT NULL,
	`thumbnail_file` text,
	`filename` text,
	`width` integer,
	`height` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`pet_id`) REFERENCES `pet`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`created_by`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `pet_file_pet_id_idx` ON `pet_file` (`pet_id`);--> statement-breakpoint
CREATE INDEX `pet_file_created_by_idx` ON `pet_file` (`created_by`);--> statement-breakpoint
CREATE INDEX `pet_file_purpose_idx` ON `pet_file` (`purpose`);--> statement-breakpoint
CREATE TABLE `pet_media` (
	`id` text PRIMARY KEY NOT NULL,
	`pet_id` text NOT NULL,
	`created_by` text NOT NULL,
	`file_id` text NOT NULL,
	`source` text DEFAULT 'upload' NOT NULL,
	`caption` text,
	`captured_at` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`pet_id`) REFERENCES `pet`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`created_by`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`file_id`) REFERENCES `pet_file`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `pet_media_pet_id_idx` ON `pet_media` (`pet_id`);--> statement-breakpoint
CREATE INDEX `pet_media_created_by_idx` ON `pet_media` (`created_by`);--> statement-breakpoint
CREATE UNIQUE INDEX `pet_media_file_id_uidx` ON `pet_media` (`file_id`);--> statement-breakpoint
CREATE INDEX `pet_media_created_at_idx` ON `pet_media` (`created_at`);--> statement-breakpoint
CREATE INDEX `pet_media_captured_at_idx` ON `pet_media` (`captured_at`);--> statement-breakpoint
CREATE TABLE `pet_action_uploaded_source` (
	`id` text PRIMARY KEY NOT NULL,
	`pet_id` text NOT NULL,
	`created_by` text NOT NULL,
	`file_id` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`pet_id`) REFERENCES `pet`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`created_by`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`file_id`) REFERENCES `pet_file`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `pet_action_uploaded_source_pet_id_idx` ON `pet_action_uploaded_source` (`pet_id`);--> statement-breakpoint
CREATE INDEX `pet_action_uploaded_source_created_by_idx` ON `pet_action_uploaded_source` (`created_by`);--> statement-breakpoint
CREATE UNIQUE INDEX `pet_action_uploaded_source_file_id_uidx` ON `pet_action_uploaded_source` (`file_id`);
