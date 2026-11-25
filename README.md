# SINUCA — Frontend

Interface do Simulado Interdisciplinar das Nações Unidas do Campus Araquari, com Vue 3, Vite, Vue Router, Pinia, Axios e PWA.

- [Passagem de bastão: funcionamento, operação e pendências](docs/PASSAGEM-DE-BASTAO.md).
- [Revisão recomendada da documentação PI](docs/REVISAO-DOCUMENTACAO-PI.md).
- [Backend](https://github.com/SINUCA-IFC/SINUCA-BACK).
- [Documentação do projeto](https://github.com/SINUCA-IFC/SINUCA-Documentacao-PI).
- [Site publicado](https://sinuca-ifc-mocha.vercel.app).

## O que existe

Visitantes acessam mural e história. Alunos cadastrados confirmam e-mail, aguardam atribuição de delegação e usam tarefas/Kanban, cronogramas, documentos, perfil e chat. Organizadores gerenciam delegações, aprovação de participantes, postagens, cronogramas e links, além das conversas com as delegações. Há PWA e notificações Web Push com VAPID.

A área do avaliador e o sistema de notas estão **em construção** e não foram implementados nesta revisão. A retirada de participante tem interface, mas falta a rota correspondente no backend. Consulte a passagem de bastão antes de considerar todos os fluxos homologados. API simulada em testes não comprova integração real.

## Instalar e executar

Requisitos: Git, npm e Node compatível com `^20.19.0 || >=22.12.0`.

```sh
git clone https://github.com/SINUCA-IFC/SINUCA-FRONT.git
cd SINUCA-FRONT
npm ci
npm run dev
```

Acesse `http://localhost:5173`. Sem configuração local, o Vite encaminha as chamadas à API publicada. Para trabalhar com o backend local, criar `.env.local`:

```dotenv
VITE_API_BASE_URL=http://localhost:8000
```

Reinicie o Vite após alterar variáveis. Confira o destino da API antes de cadastrar ou remover dados; um front local pode estar usando o banco publicado. Nunca colocar segredos em variáveis `VITE_*`, pois entram no build público.

## Organização do código

```text
src/
  views/         páginas
  components/    partes das telas e formulários
  stores/        estado compartilhado com Pinia
  services/      chamadas HTTP e contratos de autenticação
  router/        rotas e guardas
  plugins/       configuração do Axios
  composables/   lógica reutilizável de interface
  utils/         funções auxiliares
  sw.js          Service Worker, cache público e push
public/          arquivos públicos
tests/           testes automatizados e navegador
```

Uma alteração normalmente segue componente → store/service → Axios → API. Manter métodos explícitos e nomes claros. Não remover permissões, paginação nem os contadores que impedem respostas antigas de atualizar outra sessão. O catálogo de países e o conteúdo histórico são mantidos em arquivos do projeto.

## Comandos

| Comando | Uso |
| --- | --- |
| `npm ci` | Instalar conforme o lockfile. |
| `npm run dev` | Iniciar desenvolvimento. |
| `npm test` | Testar services, stores, autenticação e contratos locais. |
| `npm run lint` | Verificar código, incluindo variáveis sem uso. |
| `npm run test:browser` | Testar telas no Chrome com API simulada e Vite próprio na porta 4174. |
| `npm run build` | Gerar `dist/` e Service Worker de produção. |
| `npm run preview` | Conferir o build localmente. |
| `npm run format` | Formatar `src/`; revisar o diff antes de manter alterações em massa. |

Os testes de navegador precisam do Chrome disponível; a configuração está em `playwright.config.js`. Evite alterações nos componentes durante a suíte: o HMR pode interromper o cenário.

## API, sessão e produção

Chamadas comuns usam `/api`. `vite.config.js` faz proxy em desenvolvimento; `vercel.json` faz rewrite para `https://sinuca-backend.class.fabricadesoftware.ifc.edu.br` em produção. O rewrite deve vir antes do fallback das rotas para `index.html` e preservar a barra final do Django.

Google, CSRF e logout de sessão usam diretamente a origem do backend com cookies. Essa origem precisa ser a mesma do callback Google. O Axios acrescenta o JWT às demais chamadas e centraliza a renovação; o perfil real vem de `/usuarios/me/`.

`.env.production` aponta para a API HTTPS publicada. Variáveis do painel de build e `.env.local` podem sobrescrever esse valor. Ao mudar a API, atualizar também o destino de `vercel.json`. Executar `npm run build` e publicar `dist/`; build local não significa deploy concluído.

O backend precisa de SMTP/Google/VAPID configurados, CORS/CSRF com origens exatas e cookies adequados à topologia. Ver [autenticação do backend](https://github.com/SINUCA-IFC/SINUCA-BACK/blob/main/docs/django-allauth.md) e [notificações](docs/NOTIFICACOES.md). A PWA guarda o shell público; dados privados da API e edição offline não são oferecidos pelo cache.

## Rotas principais

| Rota | Uso |
| --- | --- |
| `/mural`, `/historia` | Conteúdo público. |
| `/bem-vindo`, `/login`, `/cadastro` | Entrada e autenticação. |
| `/delegacao` | Área do aluno e espera de atribuição. |
| `/delegacao/nova-tarefa`, `/delegacao/tarefas/:id/editar` | Formulário de tarefa. |
| `/delegacao/schedule/:id` | Detalhes da atividade. |
| `/organizador`, `/organizador/delegacoes/:id` | Gestão da organização. |
| `/chat/:countryId?`, `/perfil` | Chat autorizado e perfil. |

## Conferir roteamento após publicação

```sh
node scripts/check-deployment.js https://sinuca-ifc-mocha.vercel.app
node scripts/check-deployment.js http://localhost:5173
```

O verificador espera JSON/200 em postagens e JSON/400 no login vazio. HTML, 405 ou redirecionamento indicam problema de roteamento. Isso não substitui homologação autenticada com contas de teste, Google, e-mail e push. Registre os commits publicados e as verificações reais na passagem de bastão.
