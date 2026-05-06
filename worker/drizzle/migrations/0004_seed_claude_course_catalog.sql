-- Catalog synced from Claude public courses listing (titles, durations, taxonomy).
DELETE FROM lessons;
DELETE FROM courses;

INSERT INTO `courses` (
  `id`, `slug`, `title_mn`, `title_en`, `summary_mn`, `summary_en`,
  `product`, `category`, `lectures_count`, `video_length`, `quizzes_count`,
  `external_url`, `sort_order`, `created_at`
) VALUES
  ('ai-capabilities-and-limitations', 'ai-capabilities-and-limitations', 'AI Capabilities and Limitations', 'AI Capabilities and Limitations', NULL, NULL, 'AI Fluency', 'Education', 13, '15 min', 1, 'https://claude.com/courses/ai-capabilities-and-limitations', 10, datetime('now')),
  ('claude-code-101', 'claude-code-101', 'Claude Code 101', 'Claude Code 101', NULL, NULL, 'Claude Code', 'Engineering', 12, '1 hr', NULL, 'https://claude.com/courses/claude-code-101', 20, datetime('now')),
  ('introduction-to-subagents', 'introduction-to-subagents', 'Introduction to subagents', 'Introduction to subagents', NULL, NULL, 'Claude Code', 'Engineering', 4, '20 mins', NULL, 'https://claude.com/courses/introduction-to-subagents', 30, datetime('now')),
  ('introduction-to-claude-cowork', 'introduction-to-claude-cowork', 'Introduction to Claude Cowork', 'Introduction to Claude Cowork', NULL, NULL, 'Claude Cowork', 'Professional', NULL, NULL, NULL, 'https://claude.com/courses/introduction-to-claude-cowork', 40, datetime('now')),
  ('introduction-to-agent-skills', 'introduction-to-agent-skills', 'Introduction to agent skills', 'Introduction to agent skills', NULL, NULL, 'Claude Code', 'Engineering', 6, '30 min', NULL, 'https://claude.com/courses/introduction-to-agent-skills', 50, datetime('now')),
  ('ai-fluency-framework-foundations', 'ai-fluency-framework-foundations', 'AI Fluency: Framework & Foundations', 'AI Fluency: Framework & Foundations', NULL, NULL, 'AI Fluency', 'Professional', 14, '1.1 hr', 1, 'https://claude.com/courses/ai-fluency-framework-foundations', 60, datetime('now')),
  ('ai-fluency-for-educators', 'ai-fluency-for-educators', 'AI Fluency for Educators', 'AI Fluency for Educators', NULL, NULL, 'AI Fluency', 'Education', 4, '24 min', NULL, 'https://claude.com/courses/ai-fluency-for-educators', 70, datetime('now')),
  ('ai-fluency-for-students', 'ai-fluency-for-students', 'AI Fluency for Students', 'AI Fluency for Students', NULL, NULL, 'AI Fluency', 'Education', 5, '30 min', NULL, 'https://claude.com/courses/ai-fluency-for-students', 80, datetime('now')),
  ('building-with-the-claude-api', 'building-with-the-claude-api', 'Building with the Claude API', 'Building with the Claude API', NULL, NULL, 'Claude Platform', 'Engineering', 84, '8.1 hr', 10, 'https://claude.com/courses/building-with-the-claude-api', 90, datetime('now')),
  ('claude-code-in-action', 'claude-code-in-action', 'Claude Code in Action', 'Claude Code in Action', NULL, NULL, 'Claude Code', 'Engineering', 15, '1 hr', 1, 'https://claude.com/courses/claude-code-in-action', 100, datetime('now')),
  ('introduction-to-model-context-protocol', 'introduction-to-model-context-protocol', 'Introduction to Model Context Protocol', 'Introduction to Model Context Protocol', NULL, NULL, 'MCP', 'Engineering', 16, '1 hr', 1, 'https://claude.com/courses/introduction-to-model-context-protocol', 110, datetime('now')),
  ('model-context-protocol-advanced-topics', 'model-context-protocol-advanced-topics', 'Model Context Protocol: Advanced Topics', 'Model Context Protocol: Advanced Topics', NULL, NULL, 'MCP', 'Engineering', 15, '1.1 hr', 2, 'https://claude.com/courses/model-context-protocol-advanced-topics', 120, datetime('now')),
  ('claude-with-amazon-bedrock', 'claude-with-amazon-bedrock', 'Claude with Amazon Bedrock', 'Claude with Amazon Bedrock', NULL, NULL, 'Claude Platform', 'Engineering', 85, '8 hr', 10, 'https://claude.com/courses/claude-with-amazon-bedrock', 130, datetime('now')),
  ('claude-with-google-clouds-vertex-ai', 'claude-with-google-clouds-vertex-ai', 'Claude with Google Cloud''s Vertex AI', 'Claude with Google Cloud''s Vertex AI', NULL, NULL, 'Claude Platform', 'Engineering', 85, '8 hr', 10, 'https://claude.com/courses/claude-with-google-clouds-vertex-ai', 140, datetime('now')),
  ('teaching-ai-fluency', 'teaching-ai-fluency', 'Teaching AI Fluency', 'Teaching AI Fluency', NULL, NULL, 'AI Fluency', 'Education', 7, '36 min', 1, 'https://claude.com/courses/teaching-ai-fluency', 150, datetime('now')),
  ('ai-fluency-for-nonprofits', 'ai-fluency-for-nonprofits', 'AI Fluency for nonprofits', 'AI Fluency for nonprofits', NULL, NULL, 'AI Fluency', 'Nonprofits', 9, '54 min', 1, 'https://claude.com/courses/ai-fluency-for-nonprofits', 160, datetime('now')),
  ('claude-101', 'claude-101', 'Claude 101', 'Claude 101', NULL, NULL, 'Claude.ai', 'Professional', 12, '1 hr', NULL, 'https://claude.com/courses/claude-101', 170, datetime('now'));
