# Permissões e uploads — S07/S08

Revisão local de 11/11/2026. A implementação usa as permissões e os modelos existentes, com uma migração pequena para identificar o dono e o tamanho de novos arquivos.

## Permissões

| Operação | Participante | Organizador | Superusuário |
| --- | --- | --- | --- |
| Consultar usuários, cronogramas e links | Somente sua delegação; aluno pendente recebe listas vazias | Todas as delegações | Todas as delegações |
| Editar perfil | Próprio perfil, respeitando o bloqueio de escrita de aluno pendente | Próprio perfil e alunos sem privilégios administrativos | Qualquer perfil |
| Criar/excluir contas pela API de usuários | Bloqueado | Alunos sem privilégios; não pode excluir outras contas administrativas | Permitido |
| Alterar cronogramas e links | Bloqueado | Permitido | Permitido |
| Aprovar aluno e atribuir delegação | Bloqueado | Permitido | Permitido |

O cadastro público continua disponível em `/api/registro/`. País, papel e privilégios permanecem definidos pelo servidor. O acesso por país e a validação de responsáveis de tarefas continuam como antes. Um documento associado a uma atividade precisa estar disponível para todas as delegações dessa atividade; remover uma dessas delegações do documento exige primeiro corrigir a atividade.

## Uploads e cadastro com foto

- GET/POST `/api/media/images/` e `/api/media/documents/` exigem autenticação. A listagem contém somente os arquivos do próprio usuário, inclusive para organizadores.
- O servidor atribui o dono; o cliente não pode escolhê-lo. A associação por `foto_attachment_key` ou `flag_attachment_key` aceita somente imagens do solicitante.
- Imagens: JPEG/PNG, até 5 MiB e 4096 pixels por lado. PDFs: até 10 MiB. O tipo é conferido pelo conteúdo; a inspeção de MIME lê somente o início do arquivo.
- Cota combinada: 50 arquivos e 100 MiB por conta. Escritas usam transação e bloqueio da conta nos bancos que suportam `SELECT FOR UPDATE`.
- Limite de envio: 10 tentativas por hora por usuário. Cadastro: 30 tentativas por minuto por endereço de conexão, inclusive sem foto. Excesso retorna 429.
- O frontend envia a foto opcional como arquivo `foto` no mesmo `multipart/form-data` do cadastro. Não envia mais uma imagem anônima separada nem um ID numérico. Cadastro sem foto continua aceitando JSON.
- Dados inválidos são rejeitados antes da gravação. Se a criação do registro da imagem ou da conta falhar após salvar o arquivo, a aplicação tenta removê-lo do armazenamento e reverte os registros.

Os limites de tamanho e cota estão em `SINUCA-BACK/app/settings.py`; as taxas estão em `uploader/limits.py`. A verificação real de e-mail continua pendente, sem alteração nesta entrega.

## Migração e arquivos anteriores

Aplicar no ambiente do backend antes de executar a nova versão:

```sh
python manage.py migrate
```

A migração `uploader/0002_document_owner_document_size_image_owner_image_size.py` adiciona `owner` e `size`. Arquivos antigos mantêm seus vínculos e URLs. Como não há informação confiável do dono de todo arquivo antigo, eles ficam com `owner=NULL` e não aparecem na listagem de uploads. Podem ser administrados pelo Django Admin. A migração não lê o storage nem exclui arquivos antigos.

## Limites operacionais

As URLs já publicadas de mídia continuam acessíveis conforme o storage; restringir listagens JSON não torna um arquivo privado por URL. Não enviar documentos confidenciais contando apenas com essas permissões.

O throttle usa o cache configurado no Django. O cache padrão é local a cada processo; em produção com vários workers, configurar cache compartilhado e limites no proxy. O cadastro usa `REMOTE_ADDR`: atrás de um proxy, várias pessoas podem compartilhar esse limite. A validação de tamanho ocorre após o recebimento do multipart; o proxy também precisa limitar o corpo da requisição. Estes controles de infraestrutura não foram configurados nesta revisão.

Não houve alteração de credenciais, limpeza de histórico, migração do banco real ou publicação. S06 continua pendente.
