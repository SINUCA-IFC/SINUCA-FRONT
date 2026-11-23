<script setup>
defineProps({
  type: {
    type: String,
    default: 'button',
  },
  variant: {
    type: String,
    default: 'primary', //secondary and danger
  },
  disabled: Boolean,
  floating: Boolean,
})
</script>

<template>
  <button
    :type="type"
    :disabled="disabled"
    :class="['app-button', `variant-${variant}`, { 'app-button--floating': floating }]"
  >
    <slot></slot>
  </button>
</template>

<style scoped>
.app-button.app-button--floating {
  position: fixed;
  right: max(1.25rem, env(safe-area-inset-right));
  bottom: calc(7rem + env(safe-area-inset-bottom, 0px));
  z-index: 30;
  width: 56px;
  height: 56px;
  padding: 0;
  margin: 0;
  border-radius: 50%;
  display: grid;
  place-items: center;
  font-size: 28px;
  box-shadow: 0 4px 14px #01295f40;
}
@media (min-width: 1024px) {
  .app-button.app-button--floating {
    bottom: 1.5rem;
    right: 1.5rem;
  }
}
.app-button {
  min-height: 44px;
  touch-action: manipulation;
  padding: 8px 30px;
  font-family: 'Poppins';
  font-weight: 600;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.3s;
  margin-top: 1rem;
}

.app-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/*PRIMARY BUTTON*/
.variant-primary {
  background-color: #01295f;
  color: #fff;
  transition: all 0.3s;
}

.variant-primary:hover {
  background-color: #002453;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.25);
}

.variant-primary:active {
  transform: scale(0.98);
  background-color: #002453;
}

/*SECONDARY BUTTON*/
.variant-secondary {
  background-color: inherit;
  border: 2px solid #01295f;
  color: #01295f;
}

.variant-secondary:hover {
  background-color: #e2e1e1;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.25);
}

.variant-secondary:active {
  background-color: #e2e1e1;
  transform: scale(0.98);
}

/*DANGER BUTTON*/
.variant-danger {
  background-color: #fd151b;
  color: #fff;
}

.variant-danger:hover {
  background-color: #d6050c;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.25);
}

.variant-danger:active {
  background-color: #d6050c;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.25);
  transform: scale(0.98);
}
</style>
