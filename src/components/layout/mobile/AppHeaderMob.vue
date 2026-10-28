<script setup>
import LogoSinuca from '/logo-sinuca.svg'

defineProps({
    title: {
        type: String,
        default: 'SINUCA'
    },
    goBack: Boolean,
})
</script>

<template>
    <header class="header-class">

        <div class="title">
            <span v-if="goBack" class="mdi mdi-arrow-left" style="font-size: 1.5rem;"></span>
            <h3>{{ title }}</h3>
        </div>
    
        <img :src="LogoSinuca" alt="logo" width="auto" height="45px">
    </header>
</template>

<style scoped>
.header-class {
    gap: 1rem;
    max-width: 100%;
    display: flex;
    justify-content: space-between;
    background-color: #01295F;
    align-items: center;
    padding: 1rem 1.5rem;
    color: white;
    font-weight: 500;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.25);
}

.title{
    min-width: 0;
    display: flex;
    align-items: center;
    gap: 1em;
}

.title h3 { font-size: clamp(1.1rem, 5vw, 1.5rem); line-height: 1.3; }
.header-class > img { flex: 0 0 auto; width: 45px; height: 45px; object-fit: contain; }

</style>
