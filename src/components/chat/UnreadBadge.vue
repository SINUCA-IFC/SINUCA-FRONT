<script setup>
defineProps({
  count: { type: Number, default: 0 },
  label: { type: String, default: 'mensagens não lidas' },
})
</script>

<template>
  <span
    v-if="count > 0"
    class="unread-badge"
    :class="{ 'unread-badge--many': count > 99 }"
    :aria-label="`${count} ${label}`"
    role="status"
  >
    <img src="/static/chat-unread-badge.svg" alt="" aria-hidden="true" />
    <span>{{ count > 99 ? '99+' : count }}</span>
  </span>
</template>

<style scoped>
.unread-badge {
  display: inline-grid;
  position: relative;
  flex: 0 0 23px;
  place-items: center;
  width: 23px;
  height: 23px;
  color: #fff;
  font-size: 0.8125rem;
  font-weight: 700;
  line-height: 1;
}
.unread-badge img {
  position: absolute;
  width: 23px;
  height: 23px;
}
.unread-badge span {
  position: relative;
  font-size: inherit;
}
.unread-badge--many {
  font-size: 0.625rem;
}
</style>
