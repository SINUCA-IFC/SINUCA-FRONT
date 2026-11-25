# Turma obrigatória e seleção de participantes por turma

**Objetivo:** exigir turma somente no cadastro de discente e inserir a escolha de turma antes da lista de alunos disponíveis para uma delegação.

**Implementação:** Vue 3, reutilizando `RegisterStepThree.vue`, o modal de `OrganizerDelegationView.vue` e a API existente. Nenhuma mudança no backend.

- [x] Cadastro: testar envio sem turma e com turma; aplicar `required` no select e validar a turma antes de enviar. Organizadores continuam sem campos de aluno.
- [x] Delegação: carregar todas as páginas de turmas e alunos pendentes; mostrar turmas pesquisáveis, depois alunos da turma selecionada. Comparar `gang` tanto como objeto quanto ID. Preservar seleção múltipla, revisão, confirmação e repetição apenas das falhas.
- [x] Permitir voltar às turmas usando o componente BackButton (seta de retorno), limpando a pesquisa e preservando a seleção. Listar apenas turmas da API, sem grupo “Sem turma”. Tratar turma vazia, falha de carregamento e reabertura do modal.
- [x] Atualizar testes de navegador existentes e adicionar cenários de filtro, paginação e navegação. Executar testes Node, lint, build e navegador em desktop/mobile.
- [x] Verificar `http://localhost:5173` e a versão publicada em `https://sinuca-ifc-mocha.vercel.app`; registrar que a mudança depende de deploy.

## Verificação

- Ajuste solicitado: removido o grupo “Sem turma” e substituído o botão textual por `BackButton`. Os cinco cenários do fluxo de turmas passaram em mobile/desktop; testes Node, lint e build passaram novamente. A seta e o retorno foram conferidos em `localhost:5173`; produção segue com a versão anterior, aguardando deploy.
- `npm test`: 10 arquivos de teste aprovados.
- `npm run lint` e `npm run build`: aprovados.
- Playwright: 12 cenários aprovados, incluindo larguras de 320, 390 e 1440 px, turma obrigatória, seleção entre turmas, paginação e repetição após falha.
- `localhost:5173`: Chrome confirmou `required=true`, bloqueio de turma vazia e seleção de turma antes dos alunos, com API simulada.
- Produção: Chrome confirmou que a versão publicada ainda usa turma opcional e lista direta de alunos, com API simulada. Deploy do frontend pendente; nenhuma alteração de backend necessária.
- Revisão independente do diff inicial: sem achados concretos. O teste detectou que a opção inicial com valor null virava texto no DOM; foi corrigida para string vazia, com o estado inicial correspondente, e o teste passou.
