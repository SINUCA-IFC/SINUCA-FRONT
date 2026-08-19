<script setup>
import { useLinkStore } from '@/stores/linkStore';
import { onMounted } from 'vue';
import DocumentItem from './DocumentItem.vue';

const linkStore = useLinkStore();

onMounted(() => {
    linkStore.getLinks();
});
</script>

<template>
    <div class="header-section" >
        <h4 style="font-weight: bolder; font-size: 1.5rem; margin-bottom: 1rem;">Documentos & links</h4>
    </div>
    <h5 style="color: #01295F; font-size: 1.2rem; font-weight: 600; margin-bottom: 1vw;"> <span
            class="mdi mdi-forum-outline" style="margin-right: 2vw;"></span>Para debate</h5>

    <a href="https://pt.wikipedia.org/wiki/Blob_(ser_vivo)" style="text-decoration: underline;"><span
            class="mdi mdi-help-circle-outline" style="margin-right: 2vw;"></span>Como funcionam os debates?</a>

    <DocumentItem></DocumentItem>

    <h5 style="color: #849324; font-size: 1.2rem; font-weight: 600; margin-bottom: 1vw;"> <span
            class="mdi mdi-handshake-outline" style="margin-right: 2vw;"></span>Para mesas de cooperação</h5>

    <a href="https://pt.wikipedia.org/wiki/Blob_(ser_vivo)" style="text-decoration: underline;"><span
            class="mdi mdi-help-circle-outline" style="margin-right: 2vw;"></span>Como funcionam as mesas de
        cooperação?</a>

    <DocumentItem></DocumentItem>

       <h5 style="color: #FFB30F; font-size: 1.2rem; font-weight: 600; margin-bottom: 1vw;"> <span
            class="mdi mdi-handshake-outline" style="margin-right: 2vw;"></span>Para apresentações culturais</h5>

    <a href="https://pt.wikipedia.org/wiki/Blob_(ser_vivo)" style="text-decoration: underline;"><span
            class="mdi mdi-help-circle-outline" style="margin-right: 2vw;"></span>Como funcionam as apresentações culturais?</a>

    <DocumentItem></DocumentItem>

      <h5 style="color: #FD151B; font-size: 1.2rem; font-weight: 600; margin-bottom: 1vw;"> <span
            class="mdi mdi-instagram" style="margin-right: 2vw;"></span>Para postagens</h5>

    <a href="https://pt.wikipedia.org/wiki/Blob_(ser_vivo)" style="text-decoration: underline;"><span
            class="mdi mdi-help-circle-outline" style="margin-right: 2vw;"></span>Como funcionam as postagens?</a>

    <DocumentItem></DocumentItem>
</template>

<style scoped>
a{
        color: #437F97;
}
</style>