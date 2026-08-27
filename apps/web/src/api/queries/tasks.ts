import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query';
import { computed, toValue, type MaybeRefOrGetter } from 'vue';
import { tasksApi, type CreateTaskInput, type TaskQuery, type UpdateTaskInput } from '../tasks';

const taskKeys = {
  all: ['tasks'] as const,
  list: (query: TaskQuery) => [...taskKeys.all, 'list', query] as const,
  detail: (id: string) => [...taskKeys.all, 'detail', id] as const,
};

export function useTasks(query: MaybeRefOrGetter<TaskQuery>) {
  return useQuery({
    queryKey: computed(() => taskKeys.list(toValue(query))),
    queryFn: () => tasksApi.findAll(toValue(query)),
  });
}

export function useTask(id: MaybeRefOrGetter<string>) {
  return useQuery({
    queryKey: computed(() => taskKeys.detail(toValue(id))),
    queryFn: () => tasksApi.findById(toValue(id)),
    enabled: computed(() => Boolean(toValue(id))),
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateTaskInput) => tasksApi.create(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: taskKeys.all }),
  });
}

export function useUpdateTask(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateTaskInput) => tasksApi.update(id, input),
    onSuccess: (task) => {
      queryClient.setQueryData(taskKeys.detail(id), task);
      return queryClient.invalidateQueries({ queryKey: taskKeys.all });
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => tasksApi.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: taskKeys.all }),
  });
}
