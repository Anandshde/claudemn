<script setup lang="ts">
import { computed } from "vue";
import { RouterLink, useRoute } from "vue-router";

const route = useRoute();

const visible = computed(() => route.meta.showBottomNav === true);
const tab = computed(() => route.meta.bottomTab as string | undefined);

const items = [
  { id: "home", label: "Нүүр", to: "/", icon: "home" },
  { id: "leaderboard", label: "Тэргүүлэгчид", to: "/leaderboard", icon: "trophy" },
  { id: "progress", label: "Ахиц", to: "/progress", icon: "chart" },
  { id: "profile", label: "Профайл", to: "/profile", icon: "user" },
] as const;

function isActive(id: string): boolean {
  return tab.value === id;
}
</script>

<template>
  <nav
    v-if="visible"
    aria-label="Primary"
    class="fixed inset-x-0 bottom-0 z-50 flex items-stretch justify-around gap-1 border-t border-border-token bg-panel/95 px-2 backdrop-blur-md"
    :style="{
      paddingTop: '0.4rem',
      paddingBottom: 'calc(0.5rem + env(safe-area-inset-bottom, 0px))',
      boxShadow: 'var(--shadow-lift)',
    }"
  >
    <RouterLink
      v-for="item in items"
      :key="item.id"
      :to="item.to"
      class="group relative flex min-w-0 max-w-[7rem] flex-1 flex-col items-center justify-center gap-0.5 rounded-xl px-2 py-1.5 text-[0.65rem] font-medium transition-colors duration-200"
      :class="isActive(item.id) ? 'text-accent' : 'text-muted hover:text-text'"
      :aria-current="isActive(item.id) ? 'page' : undefined"
    >
      <span
        class="pointer-events-none absolute inset-0 -z-10 rounded-xl bg-accent-soft opacity-0 transition-opacity duration-300"
        :class="isActive(item.id) ? 'opacity-100' : ''"
      />
      <span
        class="flex items-center justify-center transition-transform duration-300 ease-out"
        :class="isActive(item.id) ? 'scale-110 -translate-y-0.5' : 'group-hover:-translate-y-0.5'"
        aria-hidden="true"
      >
        <svg v-if="item.icon === 'home'" viewBox="0 0 24 24" width="22" height="22" fill="none">
          <path
            d="M4 10.5L12 4l8 6.5V20a1 1 0 01-1 1h-5v-6H10v6H5a1 1 0 01-1-1v-9.5z"
            stroke="currentColor"
            stroke-width="2"
            stroke-linejoin="round"
          />
        </svg>
        <svg
          v-else-if="item.icon === 'trophy'"
          viewBox="0 0 24 24"
          width="22"
          height="22"
          fill="none"
        >
          <path
            d="M8 21h8M12 17v4M7 4h10v3a5 5 0 01-10 0V4zM5 4H3v2a3 3 0 003 3M19 4h2v2a3 3 0 01-3 3"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
        <svg
          v-else-if="item.icon === 'user'"
          viewBox="0 0 24 24"
          width="22"
          height="22"
          fill="none"
        >
          <path
            d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
          />
        </svg>
        <svg v-else viewBox="0 0 24 24" width="22" height="22" fill="none">
          <path
            d="M4 19V5M4 19h16M4 19l3-6h5l2 3h6M8 13V9m4 4V7m4 6v-4"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </span>
      <span class="block max-w-full truncate">{{ item.label }}</span>
    </RouterLink>
  </nav>
</template>
