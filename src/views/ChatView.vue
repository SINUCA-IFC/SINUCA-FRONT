<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppLayout from '@/components/layout/AppLayout.vue'
import BannerComponent from '@/components/layout/BannerComponent.vue'
import DelegationChatList from '@/components/chat/DelegationChatList.vue'
import MessageService from '@/services/messageService'
import { useUserStore } from '@/stores/userStore'

const userStore = useUserStore()
const route = useRoute()
const router = useRouter()
const messageService = new MessageService()
const messages = ref([])
const draft = ref('')
const history = ref(null)
const loading = ref(false)
const refreshing = ref(false)
const sending = ref(false)
const loadError = ref('')
const sendError = ref('')
const countriesLoading = ref(false)
const countriesError = ref('')
const conversations = ref([])
const reading = ref(false)
const markingUnread = ref(false)
const readError = ref('')
const lastReadMessageId = ref(0)
// Um envio novo na tela não confirma mensagens intermediárias ainda não consultadas.
const lastLoadedMessageId = ref(0)
const isOrganizer = computed(() => userStore.user.role === 'organizer')
const showingDelegations = computed(() => isOrganizer.value && !route.params.countryId)
const countryId = computed(() =>
  isOrganizer.value ? Number(route.params.countryId) || null : userStore.user.country?.id,
)
const country = computed(() =>
  isOrganizer.value
    ? conversations.value.find((item) => item.id === countryId.value)
    : userStore.user.country,
)
const hasReceivedMessages = computed(() => messages.value.some((message) => !message.is_mine))
const canChat = computed(
  () =>
    userStore.loggedIn &&
    (isOrganizer.value || (userStore.user.role === 'student' && !!countryId.value)),
)
const subtitle = computed(() => {
  if (!isOrganizer.value) return 'Bate-papo com a organização'
  if (showingDelegations.value) return 'Bate-papo com as delegações'
  return `Bate-papo com ${country.value?.name || 'a delegação'}`
})
// Cada número invalida as respostas antigas da operação correspondente.
let requestNumber = 0
let conversationNumber = 0
let listRequestNumber = 0
let refreshTimer
let disposed = false

async function scrollToBottom() {
  await nextTick()
  if (history.value) history.value.scrollTop = history.value.scrollHeight
}

async function loadMessages(forceScroll = false) {
  if (disposed || !canChat.value || !countryId.value) return
  const request = ++requestNumber
  const nearBottom =
    !history.value ||
    history.value.scrollHeight - history.value.scrollTop - history.value.clientHeight < 80
  loading.value = messages.value.length === 0
  refreshing.value = true
  loadError.value = ''
  try {
    const result = await messageService.getMessages(countryId.value)
    if (request !== requestNumber) return
    messages.value = result
    lastLoadedMessageId.value = result.reduce((latest, message) => Math.max(latest, message.id), 0)
    if (forceScroll || nearBottom) await scrollToBottom()
    await markVisibleMessagesRead()
  } catch {
    if (request === requestNumber)
      loadError.value = 'Não foi possível atualizar a conversa. Tente novamente.'
  } finally {
    if (request === requestNumber) {
      loading.value = false
      refreshing.value = false
    }
  }
}

async function markVisibleMessagesRead() {
  if (disposed || document.visibilityState !== 'visible' || reading.value || markingUnread.value)
    return
  if (!countryId.value || !history.value || !messages.value.length) return
  if (history.value.scrollHeight - history.value.scrollTop - history.value.clientHeight > 80) return

  const lastId = lastLoadedMessageId.value
  if (lastId <= lastReadMessageId.value) return
  const conversation = conversationNumber
  reading.value = true
  readError.value = ''
  try {
    await messageService.markAsRead(countryId.value, lastId)
    if (conversation === conversationNumber) lastReadMessageId.value = lastId
  } catch {
    if (conversation === conversationNumber)
      readError.value = 'Não foi possível confirmar a leitura. Tente atualizar a conversa.'
  } finally {
    if (conversation === conversationNumber) reading.value = false
  }
}

