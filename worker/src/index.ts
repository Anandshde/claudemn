import { and, asc, desc, eq, inArray, like, or } from "drizzle-orm";
import { Hono } from "hono";
import type { MiddlewareHandler } from "hono";
import { cors } from "hono/cors";
import { createDb } from "./db";
import {
  academyDailyXp,
  academyProgress,
  academyStats,
  academyUsers,
  badges,
  courses,
  lessons,
  tasks,
  userBadges,
} from "./db/schema";

export type Env = {
  DB: D1Database;
  ADMIN_TOKEN?: string;
};

const app = new Hono<{ Bindings: Env }>();

const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
];

/** Accept dev hosts + any *.pages.dev (Cloudflare Pages production + previews). */
function originAllowed(origin: string | undefined): string {
  if (!origin) return allowedOrigins[0];
  if (allowedOrigins.includes(origin)) return origin;
  try {
    const host = new URL(origin).hostname;
    if (host.endsWith(".pages.dev")) return origin;
  } catch {}
  return allowedOrigins[0];
}

app.use(
  "*",
  cors({
    origin: (origin) => originAllowed(origin),
    allowMethods: ["GET", "POST", "OPTIONS"],
    allowHeaders: ["Content-Type"],
  }),
);

app.get("/api/health", (c) => c.json({ ok: true }));

app.get("/api/courses", async (c) => {
  const db = createDb(c.env.DB);
  const qRaw = c.req.query("q")?.trim();
  const products = [
    ...new Set(
      (c.req.queries("product") ?? [])
        .flatMap((p) => p.split(","))
        .map((s) => s.trim())
        .filter(Boolean),
    ),
  ];
  const categories = [
    ...new Set(
      (c.req.queries("category") ?? [])
        .flatMap((p) => p.split(","))
        .map((s) => s.trim())
        .filter(Boolean),
    ),
  ];

  const conditions = [];

  if (qRaw) {
    const pat = `%${qRaw}%`;
    conditions.push(
      or(like(courses.titleMn, pat), like(courses.titleEn, pat)),
    );
  }

  if (products.length) {
    conditions.push(inArray(courses.product, products));
  }

  if (categories.length) {
    conditions.push(inArray(courses.category, categories));
  }

  const whereClause = conditions.length ? and(...conditions) : undefined;

  const qb = db
    .select({
      id: courses.id,
      slug: courses.slug,
      titleMn: courses.titleMn,
      titleEn: courses.titleEn,
      summaryMn: courses.summaryMn,
      summaryEn: courses.summaryEn,
      product: courses.product,
      category: courses.category,
      lecturesCount: courses.lecturesCount,
      videoLength: courses.videoLength,
      quizzesCount: courses.quizzesCount,
      externalUrl: courses.externalUrl,
      sortOrder: courses.sortOrder,
    })
    .from(courses)
    .$dynamic();

  const rows = whereClause
    ? await qb
        .where(whereClause)
        .orderBy(asc(courses.sortOrder), asc(courses.titleEn))
    : await qb.orderBy(asc(courses.sortOrder), asc(courses.titleEn));

  return c.json({ courses: rows });
});

app.get("/api/courses/:slug", async (c) => {
  const slug = c.req.param("slug");
  const db = createDb(c.env.DB);

  const [course] = await db
    .select()
    .from(courses)
    .where(eq(courses.slug, slug))
    .limit(1);

  if (!course) {
    return c.json({ error: "not_found" }, 404);
  }

  const lessonRows = await db
    .select({
      id: lessons.id,
      slug: lessons.slug,
      titleMn: lessons.titleMn,
      titleEn: lessons.titleEn,
      durationMin: lessons.durationMin,
      sortOrder: lessons.sortOrder,
    })
    .from(lessons)
    .where(eq(lessons.courseId, course.id))
    .orderBy(asc(lessons.sortOrder), asc(lessons.titleMn));

  return c.json({ course, lessons: lessonRows });
});

/** Strip server-only answer fields before sending a task payload to the client. */
function stripTaskSecrets(kind: string, payload: unknown): unknown {
  if (!payload || typeof payload !== "object") return payload;
  const p = { ...(payload as Record<string, unknown>) };
  delete p.correctId;
  delete p.correctIds;
  delete p.mustIncludeAny;
  delete p.mustIncludeAll;
  // explanationMn stays hidden until submission
  delete p.explanationMn;
  return p;
}

