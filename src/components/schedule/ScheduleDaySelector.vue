<script setup>
import { formatShortDate } from '@/utils/date'
defineProps({ days: { type: Array, required: true }, modelValue: String })
defineEmits(['update:modelValue'])
</script>

<template>
  <div class="day-selector" role="group" aria-label="Escolha o dia da programação">
    <button
      v-for="day in days"
      :key="day.id"
      type="button"
      :aria-pressed="modelValue === day.id"
      :class="{ selected: modelValue === day.id }"
      @click="$emit('update:modelValue', day.id)"
    >
      <strong>{{ day.titulo }} - {{ formatShortDate(day.data) }}</strong>
      <span>{{ day.subtitulo }}</span>
    </button>
  </div>
</template>

<style scoped>
.day-selector { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0.6rem; }
button { min-width: 0; min-height: 80px; display: flex; flex-direction: column; justify-content: center; gap: 0.4rem; padding: 0.85rem 0.75rem; border: 1px solid #dce2ea; border-radius: 12px; background: #fff; color: #01295f; text-align: left; cursor: pointer; font: inherit; overflow-wrap: anywhere; touch-action: manipulation; }
button strong { font-size: 0.85rem; line-height: 1.5; }
button span { font-size: 0.75rem; line-height: 1.5; }
button.selected { background: #01295f; color: #fff; border-color: #01295f; }
button:focus-visible { outline: 3px solid #ffb30f; outline-offset: 3px; }
@media (min-width: 600px) {
  .day-selector { gap: 0.75rem; }
  button { padding: 1.1rem 1.4rem; }
  button strong { font-size: 1.05rem; }
  button span { font-size: 0.8rem; }
}
@media (min-width: 1400px) {
  .day-selector { grid-template-columns: repeat(4, minmax(0, 1fr)); }
}
</style>
