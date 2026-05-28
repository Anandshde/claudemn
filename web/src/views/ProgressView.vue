<script setup lang="ts">
import { computed } from "vue";
import { useAcademy } from "@/academy/store";
import AcademyOnboarding from "@/components/AcademyOnboarding.vue";

const academy = useAcademy();

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function dateKey(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

const itemCounts = computed(() => {
  let lessons = 0;
  let tasks = 0;
  for (const courseProgress of Object.values(academy.progress.value)) {
    for (const key of Object.keys(courseProgress)) {
      if (key.startsWith("lesson:")) lessons++;
      else if (key.startsWith("task:")) tasks++;
    }
  }
  return { lessons, tasks };
});

const weekLabels = ["Ня", "Да", "Мя", "Лх", "Пү", "Ба", "Бя"] as const;

const weekData = computed(() => {
  const out: { day: string; xp: number; key: string }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    out.push({
      day: weekLabels[d.getDay()],
      xp: academy.dailyXP.value[dateKey(d)] ?? 0,
      key: dateKey(d),
    });
  }
  return out;
});

const maxXP = computed(() => {
  const m = Math.max(...weekData.value.map((d) => d.xp), 1);
  return Math.ceil(m / 20) * 20;
});

const weekTotal = computed(() =>
  weekData.value.reduce((sum, d) => sum + d.xp, 0),
);
</script>

<template>
  <div class="mx-auto max-w-3xl px-4 pt-6 pb-8 sm:px-6">
    <AcademyOnboarding
      v-if="!academy.profile.value && !academy.loading.value"
    />

    <div
      v-else-if="academy.profile.value"
      class="animate-[fadeUp_0.45s_cubic-bezier(0.22,1,0.36,1)]"
    >
      <div class="mb-6">
        <h1 class="mb-2 font-heading text-3xl font-bold tracking-tight">Ахиц</h1>
        <p class="text-sm text-muted">
          Таны нийт суралцлын дүн ба сүүлийн долоо хоногийн идэвх.
        </p>
      </div>

      <section class="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div
          class="rounded-2xl border border-border-token bg-panel p-5 text-center shadow-[var(--shadow-card)]"
        >
          <p class="font-heading text-3xl font-bold tabular-nums text-accent">
            {{ academy.stats.totalXP }}
          </p>
          <p class="mt-1.5 text-xs text-muted">Нийт XP</p>
        </div>
        <div
          class="rounded-2xl border border-border-token bg-panel p-5 text-center shadow-[var(--shadow-card)]"
        >
          <p class="font-heading text-3xl font-bold tabular-nums">
            {{ academy.stats.currentStreak }}
          </p>
          <p class="mt-1.5 text-xs text-muted">Идэвхтэй хоног</p>
        </div>
        <div
          class="rounded-2xl border border-border-token bg-panel p-5 text-center shadow-[var(--shadow-card)]"
        >
          <p class="font-heading text-3xl font-bold tabular-nums">
            {{ academy.stats.longestStreak }}
          </p>
          <p class="mt-1.5 text-xs text-muted">Дээд цуваа</p>
        </div>
        <div
          class="rounded-2xl border border-border-token bg-panel p-5 text-center shadow-[var(--shadow-card)]"
        >
          <p class="font-heading text-3xl font-bold tabular-nums">
            {{ itemCounts.lessons }}
          </p>
          <p class="mt-1.5 text-xs text-muted">Хичээл дуусгасан</p>
        </div>
      </section>

      <section
        class="rounded-2xl border border-border-token bg-panel p-6 shadow-[var(--shadow-card)]"
      >
        <div class="mb-4 flex items-end justify-between gap-3">
          <div>
            <p
              class="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-muted"
            >
              Сүүлийн 7 хоног
            </p>
            <h2 class="font-heading text-xl font-bold tracking-tight">
              Өдөр тутмын XP
            </h2>
          </div>
          <p class="font-heading text-2xl font-bold tabular-nums text-accent">
            {{ weekTotal }}
            <span class="text-xs font-medium text-muted">XP / 7 хон.</span>
          </p>
        </div>

        <div class="flex h-44 items-end gap-2.5 sm:gap-4">
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

        <p v-if="weekTotal === 0" class="mt-4 text-center text-xs italic text-muted">
          Энэ долоо хоногт XP хараахан цуглаагүй байна. Нэг хичээл дуусгаад
          эхлүүлье.
        </p>
      </section>

      <p
        v-if="itemCounts.tasks > 0"
        class="mt-4 text-center text-xs text-muted"
      >
        Үүний дотор {{ itemCounts.tasks }} даалгавар амжилттай илгээгдсэн.
      </p>
    </div>

    <div
      v-else
      class="rounded-2xl border border-border-token bg-panel p-8 text-center shadow-[var(--shadow-card)]"
    >
      <p class="text-sm text-muted">Ачаалж байна…</p>
    </div>
  </div>
</template>
