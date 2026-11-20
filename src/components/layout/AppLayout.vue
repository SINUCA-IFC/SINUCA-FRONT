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
  showCornerOds: Boolean,
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
      <div class="content-inner" :class="{ 'with-corner-ods': isDesktop && showCornerOds }">
        <div v-if="isDesktop && showCornerOds" class="corner-ods" aria-hidden="true"></div>
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
  --sidebar-compact-width: 4.75rem;
  --sidebar-expanded-width: 14.5rem;
  min-height: 100vh;
  background-color: #f6f6f2;
}

.is-desktop .app-content {
  margin-left: calc(var(--sidebar-compact-width) + 0.625rem);
  padding: 5rem 4.75rem 4rem;
}

.is-desktop .sidebar:is(:hover, :has(:focus-visible)) + .app-content {
  margin-left: var(--sidebar-expanded-width);
}

@media (prefers-reduced-motion: no-preference) {
  .is-desktop .app-content {
    transition: margin-left 200ms ease;
  }
}

.is-desktop .content-inner {
  max-width: 1280px;
  margin: 0 auto;
}
.with-corner-ods {
  isolation: isolate;
}

.corner-ods {
  display: block;
  position: fixed;
  right: 0;
  bottom: 0;
  width: clamp(9rem, 13.5vw, 13.5rem);
  aspect-ratio: 3 / 4;
  overflow: hidden;
  pointer-events: none;
  z-index: -1;
}

.corner-ods::before {
  content: '';
  position: absolute;
  right: 10%;
  bottom: -4%;
  width: clamp(6rem, 9vw, 9rem);
  aspect-ratio: 90 / 163;
  background: url('/static/ods-shape.svg') center / contain no-repeat;
  transform: rotate(32deg);
  opacity: 0.22;
}
</style>