async function markAsUnread() {
  if (!countryId.value || refreshing.value || reading.value || sending.value || markingUnread.value)
    return
  const conversation = conversationNumber
  markingUnread.value = true
  readError.value = ''
  try {
    await messageService.markAsUnread(countryId.value)
    if (conversation === conversationNumber)
      await router.push(isOrganizer.value ? '/chat' : '/mural')
  } catch {
    if (conversation === conversationNumber)
      readError.value = 'Não foi possível marcar como não lida. Tente novamente.'
  } finally {
    if (conversation === conversationNumber) markingUnread.value = false
  }
}

async function sendMessage() {
  const text = draft.value.trim()
  if (
    !text ||
    text.length > 2000 ||
    sending.value ||
    markingUnread.value ||
    !canChat.value ||
    !countryId.value
  )
    return
  const destination = countryId.value
  const sender = userStore.user.id
  sending.value = true
  sendError.value = ''
  try {
    const message = await messageService.sendMessage(text, destination)
    if (disposed || destination !== countryId.value || sender !== userStore.user.id) return
    requestNumber += 1
    messages.value = [...messages.value.filter((item) => item.id !== message.id), message]
    draft.value = ''
    await scrollToBottom()
    await loadMessages(true)
  } catch {
    if (!disposed && destination === countryId.value && sender === userStore.user.id) {
      sendError.value =
        'Não foi possível enviar a mensagem. Seu texto foi mantido para tentar novamente.'
    }
  } finally {
    sending.value = false
  }
}

function handleEnter(event) {
  if (event.isComposing) return
  event.preventDefault()
  sendMessage()
}

async function loadConversations() {
  if (disposed || !isOrganizer.value || !canChat.value) return
  const request = ++listRequestNumber
  countriesLoading.value = true
  countriesError.value = ''
  try {
    const result = await messageService.getConversations()
    if (request === listRequestNumber) conversations.value = result
  } catch {
    if (request === listRequestNumber)
      countriesError.value = 'Não foi possível carregar as delegações.'
  } finally {
    if (request === listRequestNumber) countriesLoading.value = false
  }
}

function refreshVisibleChat() {
  if (
    document.visibilityState !== 'visible' ||
    refreshing.value ||
    sending.value ||
    reading.value ||
    markingUnread.value
  )
    return
  if (showingDelegations.value) {
    if (!countriesLoading.value) loadConversations()
  } else {
    loadMessages()
  }
}

watch(
  [() => userStore.user.id, countryId, canChat],
  () => {
    requestNumber += 1
    conversationNumber += 1
    listRequestNumber += 1
    messages.value = []
    draft.value = ''
    loadError.value = ''
    sendError.value = ''
    loading.value = false
    refreshing.value = false
    reading.value = false
    markingUnread.value = false
    lastReadMessageId.value = 0
    lastLoadedMessageId.value = 0
    readError.value = ''
    conversations.value = []
    if (isOrganizer.value) loadConversations()
    loadMessages(true)
  },
  { immediate: true },
)

onMounted(() => {
  refreshTimer = setInterval(refreshVisibleChat, 10000)
  document.addEventListener('visibilitychange', refreshVisibleChat)
})

onUnmounted(() => {
  disposed = true
  requestNumber += 1
  conversationNumber += 1
  listRequestNumber += 1
  clearInterval(refreshTimer)
  document.removeEventListener('visibilitychange', refreshVisibleChat)
})
</script>

