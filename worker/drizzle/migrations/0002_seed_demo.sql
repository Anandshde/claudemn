-- Demo content: replace with Claude-style curriculum as you localize

INSERT INTO `courses` (`id`, `slug`, `title_mn`, `title_en`, `summary_mn`, `summary_en`, `sort_order`, `created_at`) VALUES
  ('course-claude-intro', 'claude-undes', 'Claude суурь', 'Claude Foundations', 'Аюулгүй, үр дүнтэй дамжуулах загваруудыг судална.', 'Learn safe prompting patterns.', 10, datetime('now')),
  ('course-prompt-engineering', 'prompt-injigeniring', 'Промпт инженерчлэл', 'Prompt Engineering', 'Текст дамжуулах стратеги, загваруудыг дадлагажуулна.', 'Structured prompts and refinement.', 20, datetime('now'));

INSERT INTO `lessons` (`id`, `course_id`, `slug`, `title_mn`, `title_en`, `content_md`, `duration_min`, `sort_order`, `created_at`) VALUES
  ('lesson-1', 'course-claude-intro', 'ugiin-turkhi', 'Үнийн түүрхий', 'What is Claude', '# Танилцуулга\n\nЭнэхүү хичээлд та Claude-ийн зорилго, тохируулгыг үзнэ.', 25, 10, datetime('now')),
  ('lesson-2', 'course-claude-intro', 'ayulgui-damjuulah', 'Аюулгүй дамжуулах', 'Safe prompting', '# Аюулгүй байдал\n\nХувийн мэдээлэл, API түлхүүр зэрэгт анхаарах.', 30, 20, datetime('now')),
  ('lesson-3', 'course-prompt-engineering', 'biet-togtool', 'Бүтээцлэг дамжуулах', 'Structured prompting', '# Бүтэц\n\nРоль, контекст, жишээ өгүүлбэрүүд.', 35, 10, datetime('now'));
