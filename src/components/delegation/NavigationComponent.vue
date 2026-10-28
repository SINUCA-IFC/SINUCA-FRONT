<script setup>
import { ref, watch } from 'vue'
import { computed } from 'vue'
import { useIsDesktop } from '../../composables/useIsDesktop'
import { useDelegationTabs } from '../../composables/useDelegationTabs'

// O estado da aba ativa agora é compartilhado (sidebar + esta barra + view).
const { tabs: tabsNav, activeTab, setTab } = useDelegationTabs();
const isDesktop = useIsDesktop();

// Mobile: carrossel mostrando 2 abas por vez.
const medidor = ref(0);

watch(medidor, () => {
    if(medidor.value < 0) {
        medidor.value = 2
    } else if(medidor.value > tabsNav.length - 2) {
        medidor.value = 0
    }
});

// Desktop: todas as abas visíveis. Mobile: janela de 2.
const visibleTabs = computed(() =>
    isDesktop.value ? tabsNav : tabsNav.slice(medidor.value, medidor.value + 2)
);

// Mantido por compatibilidade: a view ainda pode escutar @change-tab.
const emit = defineEmits(['changeTab']);

const selectTab = (id) => {
    setTab(id)
    emit('changeTab', id)
};
</script>

<template>
    <div class="container">
        <span v-if="!isDesktop" class="mdi mdi-chevron-left" style="font-size: 1.7rem;" @click="medidor--"></span>
        <ul class="tabs-navigation">
            <li 
                v-for="tab in visibleTabs" 
                :key="tab.id" 
                :class="activeTab === tab.id ? 'active' : 'tab-item'"
                @click="selectTab(tab.id)"
                >
                <span :class="tab.icon"></span>
                <h4>{{ tab.name }}</h4>
            </li>
        </ul>
        <span v-if="!isDesktop" class="mdi mdi-chevron-right" style="font-size: 1.7rem;" @click="medidor++"></span>
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
    gap: 0.3rem;
    justify-content: center;
    align-items: center;
}

.tabs-navigation li {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.3rem;
    font-size: clamp(0.8rem, 2.5vw, 1rem);
    padding: 0.4rem 0.5rem;
    white-space: nowrap;
}

.tabs-navigation li span {
    font-size: clamp(1rem, 4vw, 1.4rem);
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

.active:hover {
    cursor: pointer;
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

.tabs-navigation li h4 {
font-size: clamp(0.8rem, 2.5vw, 1rem);
    white-space: nowrap;
}



@media (min-width: 1024px) {
    .container {
        height: auto;
        padding: 1.35rem 1rem;
        border-radius: 16px;
    }

    .tabs-navigation {
        gap: clamp(0.8rem, 2vw, 2.4rem);
        width: 100%;
    }

    .tabs-navigation li {
        flex: 0 1 auto;
        min-width: 0;
        padding: 0.8rem clamp(0.2rem, 0.5vw, 0.5rem);
        font-size: clamp(1rem, 1.2vw, 1.4rem);
    }

    .tabs-navigation li span {
        font-size: clamp(1.5rem, 2vw, 2.2rem);
        line-height: 1;
    }

    .tabs-navigation li h4 {
        font-size: clamp(0.85rem, 1.4vw, 1.1rem);
        font-weight: inherit;
        white-space: nowrap;
    }

    .tab-item:hover {
        color: #01295F;
        background-color: #F8F8FF;
        cursor: pointer;
    }
}
@media (max-width: 1023px) {
  .container { height: auto; min-height: 4rem; padding: 0.75rem 2.25rem; }
  .tabs-navigation { width: 100%; min-width: 0; }
  .tabs-navigation li { flex: 1; min-width: 0; flex-wrap: wrap; white-space: normal; padding: 0.4rem 0.2rem; }
  .tabs-navigation li h4 { white-space: normal; text-align: center; line-height: 1.4; }
  span.mdi-chevron-left { left: 0.25rem; }
  span.mdi-chevron-right { right: 0.25rem; }
}
</style>