<template>
  <AppLayout
    :title="showingDelegations ? 'Delegações' : 'Chat'"
    class="chat-layout"
    :class="{
      'chat-layout--delegations': showingDelegations,
      'chat-layout--organizer': isOrganizer,
    }"
  >
    <main class="chat-page" :class="{ 'chat-page--delegations': showingDelegations }">
      <BannerComponent class="chat-banner" title="Chat" :subtitle="subtitle" icon="mdi mdi-chat">
        <template v-if="isOrganizer && !showingDelegations && country?.flag?.url" #subtitle>
          {{ subtitle }}
          <img
            class="chat-country-flag"
            :src="country.flag.url"
            :alt="`Bandeira de ${country.name}`"
          />
        </template>
      </BannerComponent>

      <section v-if="!canChat" class="chat-panel chat-notice">
        <template v-if="userStore.user.approval_pending">
          <p>O chat ficará disponível quando a organização atribuir sua delegação.</p>
          <RouterLink to="/delegacao">Acompanhar aprovação</RouterLink>
        </template>
        <p v-else>O chat está disponível para alunos com delegação e organizadores.</p>
      </section>

      <DelegationChatList
        v-else-if="showingDelegations"
        :countries="conversations"
        :loading="countriesLoading && !conversations.length"
        :error="countriesError"
        @retry="loadConversations"
      />

      <template v-else>
        <section class="chat-panel" aria-label="Conversa com a organização">
          <div class="conversation-tools">
            <RouterLink
              v-if="isOrganizer"
              to="/chat"
              class="back-to-delegations"
              aria-label="Voltar às delegações"
            >
              <span class="mdi mdi-arrow-left" aria-hidden="true"></span>
              Voltar
            </RouterLink>
            <span class="visually-hidden">Mensagens da delegação e da organização</span>
            <button
              v-if="countryId"
              type="button"
              class="mark-unread-button"
              :disabled="!hasReceivedMessages || refreshing || reading || sending || markingUnread"
              aria-label="Marcar como não lida"
              title="Marcar como não lida"
              @click="markAsUnread"
            >
              <span class="mdi mdi-email-mark-as-unread" aria-hidden="true"></span>
              Não lida
            </button>
            <button
              v-if="countryId"
              type="button"
              class="refresh-button"
              :disabled="refreshing || reading || sending || markingUnread"
              aria-label="Atualizar conversa"
              @click="loadMessages()"
            >
              <span class="mdi mdi-refresh" aria-hidden="true"></span>
            </button>
          </div>
          <p v-if="loadError" class="chat-error" role="alert">{{ loadError }}</p>
          <p v-if="readError" class="chat-error read-error" role="alert">{{ readError }}</p>
          <div
            ref="history"
            class="message-history"
            role="log"
            aria-label="Mensagens"
            aria-live="polite"
            aria-relevant="additions"
            @scroll.passive="markVisibleMessagesRead"
          >
            <p v-if="!countryId" class="chat-empty">
              Selecione uma delegação para abrir a conversa.
            </p>
            <p v-else-if="loading" class="chat-empty" role="status">Carregando mensagens...</p>
            <p v-else-if="!messages.length && !loadError" class="chat-empty">
              Nenhuma mensagem ainda. Envie a primeira mensagem.
            </p>
            <article
              v-for="message in messages"
              :key="message.id"
              class="message"
              :class="message.from_organization ? 'message--organization' : 'message--delegation'"
              :aria-label="
                message.from_organization
                  ? 'Mensagem da organização'
                  : `Mensagem de ${message.creator_name || 'participante da delegação'}`
              "
            >
              <span class="message-tail" aria-hidden="true">
                <img
                  :src="
                    message.from_organization
                      ? '/static/chat-tail-organization.svg'
                      : '/static/chat-tail-delegation.svg'
                  "
                  alt=""
                />
              </span>
              <h2 class="message-sender">
                {{
                  message.from_organization
                    ? 'Organização SINUCA'
                    : `Delegação - ${country?.name || 'Participantes'}`
                }}
              </h2>
              <p>{{ message.text }}</p>
            </article>
          </div>

          <div v-if="countryId" class="composer">
            <p v-if="sendError" class="chat-error" role="alert">{{ sendError }}</p>
            <form class="send-form" @submit.prevent="sendMessage">
              <label for="chat-message" class="visually-hidden">Mensagem</label>
              <textarea
                id="chat-message"
                v-model="draft"
                rows="1"
                maxlength="2000"
                placeholder="Mensagem"
                :disabled="sending || markingUnread"
                @keydown.enter.exact="handleEnter"
              ></textarea>
              <button
                type="submit"
                class="send-button"
                :disabled="sending || markingUnread || !draft.trim()"
                :aria-label="sending ? 'Enviando mensagem' : 'Enviar mensagem'"
              >
                <span v-if="sending" class="mdi mdi-loading" aria-hidden="true"></span>
                <img v-else src="/static/chat-send.svg" alt="" />
              </button>
            </form>
          </div>
        </section>
      </template>
    </main>
  </AppLayout>
</template>

