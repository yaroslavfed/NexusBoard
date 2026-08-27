<script setup lang="ts">
import { CirclePlus, ClipboardList, RefreshCw, SlidersHorizontal } from 'lucide-vue-next';
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { TASK_PRIORITIES, TASK_STATUSES, type CreateTaskInput, type TaskQuery } from '@/api/tasks';
import { useCreateTask, useTasks } from '@/api/queries/tasks';
import TaskDialog from '@/components/tasks/TaskDialog.vue';

const router = useRouter();
const isCreateDialogOpen = ref(false);
const filters = ref<TaskQuery>({ sortBy: 'createdAt', order: 'desc' });
const query = computed(() => filters.value);
const tasksQuery = useTasks(query);
const createTask = useCreateTask();
const notice = ref('');

const statusLabel = { Todo: 'К выполнению', 'In Progress': 'В работе', Done: 'Готово' };
const priorityLabel = { Low: 'Низкий', Medium: 'Средний', High: 'Высокий' };
const statusClass = { Todo: 'status-todo', 'In Progress': 'status-progress', Done: 'status-done' };

async function submit(input: CreateTaskInput) {
  try {
    const task = await createTask.mutateAsync(input);
    isCreateDialogOpen.value = false;
    notice.value = 'Задача создана';
    await router.push(`/tasks/${task.id}`);
  } catch {
    notice.value = 'Не удалось создать задачу. Повторите попытку';
  }
}
</script>

<template>
  <section class="space-y-6">
    <div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div><p class="eyebrow">Рабочее пространство</p><h1 class="mt-1 text-3xl font-bold tracking-tight">Задачи</h1><p class="mt-2 text-slate-600">Следите за текущей работой и поддерживайте список в порядке</p></div>
      <button class="button-primary shrink-0" @click="isCreateDialogOpen = true"><CirclePlus :size="18" /> Создать задачу</button>
    </div>

    <div class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div class="mb-3 flex items-center gap-2 text-sm font-medium text-slate-700"><SlidersHorizontal :size="17" /> Фильтры и сортировка</div>
      <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <label class="field-label text-xs">Статус<select v-model="filters.status" class="field-input"><option :value="undefined">Все статусы</option><option v-for="status in TASK_STATUSES" :key="status" :value="status">{{ statusLabel[status] }}</option></select></label>
        <label class="field-label text-xs">Приоритет<select v-model="filters.priority" class="field-input"><option :value="undefined">Все приоритеты</option><option v-for="priority in TASK_PRIORITIES" :key="priority" :value="priority">{{ priorityLabel[priority] }}</option></select></label>
        <label class="field-label text-xs">Сортировка<select v-model="filters.sortBy" class="field-input"><option value="createdAt">По дате создания</option><option value="priority">По приоритету</option></select></label>
        <label class="field-label text-xs">Порядок<select v-model="filters.order" class="field-input"><option value="desc">Сначала новые / высокий</option><option value="asc">Сначала старые / низкий</option></select></label>
      </div>
    </div>

    <div v-if="notice" class="rounded-lg border border-teal-200 bg-teal-50 px-4 py-3 text-sm text-teal-900" role="status">{{ notice }}</div>
    <div v-if="tasksQuery.isPending.value" class="grid gap-3" aria-label="Загрузка задач"><div v-for="item in 4" :key="item" class="h-28 animate-pulse rounded-xl bg-slate-200" /></div>
    <div v-else-if="tasksQuery.isError.value" class="empty-state"><RefreshCw :size="30" /><h2>Не удалось загрузить задачи</h2><p>Проверьте доступность API и повторите попытку</p><button class="button-secondary" @click="tasksQuery.refetch()">Повторить</button></div>
    <div v-else-if="!tasksQuery.data.value?.length" class="empty-state"><ClipboardList :size="34" /><h2>Задач пока нет</h2><p>Создайте первую задачу, чтобы начать планировать работу</p><button class="button-primary" @click="isCreateDialogOpen = true"><CirclePlus :size="18" /> Создать задачу</button></div>
    <div v-else class="grid gap-3">
      <RouterLink v-for="task in tasksQuery.data.value" :key="task.id" :to="`/tasks/${task.id}`" class="task-row">
        <div class="min-w-0 flex-1"><h2 class="truncate font-semibold text-slate-900">{{ task.title }}</h2><p class="mt-1 line-clamp-2 text-sm text-slate-600">{{ task.description || 'Без описания' }}</p></div>
        <div class="flex shrink-0 flex-wrap items-center gap-2"><span class="badge" :class="statusClass[task.status]">{{ statusLabel[task.status] }}</span><span class="badge" :class="`priority-${task.priority}`">{{ priorityLabel[task.priority] }}</span></div>
      </RouterLink>
    </div>
  </section>
  <TaskDialog :open="isCreateDialogOpen" :submitting="createTask.isPending.value" @close="isCreateDialogOpen = false" @submit="submit($event as CreateTaskInput)" />
</template>
