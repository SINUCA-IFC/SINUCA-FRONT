# SINUCA — passagem de bastão

Atualizado em **25/11/2026**. Este é o ponto de entrada para a próxima equipe: descreve o que existe, como o código funciona, como operar e o que ainda falta. A aplicação tem mural público, histórico do evento, autenticação, gestão de delegações, tarefas, cronogramas, documentos, perfil, chat e notificações. **A avaliação por notas ainda não está implementada.** Algumas telas prontas têm pendências de integração descritas abaixo; tela existente não significa fluxo completo homologado.

O código examinado partiu de `SINUCA-FRONT@a309b36` e `SINUCA-BACK@d08c071`. As simplificações desta entrega são alterações locais posteriores a esses commits. Os testes e a consulta ao site publicado não comprovam que essas alterações já foram implantadas.

## 1. Onde manter este documento

O destino central recomendado é **`SINUCA-Documentacao-PI/docs/PASSAGEM-DE-BASTAO.md`**. Esse repositório deve reunir situação funcional, regras de negócio, decisões e próximas entregas. Os READMEs do front e do back devem explicar apenas como executar cada parte e apontar para o documento central.

Esta cópia foi preparada em `SINUCA-FRONT/docs/`, dentro do workspace disponível. Ao transferi-la, atualizar os links relativos e registrar os commits dos dois repositórios e a data de homologação. Manter uma fonte principal, evitando três versões divergentes. [Recomendações para revisar a documentação PI](REVISAO-DOCUMENTACAO-PI.md) acompanham esta passagem.

Auditorias e planos anteriores em `docs/` são registros históricos. Seus itens precisam ser confrontados com o código atual; não devem ser tratados como uma lista atualizada automaticamente.

## 2. Formação de referência e escolhas de manutenção

O projeto acompanha os conceitos dos materiais indicados:

