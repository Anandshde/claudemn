<script setup lang="ts">
const stats = [
  { value: 0, label: "Lessons done" },
  { value: 0, label: "Day streak" },
];
</script>

<template>
  <div class="mx-auto max-w-xl px-4 pt-6 pb-4 sm:px-6">
    <div class="animate-[fadeUp_0.45s_cubic-bezier(0.22,1,0.36,1)]">
      <h1 class="mb-2 font-heading text-3xl font-bold tracking-tight">Progress</h1>
      <p class="mb-6 text-sm text-muted">
        Your fourth tab: track completed lessons, streaks, and certificates. Hook this up to D1
        or your auth layer when users log in.
      </p>
    </div>

    <div class="stagger grid grid-cols-2 gap-3">
      <div
        v-for="s in stats"
        :key="s.label"
        class="rounded-2xl border border-border-token bg-panel p-5 text-center shadow-[var(--shadow-card)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
      >
        <p class="text-3xl font-bold text-accent">{{ s.value }}</p>
        <p class="mt-1.5 text-xs text-muted">{{ s.label }}</p>
      </div>
    </div>
  </div>
</template>
