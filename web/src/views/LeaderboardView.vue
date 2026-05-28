<script setup lang="ts">
import { computed, onMounted } from "vue";
import { useAcademy } from "@/academy/store";

const academy = useAcademy();

onMounted(() => {
  academy.refreshLeaderboard();
});

const rows = computed(() =>
  academy.leaderboard.value.map((entry, i) => ({
    ...entry,
    rank: i + 1,
    isMe: entry.id === academy.profile.value?.id,
  })),
);

function rankClasses(rank: number, isMe: boolean): string {
  if (isMe) return "bg-accent text-on-accent ring-2 ring-accent/30";
  if (rank === 1) return "bg-accent text-on-accent";
  if (rank === 2) return "bg-accent-soft text-accent";
  if (rank === 3) return "bg-overlay text-text";
  return "bg-panel text-muted";
}
</script>

<template>
  <div class="mx-auto max-w-xl px-4 pt-6 pb-4 sm:px-6">
    <div class="animate-[fadeUp_0.45s_cubic-bezier(0.22,1,0.36,1)]">
      <h1 class="mb-2 font-heading text-3xl font-bold tracking-tight">
        Тэргүүлэгчид
      </h1>
      <p class="mb-6 text-sm text-muted">
        XP-ээр эрэмбэлсэн топ суралцагчид. Танай нэр өнгөтэй тодорно.
      </p>
    </div>

    <p v-if="academy.error.value" class="mb-3 text-sm text-accent">
      {{ academy.error.value }}
    </p>

    <p
      v-if="academy.loading.value && rows.length === 0"
      class="rounded-2xl border border-border-token bg-panel p-6 text-center text-sm text-muted shadow-[var(--shadow-card)]"
    >
      Ачаалж байна…
    </p>

    <div
      v-else-if="rows.length === 0"
      class="rounded-2xl border border-dashed border-border-token bg-panel p-8 text-center"
    >
      <p class="mb-1 font-heading text-lg font-bold">Хараахан хоосон байна</p>
      <p class="text-sm text-muted">
        Хичээл дуусгаад жагсаалтад орох эхний хэрэглэгч болоорой.
      </p>
    </div>

    <ul
      v-else
      class="stagger m-0 list-none space-y-2 overflow-hidden rounded-2xl border border-border-token bg-panel p-2 shadow-[var(--shadow-card)]"
    >
      <li
        v-for="row in rows"
        :key="row.id"
        class="grid grid-cols-[2.5rem_1fr_auto] items-center gap-3 rounded-xl px-3 py-3 text-sm transition-colors duration-200"
        :class="row.isMe ? 'bg-accent-soft' : 'hover:bg-overlay/60'"
      >
        <span
          class="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-transform duration-200 hover:scale-110"
          :class="rankClasses(row.rank, row.isMe)"
        >
          {{ row.rank }}
        </span>
        <span class="flex items-center gap-2 min-w-0">
          <span class="truncate font-medium">{{ row.name }}</span>
          <span
            v-if="row.isMe"
            class="inline-flex shrink-0 items-center rounded-full bg-accent px-2 py-0.5 text-[0.6rem] font-semibold uppercase tracking-wider text-on-accent"
          >
            Та
          </span>
        </span>
        <span class="flex shrink-0 items-baseline gap-3 tabular-nums">
          <span v-if="row.streak > 0" class="text-xs text-muted" :title="`${row.streak} хоног streak`">
            🔥{{ row.streak }}
          </span>
          <span class="font-heading text-sm font-bold text-accent">
            {{ row.xp }}
            <span class="text-[0.65rem] font-medium text-muted">XP</span>
          </span>
        </span>
      </li>
    </ul>
  </div>
</template>
