# Afazeres do SINUCA

Atualizado em 03/11/2026. Esta lista registra trabalho futuro; os itens abaixo não foram implementados nesta revisão.

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

## Pendências relacionadas

- [ ] Criar a tela administrativa para listar alunos pendentes e aprová-los com atribuição de país. As APIs e os métodos de service/store já existem.
- [ ] Implementar convites de organizadores validados no servidor.
- [ ] Conferir os vínculos de país de contas anteriores à correção do cadastro.

Referências: [integração front/back](architecture/INTEGRACAO-FRONT-BACK.md) e [auditoria](../AUDITORIA-2026-10-27.md).
