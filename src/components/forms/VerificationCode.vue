<script setup>
import { ref, watch, nextTick } from 'vue'
const props = defineProps({ modelValue: { type: String, default: '' }, disabled: Boolean })
const emit = defineEmits(['update:modelValue'])
const digits = ref(Array(6).fill(''))
const inputs = ref([])
watch(
  () => props.modelValue,
  (value) => {
    if (digits.value.join('') !== value)
      digits.value = Array.from({ length: 6 }, (_, i) => value[i] || '')
  },
  { immediate: true },
)
function focus(index) {
  inputs.value[Math.max(0, Math.min(5, index))]?.focus()
}
function publish() {
  emit('update:modelValue', digits.value.join(''))
}
async function insert(index, value) {
  const clean = value.replace(/\D/g, '').slice(0, 6)
  if (!clean) {
    digits.value[index] = ''
    publish()
    return
  }
  const start = clean.length === 6 ? 0 : index
  for (let i = 0; i < clean.length && start + i < 6; i++) digits.value[start + i] = clean[i]
  publish()
  await nextTick()
  focus(start + clean.length)
}
function input(index, event) {
  insert(index, event.target.value)
  event.target.value = digits.value[index]
}
function keydown(index, event) {
  if (event.key === 'Backspace' && !digits.value[index] && index > 0) {
    event.preventDefault()
    digits.value[index - 1] = ''
    publish()
    focus(index - 1)
  } else if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
    event.preventDefault()
    focus(index + (event.key === 'ArrowLeft' ? -1 : 1))
  }
}
</script>
<template>
  <fieldset class="verification-code" :disabled="disabled">
    <legend>Código de seis dígitos</legend>
    <div class="digits">
      <input
        v-for="(_, index) in digits"
        :key="index"
        :ref="(el) => (inputs[index] = el)"
        :value="digits[index]"
        :aria-label="`Dígito ${index + 1} de 6`"
        type="text"
        inputmode="numeric"
        :autocomplete="index === 0 ? 'one-time-code' : 'off'"
        maxlength="6"
        pattern="[0-9]"
        required
        @input="input(index, $event)"
        @focus="$event.target.select()"
        @keydown="keydown(index, $event)"
        @paste.prevent="insert(index, $event.clipboardData.getData('text'))"
      />
    </div>
  </fieldset>
</template>
<style scoped>
.verification-code {
  border: 0;
  padding: 0;
  min-width: 0;
  margin: 0;
}
legend {
  font-size: 16px;
  line-height: 1.5;
  margin-bottom: 12px;
}
.digits {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: clamp(4px, 1.5vw, 10px);
}
.digits input {
  box-sizing: border-box;
  min-width: 0;
  width: 100%;
  height: clamp(44px, 6dvh, 56px);
  border: 1px solid #9aa8b7;
  border-radius: 8px;
  padding: 0;
  text-align: center;
  font:
    600 22px 'Poppins',
    sans-serif;
  color: #01295f;
  background: #fff;
}
.digits input:focus {
  outline: 2px solid #01295f;
  outline-offset: 2px;
}
</style>
