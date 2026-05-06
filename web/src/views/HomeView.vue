<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import { RouterLink } from "vue-router";
import { courseDisplayTitle, getCourses, type CourseCatalogItem } from "@/api";

const PRODUCT_OPTIONS = [
  "AI Fluency",
  "Claude.ai",
  "Claude Code",
  "Claude Cowork",
  "Claude Platform",
  "MCP",
] as const;

const CATEGORY_OPTIONS = [
  "Education",
  "Engineering",
  "Nonprofits",
  "Professional",
] as const;

const courses = ref<CourseCatalogItem[] | null>(null);
const error = ref<string | null>(null);
const loading = ref(false);

const searchDraft = ref("");
const searchApplied = ref("");

const draftProducts = ref<string[]>([]);
const draftCategories = ref<string[]>([]);

const appliedProducts = ref<string[]>([]);
const appliedCategories = ref<string[]>([]);

const viewMode = ref<"grid" | "list">("grid");
const filterOpen = ref(false);

async function fetchCatalog() {
  loading.value = true;
  error.value = null;
  try {
    const data = await getCourses({
      q: searchApplied.value || undefined,
      products: appliedProducts.value.length ? appliedProducts.value : undefined,
      categories: appliedCategories.value.length ? appliedCategories.value : undefined,
    });
    courses.value = data.courses;
  } catch (e) {
    error.value = e instanceof Error ? e.message : "Could not load courses.";
    courses.value = null;
  } finally {
    loading.value = false;
  }
}

function applyFilters() {
  appliedProducts.value = [...draftProducts.value];
  appliedCategories.value = [...draftCategories.value];
  searchApplied.value = searchDraft.value.trim();
  filterOpen.value = false;
  fetchCatalog();
}

function resetFilters() {
  draftProducts.value = [];
  draftCategories.value = [];
  appliedProducts.value = [];
  appliedCategories.value = [];
  searchDraft.value = "";
  searchApplied.value = "";
  filterOpen.value = false;
  fetchCatalog();
}

function toggleDraft(list: string[], value: string) {
  const i = list.indexOf(value);
  if (i === -1) {
    list.push(value);
  } else {
    list.splice(i, 1);
  }
}

function formatOptionalCount(n: number | null | undefined): string {
  return n == null ? "—" : String(n);
}

/** Matches claude.com listing: "1 Quiz" vs "N Quizzes". */
function formatQuizParts(n: number | null | undefined): {
  count: string;
  label: string;
} {
  if (n == null) return { count: "—", label: "Quizzes" };
  if (n === 1) return { count: "1", label: "Quiz" };
  return { count: String(n), label: "Quizzes" };
}

onMounted(() => {
  draftProducts.value = [];
  draftCategories.value = [];
  fetchCatalog();
});

let searchTimer: ReturnType<typeof setTimeout> | null = null;
watch(searchDraft, () => {
  if (searchTimer) clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    searchApplied.value = searchDraft.value.trim();
    fetchCatalog();
  }, 320);
});
</script>

