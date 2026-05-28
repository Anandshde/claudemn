<script setup lang="ts">
import { computed, ref } from "vue";
import type { LessonTask } from "@/api";

const props = defineProps<{
  task: LessonTask;
  locked: boolean;
  result: { correct: boolean; explanationMn?: string } | null;
}>();

const emit = defineEmits<{
  submit: [answer: { id: string } | { ids: string[] }];
}>();

const selectedSingle = ref<string | null>(null);
const selectedMulti = ref<Set<string>>(new Set());

const multi = computed(() => props.task.kind === "quiz_multi");
const options = computed(() => props.task.payload.options ?? []);

function toggleMulti(id: string) {
  if (props.locked) return;
  const next = new Set(selectedMulti.value);
  if (next.has(id)) next.delete(id);
  else next.add(id);
  selectedMulti.value = next;
}

function canSubmit() {
  if (props.locked) return false;
  if (multi.value) return selectedMulti.value.size > 0;
  return selectedSingle.value !== null;
}

function onSubmit() {
  if (!canSubmit()) return;
  if (multi.value) {
    emit("submit", { ids: [...selectedMulti.value] });
  } else if (selectedSingle.value) {
    emit("submit", { id: selectedSingle.value });
  }
}

function isSelected(id: string): boolean {
  if (multi.value) return selectedMulti.value.has(id);
  return selectedSingle.value === id;
}
</script>

<template>
  <div>
    <p class="mb-3 text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-muted">
      {{ multi ? "Олон сонголт" : "Нэг сонголт" }}
    </p>
    <p class="mb-4 font-heading text-lg font-semibold text-text">
      {{ task.promptMn }}
    </p>

    <ul class="mb-4 space-y-2">
      <li v-for="opt in options" :key="opt.id">
        <button
          type="button"
          :disabled="locked"
          :class="[
            'flex w-full items-start gap-3 rounded-xl border px-4 py-3 text-left transition-all',
            isSelected(opt.id)
              ? 'border-accent bg-overlay'
              : 'border-border-token bg-panel hover:border-accent',
            locked && 'opacity-80 cursor-default',
          ]"
          @click="multi ? toggleMulti(opt.id) : (selectedSingle = opt.id)"
        >
          <span
            :class="[
              'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center text-xs font-semibold',
              multi ? 'rounded' : 'rounded-full',
              isSelected(opt.id)
                ? 'bg-accent text-white'
                : 'border border-border-token bg-surface text-muted',
            ]"
          >
            {{ isSelected(opt.id) ? "✓" : "" }}
          </span>
          <span class="flex-1 text-sm leading-relaxed text-text">{{ opt.mn }}</span>
        </button>
      </li>
    </ul>

    <div
      v-if="result"
      :class="[
        'mb-4 rounded-xl border px-4 py-3 text-sm',
        result.correct
          ? 'border-[color-mix(in_srgb,#2f7d4f_55%,var(--surface))] bg-[color-mix(in_srgb,#2f7d4f_12%,var(--surface))] text-text'
          : 'border-[color-mix(in_srgb,#b3463d_55%,var(--surface))] bg-[color-mix(in_srgb,#b3463d_12%,var(--surface))] text-text',
      ]"
    >
      <p class="mb-1 font-semibold">
        {{ result.correct ? "Зөв хариулт ✓" : "Алдаатай байна" }}
      </p>
      <p v-if="result.explanationMn" class="text-muted">{{ result.explanationMn }}</p>
    </div>

    <button
      v-if="!locked"
      type="button"
      :disabled="!canSubmit()"
      class="rounded-full bg-accent px-5 py-2 text-sm font-medium text-white transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
      @click="onSubmit"
    >
      Илгээх
    </button>
  </div>
</template>
