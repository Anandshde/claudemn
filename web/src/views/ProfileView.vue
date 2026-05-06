<script setup lang="ts">
const actions = [
  "Account (coming soon)",
  "Notifications (coming soon)",
  "Language: MN / EN (coming soon)",
];
</script>

<template>
  <div class="mx-auto max-w-xl px-4 pt-6 pb-4 text-center sm:px-6">
    <div
      class="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-accent-soft text-3xl font-bold text-accent shadow-[var(--shadow-card)] animate-[pop_0.5s_cubic-bezier(0.34,1.56,0.64,1)]"
      aria-hidden="true"
    >
      ?
    </div>
    <h1
      class="mb-2 font-heading text-3xl font-bold tracking-tight animate-[fadeUp_0.4s_ease-out]"
    >
      Profile
    </h1>
    <p class="mb-6 text-left text-sm text-muted animate-[fadeUp_0.45s_ease-out]">
      Sign-in and profile settings will live here (name, email, language).
    </p>
    <ul class="stagger m-0 list-none space-y-2 p-0 text-left">
      <li v-for="label in actions" :key="label">
        <button
          type="button"
          disabled
          class="block w-full cursor-not-allowed rounded-xl border border-border-token bg-panel px-4 py-3.5 text-sm text-muted transition-all duration-200 hover:border-accent/40"
        >
          {{ label }}
        </button>
      </li>
    </ul>
  </div>
</template>
