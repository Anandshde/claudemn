/** Reactive client store for the Mongolian academy. Owns the auth-less user id,
 *  caches their state in-memory, and exposes mutations that round-trip to the worker. */
import { computed, reactive, ref } from "vue";
import {
  completeAcademyItem,
  createAcademyUser,
  fetchAcademyUser,
  fetchLeaderboard,
  type AcademyProfile,
  type AcademyServerStats,
  type AcademyUserPayload,
  type LeaderboardEntry,
} from "./api";
import { BADGES, COURSES, type DerivedStats } from "./data";

const USER_ID_KEY = "academy-user-id";

const profile = ref<AcademyProfile | null>(null);
const progress = ref<Record<string, Record<string, string>>>({});
const stats = reactive<AcademyServerStats>({
  totalXP: 0,
  currentStreak: 0,
  longestStreak: 0,
  lastActiveDate: null,
});
const dailyXP = ref<Record<string, number>>({});
const loading = ref(true);
const error = ref<string | null>(null);
const leaderboard = ref<LeaderboardEntry[]>([]);
const toast = ref<{ icon: string; text: string } | null>(null);

let initPromise: Promise<void> | null = null;
let toastTimer: ReturnType<typeof setTimeout> | null = null;

function applyPayload(p: AcademyUserPayload): void {
  profile.value = p.profile;
  progress.value = p.progress;
  stats.totalXP = p.stats.totalXP;
  stats.currentStreak = p.stats.currentStreak;
  stats.longestStreak = p.stats.longestStreak;
  stats.lastActiveDate = p.stats.lastActiveDate;
  dailyXP.value = p.dailyXP;
}

async function init(): Promise<void> {
  if (initPromise) return initPromise;
  initPromise = (async () => {
    loading.value = true;
    error.value = null;
    try {
      const storedId = (() => {
        try {
          return localStorage.getItem(USER_ID_KEY);
        } catch {
          return null;
        }
      })();
      if (storedId) {
        try {
          const p = await fetchAcademyUser(storedId);
          applyPayload(p);
        } catch (e) {
          // user_id missing on server (e.g. fresh DB) — drop and force onboarding
          try {
            localStorage.removeItem(USER_ID_KEY);
          } catch {
            /* ignore */
          }
          profile.value = null;
          // not a fatal error; we'll show onboarding
          console.warn("academy: stored user id not found, re-onboarding", e);
        }
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : "Тодорхойгүй алдаа";
    } finally {
      loading.value = false;
    }
  })();
  return initPromise;
}

async function onboard(name: string): Promise<void> {
  const trimmed = name.trim();
  if (!trimmed) return;
  loading.value = true;
  error.value = null;
  try {
    const p = await createAcademyUser(trimmed);
    applyPayload(p);
    try {
      localStorage.setItem(USER_ID_KEY, p.profile.id);
    } catch {
      /* ignore — degraded but functional in private mode */
    }
  } catch (e) {
    error.value = e instanceof Error ? e.message : "Бүртгүүлж чадсангүй";
  } finally {
    loading.value = false;
  }
}

function showToast(icon: string, text: string): void {
  toast.value = { icon, text };
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.value = null;
    toastTimer = null;
  }, 2400);
}

async function markComplete(
  courseId: string,
  itemKey: string,
  xp: number,
  label: string,
): Promise<void> {
  if (!profile.value) return;
  const existing = progress.value[courseId]?.[itemKey];
  if (existing) return;

  try {
    const p = await completeAcademyItem(profile.value.id, courseId, itemKey, xp);
    applyPayload(p);
    showToast("✨", `+${xp} XP — ${label}`);
  } catch (e) {
    error.value = e instanceof Error ? e.message : "Хадгалж чадсангүй";
  }
}

async function refreshLeaderboard(): Promise<void> {
  try {
    const { entries } = await fetchLeaderboard(50);
    leaderboard.value = entries;
  } catch (e) {
    error.value = e instanceof Error ? e.message : "Тэргүүлэгчдийг ачаалж чадсангүй";
  }
}

const derivedStats = computed<DerivedStats>(() => {
  let lessonsCompleted = 0;
  let coursesCompleted = 0;
  for (const course of COURSES) {
    const cp = progress.value[course.id] ?? {};
    const doneLessons = course.lessons.filter((l) => cp[`lesson:${l.id}`]).length;
    const doneTasks = course.tasks.filter((t) => cp[`task:${t.id}`]).length;
    lessonsCompleted += doneLessons;
    if (
      doneLessons === course.lessons.length &&
      doneTasks === course.tasks.length
    ) {
      coursesCompleted += 1;
    }
  }
  return {
    totalXP: stats.totalXP,
    currentStreak: stats.currentStreak,
    longestStreak: stats.longestStreak,
    lastActiveDate: stats.lastActiveDate,
    lessonsCompleted,
    coursesCompleted,
  };
});

const earnedBadgeIds = computed<string[]>(() =>
  BADGES.filter((b) => b.check(derivedStats.value)).map((b) => b.id),
);

export function useAcademy() {
  return {
    profile,
    progress,
    stats,
    dailyXP,
    loading,
    error,
    leaderboard,
    toast,
    derivedStats,
    earnedBadgeIds,
    init,
    onboard,
    markComplete,
    refreshLeaderboard,
    showToast,
  };
}
