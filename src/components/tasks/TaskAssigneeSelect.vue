<script setup>
const props = defineProps({
  modelValue: { type: Array, default: () => [] },
  users: { type: Array, default: () => [] },
})
const emit = defineEmits(['update:modelValue'])
function toggleUser(userId) {
  emit(
    'update:modelValue',
    props.modelValue.includes(userId)
      ? props.modelValue.filter((id) => id !== userId)
      : [...props.modelValue, userId],
  )
}
</script>

<template>
  <p class="label-class" style="margin-top: 1rem">Responsável</p>
  <div class="user-select">
    <button
      type="button"
      class="user-option"
      v-for="user in users"
      :key="user.id"
      @click="toggleUser(user.id)"
      :aria-pressed="modelValue.includes(user.id)"
      :class="{ selected: modelValue.includes(user.id) }"
    >
      <img v-if="user.foto?.url" :src="user.foto.url" alt="" />
      <span>{{ user.name }}</span>
    </button>
  </div>
</template>

<style scoped>
.user-select {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.user-option {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border: 2px solid #d9d9d9;
  border-radius: 8px;
  cursor: pointer;
  transition: 0.2s;
}

.user-option img {
  width: 25px;
  height: 25px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #01295f;
}

.user-option span {
  font-size: 0.95rem;
}

.selected {
  border-color: #01295f;
  background-color: #e6eef8;
}

.selected span {
  font-weight: 500;
}

.selected img {
  border-color: #01295f;
}

@media (max-width: 1023px) {
  .user-option span {
    overflow-wrap: anywhere;
    min-width: 0;
  }
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
