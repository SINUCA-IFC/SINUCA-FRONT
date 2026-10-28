<script setup>
import { computed, onMounted, ref } from 'vue';
import { useLinkStore } from '@/stores/linkStore';
import DocumentItem from './DocumentItem.vue';
import AppButton from '../forms/AppButton.vue';

const linkStore = useLinkStore();
const error = ref('');

const groups = computed(() => [
    { id: 2, icon: 'mdi mdi-forum-outline', title: 'Documentos para Debate', category: 'debate' },
    { id: 3, icon: 'mdi mdi-handshake-outline', title: 'Documentos para Mesa de cooperação', category: 'cooperation' },
].map(group => ({
    ...group,
    documents: linkStore.links.filter(document => document.categories?.includes(group.id)),
})));

onMounted(() => {
    linkStore.getLinks()
});
</script>

<template>
    <section class="documents-section">
        <h4 class="section-title">Documentos</h4>
        <p v-if="linkStore.loading" class="default" role="status">Carregando documentos...</p>
        <div v-else-if="error">
            <p class="default">{{ error }}</p>
            <AppButton @click="loadDocuments">Tentar novamente</AppButton>
        </div>
        <div v-else class="documents-groups">
            <section v-for="group in groups" :key="group.id" :class="['documents-group', group.category]">
                <h5 class="group-title"> <span :class="group.icon" /> {{ group.title }}</h5>
                <ul v-if="group.documents.length" class="documents-list">
                    <li v-for="document in group.documents" :key="document.id">
                        <DocumentItem
                            :title="document.name || document.url"
                            :link="document.url"
                            :category="group.category"
                        />
                    </li>
                </ul>
                <p v-else class="default">Nenhum documento disponível nesta categoria.</p>
            </section>
        </div>
    </section>
</template>

<style scoped>
.documents-section, .documents-groups {
    display: flex;
    flex-direction: column;
    gap: 2rem;
    min-width: 0;
}

.section-title {
    font-size: 1.5rem;
    font-weight: bolder;
}

.group-title {
    margin-bottom: 1.2rem;
    font-size: 1.1rem;
    font-weight: 500;
    line-height: 1.5;
}

.debate .group-title { color: #01295F; }
.cooperation .group-title { color: #849324; }

.documents-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.default {
    color: #969696;
    line-height: 1.5;
}

</style>
