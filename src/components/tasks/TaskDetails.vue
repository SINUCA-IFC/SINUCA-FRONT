<script setup>
import TaskNotificationToggle from '@/components/tasks/TaskNotificationToggle.vue'
import TaskAssigneeSelect from '@/components/tasks/TaskAssigneeSelect.vue'
import TaskStatusSelect from '@/components/tasks/TaskStatusSelect.vue'
import TaskCategorySelect from '@/components/tasks/TaskCategorySelect.vue'

import { onMounted, computed, ref } from 'vue'
import { useTaskStore } from '@/stores/taskStore'
import { useUserStore } from '@/stores/userStore'
import { UseCategoryStore } from '@/stores/categoryStore'
import AppInput from '@/components/forms/AppInput.vue'
import AppButton from '@/components/forms/AppButton.vue'

const taskStore = useTaskStore()
const userStore = useUserStore()
const categoryStore = UseCategoryStore()
const props = defineProps({ taskId: [String, Number] })

const emits = defineEmits(['close'])
const isEditMode = computed(() => !!props.taskId)

const initialTaskState = ref('')
const loading = ref(true)
const saving = ref(false)
const error = ref('')

const isFormUnchanged = computed(() => {
  return initialTaskState.value === JSON.stringify(taskStore.task)
})

async function handleSubmit() {
  if (saving.value || loading.value) return
  saving.value = true
  error.value = ''
  try {
    if (isEditMode.value) {
      await taskStore.updateTask(taskStore.task.id ?? props.taskId, taskStore.task)
    } else {
      await taskStore.createTask(taskStore.task)
    }
    emits('close')
  } catch {
    error.value = 'Não foi possível salvar a tarefa. Tente novamente.'
  } finally {
    saving.value = false
  }
}

async function deleteTask() {
  if (saving.value || !confirm('Deseja realmente excluir essa tarefa?')) return
  saving.value = true
  error.value = ''
  try {
    await taskStore.deleteTask(taskStore.task.id ?? props.taskId)
    emits('close')
  } catch {
    error.value = 'Não foi possível excluir a tarefa. Tente novamente.'
  } finally {
    saving.value = false
  }
}

async function loadTask() {
  loading.value = true
  error.value = ''
  taskStore.resetTask()
  try {
    await Promise.all([
      userStore.getAllUsers(),
      categoryStore.getCategories(),
      isEditMode.value ? taskStore.getTask(props.taskId) : Promise.resolve(),
    ])
    taskStore.task.category = (taskStore.task.category || []).map((c) => c.id ?? c)
    taskStore.task.user = (taskStore.task.user || []).map((u) => u.id ?? u)
    taskStore.task.status = Number(taskStore.task.status)
    initialTaskState.value = JSON.stringify(taskStore.task)
  } catch {
    error.value = 'Não foi possível carregar a tarefa. Feche e tente novamente.'
  } finally {
    loading.value = false
  }
}

onMounted(loadTask)
</script>

<template>
  <section class="form-create">
    <div class="header-section">
      <h1 style="font-size: 1.7rem">{{ isEditMode ? 'Editar tarefa' : 'Nova tarefa' }}</h1>
      <span
        class="mdi mdi-close"
        style="color: #969696; font-size: 2rem"
        @click="emits('close')"
      ></span>
    </div>

    <p v-if="loading" role="status">Carregando tarefa...</p>
    <p v-if="error" role="alert">{{ error }}</p>
    <form v-if="!loading && initialTaskState" @submit.prevent="handleSubmit()" class="task-form">
      <fieldset :disabled="saving" class="task-fields">
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

        <TaskCategorySelect
          v-model="taskStore.task.category"
          :categories="categoryStore.categories"
          :category-styles="categoryStore.categoriesStyle"
        />

        <TaskStatusSelect v-model="taskStore.task.status" />

        <TaskAssigneeSelect v-model="taskStore.task.user" :users="userStore.users" />

        <div class="date-row">
          <AppInput v-model="taskStore.task.startDate" label="Início" type="date" />
          <AppInput v-model="taskStore.task.endDate" label="Fim" type="date" />
        </div>

        <TaskNotificationToggle v-model="taskStore.task.notification" />
      </fieldset>
      <div class="task-actions">
        <AppButton type="submit" :disabled="isFormUnchanged || saving">
          {{ isEditMode ? 'Salvar Alterações' : 'Adicionar' }}
        </AppButton>

        <AppButton
          v-if="isEditMode"
          @click="deleteTask()"
          type="button"
          variant="danger"
          :disabled="saving"
        >
          APAGAR
        </AppButton>
      </div>
    </form>
  </section>
</template>

<style scoped>
.form-create {
  display: flex;
  flex-direction: column;
  z-index: 20;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 80vh;
  overflow: hidden;
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

.task-fields {
  border: 0;
  padding: 0;
  margin: 0;
  min-width: 0;
}
.task-fields,
.task-form {
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.task-form {
  flex: 1;
  overflow: hidden;
}
.task-fields {
  flex: 1;
  overflow-y: auto;
  padding-right: 0.5rem;
}
.task-fields > * {
  flex-shrink: 0;
}
.header-section {
  flex-shrink: 0;
}
.task-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  flex-shrink: 0;
  padding-top: 1rem;
  margin-top: 1rem;
  border-top: 1px solid #e0e0e0;
  background: #fff;
}
.task-actions > * {
  flex: 1 1 160px;
  margin-top: 0;
  min-height: 44px;
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
.mdi-close {
  cursor: pointer;
  transition: transform 0.15s ease;
}

.mdi-close:active {
  transform: scale(0.8);
}

@media (min-width: 1024px) {
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

    overflow: hidden;
    padding: 2rem 3rem;

    background-color: #fff;
    border-radius: 15px;

    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  }
}

@media (max-width: 1023px) {
  .form-create {
    height: 85dvh;
    max-height: 100dvh;
    padding: 1.25rem 1rem calc(1.5rem + env(safe-area-inset-bottom, 0px));
  }
  .header-section {
    gap: 1rem;
  }
  .date-row {
    flex-wrap: wrap;
  }
  .date-row > * {
    flex: 1 1 120px;
    min-width: 0;
  }
}
</style>
