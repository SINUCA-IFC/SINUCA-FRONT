<script setup>
import { computed, onMounted, ref } from 'vue'
import AppLayout from '@/components/layout/AppLayout.vue'
import BannerComponent from '@/components/layout/BannerComponent.vue'
import AppModal from '@/components/layout/AppModal.vue'
import AppButton from '@/components/forms/AppButton.vue'
import AppInput from '@/components/forms/AppInput.vue'
import { useCountryStore } from '@/stores/countryStore'
import { useUserStore } from '@/stores/userStore'
import { useToastStore } from '@/stores/toastStore'
import CountryService from '@/services/countryService'
import { countryCatalog, normalizeCountryName, searchCountries } from '@/services/countryCatalog'

const countryStore = useCountryStore()
const userStore = useUserStore()
const toast = useToastStore()
const service = new CountryService()
const loading = ref(true)
const error = ref('')
const modal = ref(null)
const query = ref('')
const selected = ref(null)
const saving = ref(false)
const actionError = ref('')
const delegations = computed(() =>
  [...countryStore.countrys].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR')),
)
const results = computed(() => searchCountries(query.value, countryStore.countrys))

function flagUrl(country) {
  return (
    country.flag?.url ||
    countryCatalog.find(
      (item) => normalizeCountryName(item.name) === normalizeCountryName(country.name),
    )?.flag
  )
}

async function load() {
  loading.value = true
  error.value = ''
  try {
    await countryStore.getCountrys()
  } catch {
    error.value = 'Não foi possível carregar as delegações. Tente novamente.'
  } finally {
    loading.value = false
  }
}

function openModal(type, country = null) {
  modal.value = type
  selected.value = country
  query.value = ''
  actionError.value = ''
}

function closeModal() {
  if (saving.value) return
  modal.value = null
  selected.value = null
}

function selectCountry(country) {
  selected.value = country
  actionError.value = ''
}

async function confirm() {
  if (saving.value || !selected.value) return
  saving.value = true
  actionError.value = ''
  try {
    if (modal.value === 'delete') {
      await service.deleteCountry(selected.value.id)
      countryStore.countrys = countryStore.countrys.filter((item) => item.id !== selected.value.id)
      toast.show('Delegação excluída.', 'success')
    } else {
      // Recheck the server list before creating, including changes from another organizer.
      await countryStore.getCountrys()
      if (
        !searchCountries('', countryStore.countrys).some(
          (item) => item.code === selected.value.code,
        )
      ) {
        throw new Error('Esta delegação já está cadastrada.')
      }
      const response = await fetch(selected.value.flag, { signal: AbortSignal.timeout(15000) })
      if (!response.ok) throw new Error('Não foi possível carregar a bandeira. Tente novamente.')
      const file = new File([await response.blob()], `${selected.value.code}.png`, {
        type: 'image/png',
      })
      const { data } = await userStore.uploadImage(file, `Bandeira de ${selected.value.name}`)
      if (!data.attachment_key) throw new Error('Não foi possível salvar a bandeira.')
      const created = await service.createCountry({
        name: selected.value.name,
        political_name: selected.value.political_name,
        flag_attachment_key: data.attachment_key,
      })
      countryStore.countrys.push(created)
      toast.show('Delegação adicionada.', 'success')
    }
    modal.value = null
    selected.value = null
  } catch (cause) {
    actionError.value =
      cause.response?.data?.detail ||
      (cause.response ? 'Não foi possível concluir a ação. Tente novamente.' : cause.message) ||
      'Não foi possível concluir a ação.'
  } finally {
    saving.value = false
  }
}

onMounted(load)
</script>

