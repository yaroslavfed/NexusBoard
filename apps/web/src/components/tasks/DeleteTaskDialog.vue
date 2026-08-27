<script setup lang="ts">
import { AlertTriangle } from 'lucide-vue-next';

defineProps<{ open: boolean; title: string; deleting: boolean }>();
const emit = defineEmits<{ close: []; confirm: [] }>();
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="dialog-backdrop" role="presentation" @click.self="emit('close')">
      <section class="dialog-panel max-w-md" role="dialog" aria-modal="true" aria-labelledby="delete-task-title">
        <div class="flex gap-3"><span class="grid size-10 shrink-0 place-items-center rounded-full bg-rose-100 text-rose-700"><AlertTriangle :size="20" /></span><div><h2 id="delete-task-title" class="text-lg font-semibold">Удалить задачу?</h2><p class="mt-2 text-sm leading-6 text-slate-600">«{{ title }}» будет удалена без возможности восстановления</p></div></div>
        <div class="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><button class="button-secondary" :disabled="deleting" @click="emit('close')">Отмена</button><button class="button-danger" :disabled="deleting" @click="emit('confirm')">{{ deleting ? 'Удаляем…' : 'Удалить задачу' }}</button></div>
      </section>
    </div>
  </Teleport>
</template>
