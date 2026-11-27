# Autenticação do frontend

O frontend usa allauth/JWT pelo backend. Cadastro por e-mail cria aluno sem delegação, exige código de seis dígitos e só então recebe tokens. Login Google usa navegação ao backend, sessão, cookies e CSRF; não há Firebase.

## Desenvolvimento

No `.env.local`, usar `VITE_API_BASE_URL=http://localhost:8000`. Executar `npm install` e `npm run dev`; acessar `http://localhost:5173`. Usar uma origem consistente para cookies e callback Google. O backend local é executado com PDM conforme seu README.

## Arquivos principais

- `src/services/authService.js`: código, reenvio, CSRF, início Google, troca de sessão por JWT e logout.
- `src/services/userService.js`: login, cadastro, perfil e operações de participantes.
- `src/stores/userStore.js`: conclusão de login, carregamento do perfil e limpeza da sessão local.
- `src/plugins/axios.js`: Bearer, refresh compartilhado e proteção contra respostas de sessão antiga.
- `src/services/authProfiles.js`: opções de perfil e validações da interface. Não concede privilégios no servidor.

## Cadastro e confirmação

O cadastro envia e-mail, nome, senha e os dados escolares do aluno. A interface exige turma para aluno; a obrigatoriedade correspondente ainda deve ser aplicada no backend. Foto opcional é enviada como arquivo `foto` no mesmo multipart do cadastro; não enviar o arquivo como ID nem fazer upload anônimo separado.

Guardar somente e-mail e `session_token` temporários em sessionStorage; senha permanece na memória do formulário. Confirmar código em `/registro/confirmar-email/` com `X-Session-Token`, preservando zeros iniciais. Após sucesso, salvar JWT, limpar a etapa pendente e carregar `/usuarios/me/`. Reenvio e expiração devem respeitar a resposta e os limites do servidor.

Confirmar e-mail ou entrar com Google não comprova vínculo acadêmico. A consulta de matrícula em fonte oficial do instituto ainda é requisito futuro.

## Google e logout

Buscar CSRF com cookies, iniciar Google por formulário POST no backend e aguardar o callback. Ao retornar, obter novo CSRF e trocar a sessão em `/token/session/` sem Bearer antigo. Tratar cancelamento, sessão ausente e necessidade de comprovação adicional. A vinculação de conta existente depende de prova validada pelo servidor; consultar o [contrato completo do backend](https://github.com/SINUCA-IFC/SINUCA-BACK/blob/main/docs/django-allauth.md).

No logout, encerrar a sessão Django com cookies/CSRF e limpar tokens e dados privados locais mesmo diante de erro de rede. JWT já emitido permanece válido até expirar conforme o contrato atual.

## Testar e publicar

```sh
npm test
npm run lint
npm run build
npm run test:browser
```

Playwright usa Chrome, API simulada e Vite na porta 4174. Testar separadamente cadastro/código/reenvio, Google, troca de conta, expiração e logout com backend real.

No build publicado, definir `VITE_API_BASE_URL` com a origem HTTPS do backend; atualizar também rewrite em `vercel.json`. Backend exige SMTP, credenciais OAuth, callback correto, origens CORS/CSRF e cookies compatíveis com a hospedagem. Nunca colocar segredos em variáveis `VITE_*`. Rotas como `/auth/callback` precisam do fallback para `index.html`.
