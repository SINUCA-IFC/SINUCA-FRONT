<script setup>
import { onMounted, reactive, ref, watch } from 'vue'

const tabsNav = reactive([
    {
        id: 0,
        icon: 'mdi mdi-view-grid-outline',
        name: 'Kanban',
    },
    {
        id: 1,
        icon: 'mdi mdi-calendar-month-outline',
        name: 'Cronograma',
    },
    {
        id: 2,
        icon: 'mdi mdi-file-document-outline',
        name: 'Documentos',
    },
    {
        id: 3,
        icon: 'mdi mdi-star-outline',
        name: 'Notas',
    },
]);

const isActive = ref(0);

const toogleActive = (id) => {
    if(isActive.value !== id) {
        isActive.value = id
    }
};

const emit = defineEmits(['changeTab']);


const medidor = ref(0);

watch(medidor, () => {
    if(medidor.value < 0) {
        medidor.value = 2
    } else if(medidor.value > tabsNav.length - 2) {
        medidor.value = 0
    }
});

</script>

<template>
    <div class="container">
        <span class="mdi mdi-chevron-left" style="font-size: 1.7rem;" @click="medidor--"></span>
        <ul class="tabs-navigation">
            <li 
                v-for="tab in tabsNav.slice(medidor, medidor + 2)" 
                :key="tab.id" 
                :class="isActive === tab.id ? 'active' : 'tab-item'"
                @click="toogleActive(tab.id); emit('changeTab', tab.id)"
                
                >
                <span :class="tab.icon"></span>
                <h4>{{ tab.name }}</h4>
            </li>
        </ul>
        <span class="mdi mdi-chevron-right" style="font-size: 1.7rem;" @click="medidor++"></span>
    </div>
</template>

<style scoped>
.container {
    background-color: white;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.6rem;
    padding: 2rem 0;
    height: 3rem;
    position: relative;
}

.tabs-navigation {
    display: flex;
    gap: 1rem;
    justify-content: center;
    align-items: center;
}

.tabs-navigation li {
    display: flex;
    gap: 0.5rem;
    font-size: 1rem;
}

.tab-item {
    color: #969696;
}

.active {
    background-color: #F8F8FF;
    font-weight: bold;
    color: #01295F;
    border-radius: 10px;
    transition: all .3s ease-in-out;
}

.active:active {
    transform: scale(0.95);
}

span.mdi-chevron-left {
    position: absolute;
    left: 1rem;
}

span.mdi-chevron-right {
    position: absolute;
    right: 1rem;
}

</style>
