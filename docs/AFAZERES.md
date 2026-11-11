# Afazeres do SINUCA

Atualizado em 11/11/2026. Esta lista registra trabalho futuro e identifica as correções já concluídas.

## Ordem de trabalho durante o desenvolvimento

Prioridades reorganizadas a pedido da equipe em 06/11/2026. S07 e S08 receberam correções locais a pedido da equipe em 11/11/2026; ver [permissões e uploads](architecture/SEGURANCA-S07-S08.md). S06 continua na preparação para publicação.

Em 11/11/2026 também foram concluídas localmente as correções de tarefas, categorias/fotos ausentes e paginação abaixo. Foram validadas com 74 testes no backend, 14 testes de services/stores, build e seis cenários de navegador com API simulada. Esta etapa não exige nova migração.

| Ordem | Correção ou task | Resultado esperado |
| --- | --- | --- |
| 1 | Concluído localmente: criação, edição e exclusão de tarefas (F03–F06). | Datas opcionais vazias viram `null`; validações são exibidas no formulário; respostas de escrita incluem categorias completas; IDs de rota são comparados corretamente. A espera pela API antes de fechar o modal foi preservada. |
| 2 | Concluído localmente: categorias sem estilo e postagens sem foto (F07/F08). | Categorias novas recebem ícone e fundo padrão; postagem sem foto permanece visível, sem imagem. |
| 3 | Concluído localmente: paginação nas listas (F11). | Oito stores percorrem todas as páginas antes de atualizar a lista. Filtros e contagens usam a coleção completa; as consultas do backend têm ordenação estável. A API de pendentes continua explicitamente paginada. |
| 4 | Criar a tela administrativa de aprovação. | Listar alunos pendentes e atribuir uma delegação usando as APIs e os métodos de service/store existentes. |
| 5 | Criar a tela de conta e configurações e corrigir o estado de sessão (F12). | Consultar/editar o perfil, sair pelo celular ou desktop e limpar a sessão após falha de renovação. Escopo detalhado abaixo. |
| 6 | Corrigir cronogramas e documentos (F09/F10/F18). | Abrir atividades diretamente pela URL, mostrar somente os documentos vinculados e permitir salvar links com o país correto. |
| 7 | Implementar a verificação real de e-mail. | Substituir a etapa de token simulada pelo fluxo integrado descrito abaixo. |
| 8 | Completar convites e fluxos por papel (F02). | Validar convites de organizadores no servidor e definir as operações de organizadores e avaliadores. |
| 9 | Corrigir navegação e validações complementares. | Revisar atalhos mobile (F16/F17), matrícula (F14), datas invertidas (F20) e página 404 (F26). O filtro de país em mensagens (F19) foi corrigido junto ao chat. |
| 10 | Definir e implementar os próximos recursos do evento. | Priorizar notas, histórico e notificações com a equipe; esses fluxos ainda têm integração incompleta ou inexistente (F23/F24). O chat básico foi integrado; detalhes abaixo. |

- [ ] Separar a URL da API por ambiente para permitir desenvolvimento e testes com dados isolados.
- [ ] Validar cada entrega com os papéis envolvidos e dados de teste, incluindo navegação mobile e desktop.

Os IDs F e S remetem à auditoria. Esta ordem é de planejamento e não representa uma nova rodada de reprodução de todos os achados.

## Chat básico — concluído localmente em 11/11/2026

A tela mobile e desktop usa os frames do Figma e a API existente. Alunos com delegação compartilham a conversa do seu país com a organização. Para organizadores, `/chat` apresenta cartões com nome, nome político, bandeira e contador de não lidas; selecionar um cartão abre `/chat/ID`, com opção de voltar à lista. A lista prioriza conversas não lidas e, dentro de cada grupo, a atividade mais recente. Cada usuário tem sua própria leitura. Pendentes e avaliadores não acessam mensagens. A interface permite consultar o histórico, enviar texto, marcar como não lida e tentar novamente após falhas. Atualiza a conversa e a lista a cada dez segundos enquanto a página está visível. A API limita mensagens a 2.000 caracteres e rejeita filtros de país inválidos com erro 400. O controle de leitura acrescenta a migração `core/0028_message_read`.

- [ ] Validar o fluxo entre participantes e organizadores no ambiente dedicado, antes de publicar.
- [ ] Confirmar com a equipe se haverá também conversa individual por aluno. O chat atual é compartilhado pela delegação.
- [x] Implementar contagem de mensagens não lidas por usuário e delegação, leitura automática, ação manual e ordenação no servidor. Detalhes em [leitura do chat](architecture/CHAT-LEITURA.md).
- [ ] Aplicar a migração de leitura no ambiente que executará a nova API e validar o fluxo antes da publicação.
- [ ] Reavaliar paginação e atualização conforme o volume real: a versão simples consulta todo o histórico, sem WebSocket.