app.get("/api/courses/:courseSlug/lessons/:lessonSlug", async (c) => {
  const courseSlug = c.req.param("courseSlug");
  const lessonSlug = c.req.param("lessonSlug");
  const db = createDb(c.env.DB);

  const [course] = await db
    .select()
    .from(courses)
    .where(eq(courses.slug, courseSlug))
    .limit(1);

  if (!course) {
    return c.json({ error: "course_not_found" }, 404);
  }

  const [lesson] = await db
    .select()
    .from(lessons)
    .where(
      and(eq(lessons.courseId, course.id), eq(lessons.slug, lessonSlug)),
    )
    .limit(1);

  if (!lesson) {
    return c.json({ error: "lesson_not_found" }, 404);
  }

  const taskRows = await db
    .select()
    .from(tasks)
    .where(eq(tasks.lessonId, lesson.id))
    .orderBy(asc(tasks.sortOrder));

  const safeTasks = taskRows.map((t) => {
    let parsed: unknown = {};
    try {
      parsed = JSON.parse(t.payloadJson);
    } catch {}
    return {
      id: t.id,
      slug: t.slug,
      kind: t.kind,
      promptMn: t.promptMn,
      promptEn: t.promptEn,
      xpReward: t.xpReward,
      sortOrder: t.sortOrder,
      payload: stripTaskSecrets(t.kind, parsed),
    };
  });

  return c.json({ course, lesson, tasks: safeTasks });
});

/* ============================================================
 * Academy API — user state for the gamified Mongolian-language app
 * ============================================================ */

const todayUTC = () => {
  const d = new Date();
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
};

const daysBetween = (a: string | null, b: string): number => {
  if (!a) return Infinity;
  const da = Date.parse(`${a}T00:00:00Z`);
  const db = Date.parse(`${b}T00:00:00Z`);
  if (Number.isNaN(da) || Number.isNaN(db)) return Infinity;
  return Math.round((db - da) / 86_400_000);
};

type AcademyUserPayload = {
  profile: { id: string; name: string; joinedDate: string };
  progress: Record<string, Record<string, string>>;
  stats: {
    totalXP: number;
    currentStreak: number;
    longestStreak: number;
    lastActiveDate: string | null;
  };
  dailyXP: Record<string, number>;
};

async function buildUserPayload(
  db: ReturnType<typeof createDb>,
  userId: string,
): Promise<AcademyUserPayload | null> {
  const [user] = await db
    .select()
    .from(academyUsers)
    .where(eq(academyUsers.id, userId))
    .limit(1);
  if (!user) return null;

  const [statsRow] = await db
    .select()
    .from(academyStats)
    .where(eq(academyStats.userId, userId))
    .limit(1);

  const progressRows = await db
    .select()
    .from(academyProgress)
    .where(eq(academyProgress.userId, userId));

  const dailyRows = await db
    .select()
    .from(academyDailyXp)
    .where(eq(academyDailyXp.userId, userId));

  const progress: Record<string, Record<string, string>> = {};
  for (const r of progressRows) {
    if (!progress[r.courseId]) progress[r.courseId] = {};
    progress[r.courseId][r.itemKey] = r.completedAt;
  }

  const dailyXP: Record<string, number> = {};
  for (const r of dailyRows) dailyXP[r.date] = r.xp;

  return {
    profile: { id: user.id, name: user.name, joinedDate: user.joinedDate },
    progress,
    stats: {
      totalXP: statsRow?.totalXp ?? 0,
      currentStreak: statsRow?.currentStreak ?? 0,
      longestStreak: statsRow?.longestStreak ?? 0,
      lastActiveDate: statsRow?.lastActiveDate ?? null,
    },
    dailyXP,
  };
}

/**
 * Idempotent XP award. If `(userId, courseId, itemKey)` is already in
 * `academy_progress`, do nothing. Otherwise insert progress, bump streak +
 * total XP + daily XP. Returns true if anything changed.
 */
async function awardXp(
  db: ReturnType<typeof createDb>,
  userId: string,
  courseId: string,
  itemKey: string,
  xp: number,
): Promise<boolean> {
  const today = todayUTC();

  const [existing] = await db
    .select()
    .from(academyProgress)
    .where(
      and(
        eq(academyProgress.userId, userId),
        eq(academyProgress.courseId, courseId),
        eq(academyProgress.itemKey, itemKey),
      ),
    )
    .limit(1);
  if (existing) return false;

  await db.insert(academyProgress).values({
    userId,
    courseId,
    itemKey,
    completedAt: today,
  });

  if (xp <= 0) return true;

  const [statsRow] = await db
    .select()
    .from(academyStats)
    .where(eq(academyStats.userId, userId))
    .limit(1);

  let currentStreak = statsRow?.currentStreak ?? 0;
  const lastActive = statsRow?.lastActiveDate ?? null;
  if (lastActive === today) {
    // same day — no change
  } else if (daysBetween(lastActive, today) === 1) {
    currentStreak += 1;
  } else {
    currentStreak = 1;
  }
  const longestStreak = Math.max(statsRow?.longestStreak ?? 0, currentStreak);
  const totalXp = (statsRow?.totalXp ?? 0) + xp;

  await db
    .update(academyStats)
    .set({ totalXp, currentStreak, longestStreak, lastActiveDate: today })
    .where(eq(academyStats.userId, userId));

  const [dailyRow] = await db
    .select()
    .from(academyDailyXp)
    .where(and(eq(academyDailyXp.userId, userId), eq(academyDailyXp.date, today)))
    .limit(1);
  if (dailyRow) {
    await db
      .update(academyDailyXp)
      .set({ xp: dailyRow.xp + xp })
      .where(and(eq(academyDailyXp.userId, userId), eq(academyDailyXp.date, today)));
  } else {
    await db.insert(academyDailyXp).values({ userId, date: today, xp });
  }
  return true;
}

