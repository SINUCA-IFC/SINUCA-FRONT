<script setup>
import { useUserStore } from '@/stores/userStore';
import { useRouter } from 'vue-router';
const router = useRouter();
const useStore = useUserStore();
</script>

<template>
    <button @click="router.push('/delegacao')">delegacao</button>
    <button v-if="useStore.loggedIn" @click="useStore.logout()">logout</button>
</template>

<style scoped>
</style>
