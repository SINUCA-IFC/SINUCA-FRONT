<script setup>
import { onMounted, onUnmounted, ref } from 'vue'

const emit = defineEmits(['close'])
let previousOverflow = ''
const modal = ref(null)
let previousFocus
function keyboard(event) {
  if (event.defaultPrevented) return
  if (event.key === 'Escape') {
    event.preventDefault()
    emit('close')
    return
  }
  if (event.key !== 'Tab') return
  const controls = [
    ...modal.value.querySelectorAll('button, input, select, textarea, a[href], [tabindex="0"]'),
  ].filter((el) => !el.matches(':disabled') && el.getClientRects().length)
  const first = controls[0],
    last = controls.at(-1)
  if (!first) {
    event.preventDefault()
    return
  }
  if (
    event.shiftKey &&
    (document.activeElement === first || document.activeElement === modal.value)
  ) {
    event.preventDefault()
    last.focus()
  } else if (
    !event.shiftKey &&
    (document.activeElement === last || document.activeElement === modal.value)
  ) {
    event.preventDefault()
    first.focus()
  }
}

onMounted(() => {
  previousOverflow = document.body.style.overflow
  previousFocus = document.activeElement
  document.body.style.overflow = 'hidden'
  if (!modal.value.contains(document.activeElement)) modal.value.focus()
})

onUnmounted(() => {
  document.body.style.overflow = previousOverflow
  if (previousFocus?.isConnected) previousFocus.focus()
})
</script>

<template>
  <Teleport to="body">
    <div ref="modal" class="app-modal" tabindex="-1" @keydown="keyboard">
      <div class="background" @click="emit('close')"></div>
      <slot />
    </div>
  </Teleport>
</template>

<style scoped>
.app-modal {
  position: fixed;
  inset: 0;
  z-index: 100;
  padding: 0;
}

.background {
  position: fixed;
  z-index: 10;
  top: 0;
  left: 0;
  backdrop-filter: blur(2px);
  background: rgba(0, 0, 0, 0.3);
  height: 100vh;
  width: 100%;
}

@media (min-width: 1024px) {
  .app-modal {
    z-index: 9999;
  }

  .background {
    position: absolute;
    inset: 0;
    z-index: 0;
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
  }
}
</style>