| Material | Relação com o SINUCA |
| --- | --- |
| [Django e DRF](https://github.com/marrcandre/django-drf-tutorial) | Modelos e relações no ORM, migrações, serializers, viewsets, routers, autenticação, permissões e Admin. |
| [Desenvolvimento Web](https://eduardo-da-silva.github.io/desenvolvimento-web/) | Componentes Vue, reatividade, props/emits, Vue Router, Pinia e chamadas com Axios e async/await. |
| [Desenvolvimento Mobile](https://eduardo-da-silva.github.io/desenvolvimento-mobile/) | Interface responsiva, estados de carregamento/erro, acessibilidade, Vite, PWA, Service Worker e Web Push. |

Manter essa estrutura. Uma tela fica em `views`, suas partes reutilizáveis em `components`, chamadas HTTP em `services` e estado compartilhado em `stores`. No back, campos persistentes ficam em `models`, validações e representação em `serializers`, endpoints e escopo de consulta em `views`. Não introduzir uma classe CRUD genérica própria para substituir viewsets simples do DRF.

Paginação, tratamento de erros, permissões e proteção contra respostas antigas são necessários ao funcionamento. Evitar confundir esses controles com código desnecessário. Uma função pequena com nome claro costuma ser mais fácil de manter que várias expressões condicionais aninhadas.

## 3. Ambientes e caminho de uma requisição

| Parte | Endereço |
| --- | --- |
| Front publicado | `https://sinuca-ifc-mocha.vercel.app` |
| API publicada | `https://sinuca-backend.class.fabricadesoftware.ifc.edu.br` |

Fluxo comum: **componente → store ou service → Axios → `/api` → viewset → serializer → modelo/banco**. Nem toda consulta precisa passar por store: detalhes usados por um único modal podem ficar no componente.

`src/plugins/axios.js` define `/api`, acrescenta o JWT e tenta renovar um acesso expirado. O Vite encaminha `/api` ao backend durante desenvolvimento. Em produção, `vercel.json` faz esse encaminhamento antes do fallback do Vue Router para `index.html`. `.env.production` e o destino de `vercel.json` precisam apontar para a mesma API. Variáveis do painel de build podem sobrescrever as do arquivo.

O login Google usa **diretamente a origem da API**, com cookies e CSRF. O callback Google ocorre no backend; passar essa sessão pelo domínio do front pode perder o cookie. Não transformar essas chamadas em chamadas comuns de `/api` sem rever todo o fluxo. [Detalhes de integração](architecture/INTEGRACAO-FRONT-BACK.md) e [autenticação](architecture/AUTENTICACAO.md) complementam o código atual.

## 4. Pessoas, contas e permissões

| Perfil | Situação atual e uso |
| --- | --- |
| Visitante | Acessa mural, história e entrada/cadastro. Não acessa tarefas, chat nem gestão. |
| Discente sem delegação | Cadastra-se, confirma e-mail e aguarda atribuição de país. A tela permite atualizar a situação. Isso não é erro de login. |
| Discente vinculado | Acessa tarefas da sua delegação ou atribuídas a ele, cronogramas, documentos, perfil e chat da delegação. |
| Organizador | Gerencia delegações/participantes, postagens, cronogramas e documentos; conversa com as delegações. Tarefas não ganham automaticamente escopo global só pelo papel organizador. |
| Avaliador | Existe como papel no modelo. Ao selecionar esse perfil na entrada, o front mostra “Área do avaliador em construção”. Ainda não há painel nem lançamento de notas. |
| Superusuário/Admin | Usado na administração técnica. `is_staff`, `is_superuser` e `role` são campos diferentes: acesso ao Django Admin não deve ser confundido com o papel de organizador do site. |

O cadastro público utiliza allauth e cria **aluno**, sem delegação. A escolha de perfil na interface não concede privilégios. Contas da organização e futuros avaliadores precisam de provisionamento controlado; não há sistema pronto de convites. Para operar o painel como organizador, conferir o `role` da conta, além das flags administrativas.

`User` usa e-mail como identificação; contém nome, foto, turma (`Gang`), matrícula e país (`Country`). O perfil não permite que o próprio usuário altere papel, país ou privilégios. O e-mail também é somente leitura na edição atual. Criar, desativar ou alterar contas privilegiadas exige cuidado administrativo.

## 5. Inventário funcional

### Mural e história

`BoardView.vue` consulta postagens paginadas. Visitantes leem; organizadores têm criação, edição e exclusão, com imagem e feedback. A API de `Post` também é acessível pelo Admin, e a criação pode disparar push. Categoria de postagem não existe como campo de `Post`: não prometer filtro por categoria sem definir o contrato.

`HistoryView.vue` e `components/history/` exibem conteúdo local de `history.json`, com busca e seções. Não dependem de um editor de história no backend. Alterações de conteúdo exigem edição dos arquivos e novo build.

### Cadastro, login e perfil

Cadastro com dados do discente e foto passa por validação no front e no backend. O allauth controla código real de seis dígitos, expiração, tentativas e reenvio. O front mantém a sessão pendente no `sessionStorage`; somente após confirmação recebe JWT. Login usa access/refresh em `localStorage`; logout e expiração limpam o estado local. O refresh é centralizado no Axios.

Google utiliza allauth, sessão, CSRF, callback e troca da sessão por JWT. A vinculação de uma conta existente tem comprovação temporária; não remover essas verificações para encurtar o código. SMTP e configuração do Google são dependências operacionais, não substituídas pelos testes simulados. Ver [contrato do backend](https://github.com/SINUCA-IFC/SINUCA-BACK/blob/main/docs/django-allauth.md).

`ProfileView.vue` mostra dados e atividades; `EditProfileModal.vue` edita nome/foto. A remoção de foto e a edição por aluno ainda pendente têm incompatibilidades registradas na seção 12.

### Delegações e participantes

`OrganizerView.vue` cria delegações a partir do catálogo de países. `OrganizerDelegationView.vue` reúne participantes, cronograma, documentos e espaço futuro de notas. A seleção de alunos usa turma e pesquisa; o envio em lote conserva quem falhou para permitir nova tentativa.

O backend lista pendentes e aprova por `POST /api/usuarios/{id}/aprovar/`, atribuindo o país. Há proteção contra duas aprovações simultâneas. **A remoção de participante já possui botão e chamada no front, mas a ação `remover-delegacao` não existe neste backend.** Esse fluxo precisa ser concluído e testado com a API real antes de ser considerado entregue. Não usar DELETE da conta como substituto de retirar o vínculo.

### Tarefas e Kanban

`TasksListComponent.vue`, `components/tasks/` e `taskStore.js` implementam criação, leitura, edição, exclusão, responsáveis, categorias, prazo, busca, filtros e mudança de status por arraste. Os estados são 1=A fazer, 2=Em andamento e 3=Concluído.

O servidor define o criador com o usuário autenticado. A visibilidade considera responsáveis e delegação do criador; a atribuição entre delegações exige superusuário. A ordem manual dentro de uma coluna não é um campo persistido. O status é salvo; uma ordem específica entre cartões pode desaparecer ao recarregar.

`Task.notification` permanece no modelo/contrato como campo legado. O toggle antigo, sem efeito real sobre push, foi removido do front. Não apagar o campo do banco só por estar sem controle na interface: isso exige decisão de contrato e migração.

### Cronogramas

`ScheduleListComponent.vue` lista atividades; `ScheduleDetails.vue` mostra detalhes. O organizador utiliza `ResourceCreateModal.vue` tanto para criar quanto para editar, com dados carregados previamente. `ResourceDeleteModal.vue` confirma exclusões. A exclusão de atividade compartilhada vale para todas as delegações vinculadas, conforme o aviso do modal.

`Schedule` possui título, descrição, início/fim, local, países e documentos relacionados. Categorias atuais: **1 Postagem; 2 Debate; 3 Mesa de cooperação; 4 Apresentação cultural**. Na categoria cultural, `tipo` distingue dança e comida. Não confundir esses números com os IDs das categorias de tarefas.

Na edição, datas/horários inalterados preservam a precisão recebida da API; atividades que atravessam dias oferecem a data final. Os países do debate e documentos vinculados são preenchidos. O backend verifica se os documentos estão disponíveis para todas as delegações da atividade. A comparação de início/fim ainda precisa ser validada também no servidor.

### Documentos e uploads

Os documentos da delegação são registros `Link`: nome, URL e países. Criar um documento na interface cadastra **um link**, sem enviar PDF. A lista agrupa Debate/Mesa conforme as categorias dos cronogramas aos quais o link está associado. As categorias são derivadas pelo backend; não são uma preferência independente persistida no link.

O organizador cria/remove links. Remover um link compartilhado o retira das delegações e das relações com cronogramas. Os cronogramas permanecem. O upload genérico de PDF existe no app `uploader`, mas ainda não há um fluxo completo na UI que faça upload e o associe como documento de delegação.

Imagens e PDFs possuem proprietário, limites e validação no servidor. `attachment_key` identifica um anexo pertencente à conta; não substituí-lo por IDs arbitrários. Imagens aceitam JPEG/PNG e o PDF tem validação de conteúdo. Limites atuais ficam em `app/settings.py` e `uploader/limits.py`; alterações exigem conferir o texto exibido no front.

### Chat, leitura e notificações

`ChatView.vue`, `chatStore.js`, `messageService.js` e `DelegationChatList.vue` integram conversas por delegação. Organizador consulta as delegações; aluno vinculado acessa a sua; avaliador e aluno pendente não têm chat. O histórico e os contadores são consultados periodicamente, com intervalos de dez segundos enquanto a página está visível. Não há WebSocket.

`MessageRead` mantém posição de leitura por usuário/delegação. Abrir uma conversa só confirma o histórico efetivamente carregado e visível. Consultar a lista não marca tudo como lido. Marcar como não lida recua a última recebida e fecha a conversa. Os contadores sobrevivem à troca de dispositivo porque estão no banco. [Regras de leitura](architecture/CHAT-LEITURA.md).

Web Push usa **Push API + VAPID + Service Worker**, sem Firebase. Eventos existentes: nova postagem, novos responsáveis por tarefa, novas mensagens e tarefas atrasadas. O comando de atraso precisa de agendador externo. Recibo por tarefa/responsável/prazo evita repetição de avisos entregues.

Permissão de push deve ser solicitada por ação do usuário; permissão negada depende das configurações do navegador. Mensagens não lidas continuam funcionando sem push. O Service Worker guarda o shell público; **não armazena respostas privadas da API**. A PWA pode abrir o shell sem conexão, mas não oferece edição offline de tarefas ou chat. [Guia de notificações](NOTIFICACOES.md).

## 6. Mapa do código e dos dados

| Local | Responsabilidade |
| --- | --- |
| Front `src/router/index.js` | Rotas e guardas de autenticação/organização. |
| Front `src/services/` | Contratos HTTP; `authService.js` trata também cookies e verificação de e-mail. |
| Front `src/stores/` | Estado compartilhado de sessão, tarefas, chat e listas. |
| Front `src/components/delegation/modais/` | Formulários e confirmações da gestão de recursos. |
| Front `src/sw.js` | Cache público, push e clique da notificação. |
| Front `src/data/`, `components/history/history.json` | Catálogo de países e conteúdo histórico local. |
| Back `app/settings.py`, `app/urls.py` | Configuração e rotas. |
| Back `core/models/`, `serializers/`, `views/` | Entidades, validações, representação e endpoints do domínio. |
| Back `core/permissions.py` | Autorização por papel/objeto; esconder botão no front não substitui esse arquivo. |
| Back `core/services/` | Montagem de eventos e transporte push. |
| Back `core/forms.py`, `adapters.py`, `google_link.py` | Integração allauth e comprovações de autenticação/vinculação. |
| Back `uploader/` | Modelos de anexo, validação, cotas e upload autenticado. |
| Back `core/migrations/`, `uploader/migrations/` | Histórico de schema; preservar em bancos já existentes. |

Relações centrais: usuário pertence opcionalmente a uma turma e delegação; tarefa tem criador, vários responsáveis e categorias; cronograma tem vários países e documentos; link pertence a vários países; mensagem pertence a um país e tem autor; leitura pertence ao par usuário/país; inscrição push pertence ao usuário e navegador. Dados de allauth guardam e-mails verificados e contas sociais.

## 7. API usada pelo front

Os caminhos da tabela devem receber o prefixo `/api`: por exemplo, `/token/` significa `/api/token/`. A barra final importa no Django e no rewrite de produção. As listagens usam `results`, `page`, `page_size` e `total_pages`; padrão de dez itens, máximo configurado de cem por página. `getAllPages` reúne páginas quando a tela precisa da coleção completa.

| Caminho | Finalidade |
| --- | --- |
| `/token/`, `/token/refresh/`, `/token/verify/` | Autenticação e renovação JWT. |
| `/registro/`, `/registro/confirmar-email/`, `/registro/reenviar-codigo/` | Cadastro e confirmação. Na confirmação/reenvio, usar a sessão pendente pelo header `X-Session-Token`. |
| `/auth/csrf/`, `/auth/google/`, `/token/session/`, `/auth/logout/` | Sessão Google, CSRF e troca por JWT, diretamente na origem da API. |
| `/usuarios/me/` | Perfil real do usuário autenticado. |
| `/usuarios/pendentes/`, `/usuarios/{id}/aprovar/` | Aprovação/atribuição de delegação pela organização. |
| `/paises/`, `/turmas/`, `/categorias/` | Cadastros de delegações, turmas e categorias. |
| `/postagens/` | Mural; leitura pública e escrita autorizada. |
| `/tarefas/` | Tarefas com escopo por usuário/delegação. |
| `/cronogramas/`, `/docs/` | Atividades e links associados às delegações. |
| `/mensagens/`, `/mensagens/conversas/`, `/mensagens/lidas/`, `/mensagens/nao-lidas/` | Histórico, conversas, contadores e leitura. |
| `/media/images/`, `/media/documents/` | Upload autenticado de imagem/PDF. |
| `/vapid-public-key/`, `/push-subscriptions/` | Inscrição e remoção de Web Push. |
| `/schema/`, `/doc/`, `/redoc/` | OpenAPI, Swagger e ReDoc, ainda com pendências de schema. |

JWT vai em `Authorization: Bearer <access>`. A API é a autoridade para decidir acesso. Não criar rotas de notas apenas para preencher a documentação: a seção 13 é uma especificação futura.

## 8. Como iniciar localmente

### Backend

Usar ambiente virtual ou PDM. `runtime.txt` indica Python 3.13; o projeto declara `>=3.10`, enquanto esta revisão utilizou Python 3.14.9. A próxima equipe deve padronizar uma versão em instalação, CI e servidor; os testes desta entrega não comprovam todas essas versões.

```sh
cd SINUCA-BACK
python -m venv .venv
# Linux/macOS
source .venv/bin/activate
# Windows PowerShell: .\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
```

No Linux, instalar a biblioteca de sistema `libmagic1` se a validação de arquivos exigir. Criar `.env` local sem reutilizar banco ou credenciais de produção:

```dotenv
MODE=DEVELOPMENT
DEBUG=True
SECRET_KEY=preencha-com-uma-chave-local-aleatoria
DATABASE_URL=sqlite:///db.sqlite3
FRONTEND_URL=http://localhost:5173
FRONTEND_ALLOWED_ORIGINS=
AUTH_CROSS_SITE_COOKIES=False
AUTH_COOKIE_SECURE=False
EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend
```

As duas opções de cookies são importantes: o padrão cross-site com cookies inseguros impede a inicialização. O e-mail de console serve para copiar o código no desenvolvimento; não envia e-mail real. Gerar a chave local com `python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"`. Não versionar `.env`.

```sh
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver localhost:8000
```

Esses comandos são para o banco local configurado. Criar turmas, países, categorias e contas administrativas pelo Admin (`http://localhost:8000/admin/`). O seed antigo incompatível foi removido; não há carga completa e homologada do evento nesta entrega. É necessário registrar um conjunto de dados iniciais mantido pela equipe.

Com PDM, utilizar `pdm install` e prefixar comandos com `pdm run`. `dev` inicia o servidor; `makemigrations` cria migrações; `migrate` aplica as existentes; `diagram` gera o diagrama quando as ferramentas gráficas estiverem instaladas. Criar/aplicar migrações e gerar diagrama agora são ações separadas. `requirements.txt` é exportado pelo PDM; alterações de dependências devem manter `pyproject.toml`, `pdm.lock` e a exportação coerentes.

### Frontend

```sh
cd SINUCA-FRONT
npm ci
```

Para utilizar o backend local, criar `.env.local`:

```dotenv
VITE_API_BASE_URL=http://localhost:8000
```

```sh
npm run dev
```

Acessar `http://localhost:5173`. Reiniciar o Vite após alterar variáveis. Sem configuração local, o desenvolvimento utiliza a API publicada: conferir o destino antes de cadastrar ou excluir dados. Para gerar o build publicado, usar a API HTTPS correta; valores de `.env.local` também podem sobrescrever a configuração de produção.

## 9. Como operar o evento

1. O responsável técnico prepara SMTP, Google, banco, mídia e HTTPS; cria contas da organização e dados iniciais.
2. A organização cadastra as delegações e confere as turmas disponíveis para os alunos.
3. O aluno faz cadastro, confirma o código e aguarda a atribuição de delegação.
4. A organização adiciona alunos pendentes pela turma; conferir sucessos e falhas do lote. Retirar vínculo ainda depende da correção da API indicada acima.
5. A organização publica avisos, cadastra links de apoio e monta cronogramas; atividades compartilhadas precisam de documentos acessíveis a todos os países envolvidos.
6. Os alunos acompanham tarefas, prazos, materiais e chat; mudanças de status são persistidas pela API.
7. O responsável pelo servidor agenda `python manage.py notify_overdue_tasks`; não basta deixar o site aberto.

Para testes manuais, criar contas específicas em ambiente de teste. Não colocar senhas de teste ou de administradores em documentação pública. Fazer backup antes de migrações ou operações em lote e testar a restauração em ambiente separado.

## 10. Publicação e manutenção

Front: `npm ci` e `npm run build`, publicando `dist/` na Vercel. `npm run preview` só serve o build para conferência; não substitui a API. Conferir rewrite `/api`, fallback das rotas, manifesto, ícones e atualização do Service Worker.

Back: configurar PostgreSQL por `DATABASE_URL`, `SECRET_KEY` própria, `DEBUG=False`, `MODE=DEPLOY`, mídia Cloudinary e estáticos WhiteNoise. O processo web usa Gunicorn. `build.sh` e o `release` do `Procfile` aplicam migrações; verificar qual fase a hospedagem executa antes de eliminar um desses caminhos. O deploy não foi realizado nesta revisão.

Para e-mail: configurar backend SMTP, host, porta/TLS, usuário, senha de aplicativo e remetente autorizado no painel do servidor. Para Google: client ID/secret no servidor e callback `https://<backend>/accounts/google/login/callback/`. Nunca colocar segredos em variáveis `VITE_*`.

Na topologia Vercel/IFC, `FRONTEND_URL` deve ser a origem pública exata; `AUTH_COOKIE_SECURE=True` e `AUTH_CROSS_SITE_COOKIES=True` habilitam cookies cross-site por HTTPS. CORS e CSRF continuam restritos. Cookies de terceiros podem ser bloqueados pelo navegador; hospedar front e API no mesmo site é uma alternativa a avaliar. `TRUST_PROXY_HTTPS` só deve ser ativado se o proxy tratar corretamente o header encaminhado.

Para push: manter par VAPID válido, contato configurado e agendador de atrasos. Trocar a chave exige renovar inscrições dos navegadores. Não interpretar a aceitação pelo provedor como prova de exibição no aparelho.

Registrar no histórico de cada implantação: commits front/back, migrações aplicadas, alterações de configuração sem valores secretos, verificações realizadas, responsável e procedimento de retorno à versão anterior.

## 11. Testes e situação verificada

```sh
# Front
npm test
npm run lint
npm run build
npm run test:browser

# Back, com dependências instaladas
python manage.py test --settings=app.settings_test --noinput
python manage.py check --settings=app.settings_test
python manage.py makemigrations --check --dry-run --settings=app.settings_test
```

`app.settings_test` desliga o carregamento de `.env`, usa banco em memória, e-mail e mídia locais de teste. Não substituir por uma execução inadvertida no banco real. O aviso de VAPID ausente é esperado nesse ambiente isolado. A suíte de navegador usa Chrome, servidor próprio na porta 4174 e API simulada. Não iniciá-la sobre uma porta já ocupada nem editar componentes no meio da execução, pois o HMR pode invalidar o cenário.

Resultado final em 25/11/2026: os dez arquivos de testes do front, lint, build/PWA e **54 testes de navegador passaram**; **185 testes de backend passaram**, sem migrações novas. Os lockfiles preservaram as versões restantes. A única advertência do check isolado foi VAPID ausente, prevista pela configuração de teste. Detalhes no [registro de execução](superpowers/plans/2026-11-25-passagem-de-bastao.md).

Foram consultados os dois ambientes com `node scripts/check-deployment.js <origem>`: postagens responderam JSON/200 e login vazio JSON/400. Isso confirma encaminhamento básico da API; não comprova login de uma conta, envio de e-mail, Google, entrega push ou operações autenticadas. A navegação pública em celular/desktop também foi conferida separadamente. Os testes com API simulada não identificam sozinhos uma rota que falta no backend, como ocorreu em remoção de participante.

Antes de operar com dados reais, homologar com front e backend reais: cadastro/código/reenvio, Google, expiração/logout, aprovação, tarefas entre contas, edição/exclusão de recursos, chat e push em dispositivos diferentes. Executar também testes em PostgreSQL e backups restauráveis.

## 12. Problemas e trabalho restante

Os itens são achados de código/integração, separados de configuração que precisa ser confirmada no servidor. Não foram provocadas exclusões nem explorações no ambiente publicado.

| Prioridade | Situação e evidência | Próxima ação |
| --- | --- | --- |
| Alta | Front chama `/usuarios/{id}/remover-delegacao/`, ausente em `core/views/user.py`. Browser mock simula uma ação que o servidor não fornece. | Implementar retirada de vínculo com autorização e regra de tarefas; testar integração real. Não excluir a conta. |
| Alta | `SECRET_KEY` tem fallback previsível e `ALLOWED_HOSTS=['*']` em `app/settings.py`. Configuração efetiva do servidor não foi inspecionada. | Exigir chave própria no deploy, restringir hosts e revisar `check --deploy`; confirmar segredos reais com o responsável. |
| Alta | Repositório de documentação contém credenciais de exemplo públicas; `.env.example` do backend também tinha senha literal, esvaziada nesta entrega. | Remover senhas da documentação e trocar credenciais caso tenham sido usadas. Limpar o arquivo atual não resolve cópias ou histórico. |
| Alta | Inscrição push aceita URL genérica e não limita explicitamente destinos/provedores ou quantidade por usuário (`push_subscription.py`). O servidor envia requisições a esses destinos. | Validar endpoint/chaves, impedir destinos privados/indevidos e limitar registro. Revisar também política de saída da hospedagem. |
| Média | Transporte push percorre inscrições na requisição original, com timeout por destino (`core/services/push.py`). | Medir volume e mover entrega para processamento separado com repetição controlada, sem exigir nova infraestrutura antes de dimensionar. |
| Média | Excluir um usuário pode apagar tarefas criadas por ele (`Task.creator` usa CASCADE). | Definir desativação/arquivamento e preservação de autoria/escopo antes de permitir exclusões operacionais. |
| Média | Serializers de tarefa e cronograma não comparam datas efetivas de início/fim. | Validar criação e PATCH parcial no backend; manter testes de limites e fuso. |
| Média | Remover foto envia nulo, mas `OwnedImageField` do perfil não o aceita; aluno sem país tem PATCH bloqueado por `HasDelegationForWrite`. | Alinhar contrato de remoção de foto e decidir se pendentes podem corrigir o próprio perfil. Não liberar edição de privilégios. |
| Média | Turma é obrigatória na interface de cadastro de aluno, mas os campos correspondentes do cadastro no backend ainda são opcionais. | Definir a regra e aplicá-la também no servidor; testar envio fora do formulário. |
| Média | Carregamento de país/usuários na gestão de delegação não invalida resposta de uma rota anterior; listas de documentos/cronogramas também merecem revisão de isolamento ao trocar conta. | Acrescentar testes de troca rápida de rota/sessão e resposta lenta antes de modificar os stores. |
| Média | OpenAPI apresenta avisos/erros de introspecção: APIs push sem schema completo, tipos ausentes, serializers `depth` e querysets dependentes do usuário. | Corrigir anotações e serializers; não considerar `spectacular --validate` limpo só porque termina com exit code 0. |
| Média | Recuperação/alteração de senha não tem fluxo completo integrado ao site. | Especificar telas, token, envio, expiração e confirmação de alteração. Reutilizar recursos do allauth com contrato documentado. |
| Média | Avaliador e notas não implementados; cadastro controlado/convites de organizadores também incompleto. | Desenvolver o escopo da seção 13 e definir provisionamento de contas. |
| Planejamento | PDF enviado não é integrado ao fluxo de links; ordem manual do Kanban não persiste; categorias de mural não existem. | Confirmar requisitos antes de acrescentar entidades, campos e telas. |
| Planejamento | O router não tem tela 404. Atividades do perfil exigem detalhes por tarefa e o chat recarrega histórico inteiro periodicamente; a criação de delegação depende da bandeira em CDN externa. | Acrescentar tratamento de rota desconhecida e medir consultas/volume; planejar paginação incremental e alternativa para a bandeira quando necessário. |
| Operação | Cron de atrasos, entrega SMTP/Google/push, backups, restrições de cookies e versão de Python dependem da implantação. | Registrar responsáveis e evidências de homologação; não marcar como resolvido somente por testes locais. |

## 13. Próximo sistema: avaliador e notas — não implementado

### Requisitos já definidos pelo solicitante

O avaliador selecionará **uma delegação** e registrará notas nas diferentes modalidades/temas, como **mesa de cooperação, desafio gastronômico e debate**. O sistema calculará médias da delegação com base nas notas. A delegação consultará os resultados **separados por tema**, na área correspondente.

A área do avaliador terá **o sistema de avaliação e as páginas já disponíveis ao visitante**, como mural e história. Não terá gestão de delegações/participantes, criação de cronogramas/documentos, Kanban de aluno nem chat da organização. Essa separação precisa existir nos endpoints e nas rotas, além da navegação visível. A restrição institucional de e-mail aparece hoje na interface, mas precisa de decisão e implementação no servidor para o novo fluxo.

Nenhum modelo, migração, endpoint, cálculo ou tela de lançamento foi criado nesta simplificação. O papel `evaluator` e as abas “Notas em construção” não representam esse sistema pronto.

### Desenho sugerido para a próxima equipe validar

Manter implementação simples em Django/DRF e Vue:

1. Cadastrar temas/modalidades de avaliação, sem usar IDs fixos de categorias de tarefa como se fossem os mesmos temas.
2. Registrar uma avaliação com avaliador autenticado, delegação, tema, nota e datas; considerar edição do evento para preservar históricos anuais.
3. Validar no serializer quem pode registrar, escala permitida e regra de duplicidade. O servidor determina o avaliador pela sessão; não aceitar autor arbitrário enviado pelo navegador.
4. Disponibilizar um resumo por delegação/tema com quantidade de avaliações e média. Calcular no servidor a partir das avaliações, evitando confiar na média enviada pelo cliente ou guardar cópias divergentes.
5. Criar tela do avaliador: selecionar delegação → tema → preencher → revisar → salvar → confirmar resultado/permitir correção conforme a regra aprovada.
6. Criar consulta de notas da delegação agrupada por tema, com vazio, carregando e erro. Definir quem vê notas individuais e quem vê apenas médias.

Como proposta inicial, uma média aritmética por tema seria `soma das notas válidas / quantidade de avaliações válidas`. Exemplo: notas 8, 6 e 10 no Debate resultam em média 8 nesse tema. O tema sem avaliação deve aparecer como “Sem avaliações”, não como zero. Não misturar notas de temas ou anos diferentes nem calcular média das médias sem uma regra explícita de pesos. Se a organização desejar média geral/ranking, decidir os pesos e critérios antes de implementá-los.

O cadastro de temas pode relacionar-se a uma atividade do cronograma, mas **não é automaticamente o mesmo cadastro**: hoje “comida típica” é um subtipo cultural, enquanto “desafio gastronômico” foi citado como modalidade de avaliação. Confirmar o mapeamento com a organização.

### Decisões que ainda precisam da organização

| Assunto | Decisão necessária |
| --- | --- |
| Escala e critérios | Intervalo, casas decimais, rubrica e eventual peso de cada critério. Não assumir 0–10 como regra já aprovada. |
| Unicidade | Uma nota por avaliador/delegação/tema ou avaliações por apresentação/rodada? |
| Cadastro de avaliadores | Quem autoriza as contas; exigência institucional e eventual atribuição de temas/delegações. |
| Revisões | Pode corrigir/excluir? Até quando? Quem audita a alteração? |
| Divulgação | Resultados imediatos ou liberados pela organização? Mostrar notas individuais e nomes de avaliadores? |
| Média geral | Existe? Pesos iguais por tema ou por avaliação? Critério de desempate e arredondamento? |
| Ausência de nota | Como tratar não participação, desclassificação ou mínimo de avaliadores? |
| Histórico anual | Como identificar edição do evento e preservar avaliações antigas? |

Critérios mínimos de aceite: avaliador não acessa área de aluno/organização; aluno não lança notas; uma delegação não consulta resultados privados de outra; autoria não pode ser falsificada; limites e duplicidade são validados no back; médias cobrem zero válido, decimais, ausência de avaliações e correções; a UI se recupera de falha sem duplicar envio. Homologar com mais de um avaliador e mais de uma delegação.

## 14. O que foi simplificado nesta entrega

No front, foram retirados Firebase e a integração de autenticação órfã, componentes sem consumidor, estados preenchidos com dados fictícios e wrappers/métodos sem chamada. A autenticação continua em allauth/JWT; push continua em VAPID. A remoção da dependência Firebase também retirou suas entradas transitivas do lockfile, sem atualizar as demais versões. O lint voltou a apontar variáveis não usadas, e o Vite deixou de carregar duas vezes a mesma configuração.

No back, foi removido o caminho antigo de cadastro que não era roteado, mantendo o cadastro real allauth; serializers, imports e arquivos vazios sem uso; scripts de população/geração incompatíveis ou sem consumidor; configuração Node vazia e hook que reescrevia `.env` sem que a aplicação usasse o resultado. A dependência JWT duplicada foi consolidada. Migrações e geração de diagrama agora são comandos explícitos. Foram preservados modelos, histórico de migrações, permissões e testes.

Não foi feita reescrita de arquitetura, implantação, carga de dados, remoção de campos públicos do banco nem implementação de notas. As correções funcionais da seção 12 continuam sendo tarefas futuras, salvo onde a própria tabela indica correção nesta entrega.

## 15. Ordem sugerida de continuidade

Começar executando o projeto e a suíte isolada, conferindo a configuração sem usar contas reais. Corrigir a retirada de participante e as incompatibilidades de perfil/data; revisar configuração e destinos push antes de ampliar o uso. Em seguida, homologar autenticação e operação com API real e registrar dados iniciais/backup/agendamento.

Depois, fechar com a organização as decisões de avaliação e implementar um fluxo vertical pequeno: uma modalidade, dois avaliadores e uma delegação, com média conferida. Só ampliar para todas as modalidades após validar permissões e regras de correção/publicação. Por fim, tratar PDF integrado, ordem persistida e outras melhorias confirmadas como requisito.
