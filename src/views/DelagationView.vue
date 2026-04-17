<script setup>
import AppHeaderMob from '@/components/layout/mobile/AppHeaderMob.vue';
import BannerDelegation from '@/components/delegation/BannerDelegation.vue';
import NavigationComponent from '@/components/delegation/NavigationComponent.vue';
</script>

<template>
    <AppHeaderMob title="Delegação"/>
    <main>
        <BannerDelegation />
        <NavigationComponent />
    </main>
</template>

<style scoped>
main {
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 2rem;
}

</style>