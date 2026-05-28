<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
  modelValue: string;
  rows?: number;
  placeholder?: string;
}>();

const emit = defineEmits<{ "update:modelValue": [v: string] }>();

const chars = computed(() => props.modelValue?.length ?? 0);
const lines = computed(() => (props.modelValue || "").split("\n").length);

function onInput(e: Event) {
  emit("update:modelValue", (e.target as HTMLTextAreaElement).value);
}
</script>

<template>
  <div>
    <textarea
      :value="modelValue"
      :rows="rows ?? 16"
      :placeholder="placeholder ?? '# Гарчиг...\n\nЭнд markdown бичнэ.'"
      class="w-full resize-y rounded-xl border border-border-token bg-surface px-4 py-3 font-mono text-[0.85rem] leading-relaxed text-text outline-none focus:border-accent"
      @input="onInput"
    />
    <p class="mt-1 text-right text-xs text-muted">{{ chars }} тэмдэгт · {{ lines }} мөр</p>
  </div>
</template>
