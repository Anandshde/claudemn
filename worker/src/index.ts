import { and, asc, desc, eq, inArray, like, or } from "drizzle-orm";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { createDb } from "./db";
import {
  academyDailyXp,
  academyProgress,
  academyStats,
  academyUsers,
  courses,
  lessons,
} from "./db/schema";

export type Env = {
  DB: D1Database;
};

const app = new Hono<{ Bindings: Env }>();

const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
];

app.use(
  "*",
  cors({
    origin: (origin) =>
      origin && allowedOrigins.includes(origin) ? origin : allowedOrigins[0],
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
      c.req
        .queries("product")
        .flatMap((p) => p.split(","))
        .map((s) => s.trim())
        .filter(Boolean),
    ),
  ];
  const categories = [
    ...new Set(
      c.req
        .queries("category")
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

  return c.json({ course, lesson });
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
  const today = todayUTC();

  const [user] = await db
    .select()
    .from(academyUsers)
    .where(eq(academyUsers.id, id))
    .limit(1);
  if (!user) return c.json({ error: "not_found" }, 404);

  // Idempotent: if already marked complete, return current state.
  const [existing] = await db
    .select()
    .from(academyProgress)
    .where(
      and(
        eq(academyProgress.userId, id),
        eq(academyProgress.courseId, courseId),
        eq(academyProgress.itemKey, itemKey),
      ),
    )
    .limit(1);

  if (!existing) {
    await db.insert(academyProgress).values({
      userId: id,
      courseId,
      itemKey,
      completedAt: today,
    });

    const [statsRow] = await db
      .select()
      .from(academyStats)
      .where(eq(academyStats.userId, id))
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
      .set({
        totalXp,
        currentStreak,
        longestStreak,
        lastActiveDate: today,
      })
      .where(eq(academyStats.userId, id));

    // Bump daily XP (upsert)
    const [dailyRow] = await db
      .select()
      .from(academyDailyXp)
      .where(and(eq(academyDailyXp.userId, id), eq(academyDailyXp.date, today)))
      .limit(1);
    if (dailyRow) {
      await db
        .update(academyDailyXp)
        .set({ xp: dailyRow.xp + xp })
        .where(and(eq(academyDailyXp.userId, id), eq(academyDailyXp.date, today)));
    } else {
      await db
        .insert(academyDailyXp)
        .values({ userId: id, date: today, xp });
    }
  }

  const payload = await buildUserPayload(db, id);
  return c.json(payload);
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
