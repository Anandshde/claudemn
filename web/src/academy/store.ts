/** Reactive client store for the Mongolian academy. Owns the auth-less user id,
 *  caches their state in-memory, and exposes mutations that round-trip to the worker. */
import { reactive, ref } from "vue";
import {
  completeAcademyItem,
  createAcademyUser,
  fetchAcademyUser,
  fetchLeaderboard,
  type AcademyProfile,
  type AcademyServerStats,
  type AcademyUserPayload,
  type AwardedBadge,
  type LeaderboardEntry,
} from "./api";
import { submitTask as submitTaskApi, type TaskAnswer, type SubmitResult } from "./tasks";

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

const toastQueue: Array<{ icon: string; text: string }> = [];

function pumpToast(): void {
  if (toast.value || toastQueue.length === 0) return;
  const next = toastQueue.shift()!;
  toast.value = next;
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.value = null;
    toastTimer = null;
    pumpToast();
  }, 2400);
}

function showToast(icon: string, text: string): void {
  toastQueue.push({ icon, text });
  pumpToast();
}

const BADGE_ICON: Record<string, string> = {
  spark: "✨",
  flame: "🔥",
  star: "⭐",
  crown: "👑",
  sparkles: "🌟",
};

function queueBadgeToasts(newBadges: AwardedBadge[]): void {
  for (const b of newBadges) {
    showToast(BADGE_ICON[b.iconKey] ?? "🏅", `Шинэ шагнал — ${b.titleMn}`);
  }
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
    const { payload, newBadges } = await completeAcademyItem(
      profile.value.id,
      courseId,
      itemKey,
      xp,
    );
    applyPayload(payload);
    if (xp > 0) showToast("✨", `+${xp} XP — ${label}`);
    queueBadgeToasts(newBadges);
  } catch (e) {
    error.value = e instanceof Error ? e.message : "Хадгалж чадсангүй";
  }
}

async function submitTask(
  courseId: string,
  taskId: string,
  answer: TaskAnswer,
): Promise<SubmitResult | null> {
  if (!profile.value) return null;
  try {
    const result = await submitTaskApi(profile.value.id, taskId, courseId, answer);
    if (result.payload) applyPayload(result.payload);
    if (result.correct && result.xpAwarded > 0) {
      showToast("✨", `+${result.xpAwarded} XP`);
    }
    queueBadgeToasts(result.newBadges);
    return result;
  } catch (e) {
    error.value = e instanceof Error ? e.message : "Илгээж чадсангүй";
    return null;
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
    init,
    onboard,
    markComplete,
    submitTask,
    refreshLeaderboard,
    showToast,
  };
}
