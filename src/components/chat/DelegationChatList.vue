<script setup>
import UnreadBadge from './UnreadBadge.vue'
defineProps({
  countries: { type: Array, default: () => [] },
  loading: Boolean,
  error: { type: String, default: '' },
})
defineEmits(['retry'])
</script>

<template>
  <nav class="delegation-conversations" aria-label="Conversas por delegação">
    <p v-if="loading" class="list-status" role="status">Carregando delegações...</p>
    <div v-if="error" class="list-status">
      <p role="alert">{{ error }}</p>
      <button type="button" @click="$emit('retry')">Tentar novamente</button>
    </div>
    <p v-if="!loading && !error && !countries.length" class="list-status">
      Nenhuma delegação cadastrada.
    </p>
    <ul v-if="countries.length" class="delegation-list">
      <li v-for="country in countries" :key="country.id">
        <RouterLink
          :to="{ name: 'chat', params: { countryId: country.id } }"
          class="delegation-card"
        >
          <UnreadBadge :count="country.unread_count" class="country-unread" />
          <div class="delegation-info">
            <h2>{{ country.name }}</h2>
            <p>{{ country.political_name }}</p>
          </div>
          <img
            v-if="country.flag?.url"
            class="delegation-flag"
            :src="country.flag.url"
            :alt="`Bandeira de ${country.name}`"
            width="40"
            height="27"
          />
        </RouterLink>
      </li>
    </ul>
  </nav>
</template>

<style scoped>
.delegation-list {
  display: grid;
  gap: 1.5rem;
}
.delegation-card {
  display: grid;
  grid-template-columns: 23px minmax(0, 1fr) 40px;
  align-items: center;
  gap: 1.375rem;
  min-height: 84px;
  padding: 1rem 1.6875rem 1rem 0.9375rem;
  border-left: 14px solid #01295f;
  border-radius: 10px;
  background: #fff;
  color: #000;
  box-shadow: 0 4px 10px rgb(161 161 161 / 10%);
}
.delegation-card:hover {
  background: #fafafa;
}
.delegation-card:focus-visible {
  outline: 2px solid #01295f;
  outline-offset: 4px;
}
.delegation-info {
  grid-column: 2;
  grid-row: 1;
  min-width: 0;
  overflow-wrap: anywhere;
}
.country-unread {
  grid-column: 1;
  grid-row: 1;
}
.delegation-info h2 {
  font-size: 1.125rem;
  font-weight: 500;
  line-height: 1.5;
}
.delegation-info p {
  color: #969696;
  font-size: 0.75rem;
  line-height: 1.5;
}
.delegation-flag {
  grid-column: 3;
  grid-row: 1;
  display: block;
  width: 40px;
  height: 27px;
  border-radius: 5px;
  object-fit: contain;
}
.list-status {
  padding: 1.5rem;
  color: #707070;
  text-align: center;
  line-height: 1.6;
}
.list-status button {
  min-height: 44px;
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  border: 1px solid #01295f;
  border-radius: 8px;
  background: #fff;
  color: #01295f;
  font: inherit;
  cursor: pointer;
}
@media (max-width: 479px) {
  .delegation-card {
    gap: 0.5rem;
    padding-right: 1rem;
  }
}
.delegation-card { transition: transform 0.2s ease, box-shadow 0.2s ease; }
@media (hover: hover) { .delegation-card:hover { transform: translateY(-4px); box-shadow: 0 4px 16px rgb(0 18 40 / 15%) !important; } }
@media (prefers-reduced-motion: reduce) { .delegation-card { transition: none; } .delegation-card:hover { transform: none; } }
</style>
