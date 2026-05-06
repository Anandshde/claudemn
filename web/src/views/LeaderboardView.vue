<script setup lang="ts">
const demo = [
  { rank: 1, name: "You (soon)", xp: "—" },
  { rank: 2, name: "Connect API to show ranks", xp: "—" },
  { rank: 3, name: "…", xp: "—" },
];

function rankClasses(rank: number): string {
  if (rank === 1) return "bg-accent text-on-accent";
  if (rank === 2) return "bg-accent-soft text-accent";
  if (rank === 3) return "bg-overlay text-text";
  return "bg-panel text-muted";
}
</script>

<template>
  <div class="mx-auto max-w-xl px-4 pt-6 pb-4 sm:px-6">
    <div class="animate-[fadeUp_0.45s_cubic-bezier(0.22,1,0.36,1)]">
      <h1 class="mb-2 font-heading text-3xl font-bold tracking-tight">Leaderboard</h1>
      <p class="mb-6 text-sm text-muted">
        Top learners this week. Wire this view to your backend when you add accounts.
      </p>
    </div>

    <ul
      class="stagger m-0 list-none space-y-2 overflow-hidden rounded-2xl border border-border-token bg-panel p-2 shadow-[var(--shadow-card)]"
    >
      <li
        v-for="row in demo"
        :key="row.rank"
        class="grid grid-cols-[2.5rem_1fr_auto] items-center gap-3 rounded-xl px-3 py-3 text-sm transition-colors duration-200 hover:bg-overlay/60"
      >
        <span
          class="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-transform duration-200 hover:scale-110"
          :class="rankClasses(row.rank)"
        >
          {{ row.rank }}
        </span>
        <span class="font-medium">{{ row.name }}</span>
        <span class="text-xs text-muted">{{ row.xp }}</span>
      </li>
    </ul>
  </div>
</template>