<style scoped>
.chat-layout {
  display: flex;
  flex-direction: column;
  height: 100dvh;
}
.chat-layout--delegations {
  height: auto;
  min-height: 100dvh;
}
.chat-layout--delegations :deep(.header-class) {
  min-height: 104px;
  padding: 1.5rem 2rem;
  padding-right: 1.5rem;
}
.chat-layout--delegations :deep(.header-class > img) {
  width: 63px;
  height: 50px;
}
.chat-layout--delegations :deep(.header-class h3) {
  font-size: 1.5625rem;
  font-weight: 600;
}
.chat-layout :deep(.app-content) {
  display: flex;
  flex: 1;
  min-height: 0;
  padding-bottom: calc(6.5rem + env(safe-area-inset-bottom, 0px));
}
.chat-layout :deep(.content-inner) {
  display: flex;
  flex: 1;
  min-height: 0;
  width: 100%;
}
.chat-page {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
  min-width: 0;
  gap: 1.5rem;
  padding: 1.5rem 1.25rem 1rem;
}
.chat-banner {
  flex-shrink: 0;
}
.chat-page--delegations {
  gap: 2.625rem;
  padding-top: 2.125rem;
}
.chat-layout--organizer .chat-banner {
  min-height: 171px;
}
.chat-layout--organizer .chat-banner :deep(.title-area) {
  padding: 2rem 2.375rem;
}
.chat-layout--organizer .chat-banner :deep(.title) {
  font-size: 1.875rem;
}
.chat-layout--organizer .chat-banner :deep(.title-icon) {
  font-size: 2.1875rem;
  color: #01295f;
}
.chat-layout--organizer .chat-banner :deep(.subtitle) {
  max-width: 166px;
  font-size: 1rem;
  font-weight: 500;
}
.chat-country-flag {
  display: inline-block;
  width: 14px;
  height: 9px;
  margin-left: 0.25rem;
  border-radius: 2px;
  object-fit: cover;
}
.chat-banner :deep(.ods-shape) {
  flex: 0 0 90px;
  width: 90px;
  height: 163px;
  max-height: 163px;
}
.chat-panel {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
  min-width: 0;
  border-radius: 10px;
  background: #fff;
  box-shadow: 0 4px 4px rgb(0 0 0 / 25%);
}
.conversation-tools {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 0.25rem 0.5rem 0;
  gap: 1rem;
}
.mark-unread-button {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  min-height: 44px;
  padding: 0 0.5rem;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: #01295f;
  font: inherit;
  font-size: 0.8125rem;
  cursor: pointer;
}
.back-to-delegations {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-height: 44px;
  margin-right: auto;
  color: #01295f;
  font-size: 0.875rem;
}
.refresh-button,
.send-button {
  display: grid;
  place-items: center;
  flex-shrink: 0;
  min-width: 44px;
  min-height: 44px;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: #01295f;
  cursor: pointer;
}
.refresh-button {
  font-size: 1.2rem;
}
button:disabled {
  cursor: default;
  opacity: 0.5;
}
button:focus-visible,
a:focus-visible,
select:focus-visible {
  outline: 2px solid #01295f;
  outline-offset: 3px;
}
.message-history {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
  gap: 1.75rem;
  padding: 1rem 1rem 1.5rem;
}
.message {
  position: relative;
  flex-shrink: 0;
  width: 85%;
  max-width: 36rem;
  padding: 1rem 1.25rem;
  border-radius: 18px;
  color: #fff;
  font-size: 1rem;
  font-weight: 500;
  line-height: 1.5;
  box-shadow: 0 4px 4px rgb(0 0 0 / 25%);
}
.message--delegation {
  align-self: flex-end;
  background: #849324;
}
.message--organization {
  align-self: flex-start;
  background: #01295f;
}
.message p {
  position: relative;
  font-size: inherit;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}