type BadgeRow = typeof badges.$inferSelect;

/** Counts of completed lessons per course slug, plus completed-task count. */
async function userCounts(
  db: ReturnType<typeof createDb>,
  userId: string,
): Promise<{
  lessonByCourse: Record<string, number>;
  taskCount: number;
  totalLessonsByCourse: Record<string, number>;
}> {
  const progRows = await db
    .select()
    .from(academyProgress)
    .where(eq(academyProgress.userId, userId));
  const lessonByCourse: Record<string, number> = {};
  let taskCount = 0;
  for (const r of progRows) {
    if (r.itemKey.startsWith("lesson:")) {
      lessonByCourse[r.courseId] = (lessonByCourse[r.courseId] ?? 0) + 1;
    } else if (r.itemKey.startsWith("task:")) {
      taskCount += 1;
    }
  }

  // lesson totals per course (for course_complete check)
  const lessonTotals = await db
    .select({ courseId: lessons.courseId, slug: lessons.slug })
    .from(lessons);
  const totalLessonsByCourse: Record<string, number> = {};
  for (const r of lessonTotals) {
    totalLessonsByCourse[r.courseId] = (totalLessonsByCourse[r.courseId] ?? 0) + 1;
  }

  return { lessonByCourse, taskCount, totalLessonsByCourse };
}

/**
 * Walk the badge catalog, award any newly-met badges to the user.
 * Returns the rows just inserted.
 */
async function evaluateBadges(
  db: ReturnType<typeof createDb>,
  userId: string,
): Promise<BadgeRow[]> {
  const [statsRow] = await db
    .select()
    .from(academyStats)
    .where(eq(academyStats.userId, userId))
    .limit(1);
  if (!statsRow) return [];

  const earnedRows = await db
    .select({ slug: userBadges.badgeSlug })
    .from(userBadges)
    .where(eq(userBadges.userId, userId));
  const earned = new Set(earnedRows.map((r) => r.slug));

  const allBadges = await db.select().from(badges);
  const { lessonByCourse, taskCount, totalLessonsByCourse } = await userCounts(
    db,
    userId,
  );

  const newlyAwarded: BadgeRow[] = [];
  const today = todayUTC();

  for (const b of allBadges) {
    if (earned.has(b.slug)) continue;
    let qualifies = false;

    switch (b.criteriaKind) {
      case "first_lesson":
        qualifies = Object.values(lessonByCourse).some((n) => n >= 1);
        break;
      case "streak_n":
        qualifies = (statsRow.currentStreak ?? 0) >= (b.criteriaValue ?? 1);
        break;
      case "xp_n":
        qualifies = (statsRow.totalXp ?? 0) >= (b.criteriaValue ?? 1);
        break;
      case "course_complete": {
        const slug = b.criteriaSlug;
        if (!slug) break;
        const done = lessonByCourse[slug] ?? 0;
        const total = totalLessonsByCourse[slug] ?? 0;
        qualifies = total > 0 && done >= total;
        break;
      }
      case "first_course":
        qualifies = Object.entries(lessonByCourse).some(
          ([slug, done]) =>
            (totalLessonsByCourse[slug] ?? 0) > 0 &&
            done >= (totalLessonsByCourse[slug] ?? 0),
        );
        break;
      case "flawless_quiz":
        qualifies = taskCount >= (b.criteriaValue ?? 1);
        break;
    }

    if (qualifies) {
      await db
        .insert(userBadges)
        .values({ userId, badgeSlug: b.slug, awardedAt: today });
      newlyAwarded.push(b);
    }
  }

  return newlyAwarded;
}

/**
 * Compute progress (current/target) for locked badges. For display only.
 */
