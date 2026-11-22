<script setup>
import { onMounted, onUnmounted } from 'vue'
const props = defineProps({ toast: { type: Object, required: true } })
const emit = defineEmits(['dismiss'])
let timer
function pause() {
  clearTimeout(timer)
}
function resume() {
  pause()
  timer = setTimeout(() => emit('dismiss'), props.toast.type === 'error' ? 10000 : 6000)
}
onMounted(resume)
onUnmounted(pause)
</script>
<template>
  <div
    class="toast"
    :class="toast.type"
    @mouseenter="pause"
    @mouseleave="resume"
    @focusin="pause"
    @focusout="resume"
  >
    <span
      class="mdi"
      :class="toast.type === 'error' ? 'mdi-alert-circle-outline' : 'mdi-check-circle-outline'"
      aria-hidden="true"
    ></span>
    <p :role="toast.type === 'error' ? 'alert' : 'status'">{{ toast.message }}</p>
    <button type="button" aria-label="Fechar notificação" @click="$emit('dismiss')">
      <span class="mdi mdi-close" aria-hidden="true"></span>
    </button>
  </div>
</template>
<style scoped>
.toast {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  background: #fff;
  color: #172337;
  border-left: 4px solid #2a9655;
  border-radius: 10px;
  box-shadow: 0 4px 24px #0003;
  pointer-events: auto;
}
.toast.error {
  border-color: #b42318;
}
.toast > .mdi {
  color: #2a9655;
  font-size: 24px;
}
.toast.error > .mdi {
  color: #b42318;
}
p {
  flex: 1;
  margin: 0;
  font-size: 14px;
  line-height: 1.5;
  overflow-wrap: anywhere;
}
button {
  flex: none;
  width: 44px;
  height: 44px;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: inherit;
  cursor: pointer;
  font-size: 22px;
}
button:focus-visible {
  outline: 2px solid #01295f;
}
</style>
