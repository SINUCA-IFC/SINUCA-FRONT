<script setup>
import BackButton from '@/components/layout/BackButton.vue'
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getAuthProfile } from '@/services/authProfiles'
import UnderConstruction from '@/components/layout/UnderConstruction.vue'
import ProfileSelection from './ProfileSelection.vue'

const router = useRouter()
const route = useRoute()
const profile = computed(() => getAuthProfile(route.query.id))
const bypassSelection = computed(
  () => route.query.google === 'return' || route.query.etapa === 'email',
)
function selectProfile(option) {
  sessionStorage.setItem('sinuca_auth_profile', option.id)
  router.push({
    name: route.name === 'cadastro' ? 'cadastro' : 'login',
    query: { ...route.query, id: option.id },
  })
}
function back() {
  if (profile.value) router.push({ name: route.name, query: { redirect: route.query.redirect } })
  else router.back()
}
defineProps({
  title: { type: String, required: true },
  subtitle: { type: String, default: 'Entre com suas credenciais' },
  loginLayout: Boolean,
})
</script>

<template>
  <ProfileSelection v-if="!profile && !bypassSelection" @select="selectProfile" />
  <main v-else class="auth-shell" :class="{ 'login-layout': loginLayout }">
    <header v-if="loginLayout" class="login-header">
      <BackButton @click="back" />
      <img src="/logo-azul.svg" alt="SINUCA" width="64" height="50" />
    </header>
    <div v-if="loginLayout" class="login-intro">
      <h1 id="auth-title">{{ title }}</h1>
      <p v-if="subtitle && profile?.role !== 'evaluator'">{{ subtitle }}</p>
    </div>
    <div v-if="loginLayout" class="login-decoration" aria-hidden="true">
      <img src="/static/ods-shape.svg" alt="" />
    </div>
    <img v-else class="auth-ods-shape" src="/static/ods-shape.svg" alt="" aria-hidden="true" />
    <section class="auth-card" aria-labelledby="auth-title">
      <BackButton v-if="!loginLayout" class="card-back" @click="back" />
      <div v-if="profile" class="auth-brand" :style="loginLayout ? { color: profile.color } : {}">
        <span
          class="mdi profile-icon"
          :class="profile.icon"
          :style="{ color: profile.color }"
          aria-hidden="true"
        ></span>
        <span>{{ profile.title }}</span>
      </div>
      <h1 v-if="!loginLayout" id="auth-title">{{ title }}</h1>
      <UnderConstruction
        v-if="profile?.role === 'evaluator'"
        title="Área do avaliador em construção"
        subtitle="Esta área estará disponível em uma próxima versão. O avaliador deverá usar obrigatoriamente um e-mail @ifc.edu.br."
      />
      <slot v-else />
    </section>
  </main>
</template>

