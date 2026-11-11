<script setup>
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
    <div v-else-if="error" class="list-status">
      <p role="alert">{{ error }}</p>
      <button type="button" @click="$emit('retry')">Tentar novamente</button>
    </div>
    <p v-else-if="!countries.length" class="list-status">Nenhuma delegação cadastrada.</p>
    <ul v-else class="delegation-list">
      <li v-for="country in countries" :key="country.id">
        <RouterLink
          :to="{ name: 'chat', params: { countryId: country.id } }"
          class="delegation-card"
        >
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
  min-width: 0;
  overflow-wrap: anywhere;
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
  width: 40px;
  height: 27px;
  border-radius: 5px;
  object-fit: cover;
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
@media (max-width: 359px) {
  .delegation-card {
    grid-template-columns: minmax(0, 1fr) 40px;
    gap: 0.75rem;
    padding-right: 1rem;
  }
  .delegation-info {
    grid-column: 1;
  }
  .delegation-flag {
    grid-column: 2;
  }
}
</style>
