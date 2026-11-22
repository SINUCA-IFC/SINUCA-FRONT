# SINUCA — Front-end

## Produção

O arquivo `.env.production` configura a API pública:
`https://sinuca-backend.class.fabricadesoftware.ifc.edu.br`.
Execute `npm ci` e `npm run build`; publique a pasta `dist` com fallback das
rotas do Vue para `index.html`. Uma variável `VITE_API_BASE_URL` no painel de
build tem prioridade sobre esse arquivo: remova valores antigos ou use a mesma
URL pública. Reinicie o Vite se estiver rodando durante uma alteração de ambiente.

O backend publicado precisa conter as rotas de `SINUCA-BACK/app/urls.py`,
incluindo `/api/auth/csrf/`, `/api/auth/google/`,
`/api/registro/confirmar-email/` e `/api/registro/reenviar-codigo/`.
Atualizar apenas o frontend não disponibiliza essas rotas no servidor.

No painel de ambiente **do backend**, configure:

```dotenv
MODE=DEPLOY
DEBUG=False
FRONTEND_URL=https://sinuca-ifc-mocha.vercel.app
FRONTEND_ALLOWED_ORIGINS=https://sinuca-ifc-mocha.vercel.app,http://localhost:5173
AUTH_COOKIE_SECURE=True
AUTH_CROSS_SITE_COOKIES=True
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_USE_SSL=False
EMAIL_HOST_USER=sinuca.ifc.no.reply@gmail.com
DEFAULT_FROM_EMAIL=SINUCA <sinuca.ifc.no.reply@gmail.com>
```

Cadastre `EMAIL_HOST_PASSWORD` como segredo usando uma senha de app desse Gmail
(com verificação em duas etapas habilitada). Cadastre também `GOOGLE_CLIENT_ID`
e `GOOGLE_CLIENT_SECRET`, obtidos de um cliente OAuth do tipo aplicativo Web.
Esses três valores ficam somente no servidor; nunca em variáveis `VITE_*`.

No cliente OAuth do Google, autorize exatamente este URI de redirecionamento:

```text
https://sinuca-backend.class.fabricadesoftware.ifc.edu.br/accounts/google/login/callback/
```

Defina `FRONTEND_URL` no backend com a origem HTTPS pública do frontend, sem
caminho nem barra final. O backend usa esse valor para CORS, CSRF e retorno do
Google. Use `TRUST_PROXY_HTTPS=True` somente se o proxy da hospedagem remover e
reescrever corretamente `X-Forwarded-Proto`. Após alterar as variáveis, reinicie
o serviço. Valide recebimento real do código, reenvio e login Google em produção.

`AUTH_CROSS_SITE_COOKIES=True` requer a versão do backend que lê essa variável.
Ela habilita cookies `SameSite=None; Secure` para o fluxo atual entre Vercel e IFC,
mantendo CORS restrito a `FRONTEND_ALLOWED_ORIGINS` e a verificação CSRF. Navegadores que
bloqueiam cookies de terceiros ainda podem impedir o login Google; nesse caso,
publique o frontend em um domínio do mesmo site da API. Ao trocar o domínio,
atualize `FRONTEND_URL` e reavalie a necessidade desse modo de cookies.

O `vercel.json` configura o build, o fallback de rotas Vue e a revalidação do
manifesto/service worker. Também redireciona o caminho antigo
`/public/logo-sinuca.svg` para `/logo-sinuca.svg`. Essas correções só ficam
disponíveis após publicar o commit que as contém na Vercel.

