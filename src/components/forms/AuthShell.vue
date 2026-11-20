<script setup>
import { useRouter } from 'vue-router'
import logo from '/logo-azul.svg'

const router = useRouter()
defineProps({ title: { type: String, required: true } })
</script>

<template>
  <main class="auth-shell">
    <img class="auth-ods-shape" src="/static/ods-shape.svg" alt="" aria-hidden="true" />
    <section class="auth-card" aria-labelledby="auth-title">
      <button type="button" class="auth-back" aria-label="Voltar" @click="router.back()">
        <span class="mdi mdi-arrow-left" aria-hidden="true"></span>
      </button>
      <div class="auth-brand">
        <img :src="logo" alt="" width="63" height="50" />
        <span>SINUCA</span>
      </div>
      <h1 id="auth-title">{{ title }}</h1>
      <slot />
    </section>
  </main>
</template>

<style scoped>
.auth-shell {
  position: relative;
  isolation: isolate;
  box-sizing: border-box;
  height: 100dvh;
  overflow: hidden;
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
  max-height: 100%;
  overflow-y: auto;
  box-sizing: border-box;
  width: min(100%, 29rem);
  padding: clamp(1.25rem, 5vw, 2.5rem);
  border-radius: 1rem;
  color: #172337;
  background: white;
  box-shadow: 0 12px 40px #01295f26;
}
.auth-back {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  min-width: 44px;
  margin-bottom: 0.75rem;
  padding: 0.5rem;
  border: 0;
  border-radius: 0.5rem;
  background: transparent;
  color: #01295f;
  font: inherit;
  font-size: 1.5rem;
  cursor: pointer;
}
.auth-back:hover {
  background: #01295f0d;
}
.auth-back:focus-visible {
  outline: 2px solid #01295f;
  outline-offset: 2px;
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
