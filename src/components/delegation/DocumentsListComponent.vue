<script setup>
import { useLinkStore } from '@/stores/linkStore';
import { onMounted } from 'vue';

const linkStore = useLinkStore();

onMounted(() =>{
    linkStore.getLinks();
});
</script>

<template>
    <div class="header-section">
        <h4 style="font-weight: bolder; font-size: 1.5rem; margin-bottom: 1.5rem;">Documentos</h4>
        
    </div>
</template>

<style scoped>
</style>