Referências: [variáveis do Vite](https://vite.dev/guide/env-and-mode),
[senhas de app Google](https://support.google.com/accounts/answer/185833) e
[OAuth Google no allauth](https://docs.allauth.org/en/latest/socialaccount/providers/google.html).

This template should help get you started developing with Vue 3 in Vite.
Interface web do **Simulado Interdisciplinar das Nações Unidas do Campus Araquari (SINUCA)**, projeto do Instituto Federal Catarinense.

A aplicação centraliza notícias, materiais de apoio, tarefas e informações das delegações, facilitando a comunicação entre a organização e os participantes.

A API utilizada pela interface está no [SINUCA-BACK](https://github.com/SINUCA-IFC/SINUCA-BACK).

FIGMA: https://www.figma.com/design/SxdVw9n8771wtU9HICf8Jg/SINUCA---LAYOUT?node-id=422-435&t=YW5CfsnfCA3GOPeE-1

## Funcionalidades

- Mural de notícias e comunicados.
- Cadastro e autenticação com JWT.
- Área autenticada da delegação.
- Quadro de tarefas com criação e edição.
- Consulta de cronogramas e detalhes dos debates.
- Acesso a documentos e materiais de apoio.
- Interface adaptada para dispositivos móveis e desktop.
- Configuração de PWA com manifesto e service worker.

As páginas de **chat** e **história** estão em construção na versão atual da `main`.

## Tecnologias

| Tecnologia | Finalidade |
| --- | --- |
| Vue 3 | Interface e componentes |
| Vite 7 | Desenvolvimento e build |
| Vue Router | Navegação |
| Pinia | Gerenciamento de estado |
| Axios | Comunicação com a API |
| vite-plugin-pwa | Configuração de PWA |
| Material Design Icons | Ícones |
| Prettier | Formatação |

## Pré-requisitos

- Git.
- Node.js compatível com `^20.19.0 || >=22.12.0`.
- npm.
- API do SINUCA disponível.

## Instalação

```bash
git clone https://github.com/SINUCA-IFC/SINUCA-FRONT.git
cd SINUCA-FRONT
npm ci
```

## Configuração da API nos dois ambientes

O frontend suporta `http://localhost:5173` e `https://sinuca-ifc-mocha.vercel.app`.
As chamadas comuns usam `/api`: o Vite encaminha para `VITE_API_BASE_URL` em
desenvolvimento, e `vercel.json` encaminha para a API do IFC em produção.
O rewrite `/api/(.*)` deve ficar antes do fallback para `index.html` e preservar a barra final exigida pelo Django.
Ao mudar a API de produção, atualize tanto `.env.production` quanto o destino
em `vercel.json`.

As chamadas que usam cookies (CSRF, troca da sessão Google e logout) acessam
diretamente `VITE_API_BASE_URL`, para manter os cookies no domínio do callback
Google. O backend deve autorizar as duas origens em `FRONTEND_ALLOWED_ORIGINS`,
com CORS de credenciais e CSRF habilitados. Isso exige publicar o backend atualizado.

Para usar a API local, configure `.env.local`:

```dotenv
VITE_API_BASE_URL=http://localhost:8000
```

Para usar a API publicada em desenvolvimento:

```dotenv
VITE_API_BASE_URL=https://sinuca-backend.class.fabricadesoftware.ifc.edu.br
```

Reinicie o Vite após alterar o ambiente. No deploy da Vercel, mantenha a URL
HTTPS pública. Nunca coloque segredos Google em variáveis `VITE_*`.
O service worker fica habilitado somente no build de produção.

## Execução

```bash
npm run dev
```

Acesse o endereço informado no terminal, normalmente:

```text
http://localhost:5173
```

Para carregar a área da delegação, o usuário precisa estar associado a um país no back-end. O cadastro público da API cria alunos aguardando atribuição de delegação pela organização.

## Comandos

| Comando | Descrição |
| --- | --- |
| `npm ci` | Instala as dependências do lockfile |
| `npm run dev` | Inicia o servidor de desenvolvimento |
| `npm run build` | Gera o build em `dist/` |
| `npm run preview` | Serve o build para conferência local |
| `npm run format` | Formata os arquivos de `src/` |

O projeto ainda não define scripts de testes automatizados ou lint no `package.json`.

## Rotas principais

| Rota | Conteúdo |
| --- | --- |
| `/` | Redirecionamento conforme a sessão |
| `/mural` | Notícias e comunicados |
| `/bem-vindo` | Entrada para autenticação |
| `/login` | Login pelo fluxo de boas-vindas |
| `/cadastro` | Cadastro de participante |
| `/delegacao` | Área autenticada da delegação |
| `/delegacao/nova-tarefa` | Criação de tarefa |
| `/delegacao/tarefas/:id/editar` | Edição de tarefa |
| `/delegacao/schedule/:id` | Detalhes do cronograma |
| `/chat` | Em construção |
| `/historia` | Em construção |

## Autenticação

O cliente armazena `access_token` e `refresh_token` no `localStorage`.

O Axios adiciona o token às requisições e tenta renovar o acesso quando necessário. As permissões sobre os recursos são verificadas pelo back-end.

## Estrutura

```text
public/             Arquivos públicos
src/
  assets/           Estilos e recursos visuais
  components/       Componentes reutilizáveis
  composables/      Lógica reutilizável de interface
  plugins/          Configuração do Axios
  router/           Rotas e regras de navegação
  services/         Chamadas à API
  stores/           Estado com Pinia
  utils/            Funções auxiliares
  views/            Páginas
  App.vue           Componente raiz
  main.js           Inicialização
static.json         Configuração de hospedagem estática
vite.config.js      Configuração do Vite e da PWA
```

## Publicação

```bash
npm run build
npm run preview
```

Publique o conteúdo de `dist/`.

Como o roteador utiliza `createWebHistory`, a hospedagem deve encaminhar as rotas da aplicação para `index.html`. O arquivo `static.json` descreve esse comportamento para plataformas compatíveis.

Configure a URL da API antes do build e utilize HTTPS para os recursos de PWA que exigem contexto seguro.

## Problemas comuns

| Problema | Verificação |
| --- | --- |
| Requisições vão para a API errada | Confira a atribuição ativa de `baseURL` |
| Delegação não carrega | Verifique a sessão e a associação do usuário a um país |
| Atualizar uma rota retorna 404 | Configure o fallback para `index.html` |
| Fotos locais não carregam | Confira a configuração de mídia do back-end |
| Interface antiga após publicação | Verifique o cache e o service worker |

## Referências

- [Back-end](https://github.com/SINUCA-IFC/SINUCA-BACK)
- [Organização SINUCA-IFC](https://github.com/SINUCA-IFC)
- [Documento do projeto](https://docs.google.com/document/d/17GRwIq2vJa5Fo7NMv2ppM04NwbgOPGmEZtuLE4Cn_as/edit)

### Verificar o deploy real

Depois de publicar, execute:

```bash
node scripts/check-deployment.js https://sinuca-ifc-mocha.vercel.app
node scripts/check-deployment.js http://localhost:5173
```

A verificação exige JSON nas postagens e no POST de login vazio (400 por campos
obrigatórios). HTML, redirecionamento ou 405 indicam falha de roteamento.
Se `/api/token` chega à API mas `/api/token/` entrega `index.html`, confira se o
rewrite publicado usa `/api/(.*)` com destino terminado em `/api/$1`.