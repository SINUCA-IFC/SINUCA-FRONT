# Edição e remoção de recursos

Adicionar edição e remoção de cronogramas e remoção de documentos no painel da delegação do organizador, respeitando as permissões existentes no backend. Reutilizar o formulário de criação para editar, carregando os dados completos pelo ID antes de permitir salvar. Preservar datas, horários, países, categoria, tipo e documentos associados.

As ações aparecem nos cartões existentes. A remoção usa um modal com nome do recurso, confirmação, estado de envio e erro com possibilidade de tentar novamente. A lista só muda depois do sucesso da API. A exclusão é global: atividades e documentos compartilhados saem de todas as delegações, com aviso na confirmação.

## Abordagem

Reutilizar o formulário existente evita diferenças entre criar e editar. Um formulário separado duplicaria os campos e as validações. A confirmação de remoção será um componente compartilhado entre os dois recursos, seguindo os modais existentes. Não alterar permissões nem publicar automaticamente.

## Verificação

Testar com Playwright preenchimento, cancelamento, atualização, exclusão, falhas da API, categorias e telas pequenas. Verificar desenvolvimento em localhost:5173 e consultar a versão publicada sem alterar dados reais. Informar que a publicação está pendente enquanto não houver deploy.
