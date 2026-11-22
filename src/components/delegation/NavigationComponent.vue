<script setup>
import { computed, nextTick, ref, watch } from 'vue'
import { useIsDesktop } from '@/composables/useIsDesktop'
import { useDelegationTabs } from '@/composables/useDelegationTabs'
const props = defineProps({
  tabs: { type: Array, default: null },
  modelValue: { type: [String, Number], default: undefined },
  label: { type: String, default: 'Navegação da delegação' },
})
const emit = defineEmits(['changeTab', 'update:modelValue'])
const { tabs: delegationTabs, activeTab: selected, setTab } = useDelegationTabs()
const tabsNav = computed(() => props.tabs ?? delegationTabs)
const activeTab = computed(() => (props.tabs ? props.modelValue : selected.value))
const isDesktop = useIsDesktop()
const strip = ref(null)
function selectTab(id) {
  if (!props.tabs) setTab(id)
  emit('update:modelValue', id)
  emit('changeTab', id)
}
function revealActive() {
  const active = strip.value?.querySelector('[aria-pressed="true"]')
  if (!active || isDesktop.value) return
  const item = active.getBoundingClientRect()
  const viewport = strip.value.getBoundingClientRect()
  if (item.left < viewport.left || item.right > viewport.right) {
    strip.value.scrollLeft += item.left - viewport.left - (viewport.width - item.width) / 2
  }
}
watch(
  [activeTab, isDesktop],
  async () => {
    await nextTick()
    revealActive()
  },
  { immediate: true },
)
function scroll(direction) {
  strip.value?.scrollBy({
    left: direction * strip.value.clientWidth * 0.85,
    behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
  })
}
function navigate(event, index) {
  let next
  if (event.key === 'ArrowRight') next = (index + 1) % tabsNav.value.length
  else if (event.key === 'ArrowLeft')
    next = (index - 1 + tabsNav.value.length) % tabsNav.value.length
  else if (event.key === 'Home') next = 0
  else if (event.key === 'End') next = tabsNav.value.length - 1
  else return
  event.preventDefault()
  strip.value.querySelectorAll('button')[next]?.focus()
  selectTab(tabsNav.value[next].id)
}
</script>
<template>
  <nav class="delegation-navigation" :aria-label="label">
    <button
      v-if="!isDesktop && tabsNav.length > 2"
      type="button"
      class="carousel-arrow"
      aria-label="Opções anteriores"
      @click="scroll(-1)"
    >
      <span class="mdi mdi-chevron-left" aria-hidden="true"></span>
    </button>
    <ul ref="strip" class="tabs-navigation">
      <li v-for="(tab, index) in tabsNav" :key="tab.id">
        <button
          type="button"
          :class="{ active: activeTab === tab.id }"
          :aria-pressed="activeTab === tab.id"
          @click="selectTab(tab.id)"
          @keydown="navigate($event, index)"
        >
          <span :class="tab.icon" aria-hidden="true"></span><span>{{ tab.name }}</span>
        </button>
      </li>
    </ul>
    <button
      v-if="!isDesktop && tabsNav.length > 2"
      type="button"
      class="carousel-arrow"
      aria-label="Próximas opções"
      @click="scroll(1)"
    >
      <span class="mdi mdi-chevron-right" aria-hidden="true"></span>
    </button>
  </nav>
</template>
<style scoped>
.delegation-navigation {
  display: flex;
  align-items: center;
  min-width: 0;
  width: 100%;
  padding: 8px 4px;
  box-sizing: border-box;
  border-radius: 10px;
  background: #fff;
}
.tabs-navigation {
  display: flex;
  gap: 8px;
  min-width: 0;
  flex: 1;
  overflow-x: auto;
  overscroll-behavior-x: contain;
  scroll-snap-type: x proximity;
  scrollbar-width: thin;
  padding: 4px;
  margin: 0;
  -webkit-overflow-scrolling: touch;
}
li {
  flex: 0 0 auto;
  scroll-snap-align: start;
}
button {
  min-height: 44px;
  border: 0;
  border-radius: 8px;
  font: inherit;
  cursor: pointer;
  touch-action: manipulation;
}
li button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px 12px;
  font-size: 14px;
  white-space: nowrap;
  color: #596578;
  background: transparent;
}
li .mdi {
  font-size: 22px;
}
button.active {
  background: #edf2f8;
  color: #01295f;
  font-weight: 600;
}
button:focus-visible {
  outline: 2px solid #01295f;
  outline-offset: 1px;
}
.carousel-arrow {
  flex: 0 0 44px;
  padding: 0;
  font-size: 28px;
  color: #01295f;
  background: transparent;
}
@media (min-width: 1024px) {
  .delegation-navigation {
    padding: 12px;
  }
  .tabs-navigation {
    justify-content: center;
    gap: clamp(8px, 2vw, 32px);
  }
}
</style>
