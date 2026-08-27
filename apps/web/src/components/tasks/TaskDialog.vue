<script setup lang="ts">
import { X } from 'lucide-vue-next';
import { type CreateTaskInput, type Task, type UpdateTaskInput } from '@/api/tasks';
import TaskForm from './TaskForm.vue';

defineProps<{ open: boolean; task?: Task; submitting: boolean }>();
const emit = defineEmits<{ close: []; submit: [input: CreateTaskInput | UpdateTaskInput] }>();
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="dialog-backdrop" role="presentation" @click.self="emit('close')">
      <section class="dialog-panel" role="dialog" aria-modal="true" :aria-labelledby="task ? 'edit-task-title' : 'create-task-title'">
        <div class="mb-6 flex items-start justify-between gap-4">
          <div><h2 :id="task ? 'edit-task-title' : 'create-task-title'" class="text-xl font-semibold">{{ task ? 'Редактирование задачи' : 'Новая задача' }}</h2><p class="mt-1 text-sm text-slate-500">{{ task ? 'Изменения будут сохранены сразу после отправки формы' : 'Добавьте первую информацию, остальное можно изменить позже' }}</p></div>
          <button class="touch-target rounded-lg p-2 text-slate-500 hover:bg-slate-100" aria-label="Закрыть" :disabled="submitting" @click="emit('close')"><X :size="20" /></button>
        </div>
        <TaskForm :task="task" :submitting="submitting" :submit-label="task ? 'Сохранить изменения' : 'Создать задачу'" @cancel="emit('close')" @submit="emit('submit', $event)" />
      </section>
    </div>
  </Teleport>
</template>
