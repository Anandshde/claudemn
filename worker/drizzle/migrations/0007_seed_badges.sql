-- Starter badge catalog. criteriaKind drives evaluator in worker.

INSERT INTO `badges` (`slug`, `title_mn`, `title_en`, `description_mn`, `description_en`, `icon_key`, `criteria_kind`, `criteria_value`, `criteria_slug`, `sort_order`) VALUES
  ('first-lesson',        'Анхны хичээл',        'First lesson',         'Эхний хичээлээ дуусгасан.',                'Completed your first lesson.',           'spark',  'first_lesson',    NULL, NULL,         10),
  ('streak-3',            '3 хоногийн зүтгэл',   '3-day streak',         '3 хоног дараалан суралцсан.',              'Studied 3 days in a row.',               'flame',  'streak_n',        3,    NULL,         20),
  ('streak-7',            '7 хоногийн зүтгэл',   '7-day streak',         '7 хоног дараалан суралцсан.',              'Studied 7 days in a row.',               'flame', 'streak_n',         7,    NULL,         30),
  ('xp-100',              '100 XP',              '100 XP',               'Нийт 100 XP цуглуулсан.',                  'Earned a total of 100 XP.',              'star',   'xp_n',            100,  NULL,         40),
  ('xp-500',              '500 XP',              '500 XP',               'Нийт 500 XP цуглуулсан.',                  'Earned a total of 500 XP.',              'star',   'xp_n',            500,  NULL,         50),
  ('claude-101-graduate', 'Claude 101 төгсөгч',  'Claude 101 graduate',  'Claude 101 хичээлийн бүх хичээлийг дуусгасан.', 'Completed every lesson in Claude 101.', 'crown',  'course_complete', NULL, 'claude-101', 60),
  ('flawless-quiz',       'Гялбам шалгуулагч',   'Flawless quiz',        '10 эсвэл түүнээс олон quiz-ийг анхны оролдлогоор зөв хариулсан.', 'Answered 10+ quiz tasks correctly on the first try.', 'sparkles', 'flawless_quiz', 10, NULL, 70);