<style scoped>
.profile-icon {
  font-size: 3rem;
  line-height: 1;
}
.auth-card :deep(.under-construction) {
  min-height: 0;
  padding: 1rem 0;
}
.auth-shell {
  position: relative;
  isolation: isolate;
  box-sizing: border-box;
  min-height: 100dvh;
  overflow-x: clip;
  display: grid;
  place-items: center;
  padding: clamp(1rem, 4vw, 3rem);
  background: linear-gradient(125deg, #f6f6f2 45%, #01295f 45%);
}
.auth-ods-shape {
  display: none;
  position: absolute;
  z-index: -1;
  left: 50%;
  bottom: 0;
  width: clamp(10rem, 26vw, 18rem);
  max-width: none;
  height: auto;
  transform: translate(-50%, 53%) rotate(90deg);
  pointer-events: none;
  user-select: none;
}
.auth-card {
  min-height: 0;
  min-width: 0;
  overflow-wrap: anywhere;
  box-sizing: border-box;
  width: min(100%, 29rem);
  padding: clamp(1.25rem, 5vw, 2.5rem);
  border-radius: 1rem;
  color: #172337;
  background: white;
  box-shadow: 0 12px 40px #01295f26;
}
.card-back {
  margin-bottom: 0.75rem;
}
.auth-brand {
  display: grid;
  justify-items: center;
  gap: 0.45rem;
  color: #01295f;
  font-size: 1.4rem;
  font-weight: 700;
  letter-spacing: 0.14em;
}
.auth-brand img {
  display: block;
}
h1 {
  margin: 1.25rem 0 1.5rem;
  color: #01295f;
  font-size: clamp(1.25rem, 4vw, 1.6rem);
  line-height: 1.25;
  text-align: center;
}
.auth-card :deep(.auth-form) {
  display: grid;
  gap: 1rem;
}
.auth-card :deep(.app-input) {
  margin: 0;
}
.auth-card :deep(.app-button) {
  min-height: 2.75rem;
  margin: 0;
}
.auth-card :deep(.auth-link) {
  display: block;
  margin-top: 1.25rem;
  color: #154b78;
  text-align: center;
  text-decoration: underline;
  text-underline-offset: 0.18em;
}
.auth-card :deep([role='alert']) {
  color: #a62028;
}
.auth-card :deep(p) {
  margin: 0;
  line-height: 1.5;
}
@media (max-width: 520px) {
  .auth-ods-shape {
    display: block;
  }
  .auth-shell {
    background: #f6f6f2;
  }
}
</style>

<style scoped>
.login-layout {
  display: flex;
  flex-direction: column;
  align-items: center;
  height: auto;
  min-height: 100dvh;
  overflow: hidden;
  padding: 59px 34px 180px;
  background: #f6f6f2;
}
.login-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  max-width: 1200px;
  margin-bottom: 60px;
}

.login-header img {
  object-fit: contain;
}
.login-intro {
  text-align: center;
  margin-bottom: 60px;
}
.login-intro h1 {
  margin: 0;
  color: #000;
  font-size: 30px;
  font-weight: 700;
  line-height: 39px;
  text-transform: uppercase;
}
.login-intro p {
  margin: 0;
  color: #969696;
  font-size: 18px;
  font-weight: 500;
  line-height: 30px;
}
.login-layout .auth-card {
  flex: none;
  width: min(100%, 352px);
  max-height: none;
  overflow: visible;
  border-radius: 10px;
  padding: 32px 37px 24px;
  color: #1e1e1e;
  box-shadow: 0 3px 3px #0004;
}
.login-layout .auth-brand {
  gap: 0;
  margin-bottom: 26px;
  font-size: 20px;
  line-height: 30px;
  letter-spacing: 0;
  text-transform: uppercase;
}
.login-layout .profile-icon {
  font-size: 36px;
  line-height: 36px;
}
.login-layout :deep(.auth-form) {
  gap: 24px;
}
.login-layout :deep(.label-class) {
  font-size: 16px;
  line-height: 24px;
  margin-bottom: 8px;
}
.login-layout :deep(.required) {
  display: none;
}
.login-layout :deep(.input-class) {
  height: 48px;
  border: 1px solid #d9d9d9;
  border-radius: 8px;
  font-size: 14px;
}
.login-layout :deep(.input-class::placeholder) {
  color: #969696;
  opacity: 1;
}
.login-layout :deep(.app-button) {
  min-height: 44px;
  border-radius: 8px;
  box-shadow: 0 3px 3px #0004;
}
.login-layout :deep(button[type='submit']) {
  text-transform: uppercase;
}
.login-layout :deep(.google-button) {
  gap: 8px;
  padding: 8px 10px;
  font-size: 14px;
}
.login-layout :deep(.auth-link) {
  margin-top: 28px;
  font-size: 14px;
  line-height: 21px;
  color: #437f97;
}
.login-decoration {
  position: absolute;
  z-index: -1;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 110px;
  overflow: hidden;
  pointer-events: none;
}
.login-decoration img {
  position: absolute;
  left: 50%;
  top: 0;
  width: 180px;
  max-width: none;
  height: auto;
  transform: translate(-50%, -22%) rotate(90deg);
}

