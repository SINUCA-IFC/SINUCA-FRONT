<script setup>
import { onBeforeUnmount, ref, watch } from 'vue'
import LinkService from '@/services/linkService'
import AppButton from '@/components/forms/AppButton.vue'

const props = defineProps({
  documents: { type: Array, default: () => [] },
})

const linkService = new LinkService()
const links = ref([])
const loading = ref(false)
const error = ref('')
let requestId = 0

async function loadDocuments() {
  const currentRequest = ++requestId
  links.value = []
  error.value = ''
  loading.value = true

  try {
    const unique = new Map()
    for (const document of props.documents) {
      const id = document?.id ?? document
      if (id != null) unique.set(String(id), document)
    }
    const documents = await Promise.all(
      [...unique.values()].map((document) =>
        typeof document === 'object' && document.url
          ? document
          : linkService.getLink(document?.id ?? document),
      ),
    )
    if (currentRequest === requestId) links.value = documents
  } catch {
    if (currentRequest === requestId) error.value = 'Não foi possível carregar os documentos.'
  } finally {
    if (currentRequest === requestId) loading.value = false
  }
}

watch(() => props.documents, loadDocuments, { immediate: true, deep: true })
onBeforeUnmount(() => {
  requestId += 1
})
</script>

<template>
  <section class="related-documents">
    <h3>
      <span class="mdi mdi-file-document-outline" aria-hidden="true"></span> Documentos relacionados
    </h3>
    <p v-if="loading" role="status">Carregando documentos...</p>
    <div v-else-if="error">
      <p role="alert">{{ error }}</p>
      <AppButton @click="loadDocuments">Tentar novamente</AppButton>
    </div>
    <ul v-else-if="links.length">
      <li v-for="link in links" :key="link.id">
        <a :href="link.url" target="_blank" rel="noopener noreferrer">{{
          link.name || link.url
        }}</a>
      </li>
    </ul>
    <p v-else>Nenhum documento relacionado.</p>
  </section>
</template>

<style scoped>
.related-documents {
  margin-top: 2rem;
  line-height: 1.5;
}
h3 {
  color: #01295f;
  font-size: 1.3rem;
  font-weight: 500;
  margin-bottom: 1rem;
}
ul {
  display: grid;
  gap: 1rem;
}
a {
  color: #01295f;
  overflow-wrap: anywhere;
  text-decoration: underline;
}
a:focus-visible {
  outline: 2px solid #01295f;
  outline-offset: 3px;
}
</style>
