<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import { useAcademy } from "@/academy/store";
import { fetchBadges, type BadgeListEntry } from "@/academy/tasks";
import AcademyOnboarding from "@/components/AcademyOnboarding.vue";

const academy = useAcademy();

const earned = ref<BadgeListEntry[]>([]);
const locked = ref<BadgeListEntry[]>([]);
const loadingBadges = ref(false);
const badgeError = ref<string | null>(null);

const BADGE_ICON: Record<string, string> = {
  spark: "✨",
  flame: "🔥",
  star: "⭐",
  crown: "👑",
  sparkles: "🌟",
};

async function loadBadges() {
  if (!academy.profile.value) {
    earned.value = [];
    locked.value = [];
    return;
  }
  loadingBadges.value = true;
  badgeError.value = null;
  try {
    const data = await fetchBadges(academy.profile.value.id);
    earned.value = data.earned;
    locked.value = data.locked;
  } catch (e) {
    badgeError.value = e instanceof Error ? e.message : "Шагнал ачаалж чадсангүй";
  } finally {
    loadingBadges.value = false;
  }
}

onMounted(loadBadges);
watch(() => academy.profile.value?.id, loadBadges);

function fmtDate(iso?: string) {
  if (!iso) return "";
  const d = new Date(iso + "T00:00:00Z");
  return d.toLocaleDateString("mn-MN");
}
</script>

<template>
  <div class="mx-auto max-w-3xl px-4 pt-6 pb-8 sm:px-6">
    <AcademyOnboarding v-if="!academy.profile.value && !academy.loading.value" />

    <div
      v-if="academy.profile.value"
      class="animate-[fadeUp_0.45s_cubic-bezier(0.22,1,0.36,1)]"
    >
      <!-- Header -->
      <section
        class="mb-8 rounded-2xl border border-border-token bg-panel p-6 sm:p-8 shadow-[var(--shadow-card)]"
      >
        <div class="flex items-center gap-5">
          <div
            class="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-accent-soft text-2xl font-bold text-accent"
          >
            {{ academy.profile.value.name.slice(0, 1) }}
          </div>
          <div class="min-w-0 flex-1">
            <h1
              class="font-heading text-2xl font-bold tracking-tight text-text sm:text-3xl"
            >
              {{ academy.profile.value.name }}
            </h1>
            <p class="text-sm text-muted">
              Бүртгүүлсэн: {{ fmtDate(academy.profile.value.joinedDate) }}
            </p>
          </div>
        </div>

        <dl class="mt-6 grid grid-cols-3 gap-4 text-center">
          <div>
            <dt class="text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-muted">
              Нийт XP
            </dt>
            <dd class="mt-1 font-heading text-2xl font-bold text-text">
              {{ academy.stats.totalXP }}
            </dd>
          </div>
          <div>
            <dt class="text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-muted">
              Идэвхтэй
            </dt>
            <dd class="mt-1 font-heading text-2xl font-bold text-text">
              {{ academy.stats.currentStreak }} <span class="text-base text-muted">хон.</span>
            </dd>
          </div>
          <div>
            <dt class="text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-muted">
              Дээд цуваа
            </dt>
            <dd class="mt-1 font-heading text-2xl font-bold text-text">
              {{ academy.stats.longestStreak }} <span class="text-base text-muted">хон.</span>
            </dd>
          </div>
        </dl>
      </section>

      <!-- Badges -->
      <section>
        <h2 class="mb-4 font-heading text-xl font-bold text-text sm:text-2xl">
          Шагнал
        </h2>
        <p v-if="badgeError" class="mb-3 text-sm text-accent">{{ badgeError }}</p>
        <p v-if="loadingBadges && !earned.length && !locked.length" class="text-sm text-muted">
          Ачаалж байна…
        </p>

        <div v-if="earned.length" class="mb-6">
          <p class="mb-2 text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-muted">
            Авсан ({{ earned.length }})
          </p>
          <ul class="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <li
              v-for="b in earned"
              :key="b.slug"
              class="rounded-2xl border border-accent bg-overlay p-4 text-center shadow-[var(--shadow-card)]"
            >
              <div class="text-3xl">{{ BADGE_ICON[b.iconKey] ?? "🏅" }}</div>
              <p class="mt-2 font-heading text-sm font-semibold text-text">
                {{ b.titleMn }}
              </p>
              <p class="mt-1 text-xs text-muted">{{ b.descriptionMn }}</p>
            </li>
          </ul>
        </div>

        <div v-if="locked.length">
          <p class="mb-2 text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-muted">
            Цоожтой ({{ locked.length }})
          </p>
          <ul class="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <li
              v-for="b in locked"
              :key="b.slug"
              class="rounded-2xl border border-border-token bg-panel p-4 text-center opacity-75"
            >
              <div class="text-3xl grayscale">{{ BADGE_ICON[b.iconKey] ?? "🏅" }}</div>
              <p class="mt-2 font-heading text-sm font-semibold text-muted">
                {{ b.titleMn }}
              </p>
              <p class="mt-1 text-xs text-muted">{{ b.descriptionMn }}</p>
              <p
                v-if="b.progress"
                class="mt-2 inline-block rounded-full bg-overlay px-2.5 py-0.5 text-[0.65rem] font-medium text-text"
              >
                {{ b.progress.current }} / {{ b.progress.target }}
              </p>
            </li>
          </ul>
        </div>
      </section>
    </div>
  </div>
</template>
