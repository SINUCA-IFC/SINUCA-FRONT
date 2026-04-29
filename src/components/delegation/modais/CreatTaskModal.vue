<script setup>
import { reactive, ref, onMounted } from 'vue'
import { useTaskStore } from '@/stores/taskStore'
import { useUserStore } from '@/stores/userStore'
import AppInput from '@/components/forms/AppInput.vue'
import AppButton from '@/components/forms/AppButton.vue'

const taskStore = useTaskStore();
const userStore = useUserStore();

const emits = defineEmits(['close']);

// categorias
const categories = ref([
  {
    id: 2,
    icon: 'mdi mdi-book-open-page-variant-outline',
    name: 'Pesquisa',
    activeStyle: 'background-color: #FFB30F;',
  },
  {
    id: 3,
    icon: 'mdi mdi-forum-outline',
    name: 'Debate',
    activeStyle: 'background-color: #01295F;',
  },
  {
    id: 4,
    icon: 'mdi mdi-instagram',
    name: 'Instagram',
    activeStyle: 'background-color: #FD151B;',
  },
  {
    id: 5,
    icon: 'mdi mdi-handshake-outline',
    name: 'Mesas de Coop.',
    activeStyle: 'background-color: #849324;',
  },
  {
    id: 6,
    icon: 'mdi mdi-drama-masks',
    name: 'Apres. Cultural',
    activeStyle: 'background-color: #FFB30F;',
  },
  {
    id: 7,
    icon: 'mdi mdi-dots-horizontal',
    name: 'Outro',
    activeStyle: 'background-color: #01295F;',
  },
]);

const toggleCategory = (categoria) => {
  const index = task.category.indexOf(categoria.id)
  if (index === -1) {
    task.category.push(categoria.id)
  } else {
    task.category.splice(index, 1)
  }
};

// forma que o backend espera na request
const task = reactive({
  title: '',
  description: '',
  endDate: '',
  startDate: '',
  status: 1,
  notification: false,
  category: [],
  user: [1],
  notification: false,
});

const addTask = (task) => {
  taskStore.createTask(task)
};

// users
onMounted(() => {
  userStore.getAllUsers()
})


</script>
<template>
  <main>
    <div class="background">
      <section class="form-create">
        <div class="header-section">
          <h1 style="font-size: 1.7rem">Nova Tarefa</h1>
          <span
            class="mdi mdi-close"
            style="color: #969696; font-size: 2rem"
            @click="emits('close')"
          ></span>
        </div>

        <form @submit.prevent="addTask(task)" class="task-form">
          <AppInput
            label="Título"
            placeholder="Ex: Estudar temas do debate."
            required
            v-model="task.title"
          />

          <label for="desc" class="label-class">Descrição</label>
          <textarea
            v-model="task.description"
            id="desc"
            class="text-area-class"
            placeholder="Digite a descrição da usa tarefa aqui."
          />

          <p class="label-class">Categoria <span style="color: #fd151b">*</span></p>
          <div class="categories">
            <div
              :class="['category-option', task.category.includes(c.id) ? 'active' : '']"
              v-for="c in categories"
              :key="c.id"
              @click="toggleCategory(c)"
              :style="task.category.includes(c.id) ? c.activeStyle : ''"
            >
              <p style="font-size: 0.9rem"><span :class="c.icon"></span> {{ c.name }}</p>
            </div>
          </div>

          <!-- Selecionar resposável  -->
          <div class="user-area">
            <label class="label-class">Responsável <span style="color: #fd151b">*</span></label>
            <select class="select-class">
              <option v-for="user in userStore.usuarios" :value="user.id">
                {{ user.name }} - {{ user.matricula }}
              </option>
            </select>
          </div>

          <!-- Data de início e fim da tarefa -->
          <div class="date-row">
            <AppInput v-model="task.startDate" label="Início" type="date" />

            <AppInput v-model="task.endDate" label="Fim" type="date" />
          </div>

          <!-- Notificações -->

          <div :class="['notification-area', task.notification ? 'active-notification' : '']">
            <div class="title-area">
              <span
                :class="task.notification ? 'mdi mdi-bell-outline' : 'mdi mdi-bell-off-outline'"
              ></span>
              <div>
                <h4 class="title-class">Notificações</h4>
                <p>{{ task.notification ? 'Receber notificações' : 'Sem notificações' }}</p>
              </div>
            </div>
            <label class="switch">
              <input type="checkbox" v-model="task.notification" />
              <span class="slider"></span>
            </label>
          </div>

          <AppButton type="submit"> ADICIONAR </AppButton>
        </form>
      </section>
    </div>
  </main>
</template>

<style scoped>
.background {
    position: absolute;
  top: 0;
  left: 0;
    backdrop-filter: blur(2px);
  background: linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3));
  height: 100vh;
  width: 100%;
}

.form-create {
  z-index: 100;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 2rem 3rem;
  background-color: #ffffff;
  border-radius: 15px 15px 0 0;
  box-shadow: 0 -2px 6px rgba(161, 161, 161, 0.1);
}

.date-row {
  display: flex;
  gap: 12px;
  margin-top: 1rem;
}

.header-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2rem;
  cursor: pointer;
}

.label-class {
  display: block;
  margin-bottom: 10px;
  font-size: 1.2rem;
  font-weight: 500;
}

.task-form {
  display: flex;
  flex-direction: column;
}

.categories {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 1rem;
}

.category-option {
  border: 1px solid #969696;
  border-radius: 15px;
  color: #969696;
  padding: 8px 12px;
  cursor: pointer;
}

.active {
  border: none;
  color: white;
  font-weight: 500;
}

.text-area-class {
  box-sizing: border-box;
  border: 2px solid #d9d9d9;
  background-color: inherit;
  padding: 8px 15px 20px 15px;
  width: 100%;
  border-radius: 5px;
  font-family: 'Poppins';
  transition: all 0.3s;
  margin-bottom: 1rem;
}

.text-area-class:focus {
  outline: none;
  border: 2px solid #01295f;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.select-class {
  width: 100%;
  padding: 10px 12px;
  border: 2px solid #d9d9d9;
  background-color: inherit;
  border-radius: 5px;
  font-family: 'Poppins';
}

.notification-area {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 15px 12px;
  border: 2px solid #d9d9d9;
  border-radius: 5px;
  font-family: 'Poppins';
  margin-bottom: 1rem;
  transition: all 0.3s;
}

.title-area {
  display: flex;
  align-items: center;
}

.title-area span {
  font-size: 1.8rem;
  margin: 0 1rem;
  color: #969696;
}

.title-area p {
  color: #969696;
  font-size: 0.9rem;
  margin-top: 0.4rem;
}

.title-class {
  font-size: 1rem;
  font-weight: 500;
}

.active-notification {
  display: flex;
  width: 100%;
  padding: 15px 12px;
  border: 2px solid #01295f;
  border-radius: 5px;
  font-family: 'Poppins';
  margin-bottom: 1rem;

  & span {
    color: #01295f;
  }
}

.switch {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 25px;
  margin-right: 1rem;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  background-color: inherit;
  border: 1px solid #969696;
  border-radius: 25px;
  width: 100%;
  height: 100%;
  transition: 0.3s;
}

.slider::before {
  content: '';
  position: absolute;
  height: 20px;
  width: 20px;
  left: 3px;
  bottom: 2.5px;
  background-color: #969696;
  border-radius: 50%;
  transition: 0.3s;
}

input:checked + .slider {
  background-color: #01295f;
}

input:checked + .slider::before {
  transform: translateX(25px);
  background-color: white;
}
</style>
