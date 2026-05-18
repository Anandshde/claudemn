<script setup lang="ts">
import { computed } from "vue";
import { useRouter } from "vue-router";
import { useAcademy } from "@/academy/store";
import { BADGES, COURSES } from "@/academy/data";

const router = useRouter();
const { profile, progress, derivedStats, dailyXP, earnedBadgeIds } = useAcademy();

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function dateKey(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

const nextStep = computed(() => {
  for (const course of COURSES) {
    const cp = progress.value[course.id] ?? {};
    for (const lesson of course.lessons) {
      if (!cp[`lesson:${lesson.id}`]) {
        return { course, kind: "lesson" as const, item: lesson };
      }
    }
    for (const task of course.tasks) {
      if (!cp[`task:${task.id}`]) {
        return { course, kind: "task" as const, item: task };
      }
    }
  }
  return null;
});

const weekLabels = ["Ня", "Да", "Мя", "Лх", "Пү", "Ба", "Бя"] as const;

const weekData = computed(() => {
  const out: { day: string; xp: number; key: string }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    out.push({
      day: weekLabels[d.getDay()],
      xp: dailyXP.value[dateKey(d)] ?? 0,
      key: dateKey(d),
    });
  }
  return out;
});

const maxXP = computed(() => {
  const m = Math.max(...weekData.value.map((d) => d.xp), 1);
  // round up to a clean tick
  return Math.ceil(m / 20) * 20;
});

const recentBadges = computed(() =>
  earnedBadgeIds.value
    .slice(-3)
    .map((id) => BADGES.find((b) => b.id === id))
    .filter((b): b is (typeof BADGES)[number] => Boolean(b)),
);

const greeting = computed(() => {
  const h = new Date().getHours();
  if (h < 12) return "Өглөөний мэнд";
  if (h < 18) return "Өдрийн мэнд";
  return "Оройн мэнд";
});

function openCourse(courseId: string) {
  router.push(`/academy/courses/${courseId}`);
}

function openCourses() {
  router.push("/academy/courses");
}

function openLeaderboard() {
  router.push("/leaderboard");
}
</script>

