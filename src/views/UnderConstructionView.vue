<script setup>
import { useRouter } from 'vue-router';
import AppButton from '@/components/forms/AppButton.vue';
import UnderConstruction from '@/components/layout/UnderConstruction.vue';
import AppLayout from '@/components/layout/AppLayout.vue';

const router = useRouter();
</script>

<template>
    <AppLayout title="Em construção">
    <section class="container">
        <UnderConstruction 
            class="notice"
            title="Área em construção"
            subtitle="Ainda estamos trabalhando nisso."
        />
        <AppButton @click="router.back()">
            <span class="mdi mdi-arrow-left"/>
            Voltar
        </AppButton>
    </section>
    </AppLayout>
</template>

<style scoped>
.container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
    min-height: calc(100dvh - 12rem);
    padding: 1.5rem;
    text-align: center;
}

.container .notice {
    min-height: 0;
}
</style>
