<script setup>
import { computed, ref, watch } from 'vue'

const props = defineProps({ src: String, alt: { type: String, default: 'Foto de perfil' } })
const failed = ref(false)
const imageUrl = computed(() => !failed.value && props.src?.trim() && props.src !== 'default'
  ? props.src
  : '/static/avatar-default.svg')

watch(() => props.src, () => { failed.value = false })
</script>

<template>
  <img class="user-avatar" :src="imageUrl" :alt="alt" @error="failed = true" />
</template>

<style scoped>
.user-avatar {
  display: block;
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  border-radius: 50%;
  object-fit: cover;
  background-color: #e6edf5;
}
</style>
