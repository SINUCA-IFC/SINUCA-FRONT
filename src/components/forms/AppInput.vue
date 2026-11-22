<script setup>
import { computed, useId } from 'vue'

defineOptions({ inheritAttrs: false })
const inputId = useId()
const props = defineProps({
  modelValue: [String, Number],
  label: String,
  type: String,
  placeholder: String,
  required: Boolean,
})

const emit = defineEmits(['update:modelValue', 'focus', 'blur'])

const value = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})
</script>

<template>
  <div class="app-input">
    <label :for="$attrs.id || inputId" v-if="label" class="label-class">
      {{ label }}
      <span v-if="required" class="required">*</span>
    </label>
    <input
      v-bind="$attrs"
      :id="$attrs.id || inputId"
      v-model="value"
      :type="type"
      :placeholder="placeholder"
      :required="required"
      class="input-class"
      @focus="$emit('focus')"
      @blur="$emit('blur')"
    />
  </div>
</template>

<style scoped>
.app-input {
  margin-bottom: 4vw;
}

.label-class {
  display: block;
  margin-bottom: 10px;
  font-weight: 500;
}

.input-class {
  min-height: 44px;
  box-sizing: border-box;
  border: 2px solid #d9d9d9;
  background-color: inherit;
  padding: 8px 15px;
  width: 100%;
  border-radius: 5px;
  font-family: 'Poppins';
  transition: all 0.3s;
}

.input-class:focus {
  outline: none;
  border: 2px solid #01295f;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.required {
  color: #fd151b;
}

@media (min-width: 768px) {
  .app-input {
    margin-bottom: 2vw;
  }
}
@media (pointer: coarse) {
  .input-class {
    font-size: 16px;
  }
}
</style>
