# SINUCA-FRONT

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
FRONTEND_URL=https://sinuca-front-pedro-gabriel-goncalves-projects.vercel.app
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
mantendo CORS restrito a `FRONTEND_URL` e a verificação CSRF. Navegadores que
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

## Recommended IDE Setup

[VS Code](https://code.visualstudio.com/) + [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Recommended Browser Setup

- Chromium-based browsers (Chrome, Edge, Brave, etc.):
  - [Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd)
  - [Turn on Custom Object Formatter in Chrome DevTools](http://bit.ly/object-formatters)
- Firefox:
  - [Vue.js devtools](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)
  - [Turn on Custom Object Formatter in Firefox DevTools](https://fxdx.dev/firefox-devtools-custom-object-formatters/)

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Compile and Minify for Production

```sh
npm run build
```