function badgeProgress(
  badge: BadgeRow,
  stats: { totalXp: number; currentStreak: number },
  lessonByCourse: Record<string, number>,
  totalLessonsByCourse: Record<string, number>,
  taskCount: number,
): { current: number; target: number } | null {
  switch (badge.criteriaKind) {
    case "streak_n":
      return { current: stats.currentStreak, target: badge.criteriaValue ?? 1 };
    case "xp_n":
      return { current: stats.totalXp, target: badge.criteriaValue ?? 1 };
    case "course_complete": {
      const slug = badge.criteriaSlug ?? "";
      return {
        current: lessonByCourse[slug] ?? 0,
        target: totalLessonsByCourse[slug] ?? 1,
      };
    }
    case "first_lesson":
      return {
        current: Math.min(1, Object.values(lessonByCourse).reduce((a, b) => a + b, 0)),
        target: 1,
      };
    case "flawless_quiz":
      return { current: taskCount, target: badge.criteriaValue ?? 1 };
    default:
      return null;
  }
}

app.post("/api/academy/users", async (c) => {
  const body = (await c.req
    .json()
    .catch(() => null)) as { name?: unknown } | null;
  const rawName = body && typeof body.name === "string" ? body.name : "";
  const name = rawName.trim().slice(0, 32);
  if (!name) return c.json({ error: "name_required" }, 400);

  const db = createDb(c.env.DB);
  const today = todayUTC();
  const id = crypto.randomUUID();

  await db.insert(academyUsers).values({ id, name, joinedDate: today });
  await db
    .insert(academyStats)
    .values({ userId: id, totalXp: 0, currentStreak: 0, longestStreak: 0, lastActiveDate: null });

  const payload = await buildUserPayload(db, id);
  return c.json(payload);
});

app.get("/api/academy/users/:id", async (c) => {
  const id = c.req.param("id");
  const db = createDb(c.env.DB);
  const payload = await buildUserPayload(db, id);
  if (!payload) return c.json({ error: "not_found" }, 404);
  return c.json(payload);
});

app.post("/api/academy/users/:id/complete", async (c) => {
  const id = c.req.param("id");
  const body = (await c.req.json().catch(() => null)) as
    | { courseId?: unknown; itemKey?: unknown; xp?: unknown }
    | null;
  const courseId = body && typeof body.courseId === "string" ? body.courseId : "";
  const itemKey = body && typeof body.itemKey === "string" ? body.itemKey : "";
  const xpRaw = body && typeof body.xp === "number" ? body.xp : 0;
  const xp = xpRaw >= 0 && xpRaw <= 500 ? xpRaw : 0;
  if (!courseId || !itemKey || !xp) {
    return c.json({ error: "bad_request" }, 400);
  }

  const db = createDb(c.env.DB);

  const [user] = await db
    .select()
    .from(academyUsers)
    .where(eq(academyUsers.id, id))
    .limit(1);
  if (!user) return c.json({ error: "not_found" }, 404);

  await awardXp(db, id, courseId, itemKey, xp);
  const newBadges = await evaluateBadges(db, id);
  const payload = await buildUserPayload(db, id);
  return c.json({
    payload,
    newBadges: newBadges.map((b) => ({
      slug: b.slug,
      titleMn: b.titleMn,
      descriptionMn: b.descriptionMn,
      iconKey: b.iconKey,
    })),
  });
});

/* ----- Task submission ----- */

type TaskPayload = Record<string, unknown>;

function normalize(s: string): string {
  return s.toLowerCase().normalize("NFKC");
}

function validateAnswer(
  kind: string,
  payload: TaskPayload,
  answer: unknown,
): { correct: boolean; explanationMn?: string } {
  const explanation =
    typeof payload.explanationMn === "string" ? payload.explanationMn : undefined;

  if (kind === "quiz_single") {
    const answerObj = answer as { id?: unknown } | null;
    const correct =
      !!answerObj &&
      typeof answerObj.id === "string" &&
      answerObj.id === payload.correctId;
    return { correct, explanationMn: explanation };
  }

  if (kind === "quiz_multi") {
    const answerObj = answer as { ids?: unknown } | null;
    const ids =
      answerObj && Array.isArray(answerObj.ids)
        ? answerObj.ids.filter((x): x is string => typeof x === "string")
        : [];
    const expected = Array.isArray(payload.correctIds)
      ? (payload.correctIds as unknown[]).filter(
          (x): x is string => typeof x === "string",
        )
      : [];
    const setA = new Set(ids);
    const setB = new Set(expected);
    const correct =
      setA.size === setB.size && [...setA].every((x) => setB.has(x));
    return { correct, explanationMn: explanation };
  }

  if (kind === "prompt_exercise") {
    const text =
      answer && typeof (answer as { text?: unknown }).text === "string"
        ? ((answer as { text: string }).text)
        : "";
    const minChars =
      typeof payload.minChars === "number" ? payload.minChars : 0;
    if (text.length < minChars) return { correct: false, explanationMn: explanation };
    const lower = normalize(text);
    const anyKw = Array.isArray(payload.mustIncludeAny)
      ? (payload.mustIncludeAny as unknown[]).filter(
          (x): x is string => typeof x === "string",
        )
      : null;
    const allKw = Array.isArray(payload.mustIncludeAll)
      ? (payload.mustIncludeAll as unknown[]).filter(
          (x): x is string => typeof x === "string",
        )
      : null;
    if (anyKw && anyKw.length && !anyKw.some((k) => lower.includes(normalize(k)))) {
      return { correct: false, explanationMn: explanation };
    }
    if (allKw && allKw.length && !allKw.every((k) => lower.includes(normalize(k)))) {
      return { correct: false, explanationMn: explanation };
    }
    return { correct: true, explanationMn: explanation };
  }

  if (kind === "reflection") {
    const text =
      answer && typeof (answer as { text?: unknown }).text === "string"
        ? ((answer as { text: string }).text)
        : "";
    const minChars =
      typeof payload.minChars === "number" ? payload.minChars : 0;
    return { correct: text.length >= minChars, explanationMn: explanation };
  }

  return { correct: false };
}

