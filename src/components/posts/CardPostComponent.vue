
<script setup>
import { computed, ref, watch, nextTick } from 'vue'

const props = defineProps({
  title: String,
  date: String,
  description: String,
  imageUrl: String,
  canManage: Boolean,
})
const emit = defineEmits(['edit', 'delete'])
const actions = ref(null)
function action(name) {
  actions.value.open = false
  emit(name)
}

const isExpanded = ref(false)
const textWrap = ref(null)
const previewLimit = 300
const text = computed(() => props.description?.trim() || '')
const canExpand = computed(() => text.value.length > previewLimit)

const visibleDescription = computed(() => {
  if (!canExpand.value || isExpanded.value) return text.value
  const excerpt = text.value.slice(0, previewLimit)
  const lastSpace = excerpt.lastIndexOf(' ')
  return `${lastSpace > previewLimit * 0.8 ? excerpt.slice(0, lastSpace) : excerpt}…`
})

watch(
  () => props.description,
  async () => {
    isExpanded.value = false
    await nextTick()
    if (textWrap.value) textWrap.value.scrollTop = 0
  },
)

async function toggle() {
  isExpanded.value = !isExpanded.value

  await nextTick()

  if (textWrap.value) {
    textWrap.value.scrollTop = 0
  }
}
</script>

<template>
  <div class="card">
    <div class="header-post">
      <details
        v-if="canManage"
        ref="actions"
        class="post-actions"
        @keydown.esc.prevent="actions.open = false"
        @focusout="
          (event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) actions.open = false
          }
        "
      >
        <summary :aria-label="`Opções da postagem ${title}`">
          <span class="mdi mdi-dots-vertical" aria-hidden="true"></span>
        </summary>
        <div class="actions-menu">
          <button type="button" @click="action('edit')">Editar postagem</button>
          <button type="button" @click="action('delete')">Excluir postagem</button>
        </div>
      </details>
      <h3 class="post-title">{{ props.title }}</h3>
      <span class="post-date">Postado em {{ props.date }}</span>
    </div>

    <div
      ref="textWrap"
      class="text-wrap"
      :class="{
        expanded: isExpanded,
        'has-fade': canExpand && !isExpanded,
      }"
    >
      <p class="post-desc">{{ visibleDescription }}</p>
    </div>

    <button
      v-if="canExpand"
      type="button"
      class="toggle-btn"
      :aria-expanded="isExpanded"
      @click="toggle"
    >
      {{ isExpanded ? 'Ler menos' : 'Ler mais' }}
    </button>

    <div v-if="props.imageUrl" class="image-wrap">
      <img class="img-post" :src="props.imageUrl" :alt="props.title" />
    </div>
  </div>
</template>

<style scoped>
.post-actions {
  position: relative;
  align-self: flex-end;
  flex: none;
}
.post-actions summary {
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  border-radius: 8px;
  cursor: pointer;
  color: #01295f;
  font-size: 1.6rem;
  list-style: none;
}
.post-actions summary::-webkit-details-marker {
  display: none;
}
.post-actions summary:hover {
  background: #ebebeb;
}
.post-actions summary:focus-visible,
.actions-menu button:focus-visible {
  outline: 2px solid #01295f;
  outline-offset: 2px;
}
.actions-menu {
  position: absolute;
  right: 0;
  top: 100%;
  z-index: 2;
  width: 190px;
  padding: 0.5rem;
  background: white;
  border: 1px solid #d6e2ef;
  border-radius: 8px;
  box-shadow: 0 4px 16px #0002;
}
.actions-menu button {
  display: block;
  width: 100%;
  min-height: 44px;
  padding: 0.5rem;
  border: 0;
  background: white;
  text-align: left;
  font: inherit;
  cursor: pointer;
}
.actions-menu button:hover {
  background: #edf4fb;
}
.actions-menu button:last-child {
  color: #a11a20;
}
.header-post:has(.post-actions) {
  position: relative;
  padding-right: 52px;
}
.header-post > .post-actions {
  position: absolute;
  top: 0;
  right: 0;
}
.card {
  min-width: 0;
  max-width: 100%;
  background-color: white;
  padding: 2rem 1.5rem;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(161, 161, 161, 0.5);
}

.header-post {
  min-width: 0;
  line-height: 1.5;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  margin-bottom: 1rem;
  gap: 0.8rem;

  & .post-title {
    font-size: 1.1rem;
    font-weight: bold;
  }

  & .post-date {
    font-size: 0.9rem;
    color: #969696;
  }
}

.post-desc {
  white-space: pre-wrap;
  font-size: 0.9rem;
  text-align: justify;
  color: #525050;
  line-height: 1.3;
}

.text-wrap {
  position: relative;
  overflow-anchor: none;
}

.text-wrap.expanded {
  height: 320px;
  max-height: 320px;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: #b5c5d8 transparent;
}

.text-wrap.has-fade::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 3rem;
  background: linear-gradient(to bottom, transparent, white);
  pointer-events: none;
}

.toggle-btn {
  margin-top: 0.5rem;
  background: none;
  border: none;
  padding: 0;
  color: #525050;
  cursor: pointer;
  font-weight: 600;
}
.toggle-btn:focus-visible {
  outline: 2px solid #01295f;
  outline-offset: 4px;
}

.image-wrap {
  display: flex;
  justify-content: center;
  width: 100%;
  max-width: 100%;
  margin-top: 1rem;
}

.img-post {
  display: block;
  width: auto;
  max-width: 100%;
  max-height: 420px;
  object-fit: contain;
  border-radius: 12px;
}

@media (max-width: 479px) {
  .card {
    padding: 1.25rem 1rem;
  }
  .post-desc {
    text-align: left;
    line-height: 1.6;
  }
}

@media (min-width: 1024px) {
  .card {
    padding: 2.5rem;
  }

  .header-post {
    flex-direction: row;
    align-items: center;
    margin-bottom: 1.2rem;
  }

  .header-post .post-title {
    font-size: 1.3rem;
  }

  .header-post .post-date {
    font-size: 0.95rem;
  }

  .post-desc {
    font-size: 1rem;
    line-height: 1.5;
  }

  .img-post {
    max-height: 650px;
  }
}
</style>
