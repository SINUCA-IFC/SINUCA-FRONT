<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'

const props = defineProps({ name: { type: String, required: true } })
const heading = ref(null)
let observer
let frame

function fitName() {
  const element = heading.value
  if (!element || !element.clientWidth) return
  element.style.fontSize = ''
  const maximum = parseFloat(getComputedStyle(element).fontSize)
  // Keep the full name readable, allowing two lines for very long names.
  for (let size = maximum; size >= 14; size -= 0.5) {
    element.style.fontSize = `${size}px`
    const lineHeight = parseFloat(getComputedStyle(element).lineHeight)
    if (element.scrollHeight <= lineHeight * 2 + 1 && element.scrollWidth <= element.clientWidth) break
  }
}

function scheduleFit() {
  cancelAnimationFrame(frame)
  frame = requestAnimationFrame(fitName)
}

watch(() => props.name, scheduleFit, { flush: 'post' })
onMounted(() => {
  let previousWidth = 0
  observer = new ResizeObserver(([entry]) => {
    if (entry.contentRect.width === previousWidth) return
    previousWidth = entry.contentRect.width
    scheduleFit()
  })
  observer.observe(heading.value)
  document.fonts.ready.then(() => { if (heading.value) scheduleFit() })
  scheduleFit()
})
onBeforeUnmount(() => {
  observer?.disconnect()
  cancelAnimationFrame(frame)
})
</script>

<template>
  <h2 ref="heading" class="profile-name">{{ name }}</h2>
</template>

<style scoped>
.profile-name {
  flex: 1;
  min-width: 0;
  font-size: calc(var(--profile-photo-size, 100px) * 0.32);
  font-weight: bold;
  line-height: 1.2;
  overflow-wrap: anywhere;
  text-wrap: pretty;
}
</style>