app.post("/api/academy/users/:id/tasks/:taskId/submit", async (c) => {
  const userId = c.req.param("id");
  const taskId = c.req.param("taskId");
  const body = (await c.req.json().catch(() => null)) as
    | { answer?: unknown; courseId?: unknown }
    | null;
  const courseId = body && typeof body.courseId === "string" ? body.courseId : "";
  if (!courseId) return c.json({ error: "course_id_required" }, 400);

  const db = createDb(c.env.DB);

  const [user] = await db
    .select()
    .from(academyUsers)
    .where(eq(academyUsers.id, userId))
    .limit(1);
  if (!user) return c.json({ error: "user_not_found" }, 404);

  const [task] = await db
    .select()
    .from(tasks)
    .where(eq(tasks.id, taskId))
    .limit(1);
  if (!task) return c.json({ error: "task_not_found" }, 404);

  let payload: TaskPayload = {};
  try {
    payload = JSON.parse(task.payloadJson) as TaskPayload;
  } catch {}

  const { correct, explanationMn } = validateAnswer(
    task.kind,
    payload,
    body?.answer ?? null,
  );

  let xpAwarded = 0;
  if (correct) {
    const inserted = await awardXp(
      db,
      userId,
      courseId,
      `task:${task.id}`,
      task.xpReward,
    );
    if (inserted) xpAwarded = task.xpReward;

    // If all tasks of this lesson are now complete, auto-mark the lesson.
    const allLessonTasks = await db
      .select({ id: tasks.id })
      .from(tasks)
      .where(eq(tasks.lessonId, task.lessonId));
    const completedTaskRows = await db
      .select({ key: academyProgress.itemKey })
      .from(academyProgress)
      .where(
        and(
          eq(academyProgress.userId, userId),
          eq(academyProgress.courseId, courseId),
        ),
      );
    const doneTaskKeys = new Set(
      completedTaskRows.map((r) => r.key).filter((k) => k.startsWith("task:")),
    );
    const allDone = allLessonTasks.every((t) =>
      doneTaskKeys.has(`task:${t.id}`),
    );
    if (allDone) {
      await awardXp(db, userId, courseId, `lesson:${task.lessonId}`, 0);
    }
  }

  const newBadges = await evaluateBadges(db, userId);
  const userPayload = await buildUserPayload(db, userId);

  return c.json({
    correct,
    explanationMn,
    xpAwarded,
    newBadges: newBadges.map((b) => ({
      slug: b.slug,
      titleMn: b.titleMn,
      descriptionMn: b.descriptionMn,
      iconKey: b.iconKey,
    })),
    payload: userPayload,
  });
});

app.get("/api/academy/users/:id/badges", async (c) => {
  const userId = c.req.param("id");
  const db = createDb(c.env.DB);

  const [user] = await db
    .select()
    .from(academyUsers)
    .where(eq(academyUsers.id, userId))
    .limit(1);
  if (!user) return c.json({ error: "not_found" }, 404);

  const [statsRow] = await db
    .select()
    .from(academyStats)
    .where(eq(academyStats.userId, userId))
    .limit(1);
  const stats = {
    totalXp: statsRow?.totalXp ?? 0,
    currentStreak: statsRow?.currentStreak ?? 0,
  };

  const allBadges = await db
    .select()
    .from(badges)
    .orderBy(asc(badges.sortOrder));
  const earnedRows = await db
    .select()
    .from(userBadges)
    .where(eq(userBadges.userId, userId));
  const earnedMap = new Map(earnedRows.map((r) => [r.badgeSlug, r.awardedAt]));

  const { lessonByCourse, taskCount, totalLessonsByCourse } = await userCounts(
    db,
    userId,
  );

  const earned: unknown[] = [];
  const locked: unknown[] = [];
  for (const b of allBadges) {
    const baseInfo = {
      slug: b.slug,
      titleMn: b.titleMn,
      descriptionMn: b.descriptionMn,
      iconKey: b.iconKey,
    };
    const awardedAt = earnedMap.get(b.slug);
    if (awardedAt) {
      earned.push({ ...baseInfo, awardedAt });
    } else {
      const progress = badgeProgress(
        b,
        stats,
        lessonByCourse,
        totalLessonsByCourse,
        taskCount,
      );
      locked.push({ ...baseInfo, progress });
    }
  }

  return c.json({ earned, locked });
});

