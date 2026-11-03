<script setup>
const props = defineProps({
  modelValue: { type: Array, default: () => [] },
  categories: { type: Array, default: () => [] },
  categoryStyles: { type: Object, default: () => ({}) },
})
const emit = defineEmits(['update:modelValue'])
function toggleCategory(category) {
  emit(
    'update:modelValue',
    props.modelValue.includes(category.id)
      ? props.modelValue.filter((id) => id !== category.id)
      : [...props.modelValue, category.id],
  )
}
</script>

<template>
  <p class="label-class">Categoria <span style="color: #fd151b">*</span></p>
  <div class="categories">
    <button
      type="button"
      :class="['category-option', modelValue.includes(c.id) ? 'active' : '']"
      v-for="c in categories"
      :key="c.id"
      @click="toggleCategory(c)"
      :aria-pressed="modelValue.includes(c.id)"
      :style="modelValue.includes(c.id) ? (categoryStyles[c.id] || {}).activeStyle : ''"
    >
      <p style="font-size: 0.9rem">
        <span :class="(categoryStyles[c.id] || {})?.icon"></span>
        {{ c.name }}
      </p>
    </button>
  </div>
</template>

<style scoped>
.categories {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 1rem;
}

.category-option {
  border: 1px solid #969696;
  border-radius: 15px;
  color: #969696;
  padding: 8px 12px;
  cursor: pointer;
}

.active {
  border: none;
  color: white;
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
