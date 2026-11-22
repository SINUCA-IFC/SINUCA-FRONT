<script setup>
defineProps({
  icon: {
    type: String,
    default: 'mdi mdi-progress-wrench',
  },
  title: {
    type: String,
    default: 'Página em construção',
  },
  subtitle: {
    type: String,
    default: 'Área em desenvolvimento. Volte em breve!',
  },
})
</script>

<template>
  <section class="under-construction">
    <span class="icon" :class="icon" aria-hidden="true"></span>
    <h2 class="title">{{ title }}</h2>
    <p class="subtitle">{{ subtitle }}</p>
  </section>
</template>

<style scoped>
.under-construction {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  min-height: 40vh;
  padding: 2rem 1.5rem;
}

.icon {
  font-size: 3rem;
  color: #01295f;
  margin-bottom: 1rem;
}

.title {
  font-weight: bold;
  font-size: 1.3rem;
}

.subtitle {
  color: #969696;
  margin-top: 0.5rem;
  max-width: 320px;
}

@media (min-width: 1024px) {
  .under-construction {
    min-height: 60vh;
  }

  .icon {
    font-size: 4rem;
  }

  .title {
    font-size: clamp(1.8rem, 2.4vw, 2.4rem);
  }

  .subtitle {
    font-size: 1.1rem;
    max-width: 460px;
    margin-top: 0.8rem;
  }
}
</style>
