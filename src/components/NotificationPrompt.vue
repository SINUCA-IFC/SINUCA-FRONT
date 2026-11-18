<script setup>
import { computed, ref } from 'vue'
import { useUserStore } from '@/stores/userStore'
import { isPushSupported, requestPushPermission } from '@/services/pushNotificationService'
import { shouldShowPushPrompt } from '@/services/pushNotificationPayload'

const auth = useUserStore()
const dismissed = ref(localStorage.getItem('push_prompt_dismissed') === '1')
const permission = ref(typeof Notification === 'undefined' ? 'denied' : Notification.permission)
const activating = ref(false)
const error = ref('')
const visible = computed(() =>
  shouldShowPushPrompt({
    loggedIn: auth.loggedIn,
    supported: isPushSupported(),
    permission: permission.value,
    dismissed: dismissed.value,
  }),
)

function dismiss() {
  dismissed.value = true
  localStorage.setItem('push_prompt_dismissed', '1')
}

async function activate() {
  activating.value = true
  error.value = ''
  try {
    if (!(await requestPushPermission()))
      error.value = 'Não foi possível ativar agora. Tente novamente mais tarde.'
  } catch {
    error.value = 'Não foi possível ativar agora. Tente novamente mais tarde.'
  } finally {
    permission.value = Notification.permission
    activating.value = false
  }
}
</script>

<template>
  <aside v-if="visible" class="notification-prompt" aria-label="Notificações">
    <strong>Ativar notificações?</strong>
    <p>Receba avisos de postagens, tarefas e novas mensagens.</p>
    <p v-if="error" role="alert">{{ error }}</p>
    <div class="prompt-actions">
      <button type="button" :disabled="activating" @click="dismiss">Agora não</button>
      <button type="button" class="activate" :disabled="activating" @click="activate">
        {{ activating ? 'Ativando...' : 'Ativar' }}
      </button>
    </div>
  </aside>
</template>

<style scoped>
.notification-prompt {
  position: fixed;
  z-index: 1000;
  right: 1rem;
  bottom: 1rem;
  width: min(380px, calc(100vw - 2rem));
  padding: 1.25rem;
  border: 1px solid #ddd;
  border-radius: 12px;
  background: white;
  box-shadow: 0 4px 20px #0002;
  color: #01295f;
  line-height: 1.5;
}
.prompt-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
  margin-top: 1rem;
}
button {
  min-height: 44px;
  padding: 0.5rem 1rem;
  border: 1px solid #01295f;
  border-radius: 6px;
  background: white;
  color: #01295f;
  font: inherit;
  cursor: pointer;
}
.activate {
  background: #01295f;
  color: white;
}
button:disabled {
  opacity: 0.6;
  cursor: wait;
}
@media (max-width: 1023px) {
  .notification-prompt {
    bottom: calc(135px + env(safe-area-inset-bottom, 0px));
  }
}
</style>
