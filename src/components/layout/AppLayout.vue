<script setup>
import { useIsDesktop } from '../../composables/useIsDesktop'
import AppHeaderMob from '../../components/layout/mobile/AppHeaderMob.vue'
import AppTabFooter from '../../components/layout/mobile/AppTabFooter.vue'
import AppSidebarDesktop from '../../components/layout/desktop/AppSidebarDesktop.vue'

defineProps({
  // Título exibido no header mobile
  title: {
    type: String,
    default: 'SINUCA',
  },
  goBack: Boolean,
})

const isDesktop = useIsDesktop()
</script>

<template>
  <div class="app-layout" :class="{ 'is-desktop': isDesktop }">
    <!-- Desktop: sidebar fixa à esquerda -->
    <AppSidebarDesktop v-if="isDesktop" />

    <!-- Mobile / tablet: header no topo -->
    <AppHeaderMob v-else :title="title" :go-back="goBack" />

    <div class="app-content">
      <div class="content-inner">
        <slot />
      </div>
    </div>

    <!-- Mobile / tablet: footer com abas -->
    <AppTabFooter v-if="!isDesktop" />
  </div>
</template>

<style scoped>
.app-content, .content-inner {
  min-width: 0;
}

.app-layout.is-desktop {
  --sidebar-width: 277px;
  min-height: 100vh;
  background-color: #f6f6f2;
}

.is-desktop .app-content {
  margin-left: var(--sidebar-width);
  padding: 5rem 4.75rem 4rem;
}

.is-desktop .content-inner {
  max-width: 1280px;
  margin: 0 auto;
}
</style>
