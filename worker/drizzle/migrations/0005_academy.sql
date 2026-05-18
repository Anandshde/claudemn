-- Gamified academy tables: user profile, progress, stats, daily XP.

CREATE TABLE `academy_users` (
  `id` text PRIMARY KEY NOT NULL,
  `name` text NOT NULL,
  `joined_date` text NOT NULL,
  `created_at` text DEFAULT (datetime('now')) NOT NULL
);

CREATE TABLE `academy_progress` (
  `user_id` text NOT NULL,
  `course_id` text NOT NULL,
  `item_key` text NOT NULL,
  `completed_at` text NOT NULL,
  PRIMARY KEY (`user_id`, `course_id`, `item_key`),
  FOREIGN KEY (`user_id`) REFERENCES `academy_users`(`id`) ON UPDATE no action ON DELETE cascade
);

CREATE TABLE `academy_stats` (
  `user_id` text PRIMARY KEY NOT NULL,
  `total_xp` integer DEFAULT 0 NOT NULL,
  `current_streak` integer DEFAULT 0 NOT NULL,
  `longest_streak` integer DEFAULT 0 NOT NULL,
  `last_active_date` text,
  FOREIGN KEY (`user_id`) REFERENCES `academy_users`(`id`) ON UPDATE no action ON DELETE cascade
);

CREATE TABLE `academy_daily_xp` (
  `user_id` text NOT NULL,
  `date` text NOT NULL,
  `xp` integer DEFAULT 0 NOT NULL,
  PRIMARY KEY (`user_id`, `date`),
  FOREIGN KEY (`user_id`) REFERENCES `academy_users`(`id`) ON UPDATE no action ON DELETE cascade
);

CREATE INDEX `academy_stats_total_xp_idx` ON `academy_stats` (`total_xp` DESC);
