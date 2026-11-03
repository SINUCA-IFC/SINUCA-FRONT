<script setup>
defineProps({ modelValue: Number })
const emit = defineEmits(['update:modelValue'])
const statusOptions = [
  { id: 1, name: 'A Fazer', color: '#fd151b' },
  { id: 2, name: 'Em Andamento', color: '#FFB30F' },
  { id: 3, name: 'Concluído', color: '#849324' },
]
</script>

<template>
  <p class="label-class">Status da Tarefa</p>
  <div class="status-select">
    <button
      type="button"
      class="status-option"
      v-for="status in statusOptions"
      :key="status.id"
      @click="emit('update:modelValue', status.id)"
      :aria-pressed="modelValue === status.id"
      :class="{ selectedStatus: modelValue === status.id }"
      :style="modelValue === status.id ? { borderColor: status.color } : {}"
    >
      <span class="status-dot" :style="{ backgroundColor: status.color }"></span>
      <span>{{ status.name }}</span>
    </button>
  </div>
</template>

<style scoped>
.status-select {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}
.status-option {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  border: 2px solid #d9d9d9;
  border-radius: 8px;
  cursor: pointer;
  transition: 0.2s;
  font-size: 0.9rem;
}
.status-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}
.selectedStatus {
  background-color: #f7f9fc;
  font-weight: 500;
}
.label-class {
  display: block;
  margin-bottom: 10px;
  font-size: 1.2rem;
  font-weight: 500;
}
button {
  font: inherit;
  background: transparent;
  text-align: left;
}
button:focus-visible {
  outline: 2px solid #01295f;
  outline-offset: 3px;
}
</style>
