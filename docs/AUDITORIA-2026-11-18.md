# Auditoria SINUCA — 18/11/2026

Revisão do front, back, contratos e principais fluxos por perfil, com consulta ao Figma. Os achados deste documento são recomendações; as correções de produto feitas nesta etapa ficaram restritas ao tamanho das listas e à rolagem do Kanban solicitados posteriormente.

**Escopo e evidências**

- Código do front a partir do merge `ae8e182` e do back `a8859f2`; a edição local da borda de `KanbanColumn.vue` foi preservada.
- Inventário das telas no [Figma SINUCA](https://www.figma.com/design/SxdVw9n8771wtU9HICf8Jg/SINUCA---LAYOUT?node-id=0-1), com inspeção visual de mural, Kanban, documentos, cronograma, login, história, delegações da organização, criação de postagem e chat mobile/desktop.
- Chrome temporário em 390×844 e 1440×1024, com chamadas de API interceptadas e dados fictícios. Conferência adicional do Kanban em 320×568 e 768×1024. Sem contas ou alterações em produção.
- Back executado em ambiente temporário, com SQLite em memória. Os testes não comprovam entrega real por provedores push nem substituem testes em PostgreSQL e aparelhos físicos.
- Front: `npm test` passou nos seis arquivos; execução sem isolamento enumerou **58 testes, todos aprovados**. `npm run build` passou.
- Back: **138 testes executados, uma falha** em `core.tests.test_pagination.PaginationTests.test_lists_are_ordered_and_cover_all_pages_without_duplicates`, no subcaso `postagens`. O teste exige IDs crescentes; o endpoint foi corretamente alterado para postagens recentes primeiro. Atualizar a expectativa, preservando a ordenação solicitada.

**Correções prioritárias**

P1 indica risco relevante de indisponibilidade ou segurança. P2 indica defeito funcional, integridade ou integração. Reproduções locais e riscos identificados por leitura são diferenciados abaixo.

| Prioridade | Problema e evidência | Correção recomendada |
| --- | --- | --- |
| P1 | **Sessão expirada permanece conectada em memória.** [axios.js](../src/plugins/axios.js:85) apaga tokens após falha do refresh, mas não limpa `userStore.loggedIn`. O [guard](../src/router/index.js:95) impede a ida ao login. Reprodução em navegador: após 401/refresh 401, `loggedIn=true`, token ausente e rota `/delegacao`. | Centralizar a invalidação local da sessão antes de navegar. Essa rotina não deve depender de chamadas autenticadas ou do sucesso da remoção da inscrição push. |
| P1 | **Cadastro de inscrição push aceita destinos arbitrários e quantidade ilimitada.** [Serializer](../../SINUCA-BACK/core/serializers/push_subscription.py:10) usa validação genérica de URL; [view](../../SINUCA-BACK/core/views/push_subscription.py:18) exige somente autenticação. O destino é repassado ao transporte. Risco de requisições externas indevidas e amplificação; exploração contra a rede interna não foi executada, nem se verificou a política de saída do provedor. | Validar HTTPS, provedores/destinos suportados e chaves; limitar inscrições por conta e frequência de registro; impedir destinos privados e redirecionamentos inseguros no transporte. |
| P1 conforme volume | **Envio push ocupa a requisição HTTP original.** [on_commit](../../SINUCA-BACK/core/services/notifications.py:20) não cria uma tarefa em segundo plano; [send_push_event](../../SINUCA-BACK/core/services/push.py:27) envia sequencialmente, com timeout de 10 s por endpoint. Falhas lentas acumulam tempo depois de o dado já ter sido salvo. É um risco confirmado pelo fluxo do código, sem teste de carga remoto. | Usar uma fila ou outbox persistida na transação e processada fora da requisição. Evitar introduzir várias camadas de infraestrutura antes de dimensionar o uso. |
| P2 | **Dados de cronograma/documentos sobrevivem à troca de conta.** [scheduleStore](../src/stores/scheduleStore.js:25) e [linkStore](../src/stores/linkStore.js:21) não resetam por identidade e não invalidam respostas antigas. Reprodução com dados simulados: documento da conta A permanece no store após mudar para B. Uma falha de carregamento conserva o dado antigo. | Reutilizar o padrão de reset e contador de geração já existente em `taskStore` e `chatStore`. |
| P2 | **Excluir o criador apaga tarefas compartilhadas.** [Task.creator](../../SINUCA-BACK/core/models/task.py:14) usa `CASCADE`; organizadores podem excluir alunos comuns. Em SQLite, aluno A criou uma tarefa atribuída a B; DELETE de A retornou 204 e a tarefa deixou de existir. | Preferir desativação/arquivamento ou proteger a exclusão até haver uma regra explícita para preservar a autoria. `SET_NULL` isoladamente não basta: a visibilidade usa a delegação do criador. |
| P2 | **Abrir cronograma diretamente ou recarregar sua URL falha.** [DelegationView](../src/views/DelegationView.vue:43) mantém o ID em `ref(null)` preenchida apenas pelo clique. A rota abre o modal sem preencher esse ID. Reprodução: `/delegacao/schedule/7` exibe erro sem consultar o detalhe na API. | Derivar o ID da rota e retirar a duplicação de estado. |
| P2 | **Erro de documentos aparece como ausência de documentos.** [DocumentsListComponent](../src/components/delegation/DocumentsListComponent.vue:18) não captura a rejeição; `error` nunca é preenchido e `loadDocuments`, usado no retry, não existe. HTTP 500 simulado mostrou lista vazia e promessa rejeitada. | Criar uma única função de carregamento, capturar o erro e usá-la no mount e no retry. Distinguir vazio, carregando e falha. |
| P2 | **Não há saída de sessão na navegação mobile/tablet.** O logout utilizável está na sidebar desktop; header, footer e perfil não oferecem “Sair”. Confirmado no DOM mobile. | Adicionar a ação ao perfil, reutilizando o store. O avatar do header já permite acessar `/perfil`. |
| P2 | **“Perfil” do organizador abre a rota errada.** [AppTabFooter](../src/components/layout/mobile/AppTabFooter.vue:15) aponta para `/delegacao`; contas de organização normalmente não possuem país. Confirmado no DOM. | Apontar para `/perfil`; planejar a área de gestão da organização separadamente. |
| P2 | **Remover foto falha.** [EditProfileModal](../src/components/profile/EditProfileModal.vue:81) envia `foto_attachment_key: null`; [UserSerializer](../../SINUCA-BACK/core/serializers/user.py:19) não aceita nulo nesse campo. PATCH local retornou 400, “Este campo não pode ser nulo”. | Adicionar `allow_null=True` somente ao campo em que remover a foto é permitido e testar a remoção. |
| P2 | **Perfil permite edição para aluno pendente, mas API bloqueia.** [ProfileView](../src/views/ProfileView.vue:50) sempre oferece edição; [HasDelegationForWrite](../../SINUCA-BACK/core/permissions.py:28) impede PATCH de aluno sem país. Confirmado com resposta 403 local. | Definir se o aluno pode corrigir seus dados durante a espera; ajustar a permissão de autoedição ou explicar/desabilitar a ação na UI. Não liberar edição de papel/delegação. |
| P2 | **Datas invertidas são aceitas.** Serializers de [tarefa](../../SINUCA-BACK/core/serializers/task.py:33) e [cronograma](../../SINUCA-BACK/core/serializers/schedule.py:8) não comparam início/fim. Ambos os POSTs locais com fim anterior ao início retornaram 201. | Validar os valores efetivos, incluindo PATCH que altera apenas um lado; acrescentar restrição de banco quando aplicável. |
| P2 | **Cadastro ignora a política configurada de senha.** [UserRegistrationSerializer](../../SINUCA-BACK/core/serializers/user.py:70) verifica tamanho, mas não chama `validate_password`. Cadastro com `12345678` retornou 201; os validadores configurados rejeitam essa mesma senha por ser comum e numérica. | Aplicar `validate_password` com os dados do usuário e devolver seus erros ao formulário. |
| P2 | **Etapa de verificação de e-mail é apenas visual.** [RegisterStepTwo](../src/components/forms/RegisterStepTwo.vue:14) aceita qualquer texto não vazio. Não há envio/verificação do código ou token no cadastro final. A tela afirma que houve envio. | Remover a etapa até implementar o contrato completo ou implementar envio, expiração e validação no servidor. |
| P2 | **Links protegidos comuns perdem o destino após login.** [LoginView](../src/views/LoginView.vue:41) usa o resolvedor exclusivo de push, cuja whitelist não aceita `/perfil`, edição de tarefa ou detalhe de cronograma. | Validar redirects internos com o router, mantendo o resolvedor de eventos push separado. Preservar a proteção contra redirecionamento externo. |
| P2, caso permitido | **Atividade de aluno sem delegação abre o caminho errado.** [ProfileActivities](../src/components/profile/ProfileActivities.vue:131) sempre usa a rota de edição; `DelegationView` só oferece leitura sem país pelo parâmetro `?task=id`. O back permite atribuição explícita por superusuário. | Reutilizar o destino de leitura já usado nas notificações para esse caso. |
| P2 | **Ícones do manifesto PWA apontam para arquivo ausente.** [vite.config.js](../vite.config.js:29) gera `/public/logo-sinuca.svg`; o arquivo real do build está em `/logo-sinuca.svg`. Conferido no manifesto e no diretório `dist`. | Corrigir os caminhos e fornecer ícones apropriados à instalação. Os caminhos de favicon e fundo do welcome foram reescritos pelo Vite no build; não foram classificados como arquivos quebrados. |

**Comparação com o Figma**

O Figma apresenta telas e exemplos de conteúdo; sua existência não define sozinha todas as regras de negócio. As mudanças explícitas pedidas posteriormente pelo usuário prevalecem.

| Área e referência | Situação atual | Ação útil |
| --- | --- | --- |
| [Mural desktop](https://www.figma.com/design/SxdVw9n8771wtU9HICf8Jg/SINUCA---LAYOUT?node-id=529-1367) | Centralização correta na largura de 1440: sidebar 277 px, área restante 1163 px, cartão 928 px, margens de 117,5 px dos dois lados da área útil. A tipografia do subtítulo e o espaço anterior aos cartões diferem; o layout usa título/data em vez de autor/tag. | Manter a centralização corrigida. Se as tags Aviso/Novidade/Atualização forem requisito, acrescentar categoria ao contrato e à criação de postagem. Não são apenas CSS. |
| [Kanban desktop](https://www.figma.com/design/SxdVw9n8771wtU9HICf8Jg/SINUCA---LAYOUT?node-id=422-422) | Estrutura com três estados existe; busca, filtro e drag estão integrados. Colunas com bordas e botão de adicionar por coluna diferem da referência com “NOVA +” global. Categorias usam ícones, enquanto a referência também mostra nomes. | Tratar bordas/botões como escolhas visuais recentes, sem desfazer funcionalidades. Considerar nomes de categorias para compreensão e garantir que mudanças visuais mantenham o drag. |
| [Documentos mobile](https://www.figma.com/design/SxdVw9n8771wtU9HICf8Jg/SINUCA---LAYOUT?node-id=327-54) | Grupos Debate/Mesa existem; faltam os links de ajuda e a distinção visual entre arquivo e link. O upload de PDF não está integrado ao fluxo de documentos. | Priorizar gestão e associação dos documentos; depois adicionar ajuda e ícones consistentes com o tipo real. |
| [Cronograma mobile](https://www.figma.com/design/SxdVw9n8771wtU9HICf8Jg/SINUCA---LAYOUT?node-id=291-128) | Lista e detalhes por tipo existem. Filtro e botão “NOVA +” não estão na lista atual. Há o defeito de URL direta descrito acima. | Corrigir navegação e erro antes de refinar as quatro variantes visuais e acrescentar gestão por perfil. |
| [Delegações da organização](https://www.figma.com/design/SxdVw9n8771wtU9HICf8Jg/SINUCA---LAYOUT?node-id=877-1417) | Não há área própria para criar delegação e gerenciar participantes. A lista de países do chat é outro fluxo. | Implementar o painel da organização reutilizando APIs existentes, incluindo aprovação/vínculo de alunos. |
| [Nova postagem](https://www.figma.com/design/SxdVw9n8771wtU9HICf8Jg/SINUCA---LAYOUT?node-id=877-1224) | Não há formulário de publicação no mural. A API/Admin permitem publicar; categoria da referência não existe no modelo Post. | Criar o fluxo para organização se o produto deve funcionar sem Django Admin; definir categoria antes da implementação. |
| [Chat mobile](https://www.figma.com/design/SxdVw9n8771wtU9HICf8Jg/SINUCA---LAYOUT?node-id=391-22) e [desktop](https://www.figma.com/design/SxdVw9n8771wtU9HICf8Jg/SINUCA---LAYOUT?node-id=741-293) | Chat e indicadores de não lidas estão implementados. Mobile testado sem banner e sem overflow horizontal. A retirada do banner foi solicitada pelo usuário e é uma divergência aceita em relação ao desenho original. | Preservar o layout mobile atual. A aparência nativa do aviso no Chrome não é um defeito de CSS do chat. |
| [História](https://www.figma.com/design/SxdVw9n8771wtU9HICf8Jg/SINUCA---LAYOUT?node-id=1332-36) | O Figma tem conteúdo, busca e seções expansíveis. A aplicação mostra `UnderConstruction`. | Publicar primeiro o conteúdo real e uma navegação simples; acrescentar busca quando o volume justificar. |

**Funcionalidades importantes ainda incompletas**

1. **Operação da organização:** aprovação de alunos, vínculo com país, gestão de delegações/participantes e criação/edição de cronogramas, documentos e postagens. A aprovação já existe em `/usuarios/pendentes/` e `/usuarios/:id/aprovar/`, com métodos no store, mas sem consumidor na UI. Não recriar a API que já funciona.
2. **Ingresso de organizadores por convite:** a documentação registra essa regra, mas não existe validação de convite no servidor. A escolha de papel no welcome não concede privilégios; o cadastro público corretamente força `STUDENT`. Falta explicar/provisionar o ingresso dos outros papéis.
3. **Avaliação e notas:** aba ainda em construção, sem modelo/fluxo de atribuição, critérios ou consolidação de notas. O papel avaliador não dispõe de área funcional própria.
4. **Recuperação e alteração de senha:** não há fluxo completo na UI/API revisadas. É mais urgente para operação que detalhes decorativos.
5. **História e edições anteriores:** placeholders; completar conteúdo antes de declarar essas seções entregues.
6. **Arquivos PDF:** o upload existe, mas seu serializer de resposta não fornece URL para o front e não há integração com Link/documentos. Definir se documentos são links externos ou arquivos próprios e completar um dos caminhos.
7. **Persistência da ordem do Kanban:** status é salvo; reordenação dentro do mesmo estado é apenas local. Refresh/push/recarregamento refaz a ordem por ID. Se ordem manual persistente for requisito, acrescentar posição ao modelo/API e testar concorrência; não confundir isso com falha ao salvar status.

**Notificações: o que já existe e o que conferir**

- Chat, nova atribuição, postagem por API/Admin e comando de atrasos estão implementados. O usuário confirmou entrega real em Firefox e Chrome; esta auditoria não os classifica como globalmente quebrados.
- O comando de atraso verifica prazo/status, ignora concluídas, registra entrega por responsável/prazo e permite tentar novamente quando nada foi entregue. Sua execução diária depende de um agendador externo. A configuração efetiva do Fabroku não foi verificada nesta etapa.
- Tarefas e mensagens criadas pelo Django Admin não passam pelos hooks de eventos das views da API. Apenas Post tem Admin customizado. Caso esses sejam caminhos operacionais suportados, compartilhar os disparos; caso contrário, orientar qual superfície usar.
- O registro de aceitação pelo provedor não comprova exibição no aparelho. As verificações reais devem usar contas diferentes, autorização de notificação e worker atualizado, como nos testes anteriores.
- Melhorar validação de inscrições e retirar o transporte da requisição original são as prioridades de manutenção desse módulo.

**Trechos que podem ser simplificados**

Os exemplos abaixo são propostas, não alterações aplicadas por esta auditoria.

1. **ID do cronograma derivado da rota.** Hoje há `selectedScheduleId`, atribuições em abrir/fechar e `checkModalRoute`. O dado já existe na URL:

```js
const selectedScheduleId = computed(() => route.params.id ?? null)

function openScheduleModal(id) {
  router.push(`/delegacao/schedule/${id}`)
}
```

Remover as atribuições manuais do ID ao adotar essa derivação. Uma etapa posterior pode derivar também o tipo do modal pela rota, preservando `?task=id` e leitura sem delegação.

2. **Uma função real para carregar documentos.** Em vez de estado de erro desconectado e retry inexistente:

```js
async function loadDocuments() {
  error.value = ''
  try {
    await linkStore.getLinks()
  } catch {
    error.value = 'Não foi possível carregar os documentos.'
  }
}

onMounted(loadDocuments)
```

O reset por identidade continua necessário no store; capturar erro no componente não resolve o cache entre contas.

3. **Consultar atividades atribuídas no servidor.** [getAssignedTasks](../src/services/taskService.js:13) percorre a listagem e consulta cada detalhe para descobrir responsáveis. Com 100 tarefas acessíveis em uma página, pode gerar 101 requisições. Um filtro autorizado por responsável ou endpoint de “minhas tarefas” elimina esse percurso. O filtro deve refinar o queryset já autorizado, nunca ampliar o acesso.

4. **Uma rotina de invalidação de sessão.** Separar apagar tokens/resetar identidade de cancelar a inscrição push e navegar. Reutilizar essa rotina em logout e falha definitiva de refresh; manter os guards e o interceptor com responsabilidades menores.

5. **Atualização incremental do chat.** [getMessages](../src/services/messageService.js:14) busca todas as páginas a cada atualização; [ChatView](../src/views/ChatView.vue:214) atualiza a cada 10 s quando visível. Com 100 mensagens e página padrão de 10, são dez GETs por ciclo, cerca de 60/minuto, sem contar a lista de conversas. Buscar novas mensagens por cursor e carregar antigas sob demanda já reduz o custo; WebSocket não é pré-requisito.

6. **Contratos e consultas do back:** manter campos explícitos nos serializers e adicionar `select_related`/`prefetch_related` onde houver relações serializadas por linha. Para categorias de Link, `values_list` dentro do serializer exige ajuste conjunto da consulta/cálculo; apenas adicionar prefetch sem mudar o acesso não resolve necessariamente.

7. **Uploads e arquivos sem referência:** a cada troca de foto, o arquivo antigo permanece contado na cota de 50 arquivos/100 MiB; não há remoção ou coleta de órfãos. Criar limpeza que respeite referências, propriedade e armazenamento físico. A UI de edição de perfil já possui liberação do preview; aproveitar esse padrão no cadastro.

8. **Limpezas pequenas e seguras:** tirar a rota de playground `/p` do build de produção; substituir `font-weight: semibold` por valor CSS válido; usar botões/links nos cards clicáveis do welcome e cronograma para teclado; fornecer `alt` às imagens de postagens; definir `lang="pt-BR"` e título da aplicação; centralizar cores quando tocar nesses componentes. O playground não contorna as permissões da API, mas expõe controles de desenvolvimento desnecessários.

**Ordem recomendada de trabalho**

1. Sessão, isolamento de cache e validação/limites de inscrições push.
2. Integridade: preservar tarefas na exclusão de contas, validar datas e política de senha.
3. Fluxos cotidianos: cronograma por URL, erro/retry, sair no celular, perfil e remoção de foto.
4. Completar a operação da organização e tornar o cadastro coerente com verificação/convites realmente existentes.
5. Melhorar consultas de atividades/chat e transporte de notificações conforme o volume.
6. Completar notas/história e refinar divergências visuais acordadas com o Figma.

**Ajuste posterior do Kanban solicitado nesta conversa**

- Ampliada a altura das listas: em 390×844, passou de 304 para aproximadamente 506 px; no desktop também há mais espaço.
- Rolagem lateral continua nativa fora da alça; `overscroll-behavior-x: contain` limita seu encadeamento lateral. A alça mantém o drag exclusivo da tarefa.
- Testes com toque simulado confirmaram rolagem horizontal pelo corpo do cartão, vertical na lista e mudança para “Em andamento” pela alça, com PATCH interceptado. Nenhuma chamada de escrita foi enviada ao backend real.
- Sem overflow horizontal da página nas larguras 320, 390, 768 e 1440. O conteúdo do quadro continua rolável no celular.
