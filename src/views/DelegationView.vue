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
import LogoAzul from '/logo-azul.svg';
import MascoteSinuca from '/static/sinuca-mascote.png';

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
    <AppLayout v-if="!hasDelegation" class="esperando-apovar" title="Delegação">
        <section class="pending-content">
            <h1 id="pending-title">{{ userStore.user.approval_pending ? 'Em aguardo' : 'Sem delegação' }}</h1>
            <p v-if="userStore.user.approval_pending" class="pending-description">
                Seu cadastro está registrado. Aguarde a aprovação da organização e a atribuição da sua delegação.
            </p>
            <p v-else class="pending-description">
                Esta conta não possui uma delegação vinculada. Consulte a organização para verificar seu vínculo.
            </p>

            <div class="pending-illustration" aria-hidden="true">
                <img :src="MascoteSinuca" alt="" width="600" height="450" />
            </div>

            <p class="pending-welcome">Te esperamos no SINUCA</p>
            <div class="pending-actions">
                <button
                    type="button"
                    class="pending-refresh"
                    :disabled="checkingApproval"
                    :aria-busy="checkingApproval"
                    @click="refreshApproval"
                >
                    <span class="mdi mdi-refresh" :class="{ 'is-spinning': checkingApproval }" aria-hidden="true"></span>
                    {{ checkingApproval ? 'Atualizando...' : 'Atualizar situação' }}
                </button>
            </div>
        </section>
    </AppLayout>
    <AppLayout v-else title="Delegação">
        <main class="delegation-content">
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

.esperando-apovar {
    margin-bottom: 6rem;
}

.pending-logo {
    order: 2;
    display: inline-flex;
    border-radius: 0.5rem;
}

.pending-logo img {
    display: block;
    width: 3.5rem;
    height: auto;
}

.pending-exit,
.pending-refresh {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.625rem;
    min-height: 48px;
    padding: 0.75rem 1.125rem;
    border: 0;
    border-radius: 0.5rem;
    font: inherit;
    font-size: 0.9375rem;
    font-weight: 600;
    line-height: 1.5;
    cursor: pointer;
    transition: background-color 150ms ease;
}

.pending-exit {
    background-color: #e9eeed;
    color: #01295f;
}

.pending-exit:hover {
    background-color: #dfe7e5;
}

.pending-logo:focus-visible,
.pending-exit:focus-visible,
.pending-refresh:focus-visible {
    outline: 3px solid #ffb30f;
    outline-offset: 4px;
}

.pending-content {
    display: flex;
    flex: 1;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
    max-width: 38rem;
    margin-inline: auto;
    padding-block: 2rem 1rem;
    text-align: center;
}

.pending-content h1 {
    max-width: 100%;
    font-size: clamp(1.625rem, 5vw, 2.5rem);
    font-weight: 700;
    line-height: 1.25;
    letter-spacing: 0.02em;
    text-transform: uppercase;
    text-wrap: balance;
}

.pending-description {
    max-width: 36ch;
    margin-top: 0.875rem;
    color: #626e76;
    font-size: 1rem;
    line-height: 1.65;
    text-wrap: pretty;
}

.pending-illustration {
    position: relative;
    width: clamp(13rem, 58vw, 19rem);
    aspect-ratio: 279 / 328;
    margin-block: 1.25rem 0.5rem;
    overflow: hidden;
}

.pending-illustration::before {
    content: '';
    position: absolute;
    top: 10%;
    left: 16%;
    width: 72%;
    aspect-ratio: 1;
    border-radius: 50%;
    background-color: white;
}

.pending-illustration img {
    position: absolute;
    top: -14.79%;
    left: -36.48%;
    width: 189.69%;
    height: 124.7%;
    max-width: none;
}

.pending-welcome {
    color: #626e76;
    font-size: 0.9375rem;
    line-height: 1.5;
}

.pending-actions {
    width: min(100%, 19rem);
    margin-top: 1.5rem;
}

.pending-refresh {
    width: 100%;
    background-color: #01295f;
    color: white;
}

.pending-refresh:hover:not(:disabled) {
    background-color: #002453;
}

.pending-refresh:disabled {
    opacity: 0.65;
    cursor: wait;
}

.is-spinning {
    animation: pending-spin 1s linear infinite;
}

@keyframes pending-spin {
    to { transform: rotate(360deg); }
}

.delegation-content {
    display: flex;
    flex-direction: column;
    gap: 2rem;
}


@media (min-width: 1024px) {
    .esperando-apovar {
        padding: 2rem 4rem;
        background-image: linear-gradient(rgb(246 246 242 / 90%), rgb(246 246 242 / 90%)), url('/static/fundo-continente.svg');
        background-position: center;
        background-size: cover;
    }

    .esperando-apovar::after {
        display: none;
    }

    .pending-logo { order: 0; }
    .pending-logo img { width: 4.75rem; }
    .pending-content { padding-block: 1rem; }
    .pending-illustration { width: 20rem; }

    .delegation-content {
        padding: 0;
        gap: 2.5rem;
        margin: 0 2rem;
    }
    
}

@media (max-height: 700px) {
    .pending-content { padding-block: 1.25rem 0; }
    .pending-illustration { width: 11.5rem; margin-block: 0.75rem; }
    .pending-actions { margin-top: 1rem; }
}

@media (prefers-reduced-motion: reduce) {
    .is-spinning { animation: none; }
}
</style>