.message-sender {
  display: none;
}
.message-tail {
  position: absolute;
  top: -10px;
  width: 35px;
  height: 40px;
  transform: rotate(179.39deg);
}
.message-tail img {
  position: absolute;
  top: 0;
  left: 2.35px;
  display: block;
}
.message--delegation .message-tail {
  right: -10px;
}
.message--organization .message-tail {
  left: -10px;
}
.composer {
  flex-shrink: 0;
  padding: 0.5rem 1rem 1.5rem;
}
.send-form {
  display: flex;
  align-items: center;
  min-height: 44px;
  border: 1px solid #01295f;
  border-radius: 10px;
  box-shadow: 0 4px 4px rgb(0 0 0 / 25%);
  background: #fff;
}
.send-form:focus-within {
  outline: 2px solid #01295f;
  outline-offset: 2px;
}
.send-form textarea {
  flex: 1;
  width: 100%;
  min-width: 0;
  max-height: 7rem;
  padding: 0.6rem 0.75rem;
  border: 0;
  border-radius: inherit;
  background: transparent;
  font: inherit;
  font-size: 1rem;
  line-height: 1.4;
  resize: vertical;
  outline: none;
}
.send-form textarea::placeholder {
  color: #969696;
}
.send-button {
  margin-right: 0.25rem;
}
.chat-error {
  flex-shrink: 0;
  padding: 0.5rem 1rem;
  color: #a11a20;
  font-size: 0.875rem;
  line-height: 1.5;
}
.composer .chat-error {
  padding: 0 0 0.75rem;
}
.chat-empty {
  margin: auto;
  max-width: 28rem;
  text-align: center;
  color: #707070;
  line-height: 1.6;
}
.chat-notice {
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 2rem;
  text-align: center;
  line-height: 1.6;
}
.chat-notice a {
  color: #01295f;
  text-decoration: underline;
}
.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}
@media (max-width: 359px) {
  .chat-layout--organizer .chat-banner :deep(.title-area) {
    padding: 1rem;
  }
}
@media (max-height: 650px) and (max-width: 1023px) {
  .chat-page {
    gap: 0.75rem;
    padding-top: 0.75rem;
  }
  .chat-banner :deep(.ods-shape) {
    display: none;
  }
  .chat-banner :deep(.title-area) {
    padding: 0.75rem 1rem;
  }
  .chat-banner :deep(.title) {
    font-size: 1.25rem;
  }
  .chat-banner :deep(.subtitle) {
    font-size: 0.8rem;
  }
  .chat-layout--organizer .chat-banner :deep(.title-area) {
    padding: 0.75rem 1rem;
  }
  .chat-layout--organizer .chat-banner {
    min-height: 0;
  }
  .chat-layout--organizer .chat-banner :deep(.title) {
    font-size: 1.25rem;
  }
  .chat-layout--organizer .chat-banner :deep(.subtitle) {
    font-size: 0.8rem;
  }
}
@media (min-width: 1024px) {
  .chat-layout :deep(.app-content) {
    padding: 2rem 2.75rem 1.75rem 4.875rem;
  }
  .chat-page {
    padding: 0;
    gap: 1rem;
  }
  .chat-page--delegations {
    gap: 2.5rem;
  }
  .chat-layout--organizer .chat-banner :deep(.title-area) {
    padding: 0;
  }
  .chat-layout--organizer .chat-banner {
    min-height: 0;
  }
  .chat-layout--organizer .chat-banner :deep(.title) {
    font-size: clamp(2.5rem, 3.5vw, 3.125rem);
  }
  .chat-layout--organizer .chat-banner :deep(.subtitle) {
    max-width: none;
  }
  .chat-banner :deep(.title) {
    font-size: clamp(2.5rem, 3.5vw, 3.125rem);
  }
  .chat-banner :deep(.subtitle) {
    font-size: 1rem;
  }
  .chat-panel {
    background: transparent;
    box-shadow: none;
  }
  .chat-notice {
    background: #fff;
  }
  .conversation-tools {
    padding: 0;
  }
  .message-history {
    padding: 0.75rem 4rem 1.5rem 2rem;
    gap: 2rem;
  }
  .message {
    width: 100%;
    max-width: none;
    padding: 1rem 2rem 1.5rem;
    border-radius: 20px;
    font-size: 1.125rem;
    font-weight: 400;
  }
  .message-sender {
    display: block;
    margin-bottom: 0.75rem;
    font-size: inherit;
    font-weight: 500;
  }
  .composer {
    padding: 0.5rem 0 0;
  }
  .send-form {
    border-radius: 20px;
    min-height: 48px;
  }
}
</style>
