<script setup lang="ts">
import { Archive } from 'lucide-vue-next';
import AppDialog from '@/components/ui/AppDialog.vue';

defineProps<{ open: boolean; title: string; deleting: boolean }>();
const emit = defineEmits<{ close: []; confirm: [] }>();
</script>

<template>
  <AppDialog :open="open" title="Архивировать задачу?" description="Задача исчезнет из активной работы, но не будет удалена" @update:open="!$event && emit('close')">
    <div class="flex gap-3"><span class="grid size-10 shrink-0 place-items-center rounded-full bg-amber-100 text-amber-800"><Archive :size="20" /></span><p class="text-sm leading-6 text-slate-600">«{{ title }}» будет перемещена в архив</p></div>
    <div class="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><button class="button-secondary" :disabled="deleting" @click="emit('close')">Отмена</button><button class="button-primary" :disabled="deleting" @click="emit('confirm')">{{ deleting ? 'Архивируем…' : 'Архивировать' }}</button></div>
  </AppDialog>
</template>
