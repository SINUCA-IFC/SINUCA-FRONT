<script setup>
import { ref, watch } from 'vue'
import { computed } from 'vue'
import { useIsDesktop } from '../../composables/useIsDesktop'
import { useDelegationTabs } from '../../composables/useDelegationTabs'

// O estado da aba ativa agora é compartilhado (sidebar + esta barra + view).
const props = defineProps({
    tabs: { type: Array, default: null },
    modelValue: { type: [String, Number], default: undefined },
    label: { type: String, default: 'Navegação da delegação' },
});
const { tabs: delegationTabs, activeTab: delegationActiveTab, setTab } = useDelegationTabs();
const tabsNav = computed(() => props.tabs ?? delegationTabs);
const activeTab = computed(() => props.tabs ? props.modelValue : delegationActiveTab.value);
const isDesktop = useIsDesktop();

// Mobile: carrossel mostrando 2 abas por vez.
const medidor = ref(0);

watch(medidor, () => {
    if(medidor.value < 0) {
        medidor.value = Math.max(0, tabsNav.value.length - 2)
    } else if(medidor.value > Math.max(0, tabsNav.value.length - 2)) {
        medidor.value = 0
    }
});

// Desktop: todas as abas visíveis. Mobile: janela de 2.
const visibleTabs = computed(() =>
    isDesktop.value ? tabsNav.value : tabsNav.value.slice(medidor.value, medidor.value + 2)
);

watch(activeTab, (id) => {
    const index = tabsNav.value.findIndex((tab) => tab.id === id);
    if (index >= 0 && (index < medidor.value || index >= medidor.value + 2)) {
        medidor.value = Math.min(index, Math.max(0, tabsNav.value.length - 2));
    }
});

// Mantido por compatibilidade: a view ainda pode escutar @change-tab.
const emit = defineEmits(['changeTab', 'update:modelValue']);

const selectTab = (id) => {
    if (!props.tabs) setTab(id)
    emit('update:modelValue', id)
    emit('changeTab', id)
};
</script>

<template>
    <nav class="container" :aria-label="label">
        <button type="button" v-if="!isDesktop && tabsNav.length > 2" class="carousel-arrow previous mdi mdi-chevron-left" aria-label="Opções anteriores" @click="medidor--"></button>
        <ul class="tabs-navigation">
            <li 
                v-for="tab in visibleTabs" 
                :key="tab.id" 
                >
                <button type="button" :class="activeTab === tab.id ? 'active' : 'tab-item'" :aria-pressed="activeTab === tab.id" @click="selectTab(tab.id)">
                <span :class="tab.icon"></span>
                <h4>{{ tab.name }}</h4>
                </button>
            </li>
        </ul>
        <button type="button" v-if="!isDesktop && tabsNav.length > 2" class="carousel-arrow next mdi mdi-chevron-right" aria-label="Próximas opções" @click="medidor++"></button>
    </nav>
</template>

<style scoped>
.tabs-navigation li { display: flex; min-width: 0; }
.tabs-navigation button {
    border: 0;
    background: transparent;
    font: inherit;
    cursor: pointer;
}
.tabs-navigation button.active { background: #F8F8FF; }
.carousel-arrow { position: absolute; border: 0; background: transparent; color: #01295f; font-size: 1.7rem; cursor: pointer; }
.previous { left: 0.25rem; }
.next { right: 0.25rem; }
button:focus-visible { outline: 3px solid #93b6e3; outline-offset: 2px; }
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

.tabs-navigation li > button {
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
        padding: 0.85rem 1rem;
        border-radius: 16px;
    }

    .tabs-navigation {
        gap: clamp(0.8rem, 2vw, 2.4rem);
        width: 100%;
    }

    .tabs-navigation li > button {
        flex: 0 1 auto;
        min-width: 0;
        padding: 0.6rem clamp(0.2rem, 0.5vw, 0.5rem);
        font-size: 0.9rem;
    }

    .tabs-navigation li span {
        font-size: 1.35rem;
        line-height: 1;
    }

    .tabs-navigation li h4 {
        font-size: 0.9rem;
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
  .tabs-navigation li { flex: 1; }
  .tabs-navigation li > button { width: 100%; min-width: 0; flex-wrap: wrap; white-space: normal; padding: 0.4rem 0.2rem; }
  .tabs-navigation li h4 { white-space: normal; text-align: center; line-height: 1.4; }
  span.mdi-chevron-left { left: 0.25rem; }
  span.mdi-chevron-right { right: 0.25rem; }
}
</style>
