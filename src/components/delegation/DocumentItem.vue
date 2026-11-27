<script setup>
import { computed } from 'vue'
import AppButton from '@/components/forms/AppButton.vue'
const emit = defineEmits(['remove'])
const props = defineProps({
  title: String,
  link: String,
  removable: Boolean,
  category: {
    type: String,
    default: 'debate',
  },
})
const safeLink = computed(() => {
  try {
    const url = new URL(props.link)
    return ['https:', 'http:'].includes(url.protocol) ? url.href : undefined
  } catch {
    return undefined
  }
})
</script>

<template>
  <div class="document-item">
    <a
      :href="safeLink"
      target="_blank"
      rel="noopener noreferrer"
      :aria-disabled="!safeLink || undefined"
      :class="['docs-card', props.category]"
    >
      <div class="docs-main">
        <span class="docs-icon mdi mdi-link-variant" aria-hidden="true"></span>
        <div class="docs-content">
          <h6 class="docs-title">{{ props.title }}</h6>
          <span class="docs-link">{{ props.link }}</span>
        </div>
      </div>
      <span class="docs-open mdi mdi-open-in-new"></span>
    </a>
    <AppButton
      v-if="removable"
      class="remove-document"
      variant="danger"
      :aria-label="`Remover documento ${title}`"
      @click="emit('remove')"
      >Remover</AppButton
    >
  </div>
</template>

<style scoped>
.document-item {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem;
  min-width: 0;
}
.document-item .docs-card {
  flex: 1 1 12rem;
  min-width: 0;
}
.remove-document {
  margin: 0;
  padding-inline: 1rem;
}
.docs-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fff;
  padding: 1.25rem;
  border-radius: 10px;
  gap: 0.75rem;
  color: inherit;
  transition: all 0.2s ease;
}

.docs-card:focus-visible {
  outline: 2px solid #01295f;
  outline-offset: 3px;
}

.docs-card:hover {
  box-shadow: 0 4px 16px rgb(0 18 40 / 15%);
  transform: translateY(-4px);
}

.docs-title:hover {
  text-decoration: underline;
}

.docs-main {
  display: flex;
  align-items: center;
  min-width: 0;
  gap: 1rem;
}

.docs-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 10px;
  background-color: #01295f;
  color: #fff;
  font-size: 1.5rem;
}

.cooperation .docs-icon {
  background-color: #849324;
}

.docs-content {
  min-width: 0;
}

.docs-title {
  font-size: 1rem;
  font-weight: 500;
  margin-bottom: 0.25rem;
}

.docs-link {
  display: block;
  color: #969696;
  font-size: 0.875rem;
}

.docs-title,
.docs-link {
  overflow-wrap: anywhere;
  line-height: 1.5;
}

.docs-open {
  font-size: 1.4rem;
  color: #969696;
}

.mdi {
  flex-shrink: 0;
}

@media (min-width: 1024px) {
  .docs-card {
    padding: 1.5rem;
  }
}
</style>
