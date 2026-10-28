<script setup>
import { onMounted, onUnmounted, computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTaskStore } from '@/stores/taskStore'
import { useUserStore } from '@/stores/userStore'
import { UseCategoryStore } from '@/stores/categoryStore'
import AppInput from '@/components/forms/AppInput.vue'
import AppButton from '@/components/forms/AppButton.vue'

const taskStore = useTaskStore();
const userStore = useUserStore();
const categoryStore = UseCategoryStore();
const route = useRoute();
const router = useRouter();

const emits = defineEmits(['close']);
const isEditMode = computed(() => !!route.params.id);

const initialTaskState = ref('');

const statusOptions = [
  { id: 1, name: 'A Fazer', color: '#fd151b' },
  { id: 2, name: 'Em Andamento', color: '#FFB30F' },
  { id: 3, name: 'Concluído', color: '#849324' }
]

const isFormUnchanged = computed(() => {
  return initialTaskState.value === JSON.stringify(taskStore.task);
});

const toggleCategory = (categoria) => {
  const index = taskStore.task.category.indexOf(categoria.id)
  if (index === -1) {
    taskStore.task.category.push(categoria.id)
  } else {
    taskStore.task.category.splice(index, 1)
  }
}

const toggleUser = (userId) => {
  const index = taskStore.task.user.indexOf(userId)
  if (index === -1) {
    taskStore.task.user.push(userId)
  } else {
    taskStore.task.user.splice(index, 1)
  }
}

const changeStatus = (statusId) => {
  taskStore.task.status = statusId;
}

function handleSubmit() {
  if(isEditMode.value) {
    taskStore.updateTask(route.params.id, taskStore.task)
  } else {
    taskStore.createTask(taskStore.task)
  }
  emits('close')
}

function deleteTask() {
    if(confirm('Deseja realmente excluir essa tarefa?')) {
        taskStore.deleteTask(route.params.id);
        emits('close')
    }
}

onMounted(async () => {
  document.body.style.overflow = 'hidden'
  userStore.getAllUsers()
  categoryStore.getCategories()

  if (isEditMode.value) { 
    await taskStore.getTask(route.params.id)
    
    if (taskStore.task.category && typeof taskStore.task.category[0] === 'object') {
      taskStore.task.category = taskStore.task.category.map(c => c.id);
    }
    if (taskStore.task.user && typeof taskStore.task.user[0] === 'object') {
      taskStore.task.user = taskStore.task.user.map(u => u.id);
    }
  } else {
    taskStore.resetTask();
  }

  initialTaskState.value = JSON.stringify(taskStore.task);
})

onUnmounted(() => {
  document.body.style.overflow = ''
})
</script>

<template>
  <Teleport to="body">
  <main class="task-modal">
    <div class="background" @click="emits('close')"></div>
    <section class="form-create">
      <div class="header-section">
        <h1 style="font-size: 1.7rem">{{ isEditMode ? 'Editar tarefa' : 'Nova tarefa' }}</h1>
        <span
          class="mdi mdi-close"
          style="color: #969696; font-size: 2rem"
          @click="emits('close')"
        ></span>
      </div>

      <form @submit.prevent="handleSubmit()" class="task-form">
        <AppInput
          label="Título"
          placeholder="Ex: Estudar temas do debate."
          required
          v-model="taskStore.task.title"
        />

        <label for="desc" class="label-class">Descrição</label>
        <textarea
          v-model="taskStore.task.description"
          id="desc"
          class="text-area-class"
          placeholder="Digite a descrição da usa tarefa aqui."
        />

        <p class="label-class">Categoria <span style="color: #fd151b">*</span></p>
        <div class="categories">
          <div
            :class="['category-option', taskStore.task.category.includes(c.id) ? 'active' : '']"
            v-for="c in categoryStore.categories"
            :key="c.id"
            @click="toggleCategory(c)"
            :style="taskStore.task.category.includes(c.id) ? categoryStore.getCategoryActive(c.id).activeStyle : ''"
          >
            <p style="font-size: 0.9rem">
              <span :class="categoryStore.getCategoryActive(c.id)?.icon"></span> 
              {{ c.name }}
            </p>
          </div>
        </div>

        <p class="label-class">Status da Tarefa</p>
        <div class="status-select">
          <div
            class="status-option"
            v-for="status in statusOptions"
            :key="status.id"
            @click="changeStatus(status.id)"
            :class="{ selectedStatus: taskStore.task.status === status.id }"
            :style="taskStore.task.status === status.id ? { borderColor: status.color } : {}"
          >
            <span class="status-dot" :style="{ backgroundColor: status.color }"></span>
            <span>{{ status.name }}</span>
          </div>
        </div>

        <p class="label-class" style="margin-top: 1rem;">Responsável</p>
        <div class="user-select">
          <div
            class="user-option"
            v-for="user in userStore.users"
            :key="user.id"
            @click="toggleUser(user.id)"
            :class="{ selected: taskStore.task.user.includes(user.id) }"
          >
            <img :src="user.foto?.url" />
            <span>{{ user.name }}</span>
          </div>
        </div>

        <div class="date-row">
          <AppInput v-model="taskStore.task.startDate" label="Início" type="date" />
          <AppInput v-model="taskStore.task.endDate" label="Fim" type="date" />
        </div>

        <div :class="['notification-area', taskStore.task.notification ? 'active-notification' : '']">
          <div class="title-area">
            <span :class="taskStore.task.notification ? 'mdi mdi-bell-outline' : 'mdi mdi-bell-off-outline'"></span>
            <div>
              <h4 class="title-class">Notificações</h4>
              <p>{{ taskStore.task.notification ? 'Receber notificações' : 'Sem notificações' }}</p>
            </div>
          </div>
          <label class="switch">
            <input type="checkbox" v-model="taskStore.task.notification" />
            <span class="slider"></span>
          </label>
        </div>

        <AppButton type="submit" :disabled="isFormUnchanged"> 
          {{ isEditMode ? 'Salvar Alterações' : 'Adicionar' }} 
        </AppButton>
        
        <AppButton v-if="isEditMode" @click="deleteTask()" type="button" variant="danger" style="margin-top: 0.5rem;">
          APAGAR
        </AppButton>
      </form>
    </section>
  </main>
  </Teleport>