/* ============================================================
 * Admin API — bearer-token gated content authoring
 * ============================================================ */

const requireAdmin: MiddlewareHandler<{ Bindings: Env }> = async (c, next) => {
  const expected = c.env.ADMIN_TOKEN;
  if (!expected) return c.json({ error: "admin_disabled" }, 503);
  const got = c.req.header("Authorization");
  if (got !== `Bearer ${expected}`) {
    return c.json({ error: "unauthorized" }, 401);
  }
  await next();
};

app.use("/api/admin/*", requireAdmin);

app.post("/api/admin/auth/check", (c) => c.json({ ok: true }));

app.get("/api/admin/courses/:slug", async (c) => {
  const slug = c.req.param("slug");
  const db = createDb(c.env.DB);

  const [course] = await db
    .select()
    .from(courses)
    .where(eq(courses.slug, slug))
    .limit(1);
  if (!course) return c.json({ error: "not_found" }, 404);

  const lessonRows = await db
    .select()
    .from(lessons)
    .where(eq(lessons.courseId, course.id))
    .orderBy(asc(lessons.sortOrder), asc(lessons.titleMn));

  // task counts per lesson
  const lessonIds = lessonRows.map((l) => l.id);
  const taskRows = lessonIds.length
    ? await db
        .select()
        .from(tasks)
        .where(inArray(tasks.lessonId, lessonIds))
        .orderBy(asc(tasks.sortOrder))
    : [];
  const tasksByLesson: Record<string, typeof taskRows> = {};
  for (const t of taskRows) {
    if (!tasksByLesson[t.lessonId]) tasksByLesson[t.lessonId] = [];
    tasksByLesson[t.lessonId].push(t);
  }

  const augmented = lessonRows.map((l) => ({
    ...l,
    tasks: (tasksByLesson[l.id] ?? []).map((t) => {
      let payload: unknown = {};
      try {
        payload = JSON.parse(t.payloadJson);
      } catch {}
      return {
        id: t.id,
        slug: t.slug,
        kind: t.kind,
        promptMn: t.promptMn,
        promptEn: t.promptEn,
        xpReward: t.xpReward,
        sortOrder: t.sortOrder,
        payload,
      };
    }),
  }));

  return c.json({ course, lessons: augmented });
});

const VALID_TASK_KINDS = new Set([
  "quiz_single",
  "quiz_multi",
  "prompt_exercise",
  "reflection",
]);

/** Returns null if valid, otherwise an error string. */
function validateTaskInput(
  kind: string,
  payload: unknown,
): string | null {
  if (!VALID_TASK_KINDS.has(kind)) return "invalid_kind";
  if (!payload || typeof payload !== "object") return "invalid_payload";
  const p = payload as Record<string, unknown>;

  if (kind === "quiz_single" || kind === "quiz_multi") {
    const opts = Array.isArray(p.options) ? (p.options as unknown[]) : null;
    if (!opts || opts.length < 2) return "need_at_least_2_options";
    const ids = new Set<string>();
    for (const o of opts) {
      if (!o || typeof o !== "object") return "bad_option";
      const oo = o as Record<string, unknown>;
      if (typeof oo.id !== "string" || !oo.id.trim()) return "option_id_required";
      if (typeof oo.mn !== "string" || !oo.mn.trim()) return "option_mn_required";
      if (ids.has(oo.id)) return "duplicate_option_id";
      ids.add(oo.id);
    }
    if (kind === "quiz_single") {
      if (typeof p.correctId !== "string" || !ids.has(p.correctId)) {
        return "correctId_must_match_an_option";
      }
    } else {
      if (!Array.isArray(p.correctIds) || p.correctIds.length === 0) {
        return "correctIds_required";
      }
      for (const id of p.correctIds as unknown[]) {
        if (typeof id !== "string" || !ids.has(id)) {
          return "correctId_must_match_an_option";
        }
      }
    }
  } else {
    if (typeof p.minChars !== "number" || p.minChars < 0) {
      return "minChars_required";
    }
  }
  return null;
}

