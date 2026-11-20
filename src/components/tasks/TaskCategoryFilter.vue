<script setup>
import FilterMenu from '../forms/FilterMenu.vue'
import { computed } from 'vue'
import { getCategoryStyle } from '@/utils/categoryStyle'
const props = defineProps({
  modelValue: { type: [Number, String], default: null },
  categories: { type: Array, default: () => [] },
  categoryStyles: { type: Object, default: () => ({}) },
})
const emit = defineEmits(['update:modelValue'])
const options = computed(() => props.categories.map(category => ({
  id: category.id,
  name: category.name,
  icon: getCategoryStyle(category.id, props.categoryStyles).icon,
})))
</script>
<template>
  <FilterMenu class="task-filter" :model-value="modelValue" :options="options" all-label="Todas as categorias" @update:model-value="emit('update:modelValue', $event)" />
</template>
<style scoped>
@media (max-width: 1023px) {
  .task-filter { display: none; }
}
</style>