<template>
  <AppLayout title="Painel do Organizador">
    <main class="organizer-content">
      <BannerComponent
        title="Painel do Organizador"
        subtitle="Crie, organize e visualize as delegações do SINUCA"
      />
      <section aria-labelledby="delegations-title" :aria-busy="loading">
        <div class="list-heading">
          <h2 id="delegations-title">
            Delegações <span v-if="!loading && !error">({{ delegations.length }})</span>
          </h2>
          <AppButton :disabled="loading || !!error" @click="openModal('add')"
            >Adicionar delegação <span class="mdi mdi-plus" aria-hidden="true"></span
          ></AppButton>
        </div>
        <p v-if="loading" class="status" role="status">Carregando delegações...</p>
        <div v-else-if="error" class="status" role="alert">
          <p>{{ error }}</p>
          <AppButton @click="load">Tentar novamente</AppButton>
        </div>
        <p v-else-if="!delegations.length" class="status">
          Nenhuma delegação cadastrada. Adicione um país para começar.
        </p>
        <ul v-else class="delegation-list">
          <li v-for="country in delegations" :key="country.id" class="country-card">
            <button
              type="button"
              class="delete-button"
              :aria-label="`Excluir delegação ${country.name}`"
              @click="openModal('delete', country)"
            >
              <span class="mdi mdi-trash-can-outline" aria-hidden="true"></span>
            </button>
            <RouterLink class="country-info" :to="`/organizador/delegacoes/${country.id}`">
              <h3>{{ country.name }}</h3>
              <p>{{ country.political_name }}</p>
            </RouterLink>
            <img
              v-if="flagUrl(country)"
              :src="flagUrl(country)"
              :alt="`Bandeira de ${country.name}`"
              class="flag"
              loading="lazy"
            />
          </li>
        </ul>
      </section>
    </main>
    <AppModal v-if="modal" centered @close="closeModal">
      <section
        class="country-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="country-modal-title"
        :aria-busy="saving"
      >
        <header class="modal-heading">
          <h2 id="country-modal-title">
            {{ modal === 'delete' ? 'Excluir delegação' : 'Adicionar delegação' }}
          </h2>
          <button
            type="button"
            class="close-button"
            aria-label="Fechar"
            :disabled="saving"
            @click="closeModal"
          >
            <span class="mdi mdi-close" aria-hidden="true"></span>
          </button>
        </header>
        <template v-if="modal === 'add' && !selected">
          <AppInput
            v-model="query"
            label="Pesquisar país"
            type="search"
            placeholder="Nome, nome oficial ou sigla"
          />
          <p class="result-count" role="status">
            {{ results.length }} países e territórios disponíveis
          </p>
          <ul class="search-results">
            <li v-for="country in results" :key="country.code">
              <button type="button" class="country-option" @click="selectCountry(country)">
                <img :src="country.flag" alt="" class="flag" loading="lazy" />
                <span class="country-info"
                  ><strong>{{ country.name }}</strong
                  ><span>{{ country.political_name }}</span></span
                >
                <span class="mdi mdi-plus" aria-hidden="true"></span>
              </button>
            </li>
          </ul>
          <p v-if="!results.length" class="status">Nenhum país disponível para essa pesquisa.</p>
        </template>
        <template v-else>
          <p>
            Tem certeza que deseja {{ modal === 'delete' ? 'excluir' : 'adicionar' }} a delegação de
            <strong>{{ selected.name }}</strong
            >?
          </p>
          <p v-if="modal === 'delete'" class="delete-warning">
            Essa ação não pode ser desfeita e pode afetar os vínculos e registros associados à
            delegação.
          </p>
          <p v-else class="official-name">{{ selected.political_name }}</p>
        </template>
        <p v-if="actionError" class="error" role="alert">{{ actionError }}</p>
        <footer class="modal-actions">
          <AppButton
            v-if="modal === 'add' && selected"
            variant="danger"
            :disabled="saving"
            @click="((selected = null), (actionError = ''))"
            >Cancelar seleção</AppButton
          >
          <AppButton v-else variant="danger" :disabled="saving" @click="closeModal"
            >Cancelar</AppButton
          >
          <AppButton
            v-if="selected"
            :variant="modal === 'delete' ? 'danger' : 'primary'"
            :disabled="saving"
            @click="confirm"
            >{{
              saving
                ? 'Salvando...'
                : modal === 'delete'
                  ? 'Excluir delegação'
                  : 'Confirmar cadastro'
            }}</AppButton
          >
        </footer>
      </section>
    </AppModal>
  </AppLayout>
</template>

