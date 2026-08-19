<script setup>
import { onMounted, ref, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useUserStore } from '@/stores/userStore';
import { useCountryStore } from '@/stores/countryStore';


import AppHeaderMob from '@/components/layout/mobile/AppHeaderMob.vue';
import BannerComponent from '@/components/layout/BannerComponent.vue';
import NavigationComponent from '@/components/delegation/NavigationComponent.vue';
import TasksListComponent from '@/components/delegation/TasksListComponent.vue';
import DocumentsListComponent from '@/components/delegation/DocumentsListComponent.vue';
import CreatTaskModal from '@/components/delegation/modais/CreatTaskModal.vue';
import AppTabFooter from '@/components/layout/mobile/AppTabFooter.vue';
import ScheduleListComponent from '@/components/delegation/ScheduleListComponent.vue';

const countryStore = useCountryStore();
const userStore = useUserStore();
const countryId = ref();

const activeTab = ref(0);

const router = useRouter();
const route = useRoute();
const activeModal = ref(null);

const openTaskForm = () => {
    activeModal.value = 'form-tarefa'
    router.push('/delegacao/nova-tarefa')
};

const closeModal = () => {
    activeModal.value = null
    router.push('/delegacao')
};

const checkModalRoute = () => {
    if (route.path.includes('/delegacao/nova-tarefa') || route.path.includes('/editar')) {
        activeModal.value = 'form-tarefa';
    } else {
        activeModal.value = null;
    }
}

watch(
    () => route.path,
    () => {
        checkModalRoute();
    }
);

onMounted (() => {
    countryId.value = userStore.user.country.id
    countryStore.getCountry(countryId.value)

    checkModalRoute()
});
</script>

<template>
    <AppHeaderMob title="Delegação"/>
    <main>
        <BannerComponent 
            :title="countryStore.country?.name"
            :subtitle="countryStore.country?.political_name"
            :-country-flag-url="countryStore.country?.flag?.url"
        />
        <NavigationComponent 
            @change-tab="activeTab = $event"
        />
        
        <TasksListComponent v-if="activeTab === 0"
            @open-form="openTaskForm"
        />
        <ScheduleListComponent v-if="activeTab === 1" 
            
        />
        <DocumentsListComponent v-if="activeTab === 2"/>


        <!-- MODAL -->

        <CreatTaskModal  
            v-if="activeModal === 'form-tarefa'"
            @close="closeModal"
        />
    </main>
    <AppTabFooter 
    />
</template>

<style scoped>
main {
    display: flex;
    flex-direction: column;
    gap: 2rem;
}

</style>