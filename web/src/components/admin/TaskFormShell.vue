<script setup lang="ts">
import { ref, watch, computed } from "vue";
import type { AdminTask, AdminTaskKind, AdminTaskPayload } from "@/admin/api";
import { suggestSlug } from "@/admin/slug";
import QuizPayloadEditor from "./QuizPayloadEditor.vue";
import PromptExercisePayloadEditor from "./PromptExercisePayloadEditor.vue";
import ReflectionPayloadEditor from "./ReflectionPayloadEditor.vue";

const props = defineProps<{
  initial?: AdminTask | null;
  defaultSortOrder?: number;
}>();

const emit = defineEmits<{
  submit: [
    body: {
      slug: string;
      kind: AdminTaskKind;
      promptMn: string;
      promptEn: string | null;
      payload: AdminTaskPayload;
      xpReward: number;
      sortOrder: number;
    },
  ];
  cancel: [];
}>();

const slug = ref(props.initial?.slug ?? "");
const slugTouched = ref(!!props.initial);
const kind = ref<AdminTaskKind>(props.initial?.kind ?? "quiz_single");
const promptMn = ref(props.initial?.promptMn ?? "");
const promptEn = ref(props.initial?.promptEn ?? "");
const xpReward = ref(props.initial?.xpReward ?? 10);
const sortOrder = ref(props.initial?.sortOrder ?? props.defaultSortOrder ?? 0);

function defaultPayload(k: AdminTaskKind): AdminTaskPayload {
  if (k === "quiz_single")
    return { options: [{ id: "a", mn: "" }, { id: "b", mn: "" }], correctId: undefined };
  if (k === "quiz_multi")
    return { options: [{ id: "a", mn: "" }, { id: "b", mn: "" }], correctIds: [] };
  if (k === "prompt_exercise") return { minChars: 60 };
  return { minChars: 60 }; // reflection
}

const payload = ref<AdminTaskPayload>(
  props.initial ? { ...props.initial.payload } : defaultPayload(kind.value),
);

watch(promptMn, (v) => {
  if (!slugTouched.value) slug.value = suggestSlug(v).slice(0, 48);
});

watch(kind, (newK, oldK) => {
  if (newK === oldK) return;
  // Reset payload to defaults for new kind, but try to preserve options if both are quizzes
  if ((newK === "quiz_single" || newK === "quiz_multi") &&
      (oldK === "quiz_single" || oldK === "quiz_multi")) {
    if (newK === "quiz_multi") {
      payload.value = {
        ...payload.value,
        correctIds: payload.value.correctId ? [payload.value.correctId] : [],
        correctId: undefined,
      };
    } else {
      payload.value = {
        ...payload.value,
        correctId: payload.value.correctIds?.[0],
        correctIds: undefined,
      };
    }
  } else {
    payload.value = defaultPayload(newK);
  }
});

const canSubmit = computed(() => {
  if (!slug.value.trim() || !promptMn.value.trim()) return false;
  if (kind.value === "quiz_single") {
    const opts = payload.value.options ?? [];
    return opts.length >= 2 && !!payload.value.correctId &&
      opts.every((o) => o.mn.trim());
  }
  if (kind.value === "quiz_multi") {
    const opts = payload.value.options ?? [];
    return opts.length >= 2 && (payload.value.correctIds?.length ?? 0) > 0 &&
      opts.every((o) => o.mn.trim());
  }
  return (payload.value.minChars ?? 0) >= 0;
});

const busy = ref(false);

async function onSubmit() {
  if (!canSubmit.value || busy.value) return;
  busy.value = true;
  try {
    emit("submit", {
      slug: slug.value.trim(),
      kind: kind.value,
      promptMn: promptMn.value.trim(),
      promptEn: promptEn.value.trim() || null,
      payload: payload.value,
      xpReward: xpReward.value,
      sortOrder: sortOrder.value,
    });
  } finally {
    busy.value = false;
  }
}

const KIND_LABELS: Record<AdminTaskKind, string> = {
  quiz_single: "Quiz · нэг сонголт",
  quiz_multi: "Quiz · олон сонголт",
  prompt_exercise: "Prompt дасгал",
  reflection: "Тунгаалт",
};
</script>

<template>
  <form
    class="space-y-4 rounded-2xl border border-border-token bg-surface p-5"
    @submit.prevent="onSubmit"
  >
    <div class="grid gap-3 sm:grid-cols-2">
      <div>
        <label class="mb-1 block text-xs font-semibold text-text">Төрөл</label>
        <select
          v-model="kind"
          class="w-full rounded-lg border border-border-token bg-surface px-3 py-2 text-sm focus:border-accent"
        >
          <option v-for="(label, key) in KIND_LABELS" :key="key" :value="key">{{ label }}</option>
        </select>
      </div>
      <div>
        <label class="mb-1 block text-xs font-semibold text-text">Slug</label>
        <input
          v-model="slug"
          @input="slugTouched = true"
          placeholder="task-slug"
          class="w-full rounded-lg border border-border-token bg-surface px-3 py-2 font-mono text-sm focus:border-accent"
        />
      </div>
    </div>

    <div>
      <label class="mb-1 block text-xs font-semibold text-text">Асуулт / зааварчилгаа (MN)</label>
      <textarea
        v-model="promptMn"
        rows="2"
        placeholder="Сурагчид харагдах асуулт..."
        class="w-full rounded-lg border border-border-token bg-surface px-3 py-2 text-sm focus:border-accent"
      />
    </div>

    <QuizPayloadEditor
      v-if="kind === 'quiz_single' || kind === 'quiz_multi'"
      v-model="payload"
      :multi="kind === 'quiz_multi'"
    />
    <PromptExercisePayloadEditor v-else-if="kind === 'prompt_exercise'" v-model="payload" />
    <ReflectionPayloadEditor v-else v-model="payload" />

    <div class="grid gap-3 sm:grid-cols-2">
      <div>
        <label class="mb-1 block text-xs font-semibold text-text">XP шагнал</label>
        <input
          v-model.number="xpReward"
          type="number"
          min="0"
          max="500"
          class="w-32 rounded-lg border border-border-token bg-surface px-3 py-1.5 text-sm focus:border-accent"
        />
      </div>
      <div>
        <label class="mb-1 block text-xs font-semibold text-text">Sort order</label>
        <input
          v-model.number="sortOrder"
          type="number"
          class="w-32 rounded-lg border border-border-token bg-surface px-3 py-1.5 text-sm focus:border-accent"
        />
      </div>
    </div>

    <div class="flex items-center justify-end gap-2 pt-2">
      <button
        type="button"
        class="rounded-full border border-border-token bg-panel px-4 py-1.5 text-xs font-medium"
        @click="emit('cancel')"
      >
        Цуцлах
      </button>
      <button
        type="submit"
        :disabled="!canSubmit || busy"
        class="rounded-full bg-accent px-4 py-1.5 text-xs font-medium text-on-accent hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {{ initial ? "Хадгалах" : "Нэмэх" }}
      </button>
    </div>
  </form>
</template>
