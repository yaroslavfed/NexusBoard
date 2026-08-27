<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { TASK_PRIORITIES, TASK_STATUSES, type CreateTaskInput, type Task, type UpdateTaskInput } from '@/api/tasks';

const props = defineProps<{ task?: Task; submitting: boolean; submitLabel: string }>();
const emit = defineEmits<{ submit: [input: CreateTaskInput | UpdateTaskInput]; cancel: [] }>();

const title = ref('');
const description = ref('');
const priority = ref<CreateTaskInput['priority']>('Medium');
const status = ref<NonNullable<UpdateTaskInput['status']>>('Todo');
const titleError = computed(() => title.value.trim() ? '' : 'Введите название задачи');

watch(
  () => props.task,
  (task) => {
    title.value = task?.title ?? '';
    description.value = task?.description ?? '';
    priority.value = task?.priority ?? 'Medium';
    status.value = task?.status ?? 'Todo';
  },
  { immediate: true },
);

function submit() {
  if (titleError.value) return;
  const input = {
    title: title.value.trim(),
    description: description.value.trim() || (props.task ? null : undefined),
    priority: priority.value,
    ...(props.task ? { status: status.value } : {}),
  };
  emit('submit', input);
}
</script>

<template>
  <form class="space-y-5" @submit.prevent="submit">
    <label class="field-label">Название
      <input v-model="title" class="field-input" :class="{ 'border-rose-500': titleError }" autocomplete="off" autofocus />
      <span v-if="titleError" class="field-error">{{ titleError }}</span>
    </label>
    <label class="field-label">Описание
      <textarea v-model="description" class="field-input min-h-28 resize-y" placeholder="Добавьте контекст, который поможет выполнить задачу" />
    </label>
    <div class="grid gap-5 sm:grid-cols-2">
      <label class="field-label">Приоритет
        <select v-model="priority" class="field-input">
          <option v-for="item in TASK_PRIORITIES" :key="item" :value="item">{{ { Low: 'Низкий', Medium: 'Средний', High: 'Высокий' }[item] }}</option>
        </select>
      </label>
      <label v-if="task" class="field-label">Статус
        <select v-model="status" class="field-input">
          <option v-for="item in TASK_STATUSES" :key="item" :value="item">{{ { Todo: 'К выполнению', 'In Progress': 'В работе', Done: 'Готово' }[item] }}</option>
        </select>
      </label>
    </div>
    <div class="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end">
      <button type="button" class="button-secondary" :disabled="submitting" @click="emit('cancel')">Отмена</button>
      <button type="submit" class="button-primary" :disabled="submitting || Boolean(titleError)">{{ submitting ? 'Сохраняем…' : submitLabel }}</button>
    </div>
  </form>
</template>
