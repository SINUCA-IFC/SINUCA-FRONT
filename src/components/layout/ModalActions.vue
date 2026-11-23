<template>
  <footer class="modal-actions-row"><slot /></footer>
</template>
<style scoped>
.modal-actions-row {
  display: flex;
  flex-wrap: nowrap;
  justify-content: flex-end;
  align-items: stretch;
  gap: 0.75rem;
  margin-top: 1.25rem;
}
.modal-actions-row :deep(.app-button) {
  margin: 0;
  min-width: 0;
}
@media (max-width: 767px) {
  .modal-actions-row :deep(.app-button) {
    flex: 1 1 0;
    width: auto;
    padding: 0.65rem 0.5rem;
    font-size: 0.875rem;
    overflow-wrap: anywhere;
  }
}
</style>
