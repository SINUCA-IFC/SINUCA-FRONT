<script setup>
import { useToastStore } from '@/stores/toastStore'
import ToastItem from './ToastItem.vue'
const toasts = useToastStore()
</script>
<template>
  <Teleport to="body">
    <section class="toast-region" aria-label="Notificações">
      <ToastItem
        v-for="toast in toasts.messages"
        :key="toast.id"
        :toast="toast"
        @dismiss="toasts.dismiss(toast.id)"
      />
    </section>
  </Teleport>
</template>
<style scoped>
.toast-region {
  position: fixed;
  z-index: 10000;
  top: max(16px, env(safe-area-inset-top));
  right: 16px;
  display: grid;
  gap: 10px;
  width: min(400px, calc(100vw - 32px));
  pointer-events: none;
}
@media (max-width: 767px) {
  .toast-region {
    top: auto;
    bottom: calc(80px + env(safe-area-inset-bottom));
  }
}
</style>
