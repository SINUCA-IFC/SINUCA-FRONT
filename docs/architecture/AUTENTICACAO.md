# Autenticação do frontend

O frontend usa JWT nas APIs e cookies no início/retorno do Google e no logout da sessão Django. Login e cadastro usam o
mesmo botão Google. O backend decide se reutiliza a conta ou cria o perfil.

## Executar localmente

No `.env.local`:

```dotenv
VITE_API_BASE_URL=http://localhost:8000
```

```powershell
npm.cmd install
npm.cmd run dev -- --host localhost --port 5173 --strictPort
```

Abra `http://localhost:5173`. O backend deve estar executando em
`http://localhost:8000`. Não misture localhost com 127.0.0.1. A configuração
também normaliza uma variável antiga terminada em `/api`.

## Implementação

- `src/services/authService.js`: confirmação e reenvio com X-Session-Token,
  estado pendente em sessionStorage, CSRF, formulário Google, troca de sessão
  por JWT, logout e mensagens de erro.
- `src/stores/userStore.js`: conclusão centralizada do login, perfil com Bearer,
  cadastro pendente e limpeza local mesmo com falha de rede.
- `src/plugins/axios.js`: base local configurável, exclusão de endpoints de
  autenticação do Bearer/refresh, refresh compartilhado e proteção contra
  respostas tardias após logout.
- `src/views/` e `src/components/forms/`: login, cadastro em dois passos,
  confirmação de seis dígitos e callback. Layout, cores, componentes e destino
  autenticado `/delegacao` preservados. As permissões continuam vindo do perfil.
- O formulário mantém a senha apenas na memória da página. Somente e-mail e
  session_token são persistidos para retomar a confirmação. Foto opcional usa
  o upload existente antes do cadastro e envia o ID retornado, nunca o arquivo
  como ID. Turma vazia/ID zero são omitidos.
- `AppInput` encaminha os atributos ao input e associa label/id, permitindo
  colagem, teclado numérico, autocomplete e validação nativa do código.
- ESLint foi adicionado. A única correção fora da autenticação remove uma
  inicialização redundante de `totalPages`, sem mudar a paginação.

## Validação automatizada

```powershell
npm.cmd test
npm.cmd run lint
npm.cmd run build
npm.cmd run test:browser
```

Os testes de navegador usam Chrome instalado e iniciam Vite em localhost:5173
quando necessário. Eles interceptam a API exclusivamente no ambiente de testes.
Os testes Node também simulam as respostas HTTP. Nenhum mock é importado pelo
produto e nenhuma conta real é criada por esses testes.

Cobertura: cadastro → código → JWT → perfil, senha divergente, login verificado
e pendente, persistência ao recarregar, zero inicial, reenvio e rotação de token,
erros 400/401/409/410/429/500, refresh concorrente e falha, navegação Google por
formulário, CSRF renovado, callback sem Bearer e sem troca duplicada, cancelamento,
403, logout com/sem rede e proteção contra refresh tardio. Inclui tela mobile.

## Validar com o backend real

### E-mail e senha

1. Abra `/cadastro`, informe e-mail novo, senha e confirmação; complete o nome
   e, se desejar, turma, matrícula e foto. O servidor define as permissões.
2. Confira a etapa de confirmação em `/cadastro?etapa=email`, ainda sem access/refresh.
3. No ambiente local, obtenha o código no terminal do backend e digite os seis
   dígitos na interface. O código não aparece no JSON nem na interface do site.
4. Recarregue antes de confirmar para testar a retomada. Teste um código errado
   e o reenvio; o botão aguarda 15 segundos, respeitando também o limite servidor.
5. Ao confirmar, confira a entrada em `/delegacao` e a chamada
   `/api/usuarios/me/` com Bearer. Saia e entre com e-mail/senha novamente.
6. Para testar login pendente, crie outra conta e volte ao login antes de
   confirmar. A resposta 401 deve manter a tela de login e informar que o
   cadastro está incompleto, com a ação “Concluir cadastro”, sem chamar refresh.
   Contas já confirmadas entram diretamente, sem pedir código novamente.

