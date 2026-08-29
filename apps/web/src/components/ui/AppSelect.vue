<script setup lang="ts">
import {
  SelectContent,
  SelectIcon,
  SelectItem,
  SelectItemIndicator,
  SelectItemText,
  SelectPortal,
  SelectRoot,
  SelectTrigger,
  SelectValue,
  SelectViewport,
} from 'reka-ui';
import { Check, ChevronDown } from 'lucide-vue-next';

interface Option { value: string; label: string }

defineProps<{ modelValue: string; options: Option[]; placeholder?: string }>();
const emit = defineEmits<{ 'update:modelValue': [value: string] }>();
</script>

<template>
  <SelectRoot :model-value="modelValue" @update:model-value="emit('update:modelValue', $event)">
    <SelectTrigger class="select-trigger" :aria-label="placeholder">
      <SelectValue :placeholder="placeholder" />
      <SelectIcon><ChevronDown :size="17" /></SelectIcon>
    </SelectTrigger>
    <SelectPortal>
      <SelectContent class="select-content" position="popper" :side-offset="6">
        <SelectViewport class="p-1">
          <SelectItem v-for="option in options" :key="option.value" :value="option.value" class="select-item">
            <SelectItemText>{{ option.label }}</SelectItemText>
            <SelectItemIndicator class="ml-auto text-teal-700"><Check :size="16" /></SelectItemIndicator>
          </SelectItem>
        </SelectViewport>
      </SelectContent>
    </SelectPortal>
  </SelectRoot>
</template>
