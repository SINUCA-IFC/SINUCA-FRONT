<script setup>
// No momento esta estático, mas vai consumir a API de delegação no banco
import { reactive } from 'vue';


const delegation = reactive({
    name: 'Colômbia',
    officialName: 'República da Colômbia',
    flag: '/colombia-flag.svg'
});

</script>

<template>
    <section class="banner">
        <div class="delegation-name">
            <div style="display: flex; gap: 1rem; align-items: center;">
                <h2 class="name">{{ delegation.name }}</h2>
                <img :src="delegation.flag" :alt="delegation.name">
            </div>
            <p class="official-name">{{ delegation.officialName }}</p>
        </div>
        <img src="/public/ods-shape.svg" alt="ods-shape" style="width: auto; height: 160px;">
    </section>
</template>

<style scoped>
.banner {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-radius: 10px;
    background-color: #fff;
}

.delegation-name {

    padding: 1em;

    & .name {
        font-weight: bold;
    }

    & .official-name {
        color: #969696;
        margin-top: 0.5rem;
    }
}

</style>