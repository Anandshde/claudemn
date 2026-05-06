ALTER TABLE `courses` ADD `product` text DEFAULT '' NOT NULL;
ALTER TABLE `courses` ADD `category` text DEFAULT '' NOT NULL;
ALTER TABLE `courses` ADD `lectures_count` integer;
ALTER TABLE `courses` ADD `video_length` text;
ALTER TABLE `courses` ADD `quizzes_count` integer;
ALTER TABLE `courses` ADD `external_url` text;
