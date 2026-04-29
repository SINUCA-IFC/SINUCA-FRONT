<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

import AppHeaderMob from '@/components/layout/mobile/AppHeaderMob.vue';
import BannerDelegation from '@/components/delegation/BannerDelegation.vue';
import NavigationComponent from '@/components/delegation/NavigationComponent.vue';
import TasksListComponent from '@/components/delegation/TasksListComponent.vue';
import CreatTaskModal from '@/components/delegation/modais/CreatTaskModal.vue';

const router = useRouter();

const activeModal = ref(null);


const openTaskForm = () => {
    activeModal.value = 'form-tarefa'
    router.push('/delegacao/nova-tarefa')
};

const closeModal = () => {
    activeModal.value = null
    router.push('/delegacao')
};
</script>

<template>
    <AppHeaderMob title="Delegação"/>
    <main>
        <BannerDelegation />
        <NavigationComponent />
        <TasksListComponent 
            @open-form="openTaskForm"
        />

        <!-- MODAL -->

        <CreatTaskModal  
            v-if="activeModal === 'form-tarefa'"
            @close="closeModal"
        />
    </main>
</template>

<style scoped>
main {
    display: flex;
    flex-direction: column;
    gap: 2rem;
}

</style>