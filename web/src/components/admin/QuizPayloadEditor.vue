<script setup lang="ts">
import { computed } from "vue";
import type { AdminTaskPayload, AdminTaskOption } from "@/admin/api";

const props = defineProps<{
  modelValue: AdminTaskPayload;
  multi: boolean;
}>();

const emit = defineEmits<{ "update:modelValue": [v: AdminTaskPayload] }>();

const options = computed<AdminTaskOption[]>(() => props.modelValue.options ?? []);
const correctIds = computed<string[]>(() => {
  if (props.multi) return props.modelValue.correctIds ?? [];
  return props.modelValue.correctId ? [props.modelValue.correctId] : [];
});

function update(next: AdminTaskPayload) {
  emit("update:modelValue", next);
}

function setOption(i: number, mn: string) {
  const next = [...options.value];
  next[i] = { ...next[i], mn };
  update({ ...props.modelValue, options: next });
}

function addOption() {
  const id = String.fromCharCode("a".charCodeAt(0) + options.value.length);
  update({
    ...props.modelValue,
    options: [...options.value, { id, mn: "" }],
  });
}

function removeOption(i: number) {
  const removed = options.value[i].id;
  const remaining = options.value.filter((_, j) => j !== i);
  const cleaned: AdminTaskPayload = { ...props.modelValue, options: remaining };
  if (props.multi) {
    cleaned.correctIds = (cleaned.correctIds ?? []).filter((id) => id !== removed);
  } else if (cleaned.correctId === removed) {
    cleaned.correctId = undefined;
  }
  update(cleaned);
}

function toggleCorrect(id: string) {
  if (props.multi) {
    const cur = new Set(correctIds.value);
    if (cur.has(id)) cur.delete(id);
    else cur.add(id);
    update({ ...props.modelValue, correctIds: [...cur] });
  } else {
    update({ ...props.modelValue, correctId: id });
  }
}

function setExplanation(v: string) {
  update({ ...props.modelValue, explanationMn: v || undefined });
}
</script>

<template>
  <div class="space-y-3">
    <p class="text-xs font-semibold text-text">
      Сонголтууд
      <span class="ml-1 font-normal text-muted">
        ({{ multi ? "зөв олон сонголтыг тэмдэглэнэ" : "зөв нэг сонголтыг тэмдэглэнэ" }})
      </span>
    </p>
    <ul class="space-y-2">
      <li v-for="(opt, i) in options" :key="opt.id" class="flex items-center gap-2">
        <button
          type="button"
          class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs"
          :class="
            correctIds.includes(opt.id)
              ? 'border-accent bg-accent text-on-accent'
              : 'border-border-token bg-panel text-muted'
          "
          :title="multi ? 'Зөв (олон)' : 'Зөв'"
          @click="toggleCorrect(opt.id)"
        >
          {{ correctIds.includes(opt.id) ? "✓" : opt.id }}
        </button>
        <input
          :value="opt.mn"
          placeholder="Сонголтын текст"
          class="flex-1 rounded-lg border border-border-token bg-surface px-3 py-1.5 text-sm outline-none focus:border-accent"
          @input="setOption(i, ($event.target as HTMLInputElement).value)"
        />
        <button
          type="button"
          class="rounded-md border border-border-token px-2 py-1 text-xs text-muted hover:border-accent hover:text-accent"
          @click="removeOption(i)"
        >
          ✕
        </button>
      </li>
    </ul>
    <button
      type="button"
      class="rounded-full border border-border-token bg-panel px-3 py-1.5 text-xs font-medium hover:border-accent"
      @click="addOption"
    >
      + Сонголт нэмэх
    </button>

    <div>
      <label class="mb-1 block text-xs font-semibold text-text">
        Тайлбар <span class="font-normal text-muted">(хариулсны дараа харагдана, заавал биш)</span>
      </label>
      <textarea
        :value="modelValue.explanationMn ?? ''"
        rows="2"
        placeholder="Яагаад энэ нь зөв вэ..."
        class="w-full rounded-lg border border-border-token bg-surface px-3 py-2 text-sm outline-none focus:border-accent"
        @input="setExplanation(($event.target as HTMLTextAreaElement).value)"
      />
    </div>
  </div>
</template>
