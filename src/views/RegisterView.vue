<script setup>
import { ref } from 'vue'
import { useRoute } from 'vue-router';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/userStore'
import RegisterStepOne from '@/components/forms/RegisterStepOne.vue';
import RegisterStepTwo from '@/components/forms/RegisterStepTwo.vue';
import odsShape from  '/static/ods-shape.svg'
import LogoAzul from '/logo-azul.svg'
import RegisterStepThree from '@/components/forms/RegisterStepThree.vue';

const userStore = useUserStore();
const router = useRouter();
const route = useRoute();

// Controle visual
const loading = ref(false);
const errorMessage = ref('');

// Query das opções
const userId = route.query.id;
const userType = route.query.title;
const userIcon = route.query.icon;
const userColor = route.query.color;

// Controle dos passos para o Cadastro
const currentStep = ref(1);
const backStep = () => {
    if(currentStep.value === 1) {
        router.back()
    }
    else {
        currentStep.value--
    }
}

</script>

<template>
    <section class="container">
        <header class="header-section">
            <button @click="backStep" class="back-btn">
                <span class="mdi mdi-arrow-left-thin"></span>
            </button>
            <img :src="LogoAzul" alt="logo do SINUCA azul" style="width: auto; height: 40px">
        </header>

        <RegisterStepOne 
            v-if="currentStep === 1"
            :user-type="userType"
            :user-icon="userIcon"
            :user-color="userColor"
            @next-step="currentStep++"
        />
        <RegisterStepTwo 
            v-if="currentStep === 2"
            :user-type="userType"
            :user-icon="userIcon"
            :user-color="userColor"
            @next-step="currentStep++"
        />

        <RegisterStepThree 
            v-if="currentStep === 3"
            :user-id="userId"
            :user-type="userType"
            :user-icon="userIcon"
            :user-color="userColor"

        />
        <div class="ods-decoration" aria-hidden="true">
            <img :src="odsShape" alt="" class="overlay-ods">
        </div>
    </section>
</template>

<style scoped>
.container {
    height: 100vh;
    position: relative;
    padding: 0 2rem;
    overflow: hidden;
}

.header-section {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 1.5rem;
    position: relative;
    z-index: 2;
}

.back-btn {
    background-color: inherit;
    border: none;
    font-size: 2.5rem;
}

.ods-decoration {
    position: relative;
    width: min(100%, 280px);
    aspect-ratio: 163 / 50;
    overflow: hidden;
    margin: auto auto 0;
    flex-shrink: 0;
    pointer-events: none;
}

.overlay-ods {
    position: absolute;
    top: 100%;
    left: 50%;
    width: calc(100% * 90 / 163);
    height: auto;
    transform: translate(-50%, -50%) rotate(90deg);
}

@media (min-width: 768px) {
    .container {
        height: auto;
        min-height: 100vh;
        padding: 0 4rem;
        background-color: #F6F6F2;
    }

    .container::before {
        content: '';
        position: absolute;
        inset: 0;
        background-color: #01295F;
        clip-path: polygon(48% 0, 100% 0, 100% 100%, 12% 100%);
        z-index: 0;
    }

    .ods-decoration {
        display: none;
    }

    .header-section {
        justify-content: flex-start;
        margin-top: 2.5rem;
    }

    .back-btn {
        display: none;
    }
}
@media (max-width: 767px) {
  .container { display: flex; flex-direction: column; height: auto; min-height: 100dvh; padding: 0 1rem; overflow: visible; }
  .container > * { flex-shrink: 0; }
}
</style>
