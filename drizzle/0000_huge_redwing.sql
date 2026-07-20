CREATE TABLE `adjustments` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`piece_id` text NOT NULL,
	`piece_name` text NOT NULL,
	`location` text NOT NULL,
	`quantity` integer NOT NULL,
	`memo` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
