<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { RouterLink, RouterView, useRoute } from "vue-router";
import BottomNav from "@/components/BottomNav.vue";

const THEME_KEY = "mn-courses-theme";

const route = useRoute();
const bottomNavPadding = computed(() => route.meta.showBottomNav === true);

const theme = ref<"light" | "dark">("light");

function applyTheme(mode: "light" | "dark") {
  document.documentElement.dataset.theme = mode;
  document.documentElement.style.colorScheme = mode;
}

onMounted(() => {
  const dataset = document.documentElement.dataset.theme;
  if (dataset === "dark" || dataset === "light") {
    theme.value = dataset;
    return;
  }
  try {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored === "dark" || stored === "light") {
      theme.value = stored;
      applyTheme(stored);
    }
  } catch {
    applyTheme(theme.value);
  }
});

watch(theme, (mode) => {
  try {
    localStorage.setItem(THEME_KEY, mode);
  } catch {
    /* private mode etc. */
  }
  applyTheme(mode);
});

function toggleTheme() {
  theme.value = theme.value === "light" ? "dark" : "light";
}

const toggleLabel = computed(() =>
  theme.value === "light" ? "Switch to dark mode" : "Switch to light mode",
);
</script>

<template>
  <div class="flex min-h-screen flex-col bg-surface text-text">
    <header
      class="sticky top-0 z-40 border-b border-border-token bg-surface/85 backdrop-blur-md"
    >
      <div
        class="mx-auto flex max-w-6xl flex-wrap items-center gap-4 px-4 py-3 sm:gap-6 sm:px-6"
      >
        <RouterLink
          to="/"
          class="text-sm font-semibold tracking-wide font-heading transition-colors hover:text-accent"
        >
          Claude Courses
        </RouterLink>
        <nav class="flex items-center gap-1 text-sm text-muted" aria-label="Breadcrumb">
          <span>Resources</span>
          <span class="opacity-50" aria-hidden="true">/</span>
          <RouterLink to="/" class="font-semibold text-text">Courses</RouterLink>
        </nav>
        <button
          type="button"
          class="ml-auto inline-flex h-10 w-10 items-center justify-center rounded-full border border-border-token bg-panel text-text shadow-sm transition-all duration-300 hover:scale-105 hover:border-accent hover:text-accent active:scale-95"
          :aria-label="toggleLabel"
          :title="toggleLabel"
          @click="toggleTheme"
        >
          <Transition name="fade" mode="out-in">
            <svg
              v-if="theme === 'light'"
              key="moon"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              class="animate-[pop_0.3s_cubic-bezier(0.34,1.56,0.64,1)]"
            >
              <path
                d="M21 14.5A8.5 8.5 0 0111.5 5a8.45 8.45 0 012.1-3.5 9 9 0 100 16 8.45 8.45 0 01-2.1-3.5z"
                stroke="currentColor"
                stroke-width="2"
                stroke-linejoin="round"
              />
            </svg>
            <svg
              v-else
              key="sun"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              class="animate-[pop_0.3s_cubic-bezier(0.34,1.56,0.64,1)]"
            >
              <circle
                cx="12"
                cy="12"
                r="5"
                stroke="currentColor"
                stroke-width="2"
              />
              <path
                d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
              />
            </svg>
          </Transition>
        </button>
      </div>
    </header>

    <main class="w-full flex-1" :class="bottomNavPadding ? 'pb-24' : ''">
      <RouterView v-slot="{ Component, route: r }">
        <Transition name="fade" mode="out-in">
          <component :is="Component" :key="r.fullPath" />
        </Transition>
      </RouterView>
    </main>

    <BottomNav />

    <footer
      v-if="!bottomNavPadding"
      class="border-t border-border-token bg-surface"
    >
      <p class="mx-auto max-w-6xl px-4 py-5 text-xs text-muted sm:px-6">
        Layout inspired by public course listing at claude.com; data is stored locally with your
        API.
      </p>
    </footer>
  </div>
</template>
