# Notificações push e mensagens não lidas

## Objetivo e escopo

Concluir a base dos commits `df274f7` (front) e `3b06c02` (back), seguindo a Unidade 8 de https://eduardo-da-silva.github.io/desenvolvimento-mobile/unidade8/. Entregar push de postagens, atribuições de tarefas, tarefas atrasadas e mensagens, além de indicadores de não lidas no desktop e celular. Preservar Vue/Pinia, Django/DRF e o serviço Web Push existente. Não criar central de notificações, e-mail, WebSocket ou fila de execução.

## Abordagem proposta

Reutilizar `send_push_event`, inscrições por navegador e leitura de chat por usuário. Completar `injectManifest`, handlers `push`/`notificationclick`, banner de permissão e integração de sessão. Verificar atrasos com comando Django agendado no servidor. Esta é a opção recomendada por exigir poucas dependências e aproveitar os CHORE. Celery/Redis acrescentaria serviços para administrar; verificar atrasos apenas no navegador deixaria de avisar quando o aplicativo estivesse fechado.

## Regras de entrega

- Postagem nova: todos os usuários ativos com inscrição autorizada, exceto o navegador que realizou a ação. Outras sessões do autor podem receber, conforme a unidade e a base existente.
- Tarefa criada ou editada: avisar apenas os responsáveis recém-adicionados. Editar título ou manter o responsável não repete a atribuição. Usar a relação `Task.user`, que admite vários responsáveis.
- Tarefa atrasada: `endDate < timezone.localdate()` e `status != Task.Status.DONE`. Uma data sem horário vence após o fim daquele dia no fuso America/Sao_Paulo. Sem prazo, concluída ou sem responsável não gera aviso.
- Guardar registro único por tarefa, responsável e data de prazo para evitar repetição nas execuções do comando. Outro prazo pode gerar outro aviso quando vencer; reabrir a tarefa sem mudar o prazo não repete um aviso já enviado. Falhas ou ausência de VAPID não devem ser registradas como entrega bem-sucedida. Documentar os limites de reentrega do Web Push, que não confirma leitura.
- Chat: a conversa existente é por país, não individual. Mensagem de aluno notifica organizadores ativos; mensagem da organização notifica alunos ativos da delegação destinatária. Nunca enviar a outras delegações ou ao próprio remetente. Evitar conteúdo privado no corpo do push; levar ao chat correto (`/chat/:countryId` para organização, `/chat` para alunos).
- Disparar após salvar/confirmar a transação. Falha no push não desfaz postagem, tarefa ou mensagem. Excluir o endpoint de origem nos eventos iniciados por requisição e desativar endpoints expirados.

## Navegador e navegação

Banner discreto depois do login com “Ativar” e “Agora não”, somente se houver suporte e a permissão estiver indefinida. Reaproveitar o serviço existente em vez de duplicá-lo em outro composable. Login/restauração sincronizam permissão já concedida; logout remove inscrição e estado local sem depender de sucesso do serviço de push. Evitar espera indefinida pelo Service Worker durante autenticação.

O Service Worker mantém precache de arquivos públicos do build e não armazena respostas autenticadas da API. Ao clicar, focar janela existente ou abrir a rota do recurso; preservar navegação após autenticação quando necessário. Validar destinos locais. Atualizar os dados relacionados e os indicadores ao receber o evento em uma aba aberta. As tarefas devem abrir o Kanban e identificar a tarefa correspondente com as rotas/estado já existentes.

## Indicadores de chat

Compartilhar uma única fonte de conversas no front, reutilizando `/mensagens/conversas/` e suas contagens, sem novo modelo de leitura.

- Delegado: indicador junto ao ícone Chat mostra a quantidade de mensagens não lidas da conversa da sua delegação, usando a mesma definição atual da API (mensagens de outros autores).
- Organizador: indicador mostra quantos países têm `unread_count > 0`, enquanto cada país na lista continua mostrando sua quantidade de mensagens.
- Desktop e celular usam o mesmo componente visual, reaproveitando o símbolo já presente na lista de países. Zero esconde o indicador; manter `99+` como convenção visual existente e a quantidade exata na descrição acessível.
- Atualizar após leitura/marcação manual, ao receber push, voltar à aba e por consulta periódica enquanto o app estiver visível. Funciona mesmo se push for negado ou indisponível. Limpar estado na troca de conta e ignorar respostas de sessão anterior.
- Preservar a leitura explícita atual: consultar mensagens não marca como lidas; confirmar apenas a posição efetivamente carregada quando a conversa estiver visível e no fim do histórico.

## Simplificações próximas

Centralizar atualização das conversas para não duplicar polling entre lista e indicadores; extrair o indicador visual repetido; compartilhar o tratamento seguro de envio dos eventos. Corrigir o CORS do header `X-Push-Endpoint`. Evitar refatorações fora dessas áreas.

## Validação e publicação

Testar destinatários e isolamento, diferença de responsáveis, falhas de push sem perda da ação principal, atrasos com prazo alterado/conclusão/múltiplos responsáveis/reexecução e contadores por perfil. Cobrir serviço do navegador, clique, permissão, logout e troca de conta. Executar suites front/back, build PWA e verificação de migrações.

Documentar migrações, VAPID, HTTPS e agendamento diário do comando de atrasos. Não há acesso/configuração de agendador de produção confirmado neste repositório; preparar comando e exemplo de cron, sem afirmar que o agendamento externo foi ativado. Validar push real em duas sessões exige ambiente com VAPID e navegadores autorizados.

Ao concluir, entregar resumo cumulativo dos CHORE até as alterações desta solicitação, com testes executados e passos externos de publicação. Não criar commits ou publicar automaticamente.

## Decisões propostas pelo implementador

A periodicidade diária de atrasos, aviso único por prazo, destinatários por lado da conversa e atualização dos indicadores sem WebSocket são escolhas propostas a partir do modelo atual. O usuário pode corrigi-las antes da implementação. Detalhes internos de nomes, divisão de arquivos e testes ficam a cargo do implementador.
