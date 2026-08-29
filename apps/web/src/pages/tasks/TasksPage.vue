<script setup lang="ts">
import { CirclePlus, ClipboardList, LoaderCircle, RefreshCw, SlidersHorizontal } from 'lucide-vue-next';
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { TASK_PRIORITIES, TASK_WORKFLOW_STATUSES, type CreateTaskInput, type TaskQuery } from '@/api/tasks';
import { useCreateTask, useTasks } from '@/api/queries/tasks';
import TaskDialog from '@/components/tasks/TaskDialog.vue';
import AppSelect from '@/components/ui/AppSelect.vue';
import AppToast from '@/components/ui/AppToast.vue';

const router = useRouter();
const isCreateDialogOpen = ref(false);
const workflowStatusFilter = ref('all');
const priorityFilter = ref('all');
const sortBy = ref<TaskQuery['sortBy']>('createdAt');
const order = ref<NonNullable<TaskQuery['order']>>('desc');
const query = computed<TaskQuery>(() => ({
  ...(workflowStatusFilter.value === 'all' ? {} : { workflowStatus: workflowStatusFilter.value as TaskQuery['workflowStatus'] }),
  ...(priorityFilter.value === 'all' ? {} : { priority: priorityFilter.value as TaskQuery['priority'] }),
  sortBy: sortBy.value,
  order: order.value,
}));
const tasksQuery = useTasks(query);
const createTask = useCreateTask();
const notice = ref('');

const statusLabel = { Todo: 'К выполнению', 'In Progress': 'В работе', Resolved: 'Решена', Closed: 'Закрыта', Rejected: 'Отклонена' };
const priorityLabel = { Low: 'Низкий', Medium: 'Средний', High: 'Высокий' };
const statusClass = { Todo: 'status-todo', 'In Progress': 'status-progress', Resolved: 'status-resolved', Closed: 'status-closed', Rejected: 'status-rejected' };
const workflowOptions = [{ value: 'all', label: 'Все статусы' }, ...TASK_WORKFLOW_STATUSES.map((value) => ({ value, label: statusLabel[value] }))];
const priorityOptions = [{ value: 'all', label: 'Все приоритеты' }, ...TASK_PRIORITIES.map((value) => ({ value, label: priorityLabel[value] }))];
const sortOptions = [{ value: 'createdAt', label: 'По дате создания' }, { value: 'priority', label: 'По приоритету' }];
const orderOptions = [{ value: 'desc', label: 'Сначала новые / высокий' }, { value: 'asc', label: 'Сначала старые / низкий' }];

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

    <div class="glass-panel p-4">
      <div class="mb-3 flex items-center gap-2 text-sm font-medium text-slate-700"><SlidersHorizontal :size="17" /> Фильтры и сортировка</div>
      <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <label class="field-label text-xs">Статус<AppSelect v-model="workflowStatusFilter" :options="workflowOptions" placeholder="Все статусы" /></label>
        <label class="field-label text-xs">Приоритет<AppSelect v-model="priorityFilter" :options="priorityOptions" placeholder="Все приоритеты" /></label>
        <label class="field-label text-xs">Сортировка<AppSelect v-model="sortBy" :options="sortOptions" placeholder="Сортировка" /></label>
        <label class="field-label text-xs">Порядок<AppSelect v-model="order" :options="orderOptions" placeholder="Порядок" /></label>
      </div>
    </div>

    <div v-if="tasksQuery.isFetching.value && !tasksQuery.isPending.value" class="flex items-center gap-2 text-sm text-slate-500"><LoaderCircle class="animate-spin" :size="16" /> Обновляем задачи</div>
    <div v-if="tasksQuery.isPending.value" class="grid gap-3" aria-label="Загрузка задач"><div v-for="item in 4" :key="item" class="h-28 animate-pulse rounded-xl bg-slate-200" /></div>
    <div v-else-if="tasksQuery.isError.value" class="empty-state"><RefreshCw :size="30" /><h2>Не удалось загрузить задачи</h2><p>Проверьте доступность API и повторите попытку</p><button class="button-secondary" @click="tasksQuery.refetch()">Повторить</button></div>
    <div v-else-if="!tasksQuery.data.value?.length" class="empty-state"><ClipboardList :size="34" /><h2>Задач пока нет</h2><p>Создайте первую задачу, чтобы начать планировать работу</p><button class="button-primary" @click="isCreateDialogOpen = true"><CirclePlus :size="18" /> Создать задачу</button></div>
    <div v-else class="grid gap-3">
      <RouterLink v-for="task in tasksQuery.data.value" :key="task.id" :to="`/tasks/${task.id}`" class="task-row" :class="{ 'opacity-65': task.lifecycleStatus === 'Archived' }">
        <div class="min-w-0 flex-1"><h2 class="truncate font-semibold text-slate-900">{{ task.title }}</h2><p class="mt-1 line-clamp-2 text-sm text-slate-600">{{ task.description || 'Без описания' }}</p></div>
        <div class="flex shrink-0 flex-wrap items-center gap-2"><span class="badge" :class="statusClass[task.workflowStatus]">{{ statusLabel[task.workflowStatus] }}</span><span v-if="task.lifecycleStatus === 'Archived'" class="badge status-archived">В архиве</span><span class="badge" :class="`priority-${task.priority}`">{{ priorityLabel[task.priority] }}</span></div>
      </RouterLink>
    </div>
  </section>
  <TaskDialog :open="isCreateDialogOpen" :submitting="createTask.isPending.value" @close="isCreateDialogOpen = false" @submit="submit($event as CreateTaskInput)" />
  <AppToast :message="notice" @close="notice = ''" />
</template>