</template>

<style scoped>
.status-select {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.status-option {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  border: 2px solid #d9d9d9;
  border-radius: 8px;
  cursor: pointer;
  transition: 0.2s;
  font-size: 0.9rem;
}

.status-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.selectedStatus {
  background-color: #f7f9fc;
  font-weight: 500;
}

.background {
  position: fixed;
  z-index: 10;
  top: 0;
  left: 0;
  backdrop-filter: blur(2px);
  background: linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3));
  height: 100vh;
  width: 100%;
}

.form-create {
  z-index: 20;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 80vh;
  overflow-y: auto;
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
  overflow: visible;
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

.user-select {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.user-option {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border: 2px solid #d9d9d9;
  border-radius: 8px;
  cursor: pointer;
  transition: 0.2s;
}

.user-option img {
  width: 25px;
  height: 25px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #01295f;
}

.user-option span {
  font-size: 0.95rem;
}

.selected {
  border-color: #01295f;
  background-color: #e6eef8;
}

.selected span {
  font-weight: 500;
}

.selected img {
  border-color: #01295f;
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
}

.active-notification span {
  color: #01295f;
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
.mdi-close {
  cursor: pointer;
  transition: transform 0.15s ease;
}

.mdi-close:active {
  transform: scale(0.8);
}

@media (min-width: 1024px) {
  .task-modal {
  position: fixed;
  inset: 0;
  z-index: 9999;
}

.background {
  position: absolute;
  inset: 0;
  z-index: 0;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
}

.form-create {
  z-index: 1;
  position: absolute;

  bottom: auto;
  
  transform: translate(-50%, -50%);
  left: 50%;
  top: 50%;
/*left e top deixam as bordas esquerdas e superiores do elemento no centro da tela e o translete faz metade do elemento voltar, função que centraliza. usar futuramente*/

  width: 50%;
  height: 80%;

  overflow-y: auto;
  padding: 2rem 3rem;

  background-color: #fff;
  border-radius: 15px;

  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
}
}

@media (max-width: 1023px) {
  .task-modal { position: fixed; inset: 0; z-index: 100; padding: 0; }
  .form-create { height: 85dvh; max-height: 100dvh; padding: 1.25rem 1rem calc(1.5rem + env(safe-area-inset-bottom, 0px)); }
  .header-section { gap: 1rem; }
  .date-row { flex-wrap: wrap; }
  .date-row > * { flex: 1 1 120px; min-width: 0; }
  .notification-area { gap: 0.75rem; }
  .title-area { min-width: 0; }
  .title-area span { margin: 0 0.5rem 0 0; }
  .switch { flex-shrink: 0; margin-right: 0; }
  .user-option span { overflow-wrap: anywhere; min-width: 0; }
}
</style>