<template>
  <div class="mx-auto box-border w-full max-w-6xl px-4 pt-8 pb-12 sm:px-6">
    <!-- Hero -->
    <section class="mb-8 max-w-2xl animate-[fadeUp_0.5s_cubic-bezier(0.22,1,0.36,1)_both]">
      <p class="mb-2 text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-muted">
        Explore here
      </p>
      <h1
        class="mb-3 font-heading text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl"
      >
        Go deeper with Anthropic courses
      </h1>
      <p class="text-base leading-relaxed text-muted sm:text-lg">
        Structured learning paths with video lessons and assessments to help you master AI
        collaboration, Claude development, and MCP.
      </p>
    </section>

    <!-- Toolbar -->
    <section
      aria-label="Course controls"
      class="mb-7 animate-[fadeUp_0.55s_cubic-bezier(0.22,1,0.36,1)_both] [animation-delay:0.05s]"
    >
      <div class="flex flex-wrap items-center gap-3">
        <button
          type="button"
          class="inline-flex items-center gap-1.5 rounded-full border border-border-token bg-panel px-4 py-2 text-sm font-medium shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-accent hover:text-accent active:translate-y-0"
          :class="filterOpen ? 'border-accent text-accent' : ''"
          @click="filterOpen = !filterOpen"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            class="transition-transform duration-300"
            :class="filterOpen ? 'rotate-180' : ''"
          >
            <path
              d="M3 6h18M6 12h12M10 18h4"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
            />
          </svg>
          Filter
        </button>

        <label class="relative min-w-48 flex-1">
          <span class="sr-only">Search courses</span>
          <span
            class="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
            aria-hidden="true"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M21 21l-4.35-4.35m0 0a7 7 0 10-3.93 3.93 7 7 0 003.93-3.93z"
              />
            </svg>
          </span>
          <input
            v-model="searchDraft"
            type="search"
            autocomplete="off"
            placeholder="Search courses"
            class="w-full rounded-full border border-border-token bg-panel py-2.5 pl-10 pr-4 text-sm shadow-sm outline-none transition-all duration-200 placeholder:text-muted focus:border-accent focus:shadow-md focus:ring-2 focus:ring-accent/30"
          />
        </label>

        <div
          class="flex overflow-hidden rounded-full border border-border-token bg-panel"
          role="group"
          aria-label="Layout"
        >
          <button
            type="button"
            class="flex items-center justify-center px-3 py-2 transition-colors duration-200"
            :class="
              viewMode === 'grid' ? 'bg-accent-soft text-text' : 'text-muted hover:text-text'
            "
            title="Grid view"
            @click="viewMode = 'grid'"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M4 4h7v7H4V4zm9 0h7v7h-7V4zM4 13h7v7H4v-7zm9 0h7v7h-7v-7z" />
            </svg>
          </button>
          <button
            type="button"
            class="flex items-center justify-center px-3 py-2 transition-colors duration-200"
            :class="
              viewMode === 'list' ? 'bg-accent-soft text-text' : 'text-muted hover:text-text'
            "
            title="List view"
            @click="viewMode = 'list'"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M4 6h16v3H4V6zm0 5h16v3H4v-3zm0 5h16v3H4v-3z" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Filter panel -->
      <Transition
        enter-active-class="transition-all duration-300 ease-out"
        enter-from-class="opacity-0 -translate-y-2 max-h-0"
        enter-to-class="opacity-100 translate-y-0 max-h-[600px]"
        leave-active-class="transition-all duration-200 ease-in"
        leave-from-class="opacity-100 max-h-[600px]"
        leave-to-class="opacity-0 -translate-y-2 max-h-0"
      >
        <div
          v-if="filterOpen"
          role="dialog"
          aria-label="Filters"
          class="mt-4 overflow-hidden rounded-2xl border border-border-token bg-panel p-5 shadow-sm"
        >
          <div class="grid gap-5 sm:grid-cols-2">
            <fieldset class="border-0 p-0">
              <legend class="mb-2.5 text-sm font-semibold">Product</legend>
              <div class="space-y-1.5">
                <label
                  v-for="p in PRODUCT_OPTIONS"
                  :key="p"
                  class="flex cursor-pointer items-center gap-2 text-sm transition-colors hover:text-accent"
                >
                  <input
                    type="checkbox"
                    class="h-4 w-4 cursor-pointer accent-[var(--accent)]"
                    :checked="draftProducts.includes(p)"
                    @change="toggleDraft(draftProducts, p)"
                  />
                  {{ p }}
                </label>
              </div>
            </fieldset>
            <fieldset class="border-0 p-0">
              <legend class="mb-2.5 text-sm font-semibold">Category</legend>
              <div class="space-y-1.5">
                <label
                  v-for="c in CATEGORY_OPTIONS"
                  :key="c"
                  class="flex cursor-pointer items-center gap-2 text-sm transition-colors hover:text-accent"
                >
                  <input
                    type="checkbox"
                    class="h-4 w-4 cursor-pointer accent-[var(--accent)]"
                    :checked="draftCategories.includes(c)"
                    @change="toggleDraft(draftCategories, c)"
                  />
                  {{ c }}
                </label>
              </div>
            </fieldset>
          </div>
          <div class="mt-5 flex flex-wrap justify-end gap-2.5">
            <button
              type="button"
              class="rounded-full border border-border-token bg-transparent px-4 py-2 text-sm font-medium transition-all duration-200 hover:border-accent hover:text-accent"
              @click="resetFilters"
            >
              Reset
            </button>
            <button
              type="button"
              class="rounded-full bg-accent px-4 py-2 text-sm font-medium text-on-accent shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:brightness-110 active:translate-y-0"
              @click="applyFilters"
            >
              Apply
            </button>
          </div>
        </div>
      </Transition>
    </section>

    <!-- Error -->
    <p
      v-if="error"
      class="mb-4 rounded-lg border border-accent bg-overlay px-4 py-2.5 text-sm animate-[fadeIn_0.3s_ease-out]"
    >
      {{ error }}
    </p>

    <!-- Loading skeleton -->
    <div
      v-if="loading"
      class="grid gap-5"
      style="grid-template-columns: repeat(auto-fill, minmax(min(17rem, 100%), 1fr))"
    >
      <div
        v-for="n in 6"
        :key="n"
        class="overflow-hidden rounded-2xl border border-border-token bg-panel"
      >
        <div class="space-y-3 p-5">
          <div class="skeleton h-5 w-3/4" />
          <div class="flex gap-2">
            <div class="skeleton h-5 w-20 rounded-full" />
            <div class="skeleton h-5 w-24 rounded-full" />
          </div>
          <div class="grid grid-cols-1 gap-4 pt-3 sm:grid-cols-3">
            <div class="skeleton h-16" />
            <div class="skeleton h-16" />
            <div class="skeleton h-16" />
          </div>
        </div>
        <div class="border-t border-border-token p-5">
          <div class="skeleton h-9 w-full" />
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div
      v-else-if="courses && courses.length === 0"
      role="status"
      aria-live="polite"
      class="rounded-2xl border border-dashed border-border-token bg-panel px-4 py-12 text-center animate-[fadeUp_0.4s_ease-out]"
    >
      <h2 class="mb-2 font-heading text-2xl font-bold">No posts for those filters</h2>
      <p class="mb-4 text-muted">Try another search or clear some of your filters.</p>
      <button
        type="button"
        class="rounded-full border border-border-token bg-panel px-4 py-2 text-sm font-medium transition-all duration-200 hover:border-accent hover:text-accent"
        @click="resetFilters"
      >
        Clear all filters
      </button>
    </div>

    <!-- Grid view -->
    <div
      v-else-if="courses && viewMode === 'grid'"
      role="list"
      class="stagger grid gap-5"
      style="grid-template-columns: repeat(auto-fill, minmax(min(17rem, 100%), 1fr))"
    >
      <article
        v-for="c in courses"
        :key="c.id"
        role="listitem"
        class="group flex flex-col overflow-hidden rounded-2xl border border-border-token bg-panel shadow-[var(--shadow-card)] transition-all duration-300 ease-out hover:-translate-y-1 hover:border-accent/40 hover:shadow-lg"
      >
        <div class="flex-1 px-5 pb-3 pt-5">
          <h2
            class="font-heading text-xl font-bold leading-tight tracking-tight transition-colors group-hover:text-accent"
          >
            {{ courseDisplayTitle(c) }}
          </h2>
          <p class="mt-0.5 text-sm font-medium leading-snug text-muted">
            {{ courseDisplayTitle(c) }}
          </p>

          <div class="mt-5 space-y-4">
            <div>
              <p class="text-2xl font-bold tabular-nums text-text">
                {{ formatOptionalCount(c.lecturesCount) }}
              </p>
              <p class="mt-0.5 text-[0.65rem] font-semibold uppercase tracking-wider text-muted">
                Lectures
              </p>
            </div>
            <div>
              <p class="text-2xl font-bold tabular-nums text-text">
                {{ c.videoLength ?? "—" }}
              </p>
              <p class="mt-0.5 text-[0.65rem] font-semibold uppercase tracking-wider text-muted">
                of video
              </p>
            </div>
            <div>
              <p class="text-2xl font-bold tabular-nums text-text">
                {{ formatQuizParts(c.quizzesCount).count }}
              </p>
              <p class="mt-0.5 text-[0.65rem] font-semibold uppercase tracking-wider text-muted">
                {{ formatQuizParts(c.quizzesCount).label }}
              </p>
            </div>
          </div>

          <div class="mt-5 flex flex-wrap gap-1.5">
            <span
              class="rounded-full border border-border-token px-2.5 py-0.5 text-[0.7rem] font-semibold uppercase tracking-wider"
            >
              {{ c.product }}
            </span>
            <span
              class="rounded-full border border-border-token bg-surface px-2.5 py-0.5 text-[0.7rem] font-semibold uppercase tracking-wider"
            >
              {{ c.category }}
            </span>
          </div>
        </div>
        <div class="border-t border-border-token bg-overlay/40 px-5 pb-5 pt-4">
          <RouterLink
            :to="`/courses/${c.slug}`"
            class="block w-full rounded-lg bg-accent px-4 py-2.5 text-center text-sm font-medium text-on-accent shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:brightness-110 hover:shadow-md active:translate-y-0"
          >
            View course
          </RouterLink>
          <a
            v-if="c.externalUrl"
            :href="c.externalUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="mt-2.5 block text-xs text-muted transition-colors hover:text-accent"
          >
            Open on claude.com →
          </a>
        </div>
      </article>
    </div>

    <!-- List view -->
    <div
      v-else-if="courses && viewMode === 'list'"
      role="region"
      class="overflow-x-auto rounded-2xl border border-border-token bg-panel animate-[fadeIn_0.3s_ease-out]"
    >
      <table class="w-full min-w-[44rem] border-collapse text-sm">
        <thead>
          <tr class="border-b border-border-token text-[0.7rem] uppercase tracking-wider text-muted">
            <th class="px-4 py-3 text-left font-semibold">Product</th>
            <th class="px-4 py-3 text-left font-semibold">Category</th>
            <th class="px-4 py-3 text-left font-semibold">Course</th>
            <th class="px-4 py-3 text-left font-semibold">Lectures</th>
            <th class="px-4 py-3 text-left font-semibold">Video</th>
            <th class="px-4 py-3 text-left font-semibold">Assessment</th>
            <th class="px-4 py-3" />
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="c in courses"
            :key="c.id"
            class="border-b border-border-token transition-colors last:border-b-0 hover:bg-overlay/40"
          >
            <td class="px-4 py-3">{{ c.product }}</td>
            <td class="px-4 py-3">{{ c.category }}</td>
            <td class="max-w-[14rem] px-4 py-3">
              <div class="font-semibold leading-tight">{{ courseDisplayTitle(c) }}</div>
              <div class="mt-1 text-xs font-normal leading-snug text-muted">
                {{ courseDisplayTitle(c) }}
              </div>
            </td>
            <td class="px-4 py-3 align-top tabular-nums">
              <span class="font-semibold">{{ c.lecturesCount ?? "—" }}</span>
              <div class="text-[0.65rem] uppercase tracking-wider text-muted">Lectures</div>
            </td>
            <td class="px-4 py-3 align-top tabular-nums">
              <span class="font-semibold">{{ c.videoLength ?? "—" }}</span>
              <div class="text-[0.65rem] uppercase tracking-wider text-muted">of video</div>
            </td>
            <td class="px-4 py-3 align-top tabular-nums">
              <span class="font-semibold">{{ formatQuizParts(c.quizzesCount).count }}</span>
              <div class="text-[0.65rem] uppercase tracking-wider text-muted">
                {{ formatQuizParts(c.quizzesCount).label }}
              </div>
            </td>
            <td class="px-4 py-3">
              <RouterLink
                :to="`/courses/${c.slug}`"
                class="font-medium text-accent transition-colors hover:underline"
              >
                View course →
              </RouterLink>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Cert CTA -->
    <section
      class="mt-12 rounded-2xl border border-border-token bg-accent-soft px-5 py-10 text-center animate-[fadeUp_0.5s_ease-out]"
    >
      <h2 class="mb-5 font-heading text-2xl font-bold sm:text-3xl">
        Ready to prove your expertise?
      </h2>
      <a
        href="https://claude.com/resources/certifications"
        class="inline-block rounded-full bg-accent px-6 py-3 text-base font-medium text-on-accent shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:brightness-110 hover:shadow-md active:translate-y-0"
      >
        Get certified
      </a>
    </section>
  </div>
</template>
