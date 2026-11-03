<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useUserStore } from '../stores/userStore';
import { useCountryStore } from '../stores/countryStore';
import { useDelegationTabs } from '../composables/useDelegationTabs';

// AppLayout substitui AppHeaderMob + AppTabFooter (e adiciona a sidebar desktop)
import AppLayout from '../components/layout/AppLayout.vue';
import BannerComponent from '../components/layout/BannerComponent.vue';
import NavigationComponent from '../components/delegation/NavigationComponent.vue';
import TasksListComponent from '../components/delegation/TasksListComponent.vue';
import CreatTaskModal from '../components/delegation/modais/CreatTaskModal.vue';
import ScheduleListComponent from '../components/delegation/ScheduleListComponent.vue';
import ScheduleModal from '../components/delegation/modais/ScheduleModal.vue';
import DocumentsListComponent from '../components/delegation/DocumentsListComponent.vue';
import NotesListComponent from '../components/delegation/NotesListComponent.vue';

const countryStore = useCountryStore();
const userStore = useUserStore();
const countryId = ref();
const hasDelegation = computed(() => Boolean(userStore.user.country?.id));
const checkingApproval = ref(false);

// Cópia local do país da delegação. O ScheduleModal chama
// countryStore.getCountry() para os países do debate, o que sobrescreve
// countryStore.country — sem esta cópia o banner passaria a mostrar
// o país adversário depois de abrir um debate.
const delegationCountry = ref(null);

// Aba ativa compartilhada com a sidebar (desktop)
const { activeTab } = useDelegationTabs();

const router = useRouter();
const route = useRoute();
const activeModal = ref("");
const selectedScheduleId = ref(null)

const openTaskForm = () => {
    activeModal.value = 'form-tarefa'
    router.push('/delegacao/nova-tarefa')
};

const openScheduleModal = (id) => {
    selectedScheduleId.value = id
    activeModal.value = 'schedule-details'
    router.push(`/delegacao/schedule/${id}`)
}

const closeModal = () => {
    activeModal.value = null
    selectedScheduleId.value = null
    router.push('/delegacao')
};

const checkModalRoute = () => {
    if (!hasDelegation.value) {
        activeModal.value = null;
        return;
    }
    if (route.path.includes('/delegacao/nova-tarefa') || route.path.includes('/editar')) {
        activeModal.value = 'form-tarefa';
    } else if (route.path.includes('/delegacao/schedule/')) {
        activeModal.value = 'schedule-details';
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

const loadDelegation = async () => {
    countryId.value = userStore.user.country?.id
    delegationCountry.value = null
    if (!countryId.value) {
        activeModal.value = null
        return
    }
    await countryStore.getCountry(countryId.value)
    delegationCountry.value = { ...countryStore.country }

    checkModalRoute()
};

const refreshApproval = async () => {
    checkingApproval.value = true
    try {
        await userStore.checkAuth()
        if (!userStore.loggedIn) router.push('/bem-vindo')
    } finally {
        checkingApproval.value = false
    }
};

const logout = () => {
    userStore.logout()
    router.push('/bem-vindo')
};

watch(() => userStore.user.country?.id, loadDelegation);
onMounted(loadDelegation);
</script>

<template>
    <AppLayout title="Delegação">
        <section v-if="!hasDelegation" class="pending-approval" aria-live="polite">
            <h1>{{ userStore.user.approval_pending ? 'Aguardando aprovação' : 'Nenhuma delegação vinculada' }}</h1>
            <p v-if="userStore.user.approval_pending">Seu cadastro está registrado. Os organizadores precisam aprovar sua participação e atribuir uma delegação.</p>
            <p v-else>Esta conta não possui uma delegação vinculada.</p>
            <button type="button" :disabled="checkingApproval" @click="refreshApproval">
                {{ checkingApproval ? 'Atualizando...' : 'Atualizar situação' }}
            </button>
            <button type="button" @click="logout">Sair</button>
        </section>
        <main v-else>
            <BannerComponent 
                :title="delegationCountry?.name"
                :subtitle="delegationCountry?.political_name"
                :-country-flag-url="delegationCountry?.flag?.url"
            />
            <NavigationComponent />
            
            <TasksListComponent v-if="activeTab === 0"
                @open-form="openTaskForm"
            />

            <ScheduleListComponent v-if="activeTab === 1" 
                @open-details="openScheduleModal"
            />

            <DocumentsListComponent v-if="activeTab === 2" 

            />

            <NotesListComponent v-if="activeTab === 3" 
            
            />

            <CreatTaskModal  
                v-if="activeModal === 'form-tarefa'"
                @close="closeModal"
            />

            <ScheduleModal
                v-if="activeModal === 'schedule-details'"
                :schedule-id="selectedScheduleId"
                @close="closeModal"
            />
        </main>
    </AppLayout>
</template>

<style scoped>
.pending-approval {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 2rem;
}

main {
    display: flex;
    flex-direction: column;
    gap: 2rem;
}


@media (min-width: 1024px) {
    main {
        padding: 0;
        gap: 2.5rem;
        margin: 0 2rem;
    }
    
}
</style>
