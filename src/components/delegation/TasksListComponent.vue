<script setup>
import AppButton from '../forms/AppButton.vue';


</script>

<template>
    <section class="task-list-section">
        <div class="header-title">
            <h4 style="font-weight: bolder; font-size: 1.2rem;">Quadro de Tarefas</h4>
            <AppButton>Nova +</AppButton>
        </div>
    </section>

</template>

<style scoped>
.header-title {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

</style>