/* Distribute space according to the available viewport height, without scaling controls. */
.login-layout {
  --auth-input-height: clamp(44px, 5dvh, 48px);
  min-height: 100dvh;
  padding: clamp(12px, calc(12dvh - 65px), 59px) clamp(20px, 7.7vw, 34px)
    clamp(48px, calc(20dvh - 80px), 130px);
}
.login-header {
  flex: none;
  margin-bottom: clamp(12px, calc(14dvh - 86px), 60px);
}

.login-header img {
  height: clamp(38px, 5.3dvh, 50px);
  width: auto;
}
.login-intro {
  flex: none;
  margin-bottom: clamp(16px, calc(15dvh - 100px), 60px);
}
.login-intro h1 {
  font-size: clamp(24px, 3.2dvh, 30px);
  line-height: 1.3;
}
.login-intro p {
  font-size: clamp(14px, 1.9dvh, 18px);
  line-height: 1.5;
}
.login-layout .auth-card {
  padding: clamp(16px, calc(5dvh - 16px), 32px) clamp(24px, 8vw, 37px) clamp(16px, 2.5dvh, 24px);
}
.login-layout .auth-brand {
  margin-bottom: clamp(12px, calc(5dvh - 20px), 26px);
  font-size: clamp(18px, 2.1dvh, 20px);
  line-height: 1.5;
}
.login-layout .profile-icon {
  font-size: clamp(28px, 3.8dvh, 36px);
  line-height: 1;
}
.login-layout :deep(.auth-form) {
  gap: clamp(12px, calc(4dvh - 14px), 24px);
}
.login-layout :deep(.label-class) {
  margin-bottom: clamp(4px, 0.8dvh, 8px);
  line-height: 22px;
}
.login-layout :deep(.input-class) {
  height: var(--auth-input-height);
  min-height: 44px;
  font-size: 16px;
}
.login-layout :deep(.auth-link) {
  margin-top: clamp(16px, calc(4dvh - 10px), 28px);
}
.login-decoration {
  height: clamp(40px, calc(16dvh - 60px), 110px);
}
@media (max-height: 600px) {
  .login-layout {
    padding-bottom: 20px;
  }
  .login-decoration {
    display: none;
  }
}
@media (min-width: 768px) {
  .login-layout {
    padding: clamp(24px, 5dvh, 48px) 32px 24px;
  }
  .login-layout::before {
    content: '';
    position: absolute;
    inset: 0;
    z-index: -1;
    background: #01295f;
    clip-path: polygon(58.4% 0, 100% 0, 100% 100%, 11.5% 100%);
  }
  .login-header {
    position: static;
    width: min(100%, 636px);
    margin: 0 0 1.5rem;
    gap: 20px;
  }
  .login-header img {
    width: clamp(72px, 7.5vw, 108px);
    height: auto;
  }
  .login-intro {
    width: min(100%, 636px);
    margin-bottom: 16px;
    text-align: left;
  }
  .login-intro h1 {
    padding-left: 0;
    text-align: left;
    font-size: 40px;
    line-height: 1.3;
    color: #01295f;
  }
  .login-intro p,
  .login-decoration {
    display: none;
  }
  .login-layout .auth-card {
    width: min(100%, 636px);
    padding: clamp(20px, 3.2dvh, 40px) 50px;
    box-shadow: none;
  }
  .login-layout .auth-brand {
    font-size: 24px;
    margin-bottom: clamp(16px, 3dvh, 32px);
  }
  .login-layout :deep(.auth-form) {
    gap: clamp(12px, 2dvh, 24px);
  }
  .login-layout :deep(.label-class) {
    font-size: 18px;
  }
  .login-layout :deep(.input-class) {
    font-size: 16px;
  }
  .login-layout :deep(.app-button) {
    width: 100%;
    justify-self: stretch;
  }
}
</style>
