<script setup lang="ts">
import MarkdownIt from "markdown-it";
import { computed } from "vue";

const props = defineProps<{ md: string | null | undefined }>();

const md = new MarkdownIt({
  html: false,
  linkify: true,
  breaks: false,
  typographer: true,
});

const html = computed(() => (props.md ? md.render(props.md) : ""));
</script>

<template>
  <div
    class="prose prose-stone max-w-none lesson-prose
      prose-headings:font-heading prose-headings:tracking-tight
      prose-headings:text-text
      prose-h1:text-3xl prose-h1:font-bold prose-h1:mb-4 prose-h1:mt-0
      prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-3
      prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-2
      prose-p:text-text prose-p:leading-relaxed
      prose-strong:text-text prose-strong:font-semibold
      prose-em:text-text
      prose-a:text-accent prose-a:no-underline hover:prose-a:underline
      prose-code:bg-overlay prose-code:text-text
      prose-code:rounded prose-code:px-1.5 prose-code:py-0.5
      prose-code:font-mono prose-code:text-[0.9em]
      prose-code:before:content-none prose-code:after:content-none
      prose-pre:bg-overlay prose-pre:text-text prose-pre:rounded-xl
      prose-pre:border prose-pre:border-border-token
      prose-blockquote:border-l-accent prose-blockquote:text-muted
      prose-li:marker:text-accent
      prose-hr:border-border-token"
    v-html="html"
  />
</template>