<style scoped>
.country-card {
  border-left-width: 6px !important;
  box-shadow: 0 3px 12px rgb(1 41 95 / 4%) !important;
}
.country-info h3 {
  font-size: 1.25rem !important;
  color: #20334d;
}
.country-info:hover h3 {
  color: #155b9c;
}
.country-modal .app-input {
  margin-bottom: 1rem;
}
.country-modal .country-option {
  border-radius: 8px;
  padding: 0.875rem;
}
.country-modal .modal-heading {
  border-bottom: 1px solid #e8edf2;
  padding-bottom: 1rem;
}
.modal-actions {
  border-top: 1px solid #e8edf2;
  margin-top: 1rem;
  padding-top: 0.25rem;
}
.organizer-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}
.list-heading,
.modal-heading {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}
.list-heading {
  flex-wrap: wrap;
  margin-bottom: 1.5rem;
}
.list-heading h2 {
  font-size: 1.25rem;
}
.list-heading h2 span,
.result-count {
  color: #626e76;
  font-weight: 400;
}
.list-heading .app-button {
  margin-top: 0;
}
.delegation-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}
.country-card {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  min-height: 102px;
  padding: 1.25rem 1.75rem 1.25rem 1rem;
  border-left: 24px solid #01295f;
  border-radius: 10px;
  background: white;
  box-shadow: 0 4px 12px rgb(0 0 0 / 4%);
}
.country-info {
  flex: 1;
  min-width: 0;
  overflow-wrap: anywhere;
}
.country-info h3 {
  font-size: 1.5rem;
  font-weight: 500;
}
.country-info p,
.country-info > span,
.official-name {
  display: block;
  color: #626e76;
  font-size: 0.9rem;
  margin-top: 0.25rem;
}
.flag {
  width: 48px;
  height: 32px;
  object-fit: contain;
  flex-shrink: 0;
  border-radius: 4px;
}
.delete-button,
.close-button {
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 44px;
  height: 44px;
  border: 0;
  border-radius: 6px;
  background: transparent;
  font-size: 1.5rem;
  cursor: pointer;
}
.delete-button {
  color: #d6050c;
}
.delete-button:hover {
  background: #fff0f0;
}
.status {
  padding: 2rem 1rem;
  color: #626e76;
  text-align: center;
}
.country-modal {
  position: relative;
  z-index: 11;
  width: min(640px, calc(100% - 2rem));
  max-height: calc(100dvh - 2rem);
  overflow-y: auto;
  margin: 1rem auto;
  padding: 1.5rem;
  border-radius: 12px;
  background: white;
}
.country-info {
  color: inherit;
  text-decoration: none;
}
.country-modal {
  margin: auto !important;
}
.modal-heading {
  margin-bottom: 1.5rem;
}
.modal-heading h2 {
  font-size: 1.35rem;
}
.search-results {
  max-height: 45dvh;
  overflow-y: auto;
  margin-top: 0.75rem;
}
.country-option {
  display: flex;
  align-items: center;
  gap: 1rem;
  width: 100%;
  padding: 1rem 0.5rem;
  border: 0;
  border-bottom: 1px solid #e9eeed;
  background: white;
  font: inherit;
  text-align: left;
  cursor: pointer;
}
.country-option:hover {
  background: #edf2f8;
}
.modal-actions {
  display: flex;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 0.75rem;
}
.delete-warning {
  margin-top: 1rem;
  color: #626e76;
}
.error {
  color: #b00020;
  margin-top: 1rem;
}
button:focus-visible {
  outline: 3px solid #01295f;
  outline-offset: 2px;
}
@media (min-width: 1024px) {
  .organizer-content {
    margin: 0 2rem;
    gap: 2.5rem;
  }
  .country-modal {
    margin-top: 5vh;
    max-height: 90dvh;
  }
}
@media (max-width: 600px) {
  .country-card {
    gap: 0.5rem;
    padding: 0.75rem;
    border-left-width: 10px;
  }
  .country-info h3 {
    font-size: 1.1rem;
  }
  .country-info p {
    font-size: 0.8rem;
  }
  .country-modal {
    padding: 1rem;
  }
  .flag {
    width: 36px;
    height: 26px;
  }
}
</style>
