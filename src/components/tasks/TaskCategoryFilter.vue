<script setup>
import { computed, ref } from 'vue'
import { getCategoryStyle } from '@/utils/categoryStyle'
const props = defineProps({
  modelValue: { type: [Number, String], default: null },
  categories: { type: Array, default: () => [] },
  categoryStyles: { type: Object, default: () => ({}) },
})
const emit = defineEmits(['update:modelValue'])
const filterOpen = ref(false)
const selectedCategoryName = computed(
  () => props.categories.find((c) => c.id === props.modelValue)?.name,
)
const catInfo = (id) => getCategoryStyle(id, props.categoryStyles)
function pickCategory(id) {
  emit('update:modelValue', id)
  filterOpen.value = false
}
</script>
<template>
  <div class="filter" @keydown.esc="filterOpen = false">
    <button
      type="button"
      class="filter-btn"
      @click="filterOpen = !filterOpen"
      :aria-expanded="filterOpen"
    >
      <span class="mdi mdi-filter-variant"></span>
      {{ selectedCategoryName ? selectedCategoryName : 'Filtrar por' }}
      <span class="mdi" :class="filterOpen ? 'mdi-menu-up' : 'mdi-menu-down'"></span>
    </button>

    <template v-if="filterOpen">
      <div class="filter-backdrop" @click="filterOpen = false"></div>
      <ul class="filter-menu">
        <li>
          <button
            type="button"
            :class="{ current: modelValue === null }"
            @click="pickCategory(null)"
          >
            Todas as categorias
          </button>
        </li>
        <li v-for="c in categories" :key="c.id">
          <button
            type="button"
            :class="{ current: modelValue === c.id }"
            @click="pickCategory(c.id)"
          >
            <span :class="catInfo(c.id).icon"></span>
            {{ c.name }}
          </button>
        </li>
      </ul>
    </template>
  </div>
</template>
<style scoped>
.filter {
  display: none; /* só desktop */
}
@media (min-width: 1024px) {
  .filter {
    display: block;
    position: relative;
  }

  .filter-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.4rem 0.2rem;
    border: 0;
    background: none;
    font: inherit;
    font-size: 1rem;
    color: #1a1a1a;
    cursor: pointer;
  }

  .filter-btn .mdi {
    font-size: 1.2rem;
  }

  .filter-backdrop {
    position: fixed;
    inset: 0;
    z-index: 40;
  }

  .filter-menu {
    position: absolute;
    top: calc(100% + 0.4rem);
    right: 0;
    z-index: 41;
    min-width: 14rem;
    padding: 0.4rem;
    background: #fff;
    border-radius: 10px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.14);
  }

  .filter-menu button {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.6rem 0.8rem;
    border-radius: 8px;
    font-size: 0.95rem;
    cursor: pointer;
  }

  .filter-menu button:hover {
    background: #f3f5f9;
  }

  .filter-menu button.current {
    color: #01295f;
    font-weight: 600;
    background: #eef3fb;
  }
}
.filter-menu button {
  width: 100%;
  border: 0;
  background: transparent;
  font: inherit;
  text-align: left;
}
button:focus-visible {
  outline: 2px solid #01295f;
  outline-offset: 2px;
}
</style>
