<script setup>
import { RouterLink } from 'vue-router'
defineProps({
  to: { type: [String, Object], default: undefined },
  label: { type: String, default: 'Voltar' },
  disabled: Boolean,
})
</script>

<template>
  <component
    :is="to ? RouterLink : 'button'"
    :to="to"
    :type="to ? undefined : 'button'"
    :disabled="to ? undefined : disabled"
    class="app-back"
    :aria-label="label"
    :title="label"
    ><span class="mdi mdi-arrow-left" aria-hidden="true"></span
  ></component>
</template>

<style scoped>
.app-back {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: none;
  align-self: center;
  width: 44px;
  height: 44px;
  padding: 0.5rem;
  border: 0;
  border-radius: 0.5rem;
  background: #ebebeb;
  color: #1e1e1e;
  font: inherit;
  font-size: 26px;
  text-decoration: none;
  cursor: pointer;
}
.app-back:hover {
  background: #dedede;
}
.app-back:focus-visible {
  outline: 2px solid #01295f;
  outline-offset: 3px;
}
.app-back:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
