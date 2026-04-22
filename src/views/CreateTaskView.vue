<script setup>
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useTaskStore } from '@/stores/taskStore';
import AppInput from '@/components/forms/AppInput.vue';
import AppButton from '@/components/forms/AppButton.vue';


const taskStore = useTaskStore();
const router = useRouter();

// categorias
const categories = ref(
    [
        {
            id: 2,
            icon: 'mdi mdi-book-open-page-variant-outline',
            name: 'Pesquisa',
            activeStyle: 'background-color: #FFB30F;'
        },
        {
            id: 3,
            icon: 'mdi mdi-forum-outline',
            name: 'Debate',
            activeStyle: 'background-color: #01295F;'
        },
        {
            id: 4,
            icon: 'mdi mdi-instagram',
            name: 'Instagram',
            activeStyle: 'background-color: #FD151B;'
        },
        {
            id: 5,
            icon: 'mdi mdi-handshake-outline',
            name: 'Mesas de Coop.',
            activeStyle: 'background-color: #849324;'
        },
        {
            id: 6,
            icon: 'mdi mdi-drama-masks',
            name: 'Apres. Cultural',
            activeStyle: 'background-color: #FFB30F;'
        },
        {
            id: 7,
            icon: 'mdi mdi-dots-horizontal',
            name: 'Outro',
            activeStyle: 'background-color: #01295F;'
        }
        
    ]
);

const toogleCategory = (categoria) => {
    const index = task.category.indexOf(categoria.id)
    if(index === -1) {
        task.category.push(categoria.id)
    }
    else {
        task.category.splice(index, 1);
    }
}

// forma que o backend espera na request
const task = reactive(
    {
        title: '',
        description: '',
        endDate: '00-00-0000',
        startDate: '00-00-0000',
        status: 1,
        notification: false,
        category: [],
        user: [1]
    }
)

const addTask = (task) => {
    taskStore.createTask(task);
};
</script>
<template>
    <main>
        <section class="form-create">
            <div class="header-section">
                <h1 style="font-size: 1.7rem;">Nova Tarefa</h1>
                <span 
                    class="mdi mdi-close" 
                    style="color: #969696; font-size: 2rem;"
                    @click="router.push('/delegacao')"
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
                <textarea v-model="task.description" id="desc" class="text-area-class" placeholder="Digite a descrição da usa tarefa aqui." />

                <p class="label-class">Categoria <span style="color: #FD151B;">*</span></p>
                <div class="categories">
                    <div 
                        :class="['category-option', task.category.includes(c.id) ? 'active' : '']"
                        v-for="c in categories"
                        :key="c.id"
                        @click="toogleCategory(c)"
                        :style="task.category.includes(c.id) ? c.activeStyle : ''"
                        >
                        <p style="font-size: 0.9rem;"> <span :class="c.icon"></span> {{ c.name }}</p>
                    </div>
                </div>
                <div class="date-row">
                    <AppInput
                        v-model="task.startDate"
                        label="Início"
                        type="date"
                    />

                    <AppInput
                        v-model="task.endDate"
                        label="Fim"
                        type="date"
                    />
                </div>
                <AppButton type="submit">
                ADICIONAR
                </AppButton>
            </form>
        </section>
    </main>
</template>

<style scoped>
.date-row {
    display: flex;
    gap: 12px;
    margin-top: 1rem;
}

.date-row > * {
    flex: 1;
}

.header-section {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 2rem;
    cursor: pointer;
}

.label-class{
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
    border: 2px solid #D9D9D9;
    background-color: inherit;
    padding: 8px 15px 20px 15px;
    width: 100%;
    border-radius: 5px;
    font-family: 'Poppins';
    transition: all .3s;
    margin-bottom: 1rem;
}

.text-area-class:focus {
    outline: none;
    border: 2px solid #01295F ;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

</style>