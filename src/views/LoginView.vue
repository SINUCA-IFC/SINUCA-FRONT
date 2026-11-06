<script setup>
import { ref } from 'vue';
import { useUserStore } from '@/stores/userStore';
import { useRoute, useRouter } from 'vue-router';
import AppInput from '@/components/forms/AppInput.vue';
import AppButton from '@/components/forms/AppButton.vue';
import odsShape from  '/static/ods-shape.svg'
import LogoAzul from '/logo-azul.svg'

const route = useRoute();
const router = useRouter();

const userStore = useUserStore();

const showPassword = ref(false);

function tooglePassword() {
    showPassword.value = !showPassword.value
}

// email e senha do usuário
const email = ref('');
const password = ref('');

// controle visual do login
const loading = ref(false);
const errorMessage = ref('');

// Query das opções
const userType = route.query.title;
const userIcon = route.query.icon;
const userColor = route.query.color;

// login 
async function login() {
    loading.value = true;
    errorMessage.value = '';
    try {
        await userStore.login(email.value, password.value);
        router.push('/');
    } catch (err){
        errorMessage.value = 'Erro ao entrar. Verifique suas credenciais.';
    } finally {
        loading.value = false;  
    }
}
</script>

<template>
    <div class="container">

        <header class="header-section">
            <button @click="router.back()" class="back-btn">
                <span class="mdi mdi-arrow-left-thin"></span>
            </button>
            <img :src="LogoAzul" alt="logo do SINUCA azul" class="imagemLogo">
        </header>

        <section class="login-section">

            <h1 class="login-title">ENTRAR</h1>

            <div class="login-area">
                <div class="header-login" :style="`color: ${userColor}`">
                    <span :class="userIcon"></span>
                    <h2>{{ userType }}</h2>
                </div>

                <form @submit.prevent="login" class="login-form" >
                    <AppInput
                        v-model="email" 
                        label="Email"
                        placeholder="exemplo@gmail.com"
                        type="email"
                    />
                    
                    <div class="password-input">
                        <AppInput 
                            v-model="password"
                            label="Senha"
                            placeholder="Digite sua senha"
                            :type="showPassword ? 'text' : 'password'" 
                        />
                        <span class="toogle-password" @click="tooglePassword">
                            <span :class="showPassword ? 'mdi mdi-eye' : 'mdi mdi-eye-off'"></span>
                        </span>
                    </div>
                    <p class="error-message" v-if="errorMessage">{{ errorMessage }}</p>
                    <AppButton type="submit">ENTRAR</AppButton>
                    <RouterLink :to="{
                        path: '/cadastro',
                        query: route.query }" >
                        Novo no SINUCA? Clique Aqui.
                    </RouterLink>
                </form>
            </div>

            <p class="login-subtitle">Entre com suas credenciais.</p>

        </section>

        <div class="ods-decoration" aria-hidden="true">
            <img :src="odsShape" alt="" class="overlay-ods">
        </div>
    </div>
</template>

<style scoped>
.imagemLogo {
    height: 40px;
    width: auto;
}

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

/* título separado do subtítulo para poder reordenar no desktop */
.login-title {
    text-align: center;
    margin: 2rem 0 1rem;
}

.login-subtitle {
    text-align: center;
    color: #969696;
    margin-bottom: 2rem;
}

.login-section {
    height: 70vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    position: relative;
    z-index: 2;
}

/* ordem mobile: título > subtítulo > card */
.login-title { order: 1; }
.login-subtitle { order: 2; }
.login-area { order: 3; }

.login-area {
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.15);
    padding: 2rem;
}

.header-login {
    text-align: center;
    margin-bottom: 2rem;
    & span {
        font-size: 3rem;
    }
    & h2 {
        font-weight: 600;
        font-size: 1.7rem;
        margin-top: 0.5rem;
    }
}

.login-form {
    display: flex;
    flex-direction: column;
}

.password-input {
    position: relative;
}

.toogle-password {
    position: absolute;
    right: 20px;
    top: 45%;
    font-size: 1.2rem;
    color: #002453;
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

.error-message {
    color: #FD151B;
}

a {
    text-align: center;
    margin-top: 1rem;
    color: #437F97;
    text-decoration: underline;
}


/* ===================== DESKTOP ===================== */
@media (min-width: 768px) {

    .container {
        height: auto;
        min-height: 100vh;
        padding: 0 4rem;
        background-color: #F6F6F2; /* lado creme */
    }

    /* fundo diagonal, substitui o ods-shape como elemento decorativo principal */
    .container::before {
        content: '';
        position: absolute;
        inset: 0;
        background-color: #01295F; /* lado azul-marinho */
        clip-path: polygon(48% 0, 100% 0, 100% 100%, 12% 100%);
        z-index: 0;
    }

    /* o ods-shape some no desktop, quem faz o recorte agora é o ::before */
    .ods-decoration {
        display: none;
    }

    .header-section {
        justify-content: flex-start;
        margin-top: 2.5rem;
    }

    /* botão de voltar não aparece no design desktop */
    .back-btn {
        display: none;
    }

    .login-section {
        height: auto;
        min-height: 80vh;
        justify-content: center;
        align-items: center;
    }

    .login-title {
        text-align: left;
        color: #01295F;
        font-size: 2.5rem;
        margin: 0 5rem 1.5rem 0;
        max-width: 600px;
        width: 100%;
        align-items: left;
    }

    .login-area {
        width: 100%;
        max-width: 600px;
        padding: 3rem;
        box-shadow: 0 2px 20px rgba(0, 0, 0, 0.2);
    }

    /* reordena: título > card > subtítulo */
    .login-title { order: 1; }
    .login-area { order: 2; }
    .login-subtitle {
        order: 3;
        color: #fff;
        font-weight: 600;
        margin-top: 2rem;
    }

    .imagemLogo {
        height: 80px;
    }
}
@media (max-width: 767px) {
  .container { display: flex; flex-direction: column; height: auto; min-height: 100dvh; padding: 0 1rem; overflow: visible; }
  .login-section { flex-shrink: 0; height: auto; min-height: 0; padding: 1.5rem 0; }
  .login-area { width: 100%; padding: 1.25rem; }
  .login-title { font-size: 2rem; line-height: 1.3; }
  .login-subtitle { line-height: 1.5; }
}
</style>
