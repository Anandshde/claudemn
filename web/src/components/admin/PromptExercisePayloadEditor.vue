<script setup lang="ts">
import { computed } from "vue";
import type { AdminTaskPayload } from "@/admin/api";

const props = defineProps<{ modelValue: AdminTaskPayload }>();
const emit = defineEmits<{ "update:modelValue": [v: AdminTaskPayload] }>();

const minChars = computed(() => props.modelValue.minChars ?? 0);
const mustAny = computed(() => (props.modelValue.mustIncludeAny ?? []).join(", "));
const mustAll = computed(() => (props.modelValue.mustIncludeAll ?? []).join(", "));
const rubric = computed(() => props.modelValue.rubricMn ?? "");

function update(next: AdminTaskPayload) {
  emit("update:modelValue", next);
}

function parseKeywords(raw: string): string[] {
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}
</script>

<template>
  <div class="space-y-3">
    <div>
      <label class="mb-1 block text-xs font-semibold text-text">
        Хамгийн багадаа хэдэн тэмдэгт
      </label>
      <input
        type="number"
        min="0"
        :value="minChars"
        class="w-32 rounded-lg border border-border-token bg-surface px-3 py-1.5 text-sm outline-none focus:border-accent"
        @input="update({ ...modelValue, minChars: Number(($event.target as HTMLInputElement).value) || 0 })"
      />
    </div>
    <div>
      <label class="mb-1 block text-xs font-semibold text-text">
        Дор хаяж нэг агуулсан байх үгс <span class="font-normal text-muted">(таслалаар)</span>
      </label>
      <input
        type="text"
        :value="mustAny"
        placeholder="жишээ: хэн, тухай, зорилго"
        class="w-full rounded-lg border border-border-token bg-surface px-3 py-1.5 text-sm outline-none focus:border-accent"
        @input="
          update({
            ...modelValue,
            mustIncludeAny: parseKeywords(($event.target as HTMLInputElement).value),
          })
        "
      />
    </div>
    <div>
      <label class="mb-1 block text-xs font-semibold text-text">
        Бүгдийг агуулсан байх үгс <span class="font-normal text-muted">(заавал биш)</span>
      </label>
      <input
        type="text"
        :value="mustAll"
        placeholder="заавал орох үгс"
        class="w-full rounded-lg border border-border-token bg-surface px-3 py-1.5 text-sm outline-none focus:border-accent"
        @input="
          update({
            ...modelValue,
            mustIncludeAll: parseKeywords(($event.target as HTMLInputElement).value),
          })
        "
      />
    </div>
    <div>
      <label class="mb-1 block text-xs font-semibold text-text">
        Шалгуур <span class="font-normal text-muted">(сурагчид харагдана)</span>
      </label>
      <textarea
        :value="rubric"
        rows="2"
        class="w-full rounded-lg border border-border-token bg-surface px-3 py-2 text-sm outline-none focus:border-accent"
        @input="update({ ...modelValue, rubricMn: ($event.target as HTMLTextAreaElement).value })"
      />
    </div>
  </div>
</template>
