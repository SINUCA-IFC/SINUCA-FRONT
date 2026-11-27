# Leitura das mensagens do chat

## Regras

- Cada usuário tem sua própria leitura em cada delegação. A leitura de um organizador não limpa a contagem dos demais.
- Mensagens enviadas pelo próprio usuário não entram na sua contagem de não lidas.
- Ao abrir uma conversa visível, o front confirma somente as mensagens que terminou de carregar. Uma mensagem que chegar depois continua não lida.
- “Marcar como não lida” volta a última mensagem recebida ao estado de não lida e fecha a conversa. Se já houver outras não lidas, mantém todas. O organizador volta à lista; o aluno volta ao mural. Isso evita que a conversa aberta confirme a leitura novamente.
- A lista mostra primeiro as delegações com mensagens não lidas. Dentro de cada grupo, a conversa mais recente aparece primeiro. Delegações sem mensagens ficam no final.
- Alunos acessam somente sua delegação. Os organizadores acessam todas. Pendentes e avaliadores continuam sem acesso ao chat.
- Web Push de postagens, tarefas e chat usa VAPID; contadores de não lidas funcionam mesmo sem permissão de push. Ver [notificações](../NOTIFICACOES.md).

## Como manter simples

Guardar uma linha por usuário e delegação, com o ID da última mensagem lida. Essa opção evita criar uma confirmação para cada mensagem. Não usar armazenamento apenas no navegador: a leitura precisa continuar válida após atualizar a página ou trocar de dispositivo.

A listagem específica do chat fornece a contagem e a data da última mensagem. A ordenação acontece no servidor antes da paginação. O cadastro público de países mantém seu contrato atual.

## Arquivos principais

- [MessageRead](../../../SINUCA-BACK/core/models/message_read.py): guarda `user`, `country` e `last_read_message_id`, com uma única linha para cada par usuário/delegação.
- [View de mensagens](../../../SINUCA-BACK/core/views/message.py): filtra permissões, calcula as contagens, ordena e salva a leitura.
- [Serializers](../../../SINUCA-BACK/core/serializers/message.py): validam o país e o ID da mensagem e definem os campos da listagem.
- [messageService](../../src/services/messageService.js): faz as chamadas HTTP e carrega todas as páginas.
- [ChatView](../../src/views/ChatView.vue): controla carregamento, leitura e ações do usuário. Mantém os dados no próprio componente.
- [DelegationChatList](../../src/components/chat/DelegationChatList.vue): exibe cartões e contadores. Acima de 99, mostra `99+`; o texto acessível mantém a quantidade real.

## Contrato da API

| Requisição | Entrada | Resultado |
| --- | --- | --- |
| GET `/mensagens/conversas/?page=1` | Usuário autenticado | Países paginados com `id`, `name`, `political_name`, `flag`, `unread_count` e `last_message_at`. Consultar não altera a leitura. |
| POST `/mensagens/lidas/` | `{"country": 1, "last_message_id": 23}` | Confirma somente até a mensagem indicada. Ela precisa existir nessa delegação. Confirmações antigas não recuam uma leitura mais recente. |
| POST `/mensagens/nao-lidas/` | `{"country": 1}` | Marca a última recebida como não lida, preservando outras não lidas. Retorna 400 se a conversa não tiver mensagens recebidas. |

Nas duas escritas, o servidor usa o usuário autenticado. Um aluno tentando alterar a leitura de outro país recebe 404. Pendentes e avaliadores recebem 403. O retorno de sucesso das escritas contém `country`; a lista atualizada é consultada ao voltar ao chat.

`last_read_message_id = 0` significa que o usuário ainda não confirmou nenhuma mensagem naquela delegação. A contagem inclui mensagens com ID maior que esse valor e autor diferente do solicitante. Sem um registro de leitura, o histórico recebido começa como não lido.

## Cuidados no front

O chat confirma leitura ao abrir o histórico no final, com a página visível. Se novas mensagens chegarem enquanto a pessoa consulta o histórico antigo, continuam não lidas até ela voltar ao final. Falhas de confirmação não avançam a posição local; atualizar a conversa tenta novamente.

O limite de confirmação deve vir do histórico obtido por GET, não da mensagem recém-enviada acrescentada à tela. Pode ter chegado uma mensagem de outra pessoa entre a última consulta e esse envio. A confirmação precisa esperar a próxima consulta completa para incluir essa mensagem intermediária.

A lista e a conversa atualizam a cada dez segundos enquanto a página está visível. Os contadores que identificam as requisições impedem respostas antigas de atualizar outra delegação. Ao sair, o componente encerra o temporizador e remove o evento de visibilidade.

## Migração e verificação

No backend, aplicar as migrações com `pdm run migrate` antes de usar os contratos de leitura. MessageRead guarda uma linha por usuário/delegação; a migração não apaga mensagens.

As regressões estão em `SINUCA-BACK/core/tests/test_message_reads.py` e `tests/messageService.test.js`. Executar os testes isolados dos dois repositórios e homologar leitura com duas contas diferentes, troca de delegação, mensagens novas, marcação manual e falhas de rede. Testes com API simulada não comprovam estado compartilhado entre navegadores reais.