<template>
  <div class="mx-auto box-border w-full max-w-6xl px-4 pt-8 pb-12 sm:px-6">
    <!-- Hero -->
    <section class="mb-8 animate-[fadeUp_0.5s_cubic-bezier(0.22,1,0.36,1)_both]">
      <p class="mb-2 text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-muted">
        {{ greeting }}
      </p>
      <h1
        class="mb-3 font-heading text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl"
      >
        {{ profile?.name }},
        <span class="italic text-accent">үргэлжлүүлье.</span>
      </h1>
      <p class="max-w-xl text-base leading-relaxed text-muted sm:text-lg">
        {{
          derivedStats.currentStreak > 0
            ? `Та ${derivedStats.currentStreak} хоног дараалан суралцаж байна. Энэ хэмнэлээ алдалгүй явцгаая.`
            : "Өнөөдөр нэг хичээл хийгээд streak-ээ эхлүүлье."
        }}
      </p>
    </section>

    <div class="grid gap-5 sm:grid-cols-2">
      <!-- Continue card -->
      <article
        v-if="nextStep"
        class="flex flex-col justify-between rounded-2xl p-7 text-cream shadow-[var(--shadow-card)] animate-[fadeUp_0.4s_ease-out]"
        :style="{ background: nextStep.course.color }"
      >
        <div>
          <p class="mb-2 text-[0.7rem] font-semibold uppercase tracking-[0.18em] opacity-80">
            Үргэлжлүүлэх
          </p>
          <h2
            class="mb-2 font-heading text-2xl font-bold leading-tight tracking-tight sm:text-3xl"
          >
            {{ nextStep.item.title }}
          </h2>
          <p class="text-sm opacity-85">
            {{ nextStep.course.title }}
          </p>
        </div>
        <button
          type="button"
          class="mt-5 inline-flex w-fit items-center gap-1.5 rounded-full bg-cream px-5 py-2.5 text-sm font-semibold text-charcoal shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:brightness-105 active:translate-y-0"
          @click="openCourse(nextStep.course.id)"
        >
          Үргэлжлүүлэх
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 6l6 6-6 6" />
          </svg>
        </button>
      </article>

      <article
        v-else
        class="flex flex-col justify-center rounded-2xl border border-border-token bg-panel p-7 text-center animate-[fadeUp_0.4s_ease-out]"
      >
        <p class="mb-2 text-3xl">🎉</p>
        <h2 class="mb-1 font-heading text-2xl font-bold">Бүх хичээл дууссан!</h2>
        <p class="text-sm text-muted">Дараагийн хичээлүүдийг хүлээж байна.</p>
      </article>

      <!-- Stats summary -->
      <article
        class="rounded-2xl border border-border-token bg-panel p-7 shadow-[var(--shadow-card)] animate-[fadeUp_0.45s_ease-out]"
      >
        <p class="mb-4 text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-muted">
          Статистик
        </p>
        <div class="grid grid-cols-2 gap-5">
          <div>
            <p class="font-heading text-3xl font-bold tabular-nums">
              {{ derivedStats.lessonsCompleted }}
            </p>
            <p class="mt-0.5 text-xs text-muted">хичээл дуусгасан</p>
          </div>
          <div>
            <p class="font-heading text-3xl font-bold tabular-nums">
              {{ derivedStats.coursesCompleted }}
            </p>
            <p class="mt-0.5 text-xs text-muted">бүтэн хөтөлбөр</p>
          </div>
          <div>
            <p class="font-heading text-3xl font-bold tabular-nums">
              {{ derivedStats.longestStreak }}
            </p>
            <p class="mt-0.5 text-xs text-muted">хамгийн урт streak</p>
          </div>
          <div>
            <p class="font-heading text-3xl font-bold tabular-nums">
              {{ earnedBadgeIds.length }}
            </p>
            <p class="mt-0.5 text-xs text-muted">тэмдэг хүртсэн</p>
          </div>
        </div>
      </article>

      <!-- Weekly chart -->
      <article
        class="rounded-2xl border border-border-token bg-panel p-7 shadow-[var(--shadow-card)] sm:col-span-2 animate-[fadeUp_0.5s_ease-out]"
      >
        <p class="mb-1 text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-muted">
          Сүүлийн 7 хоног
        </p>
        <h3 class="font-heading text-xl font-bold tracking-tight">Өдөр тутмын XP</h3>
        <div class="mt-5 flex h-44 items-end gap-2.5 sm:gap-4">
          <div
            v-for="d in weekData"
            :key="d.key"
            class="flex flex-1 flex-col items-center gap-2"
            :title="`${d.key}: ${d.xp} XP`"
          >
            <div
              class="relative flex w-full flex-1 items-end justify-center rounded-t-lg bg-overlay/70"
            >
              <div
                class="w-full rounded-t-lg bg-accent transition-all duration-500 ease-out"
                :style="{
                  height: `${(d.xp / maxXP) * 100}%`,
                  minHeight: d.xp > 0 ? '4px' : '0',
                }"
              />
              <span
                v-if="d.xp > 0"
                class="absolute -top-5 text-[0.65rem] font-semibold tabular-nums text-text"
              >
                {{ d.xp }}
              </span>
            </div>
            <span class="text-[0.7rem] font-medium text-muted">{{ d.day }}</span>
          </div>
        </div>
      </article>

      <!-- Recent badges -->
      <article
        class="rounded-2xl border border-border-token bg-panel p-7 shadow-[var(--shadow-card)] animate-[fadeUp_0.55s_ease-out]"
      >
        <p class="mb-1 text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-muted">
          Сүүлийн тэмдгүүд
        </p>
        <h3 class="mb-4 font-heading text-xl font-bold tracking-tight">Шагнал</h3>
        <div v-if="recentBadges.length" class="grid grid-cols-3 gap-3">
          <div
            v-for="b in recentBadges"
            :key="b.id"
            class="rounded-xl bg-surface p-4 text-center"
          >
            <div class="mb-1 text-2xl" aria-hidden="true">{{ b.icon }}</div>
            <p class="text-[0.7rem] font-semibold">{{ b.name }}</p>
          </div>
        </div>
        <p v-else class="text-sm italic text-muted">
          Эхний хичээлээ дуусгахад тэмдэг хүртэх боломжтой.
        </p>
      </article>

      <!-- Catalog link -->
      <article
        class="rounded-2xl border border-border-token bg-panel p-7 shadow-[var(--shadow-card)] animate-[fadeUp_0.6s_ease-out]"
      >
        <p class="mb-1 text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-muted">
          Бусад хэсэг
        </p>
        <h3 class="mb-4 font-heading text-xl font-bold tracking-tight">Холбоосууд</h3>
        <div class="flex flex-col gap-2">
          <button
            type="button"
            class="flex items-center justify-between rounded-xl bg-surface px-4 py-3 text-sm font-medium transition-colors hover:text-accent"
            @click="openCourses"
          >
            <span>Бүх хичээлүүд</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 6l6 6-6 6" />
            </svg>
          </button>
          <button
            type="button"
            class="flex items-center justify-between rounded-xl bg-surface px-4 py-3 text-sm font-medium transition-colors hover:text-accent"
            @click="openLeaderboard"
          >
            <span>Тэргүүлэгчид</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 6l6 6-6 6" />
            </svg>
          </button>
        </div>
      </article>
    </div>
  </div>
</template>
