<script setup>
import { ref } from 'vue'
import AppButton from './AppButton.vue'
defineProps({
  disabled: Boolean,
  fileName: { type: String, default: '' },
  hasImage: Boolean,
})
defineEmits(['change'])
const input = ref(null)
</script>

<template>
  <div class="image-picker">
    <input
      ref="input"
      class="native-input"
      type="file"
      accept="image/jpeg,image/png"
      aria-label="Imagem (opcional)"
      :disabled="disabled"
      tabindex="-1"
      @change="$emit('change', $event)"
    />
    <AppButton
      variant="secondary"
      class="image-picker-button"
      :disabled="disabled"
      @click="input.click()"
    >
      <span class="image-picker-icon mdi mdi-image-plus" aria-hidden="true"></span>
      <span class="image-picker-copy">
        <strong>{{ hasImage ? 'Trocar imagem' : 'Adicionar imagem' }}</strong>
        <span>{{ fileName || 'Escolha uma imagem para a postagem' }}</span>
        <small>JPG ou PNG · Até 5 MB</small>
      </span>
    </AppButton>
  </div>
</template>

<style scoped>
.native-input {
  display: none;
}
.image-picker {
  min-width: 0;
}
.image-picker-button {
  display: flex;
  align-items: center;
  gap: 1rem;
  width: 100%;
  margin: 0;
  padding: 1rem;
  border: 1px dashed #8ea8c8;
  border-radius: 12px;
  background: #f5f8fc;
  text-align: left;
  line-height: 1.5;
}
.image-picker-button:hover:not(:disabled) {
  background: #e8eff8;
  border-color: #01295f;
}
.image-picker-button:focus-visible {
  outline: 3px solid #93b6e3;
  outline-offset: 3px;
}
.image-picker-icon {
  flex: none;
  font-size: 2rem;
}
.image-picker-copy {
  display: grid;
  gap: 0.2rem;
  min-width: 0;
  overflow-wrap: anywhere;
}
.image-picker-copy strong {
  font-size: 1rem;
}
.image-picker-copy > span,
.image-picker-copy small {
  font-size: 0.85rem;
  font-weight: 400;
  color: #52657b;
}
</style>
