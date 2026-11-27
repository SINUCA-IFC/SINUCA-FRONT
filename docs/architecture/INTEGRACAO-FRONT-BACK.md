# Integração frontend e backend

## Requisições e sessão

Componentes chamam services ou stores; services usam Axios e a API valida permissões e dados. A base comum é `/api`, com proxy do Vite no desenvolvimento e rewrite da Vercel em produção. Ambos devem preservar a barra final das rotas Django.

`VITE_API_BASE_URL` define a origem do backend. Usar `http://localhost:8000` no `.env.local` para backend local e reiniciar o Vite após alterações. Sem esse arquivo, conferir a API publicada configurada antes de cadastrar ou excluir dados.

Google, CSRF e logout de sessão acessam diretamente a origem do backend com cookies; essa origem deve corresponder ao callback Google. Demais chamadas usam Bearer/JWT. A renovação de access é centralizada em `src/plugins/axios.js`, com proteção contra respostas de uma sessão anterior.

## Recursos

| Recurso | Contrato |
| --- | --- |
| Cadastro e login | allauth, código de e-mail e JWT; perfil real em `/usuarios/me/`. Ver [autenticação](AUTENTICACAO.md). |
| Delegação | Cadastro público cria aluno sem país. Organização consulta `/usuarios/pendentes/` e atribui país em `/usuarios/{id}/aprovar/`. |
| Retirada de participante | Front chama `/usuarios/{id}/remover-delegacao/`, ainda sem implementação correspondente no backend. Não substituir pela exclusão da conta. |
| Tarefas | Status, datas, categorias e responsáveis; gravações dependem de escopo/autorização da API. |
| Cronogramas | Schedule é uma atividade; pode relacionar vários países e links de apoio. |
| Documentos | `/docs/` representa Link. `/media/documents/` é upload de PDF, ainda sem integração completa no formulário. |
| Chat | GET/POST `/mensagens/` e ações de conversa/leitura. Ver [leitura de mensagens](CHAT-LEITURA.md). |
| Push | Service Worker, VAPID e inscrição do navegador; ver [notificações](../NOTIFICACOES.md). |

## Paginação e isolamento

Listas retornam `results`, `page`, `page_size` e `total_pages`; services/helpers percorrem páginas quando necessário. Manter os contadores que invalidam respostas ao trocar sessão, tarefa ou conversa. Uma resposta antiga não pode preencher dados privados de outra conta.

Permissões do servidor são independentes de botões ocultos na interface. Validar chamadas diretas com aluno pendente, aluno de outra delegação, organizador e avaliador. Recursos compartilhados de cronogramas/links exigem cuidado: editar/excluir afeta todos os países associados.

## Verificação

Executar `npm test`, `npm run lint`, `npm run build` e `npm run test:browser`. A suíte de navegador usa API simulada e porta 4174; não comprova integração com a API publicada. Homologar cadastro/e-mail, Google, aprovação, tarefas, recursos compartilhados, chat e push com backend real e contas de teste.

Pendências de matrícula institucional, notas, perfil, convites e operação estão na [passagem de bastão](../PASSAGEM-DE-BASTAO.md).
