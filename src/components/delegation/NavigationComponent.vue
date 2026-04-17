<script setup>
import { reactive, ref } from 'vue'

const tabsNav = reactive([
    {
        id: 1,
        icon: 'mdi mdi-view-grid-outline',
        name: 'Kaban',
    },
    {
        id: 2,
        icon: 'mdi mdi-calendar-month-outline',
        name: 'Cronograma',
    },
    {
        id: 3,
        icon: 'mdi mdi-file-document-outline',
        name: 'Documentos',
    },
    {
        id: 4,
        icon: 'mdi mdi-star-outline',
        name: 'Notas',
    },
]);

const isActive = ref(1);

const toogleActive = (id) => {
    if(isActive.value !== id) {
        isActive.value = id
    }
}

</script>

<template>
    <div class="container">
        <span class="mdi mdi-chevron-left" style="font-size: 1.7rem;"></span>
        <ul class="tabs-navigation">
            <li 
                v-for="tab in tabsNav.slice(0, 2)" 
                :key="tab.id" 
                :class="isActive === tab.id ? 'active' : 'tab-item'"
                @click="toogleActive(tab.id)"
                >
                <span :class="tab.icon"></span>
                <h4>{{ tab.name }}</h4>
            </li>
        </ul>
        <span class="mdi mdi-chevron-right" style="font-size: 1.7rem;"></span>
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
}

.tabs-navigation {
    display: flex;
    gap: 1rem;
    justify-content: center;
    padding: 2rem 0;
    align-items: center;
}

.tabs-navigation li {
    display: flex;
    gap: 0.5rem;
}

.tab-item {
    color: #969696;
}

.active {
    background-color: #F8F8FF;
    font-weight: bold;
    color: #01295F;
    padding: 1rem;
    border-radius: 10px;
}
</style>
