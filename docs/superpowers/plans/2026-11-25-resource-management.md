# Resource management Implementation Plan

> **For agentic workers:** Execute inline using test-driven-development and verification-before-completion.

**Goal:** Editar/remover cronogramas e remover documentos a partir das páginas existentes.

**Architecture:** O painel do organizador fornece ações aos cartões. ResourceCreateModal aceita scheduleId para edição; ResourceDeleteModal centraliza confirmação e chamadas aos stores existentes.

**Tech Stack:** Vue, Pinia, Axios, Playwright.

**Spec:** docs/superpowers/specs/2026-11-25-resource-management-design.md

## Global Constraints

- Respeitar permissões existentes e usar /api.
- Validar localhost:5173 e consultar produção; distinguir código local de deploy.
- Preservar os dados carregados ao editar e só alterar listas após sucesso.

## Review Focus

- Datas no fuso local e cronogramas que atravessam dias.
- País atual como segundo participante de um debate.
- Cancelamento e erros não removem recursos.
- Cliques repetidos não duplicam operações.
- Estudantes permanecem sem ações de gestão.

### Task 1: Fluxos de edição e remoção

**Files:** ResourceCreateModal.vue, ResourceDeleteModal.vue, ScheduleListComponent.vue, DocumentItem.vue, DocumentsListComponent.vue, OrganizerDelegationView.vue, scheduleStore.js, linkStore.js, tests/browser/resource-management.spec.js.

- [x] Escrever testes de navegador para preenchimento, salvar, cancelar, remover e falhas.
- [x] Executar testes e observar falha por ausência das ações.
- [x] Implementar ações nos cartões, editor preenchido e modal compartilhado de remoção.
- [x] Executar testes até passarem e revisar o diff.
- [x] Rodar npm test, npm run lint, npm run build e testes de navegador pertinentes.
- [x] Verificar localhost:5173 e produção, registrando limitações de publicação/autenticação.


## Resultado

- Edição usa o formulário existente com dados carregados da API; datas e horários inalterados mantêm a precisão original. Datas finais de atividades em vários dias ficam disponíveis para edição.
- Valores ocultos e tipos nulos são preservados; debates com apenas um país passam a gravar o segundo país selecionado.
- Remoção global confirmada por modal, com envio protegido e erro recuperável.
- Revisão independente identificou os dois casos acima; quatro testes reproduziram as falhas antes da correção e passaram depois.
- `npm test`: 10 testes passaram. `npm run lint` e `npm run build`: passaram.
- Playwright em `http://localhost:5173`, Chrome e API simulada: 18 testes de recursos/gestão passaram e 9 testes de alunos passaram. Os mocks antigos dos alunos foram atualizados de uma origem fixa para `**/api/**` após falhas de interceptação.
- Conferência visual em 390 e 1440 px: editor preenchido e confirmação de remoção.
- Produção: site HTTP 200; proxy da API HTTP 401 sem credenciais; endpoints publicados de detalhe anunciam PATCH e DELETE. Inspeção de UI com API simulada confirmou que os botões novos ainda não estão no bundle publicado. Deploy pendente; nenhum dado real foi alterado.
