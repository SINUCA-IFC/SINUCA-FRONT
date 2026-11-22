<script setup>
import { authProfiles } from '@/services/authProfiles'
defineEmits(['select'])
</script>

<template>
  <main class="profile-selection" aria-labelledby="welcome-title">
    <header class="welcome-brand">
      <img src="/logo-azul.svg" alt="SINUCA" width="72" height="56" />
      <span aria-hidden="true">SINUCA</span>
    </header>
    <h1 id="welcome-title">Bem-vindo</h1>
    <p class="welcome-subtitle">Selecione como deseja acessar o sistema</p>
    <div class="profile-options">
      <button
        v-for="option in authProfiles"
        :key="option.id"
        class="profile-option"
        :aria-label="option.title"
        :style="{ borderColor: option.color }"
        @click="$emit('select', option)"
      >
        <span
          class="mdi"
          :class="option.icon"
          :style="{ color: option.color }"
          aria-hidden="true"
        ></span>
        <strong>{{ option.title }}</strong>
        <span class="profile-description">{{ option.description }}</span>
      </button>
    </div>
  </main>
</template>

<style scoped>
.profile-selection {
  position: relative;
  isolation: isolate;
  min-height: 100dvh;
  box-sizing: border-box;
  padding: clamp(24px, 5dvh, 48px) 24px;
  background: #f6f6f2;
  color: #1e1e1e;
  text-align: center;
}
.profile-selection::before {
  content: '';
  position: absolute;
  inset: 0;
  z-index: -1;
  background: url('/static/fundo-pc.png') center / cover no-repeat;
  pointer-events: none;
}
.welcome-brand {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: #01295f;
}
.welcome-brand img {
  display: block;
  width: 56px;
  height: 44px;
  object-fit: contain;
}
.welcome-brand span {
  font-size: 24px;
  font-weight: 700;
  line-height: 1.5;
}
h1 {
  margin: 24px 0 8px;
  font-size: clamp(28px, 3vw, 40px);
  font-weight: 800;
  line-height: 1.3;
  text-transform: uppercase;
}
.welcome-subtitle {
  margin: 0;
  font-size: 18px;
  line-height: 1.5;
  color: #969696;
}
.profile-options {
  display: flex;
  justify-content: center;
  gap: 28px;
  margin: clamp(24px, 5dvh, 48px) auto 0;
}
.profile-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  width: 220px;
  min-height: 210px;
  padding: 20px 16px;
  border: 2px solid;
  border-radius: 10px;
  background: #f6f6f2;
  box-shadow: 0 3px 6px #0005;
  color: inherit;
  font: inherit;
  cursor: pointer;
}
.profile-option > .mdi {
  font-size: 44px;
  line-height: 1;
  margin-bottom: 8px;
}
.profile-option strong {
  font-size: 20px;
  line-height: 1.5;
  font-weight: 700;
}
.profile-description {
  font-size: 16px;
  line-height: 1.5;
  color: #969696;
  margin-top: 8px;
}
.profile-option:focus-visible {
  outline: 3px solid #01295f;
  outline-offset: 5px;
}
@media (max-width: 767px) {
  .profile-selection {
    padding: clamp(12px, 2.5dvh, 24px) 20px;
  }
  .profile-selection::before {
    background-image: url('/static/fundo-continente.svg');
    background-size: 100% auto;
    background-position: center;
  }
  .welcome-brand img {
    width: 48px;
    height: 36px;
  }
  .welcome-brand span {
    display: none;
  }
  h1 {
    margin: 12px 0 4px;
    font-size: 28px;
    line-height: 36px;
  }
  .welcome-subtitle {
    max-width: 240px;
    margin: 0 auto;
    font-size: 14px;
    line-height: 20px;
  }
  .profile-options {
    flex-direction: column;
    align-items: center;
    gap: clamp(8px, 2dvh, 16px);
    margin-top: clamp(12px, 2.5dvh, 24px);
  }
  .profile-option {
    width: 190px;
    min-height: clamp(112px, 19dvh, 144px);
    padding: 8px 12px;
    background: white;
  }
  .profile-option > .mdi {
    font-size: 30px;
    margin-bottom: 2px;
  }
  .profile-option strong {
    font-size: 16px;
    line-height: 24px;
  }
  .profile-description {
    margin-top: 4px;
    font-size: 12px;
    line-height: 18px;
  }
}
</style>
