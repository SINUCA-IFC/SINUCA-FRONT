<script setup>
defineProps({ modelValue: Boolean })
const emit = defineEmits(['update:modelValue'])
</script>

<template>
  <div :class="['notification-area', modelValue ? 'active-notification' : '']">
    <div class="title-area">
      <span :class="modelValue ? 'mdi mdi-bell-outline' : 'mdi mdi-bell-off-outline'"></span>
      <div>
        <h4 class="title-class">Notificações</h4>
        <p>{{ modelValue ? 'Receber notificações' : 'Sem notificações' }}</p>
      </div>
    </div>
    <label class="switch">
      <input
        type="checkbox"
        :checked="modelValue"
        @change="emit('update:modelValue', $event.target.checked)"
        aria-label="Receber notificações"
      />
      <span class="slider"></span>
    </label>
  </div>
</template>

<style scoped>
.notification-area {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 15px 12px;
  border: 2px solid #d9d9d9;
  border-radius: 5px;
  font-family: 'Poppins';
  margin-bottom: 1rem;
  transition: all 0.3s;
}

.title-area {
  display: flex;
  align-items: center;
}

.title-area span {
  font-size: 1.8rem;
  margin: 0 1rem;
  color: #969696;
}

.title-area p {
  color: #969696;
  font-size: 0.9rem;
  margin-top: 0.4rem;
}

.title-class {
  font-size: 1rem;
  font-weight: 500;
}

.switch {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 25px;
  margin-right: 1rem;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  background-color: inherit;
  border: 1px solid #969696;
  border-radius: 25px;
  width: 100%;
  height: 100%;
  transition: 0.3s;
}

.slider::before {
  content: '';
  position: absolute;
  height: 20px;
  width: 20px;
  left: 3px;
  bottom: 2.5px;
  background-color: #969696;
  border-radius: 50%;
  transition: 0.3s;
}

input:checked + .slider {
  background-color: #01295f;
}

input:checked + .slider::before {
  transform: translateX(25px);
  background-color: white;
}

@media (max-width: 1023px) {
  .notification-area {
    gap: 0.75rem;
  }
  .title-area {
    min-width: 0;
  }
  .title-area span {
    margin: 0 0.5rem 0 0;
  }
  .switch {
    flex-shrink: 0;
    margin-right: 0;
  }
}
.active-notification {
  display: flex;
  width: 100%;
  padding: 15px 12px;
  border: 2px solid #01295f;
  border-radius: 5px;
  font-family: 'Poppins';
  margin-bottom: 1rem;
}
.active-notification span {
  color: #01295f;
}
.switch input:focus-visible + .slider {
  outline: 2px solid #01295f;
  outline-offset: 3px;
}
</style>
