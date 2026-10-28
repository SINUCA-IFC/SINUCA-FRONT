<script setup>
import { ref, computed, onMounted } from 'vue'
import { useGangStore } from '@/stores/gangStore.js'
import { useUserStore } from '@/stores/userStore.js'
import AppButton from './AppButton.vue'
import AppInput from './AppInput.vue'
import { useRouter } from 'vue-router'

const userStore = useUserStore();
const gangStore = useGangStore();
const router = useRouter();

const loading = ref(false);
const errorMessage = ref('');
const focusMatriculation = ref(false);

const props = defineProps({
  userId: String,
  userType: String,
  userIcon: String,
  userColor: String,
});

const previewUrl = ref(null);
const selectedFile = ref(null);

const requirements = computed(() => {
  return [
    {
      requirement: 'Digite uma matrícula válida',
      valid:
        userStore.user.matriculation.length < 10 ||
        userStore.user.matriculation.length > 10 ||
        !/^[0-9]+$/.test(userStore.user.matriculation),
    },
  ]
})

function handleImage(event) {
  const file = event.target.files[0];
  if(!file) return
  
  selectedFile.value = file
  previewUrl.value = URL.createObjectURL(file)
}

async function register() {
  loading.value = true
  errorMessage.value = ''

  try {
    if(selectedFile.value) {
      const response = await userStore.uploadImage(selectedFile.value);
      console.log('UPLOAD RESPONSE:', response.data)
      userStore.user.foto = response.data.id
    }
    await userStore.register(
      userStore.user.email,
      userStore.user.name,
      userStore.user.password,
      userStore.user.gang,
      userStore.user.matriculation,
      userStore.user.foto,
    )
    router.push('/')
  } catch (err) {
    errorMessage.value = 'Erro ao cadastrar. Verifique suas credenciais'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  gangStore.getGangs()
});
</script>

<template>
  <div class="container-component">
    <h1 class="step-title">QUASE LÁ!</h1>
    <h1 class="step-title2">REGISTRO</h1>


    <div class="forms-container">
      <form @submit.prevent="register" class="forms">
        <div class="image-section">
          <label class="avatar">
            <img v-if="previewUrl" :src="previewUrl" alt="foto do usuário" />

            <span v-else class="avatar-placeholder">
              <i class="mdi mdi-camera"></i>
            </span>

            <input
              type="file"
              accept="image/jpeg, image/png"
              @change="handleImage"
            />
          </label>
        </div>

        <AppInput
          v-model="userStore.user.name"
          label="Nome Completo"
          type="text"
          placeholder="Digite seu nome."
          required
        />
        <AppInput
          v-if="userId === '2'"
          v-model="userStore.user.matriculation"
          label="Matrícula"
          type="text"
          placeholder="Digite sua matrícula."
          @focus="focusMatriculation = true"
          @blur="focusMatriculation = false"
          required
        />

        <span style="color: #fd151b; margin-bottom: 1rem;" v-if="requirements[0].valid && focusMatriculation">
          <span class="mdi mdi-alert-circle-outline" />
          {{ requirements[0].requirement }}</span
        >
        <div class="class-area">
          <label for="class" class="label-class">Turma</label>
          <select class="select-class" v-model="userStore.user.gang">
            <option
              v-for="c in gangStore.gangs"
              :key="c.id"
              :value="c.id"
              name="class" 
              class="option-class"
            >{{ c.name }}</option>
          </select>
        </div>

        <AppButton type="submit">CADASTRAR</AppButton>
      </form>
    </div>

    <p class="step-subtitle">Complete suas informações para finalizar seu cadastro.</p>
  </div>
</template>

<style scoped>
.container-component {
  height: 80vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.step-title {
  text-align: center;
  order: 1;  
  margin-bottom: 1rem;
}

.step-title2 {
  display: none;
}

.forms-container {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.15);
  padding: 2rem;
  order: 3;
}

.step-subtitle {
  text-align: center;
  color: #969696;
  margin-bottom: 2.5rem;
  order: 2;
}

.forms {
  display: flex;
  flex-direction: column;
}

.image-section {
  display: flex;
  justify-content: center;
  margin-bottom: 1.5rem;
}

.avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: #f1f1f1;
  border: 2px dashed #ccc;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: 0.3s;
}

.avatar:hover {
  border-color: #666;
  background: #eaeaea;
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar input {
  display: none;
}

.avatar-placeholder {
  color: #999;
  font-size: 2rem;
}

.label-class {
  display: block;
  margin-bottom: 10px;
  font-weight: 500;
}
.select-class {
  width: 100%;
  padding: 0.5rem 1rem;
  border: 2px solid #D9D9D9;
  border-radius: 5px;
  outline: none;
}

.select-class::picker-icon {
  color: #9999;
  transition: .4s rotate;
}

.select-class:open::picker-icon {
  rotate: 180deg;
}

.select-class option {
  border: 1px solid #d7d7d7;
  padding: 6px;
  transition: .4s;
}

@media (min-width: 768px) {
  .container-component {
    height: auto;
    min-height: 85vh;
    justify-content: center;
    align-items: center;
    position: relative;
    z-index: 2;
  }

  .step-title {
    display: none;
  }

  .forms-container {
    width: 100%;
    max-width: 600px;
    padding: 3rem;
    box-shadow: 0 2px 20px rgba(0, 0, 0, 0.2);
    order: 2;
  }

  .step-subtitle {
    color: #fff;
    font-weight: 600;
    margin-top: 2rem;
    order: 3;
  }

  .avatar {
    width: 140px;
    height: 140px;
  }

  .step-title2 {
    text-align: left;
    color: #01295F;
    font-size: 2.5rem;
    max-width: 680px;
    width: 100%;
    margin: 0 0 1.5rem;
    order: 1;
    display: block;
  }
}
@media (max-width: 767px) {
  .container-component { height: auto; min-height: 0; padding: 1.5rem 0; }
  .forms-container { width: 100%; min-width: 0; padding: 1.25rem; }
  .step-title { font-size: clamp(1.5rem, 7vw, 2rem); line-height: 1.4; }
  .step-subtitle { line-height: 1.5; margin-bottom: 1.5rem; }
}
</style>
