<script setup>
import { onMounted, onUnmounted } from 'vue'

const emit = defineEmits(['close'])
let previousOverflow = ''

onMounted(() => {
  previousOverflow = document.body.style.overflow
  document.body.style.overflow = 'hidden'
})

onUnmounted(() => {
  document.body.style.overflow = previousOverflow
})
</script>

<template>
  <Teleport to="body">
    <div class="app-modal">
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