A aplicação não solicita confirmação por telefone. Caso o próprio Google peça
uma verificação de segurança, essa etapa pertence à conta Google e não é
controlada pelo frontend SINUCA.

### Google real

1. Em `/login` ou `/cadastro`, clique em “CONTINUAR COM GOOGLE”. Verifique a
   navegação para o backend e para o Google, e autorize com uma conta real.
2. Após o retorno técnico a `/auth/callback`, o login conclui o acesso no mesmo
   formulário. Confira novo CSRF, uma troca em
   `/api/token/session/`, armazenamento de access/refresh e perfil com Bearer.
3. Teste cancelamento e logout. Depois do logout, confirme a limpeza local e a
   chamada `/api/auth/logout/`. JWTs já emitidos seguem a expiração do servidor.
4. Teste uma conta SINUCA ativa cujo e-mail Gmail ou Workspace já esteja
   confirmado. O primeiro acesso Google associa a identidade à conta existente.
   Para um e-mail novo, o Google cria o perfil com o nome recebido e foto opcional.

**Os testes simulados não comprovam consentimento real, credenciais Google ou
configuração remota do OAuth. Essa autorização precisa ser realizada com uma
conta real no navegador.** Nenhuma credencial Google é necessária no frontend.

## Diagnóstico de sessão Google recusada

Uma resposta 403 com `detail: As credenciais de autenticação não foram fornecidas.`
em `/api/token/session/` significa que a requisição não possui uma sessão Django
autenticada. O frontend já usa `withCredentials: true` e CSRF renovado. Enviar o
nome ou e-mail do Google pelo cliente não substitui a autenticação do servidor.

O callback técnico retorna ao formulário de login. Contas elegíveis concluem a
sessão com o Google e entram direto. Se o servidor exigir confirmação adicional,
o login exibe o aviso e oferece o fluxo padrão de e-mail. A tela separada de
vinculação foi retirada da interface.

## E-mail de confirmação

O Django usa os modelos de account/email na pasta templates do backend. Tanto
cadastro quanto reenvio incluem HTML com o código destacado e texto simples
com o mesmo código. A validade continua em dez minutos.

## Deploy em dev hospedado

- Configure `VITE_API_BASE_URL` com a origem HTTPS do backend no ambiente que
  roda `npm run build`. O valor é incorporado ao bundle durante o build. A
  compilação para deploy recusa `localhost`. Para compilar localmente com a
  API em `localhost`, use `npm run build -- --mode development`.
- No backend, configure `FRONTEND_URL` com a origem HTTPS do frontend,
  `MODE=PRODUCTION`, `DEBUG=False`, `SECRET_KEY`, `DATABASE_URL` e
  `CLOUDINARY_URL` para o armazenamento de mídia. Use o banco do dev hospedado
  e aplique as migrações antes de liberar a aplicação.
- Mantenha frontend e backend no mesmo site HTTPS (por exemplo, subdomínios
  irmãos). O retorno do Google troca a sessão Django por JWT usando cookies.
  Atrás de um proxy TLS que sobrescreve `X-Forwarded-Proto`, configure
  `TRUST_PROXY_HTTPS=True`. Isso permite gerar o callback público em HTTPS.
- No cliente OAuth Google, autorize exatamente
  `https://<backend-dev>/accounts/google/login/callback/`. Configure
  `GOOGLE_CLIENT_ID` e `GOOGLE_CLIENT_SECRET` no backend. Se o cliente OAuth
  estiver em modo de teste, inclua a conta que fará a validação.
- Para entrega de e-mails, configure `EMAIL_BACKEND` como
  `django.core.mail.backends.smtp.EmailBackend` e defina as variáveis
  `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_HOST_USER`, `EMAIL_HOST_PASSWORD`,
  `EMAIL_USE_TLS`, `EMAIL_USE_SSL` e `DEFAULT_FROM_EMAIL` no backend. A senha
  de app fica no gerenciador de configuração do deploy.
- Verifique o cadastro por código, o acesso Google e o logout nas URLs
  públicas após subir. A hospedagem do frontend deve servir `index.html`
  também em rotas diretas como `/auth/callback`.
