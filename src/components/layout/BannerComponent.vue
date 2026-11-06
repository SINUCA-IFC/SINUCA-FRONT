<script setup>
const props = defineProps({
    title: {
        type: String,
        default: 'Título Banner'
    },
    icon: String,
    subtitle: String,
    CountryFlagUrl: String, 
});
</script>

<template>
    <section class="banner">
        <div class="title-area">
            <div class="title-row">
                <h2 class="title">{{ title }}</h2>
                <span v-if="icon" :class="icon" class="title-icon"></span>
                <img class="country-flag" v-if="CountryFlagUrl" :src="CountryFlagUrl" :alt="title">
            </div>
            <p class="subtitle">{{ subtitle }}</p>
        </div>
        <img class="ods-shape" src="/static/ods-shape.svg" alt="ods-shape">
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

.title-area {
    flex: 1;
    min-width: 0;
    padding: 1em;

    & .title {
        font-weight: bold;
    }

    & .subtitle {
        color: #969696;
        margin-top: 0.5rem;
    }
}

.title-row {
    flex-wrap: wrap;
    display: flex;
    gap: 1rem;
    align-items: center;
}

.title-icon {
    font-size: 2rem;
}

.country-flag {
    width: 35px;
    height: auto;
}

.ods-shape {
    flex: 0 1 28%;
    width: 28%;
    max-width: 120px;
    height: auto;
    max-height: 160px;
    object-fit: contain;
    align-self: center;
}

.title-area .title { line-height: 1.2; }
.title-area .subtitle { line-height: 1.5; }

@media (max-width: 479px) {
    .title-area .title { font-size: 1.5rem; }
    .title-area .subtitle { font-size: 0.85rem; }
    .title-row { gap: 0.5rem; }
    .title-icon { font-size: 1.4rem; }
}

/* ---------- DESKTOP: título solto no fundo, sem card e sem ilustração ---------- */
@media (min-width: 1024px) {
    .banner {
        background-color: transparent;
        border-radius: 0;
    }

    .title-area {
        padding: 0;
    }

    .title-area .title {
        font-size: clamp(2.4rem, 3.4vw, 3.5rem);
        line-height: 1.1;
    }

    .title-area .subtitle {
        font-size: clamp(1.3rem, 2vw, 1.8rem);
        font-weight: 500;
        margin-top: 0.2rem;
        color: #a0a0a0;
    }

    .country-flag {
        width: clamp(34px, 3vw, 42px);
    }

    /* o Figma do Mural não mostra esse ícone no desktop */
    .title-icon {
        display: none;
    }

    .ods-shape {
        display: none;
    }
}
</style>