Contrato e verificações: [integração front/back](architecture/INTEGRACAO-FRONT-BACK.md#chat-por-delegação).

## Notificações — trabalho futuro

Solicitado em 11/11/2026. O contador do chat representa mensagens não lidas; a entrega de notificações ainda será desenvolvida.

- [ ] Notificar novas postagens do mural: definir destinatários, preferências e o evento de publicação que gera o aviso.
- [ ] Criar a central de notificações na aplicação, com listagem e estados lida/não lida. Definir quais eventos entram nela, incluindo mensagens, tarefas e cronogramas.
- [ ] Definir e implementar os canais necessários, como avisos dentro do site, push do PWA ou e-mail, com permissão e preferência do usuário.
- [ ] Evitar avisos duplicados e testar destinatários, leitura, falhas e novas tentativas. O campo de notificação já existente em tarefas não comprova entrega de avisos.

## Verificação real de e-mail — prioridade alta

A verificação de e-mail continua fazendo parte do cadastro. A interface original de `RegisterStepTwo.vue` foi restaurada a pedido da equipe. Atualmente ela é um protótipo: preencher o campo permite avançar, sem envio ou validação de código pelo servidor.

- [ ] Configurar o serviço de envio de e-mails, mantendo credenciais fora do Git.
- [ ] Criar no backend o envio e a validação do código vinculado ao endereço informado. A etapa atual acontece antes da criação da conta; a confirmação precisa ser comprovada também ao concluir o registro.
- [ ] Aplicar expiração, uso único, limite de tentativas e controle de reenvio. Não armazenar ou registrar códigos em logs de produção.
- [ ] Impedir que alterações no endereço reaproveitem uma confirmação anterior.
- [ ] Conectar a segunda etapa às APIs reais, aguardando a resposta antes de avançar e exibindo erro, carregamento e opção de reenvio.
- [ ] Validar a confirmação no servidor, sem confiar em flags ou na navegação do front.
- [ ] Testar código correto, incorreto, expirado, reutilizado, reenvio e tentativa de pular a etapa diretamente pela API.

Confirmar o e-mail comprova o acesso ao endereço. A aprovação dos organizadores e a atribuição de delegação continuam sendo etapas distintas dessa confirmação. Na implementação atual de S05, a aprovação da organização acontece junto à atribuição de `country`; a verificação de e-mail ainda não participa desse controle.

## Tela de conta e configurações do usuário — prioridade média, antes do evento

Solicitada em 06/11/2026. Disponibilizar uma tela própria de conta, acessível pela navegação mobile e desktop, para consultar o perfil, editar configurações e sair da conta.

- [ ] Definir a rota e os acessos à tela na navegação mobile e desktop.
- [ ] Exibir os dados do usuário autenticado e permitir editar os campos de perfil autorizados pela API, com estados de carregamento, sucesso e erro.
- [ ] Definir as demais configurações disponíveis; conectar cada opção ao comportamento e à persistência correspondentes.
- [ ] Disponibilizar uma ação visível de logout, limpando tokens, perfil e dados privados dos stores e encaminhando para a entrada da aplicação.
- [ ] Integrar o encerramento de sessão ao tratamento de expiração, evitando manter estado de usuário autenticado após falha de renovação.
- [ ] Conferir navegação por teclado, uso no celular e troca de conta sem exibir dados da sessão anterior.

País, papel e privilégios continuam sob controle da organização no servidor; a edição do próprio perfil deve respeitar essas restrições.

## Antes da publicação — pendências registradas

Executar os itens ainda não marcados na preparação para disponibilizar a aplicação ao público com dados reais. S07/S08 foram corrigidos localmente em 11/11/2026, mas exigem implantação e validação no ambiente publicado.

- [ ] **S06 — Segredos e bases versionados:** retirar `.env`, `db.sqlite3` e `dump.json` do conteúdo distribuído, fornecer configuração de exemplo sem segredos, eliminar o fallback de chave previsível e substituir credenciais afetadas que estejam em uso. Avaliar histórico e cópias com a equipe.
- [x] **S07 — Permissões de participantes:** alterações de colegas e de cronogramas/documentos restritas por papel e objeto; organizadores comuns não alteram contas administrativas. Validado localmente; publicação pendente.
- [x] **S08 — Uploads e mídias:** autenticação, arquivos próprios, limites de tamanho/quantidade e cotas. Foto enviada junto ao cadastro, sem upload anônimo separado. Aplicação da migração e configuração de cache/proxy na implantação continuam pendentes.
- [ ] Rever configuração de produção, dependências efetivamente instaladas e reprodução do ambiente de implantação.
- [ ] Validar autorização, isolamento entre delegações e os fluxos principais em ambiente dedicado antes da liberação.

- [ ] Conferir os vínculos de país de contas anteriores à correção do cadastro.

Referências: [integração front/back](architecture/INTEGRACAO-FRONT-BACK.md) e [auditoria](../AUDITORIA-2026-10-27.md).