app.post("/api/admin/courses/:slug/lessons", async (c) => {
  const courseSlug = c.req.param("slug");
  const body = (await c.req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return c.json({ error: "bad_json" }, 400);

  const slug = typeof body.slug === "string" ? body.slug.trim() : "";
  const titleMn = typeof body.titleMn === "string" ? body.titleMn.trim() : "";
  const titleEn = typeof body.titleEn === "string" ? body.titleEn.trim() || null : null;
  const contentMd = typeof body.contentMd === "string" ? body.contentMd : "";
  const durationMin =
    typeof body.durationMin === "number" && body.durationMin > 0
      ? Math.round(body.durationMin)
      : null;
  const sortOrder =
    typeof body.sortOrder === "number" ? Math.round(body.sortOrder) : 0;

  if (!slug || !titleMn) {
    return c.json({ error: "slug_and_titleMn_required" }, 400);
  }

  const db = createDb(c.env.DB);
  const [course] = await db
    .select()
    .from(courses)
    .where(eq(courses.slug, courseSlug))
    .limit(1);
  if (!course) return c.json({ error: "course_not_found" }, 404);

  // unique (courseId, slug)
  const [existing] = await db
    .select()
    .from(lessons)
    .where(and(eq(lessons.courseId, course.id), eq(lessons.slug, slug)))
    .limit(1);
  if (existing) return c.json({ error: "lesson_slug_taken" }, 409);

  const id = crypto.randomUUID();
  await db.insert(lessons).values({
    id,
    courseId: course.id,
    slug,
    titleMn,
    titleEn,
    contentMd,
    durationMin,
    sortOrder,
  });
  const [row] = await db.select().from(lessons).where(eq(lessons.id, id)).limit(1);
  return c.json({ lesson: row });
});

app.patch("/api/admin/lessons/:id", async (c) => {
  const id = c.req.param("id");
  const body = (await c.req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return c.json({ error: "bad_json" }, 400);

  const db = createDb(c.env.DB);
  const [existing] = await db.select().from(lessons).where(eq(lessons.id, id)).limit(1);
  if (!existing) return c.json({ error: "not_found" }, 404);

  const patch: Record<string, unknown> = {};
  if (typeof body.slug === "string" && body.slug.trim()) patch.slug = body.slug.trim();
  if (typeof body.titleMn === "string" && body.titleMn.trim()) patch.titleMn = body.titleMn.trim();
  if ("titleEn" in body)
    patch.titleEn = typeof body.titleEn === "string" ? body.titleEn.trim() || null : null;
  if (typeof body.contentMd === "string") patch.contentMd = body.contentMd;
  if ("durationMin" in body) {
    patch.durationMin =
      typeof body.durationMin === "number" && body.durationMin > 0
        ? Math.round(body.durationMin)
        : null;
  }
  if (typeof body.sortOrder === "number") patch.sortOrder = Math.round(body.sortOrder);

  if (Object.keys(patch).length === 0) return c.json({ lesson: existing });

  // If slug is changing, enforce uniqueness within course
  if (patch.slug && patch.slug !== existing.slug) {
    const [dup] = await db
      .select()
      .from(lessons)
      .where(
        and(
          eq(lessons.courseId, existing.courseId),
          eq(lessons.slug, patch.slug as string),
        ),
      )
      .limit(1);
    if (dup) return c.json({ error: "lesson_slug_taken" }, 409);
  }

  await db.update(lessons).set(patch).where(eq(lessons.id, id));
  const [row] = await db.select().from(lessons).where(eq(lessons.id, id)).limit(1);
  return c.json({ lesson: row });
});

app.delete("/api/admin/lessons/:id", async (c) => {
  const id = c.req.param("id");
  const db = createDb(c.env.DB);
  await db.delete(lessons).where(eq(lessons.id, id));
  return c.json({ ok: true });
});

app.post("/api/admin/lessons/:id/tasks", async (c) => {
  const lessonId = c.req.param("id");
  const body = (await c.req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return c.json({ error: "bad_json" }, 400);

  const slug = typeof body.slug === "string" ? body.slug.trim() : "";
  const kind = typeof body.kind === "string" ? body.kind : "";
  const promptMn = typeof body.promptMn === "string" ? body.promptMn.trim() : "";
  const promptEn = typeof body.promptEn === "string" ? body.promptEn.trim() || null : null;
  const payload = body.payload;
  const xpReward =
    typeof body.xpReward === "number" && body.xpReward >= 0 && body.xpReward <= 500
      ? Math.round(body.xpReward)
      : 10;
  const sortOrder =
    typeof body.sortOrder === "number" ? Math.round(body.sortOrder) : 0;

  if (!slug || !promptMn) return c.json({ error: "slug_and_promptMn_required" }, 400);
  const invalid = validateTaskInput(kind, payload);
  if (invalid) return c.json({ error: invalid }, 400);

  const db = createDb(c.env.DB);
  const [lesson] = await db.select().from(lessons).where(eq(lessons.id, lessonId)).limit(1);
  if (!lesson) return c.json({ error: "lesson_not_found" }, 404);

  const [dup] = await db
    .select()
    .from(tasks)
    .where(and(eq(tasks.lessonId, lessonId), eq(tasks.slug, slug)))
    .limit(1);
  if (dup) return c.json({ error: "task_slug_taken" }, 409);

  const id = crypto.randomUUID();
  await db.insert(tasks).values({
    id,
    lessonId,
    slug,
    kind,
    promptMn,
    promptEn,
    payloadJson: JSON.stringify(payload),
    xpReward,
    sortOrder,
  });
  const [row] = await db.select().from(tasks).where(eq(tasks.id, id)).limit(1);
  return c.json({ task: row });
});

app.patch("/api/admin/tasks/:id", async (c) => {
  const id = c.req.param("id");
  const body = (await c.req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return c.json({ error: "bad_json" }, 400);

  const db = createDb(c.env.DB);
  const [existing] = await db.select().from(tasks).where(eq(tasks.id, id)).limit(1);
  if (!existing) return c.json({ error: "not_found" }, 404);

  const patch: Record<string, unknown> = {};
  if (typeof body.slug === "string" && body.slug.trim()) patch.slug = body.slug.trim();
  if (typeof body.promptMn === "string" && body.promptMn.trim()) patch.promptMn = body.promptMn.trim();
  if ("promptEn" in body)
    patch.promptEn = typeof body.promptEn === "string" ? body.promptEn.trim() || null : null;
  if (typeof body.xpReward === "number" && body.xpReward >= 0 && body.xpReward <= 500) {
    patch.xpReward = Math.round(body.xpReward);
  }
  if (typeof body.sortOrder === "number") patch.sortOrder = Math.round(body.sortOrder);

  const newKind = typeof body.kind === "string" ? body.kind : existing.kind;
  if ("payload" in body || "kind" in body) {
    const invalid = validateTaskInput(newKind, body.payload ?? JSON.parse(existing.payloadJson));
    if (invalid) return c.json({ error: invalid }, 400);
    if ("kind" in body) patch.kind = newKind;
    if ("payload" in body) patch.payloadJson = JSON.stringify(body.payload);
  }

  if (patch.slug && patch.slug !== existing.slug) {
    const [dup] = await db
      .select()
      .from(tasks)
      .where(and(eq(tasks.lessonId, existing.lessonId), eq(tasks.slug, patch.slug as string)))
      .limit(1);
    if (dup) return c.json({ error: "task_slug_taken" }, 409);
  }

  if (Object.keys(patch).length) {
    await db.update(tasks).set(patch).where(eq(tasks.id, id));
  }
  const [row] = await db.select().from(tasks).where(eq(tasks.id, id)).limit(1);
  return c.json({ task: row });
});

app.delete("/api/admin/tasks/:id", async (c) => {
  const id = c.req.param("id");
  const db = createDb(c.env.DB);
  await db.delete(tasks).where(eq(tasks.id, id));
  return c.json({ ok: true });
});

app.get("/api/admin/courses-overview", async (c) => {
  const db = createDb(c.env.DB);
  const courseRows = await db
    .select({
      id: courses.id,
      slug: courses.slug,
      titleMn: courses.titleMn,
      titleEn: courses.titleEn,
      product: courses.product,
      category: courses.category,
      sortOrder: courses.sortOrder,
    })
    .from(courses)
    .orderBy(asc(courses.sortOrder));

  const lessonCounts = await db
    .select({ courseId: lessons.courseId, id: lessons.id })
    .from(lessons);
  const lessonsByCourse: Record<string, number> = {};
  for (const r of lessonCounts) {
    lessonsByCourse[r.courseId] = (lessonsByCourse[r.courseId] ?? 0) + 1;
  }

  return c.json({
    courses: courseRows.map((c) => ({
      ...c,
      lessonCount: lessonsByCourse[c.id] ?? 0,
    })),
  });
});

app.get("/api/academy/leaderboard", async (c) => {
  const db = createDb(c.env.DB);
  const limitRaw = Number.parseInt(c.req.query("limit") ?? "50", 10);
  const limit = Number.isFinite(limitRaw)
    ? Math.min(Math.max(limitRaw, 1), 200)
    : 50;

  const rows = await db
    .select({
      id: academyUsers.id,
      name: academyUsers.name,
      xp: academyStats.totalXp,
      streak: academyStats.currentStreak,
    })
    .from(academyStats)
    .innerJoin(academyUsers, eq(academyUsers.id, academyStats.userId))
    .orderBy(desc(academyStats.totalXp), desc(academyStats.currentStreak))
    .limit(limit);

  return c.json({ entries: rows });
});

export default app;
