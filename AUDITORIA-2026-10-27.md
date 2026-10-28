# Auditoria funcional e de segurança — SINUCA

Data: **27/10/2026**, fuso America/Sao_Paulo. Escopo: **SINUCA-FRONT e SINUCA-BACK**.

**Parecer: há bloqueadores para uso com participantes e dados reais.** O projeto compila e vários fluxos funcionam, mas a auditoria identificou elevação de privilégios, alterações anônimas em dados do evento e exposição de informações sensíveis. A interface também apresenta falhas em operações centrais. Esses problemas são relevantes mesmo para um evento pequeno. O acompanhamento abaixo distingue as correções posteriores do levantamento original.

Na etapa de auditoria, nenhum código existente foi alterado. O banco original foi consultado somente para inspeção de estrutura e estatísticas. Foram adicionados apenas este relatório e os artefatos de auditoria. Não houve commit, publicação, rotação de credenciais ou operação contra a API pública. As evidências e revisões das seções seguintes descrevem essa etapa histórica.

## Acompanhamento das correções

### S01 — Corrigida no código local em 27/10/2026

Em `SINUCA-BACK/core/serializers/user.py`, os campos `is_staff`, `is_superuser`, `is_active` e `last_login` passaram a ser explicitamente somente leitura. `id`, `groups`, `country` e `role` também foram declarados somente leitura, preservando e explicitando as restrições existentes. A API de perfis continua retornando esses dados, mas não os modifica; os campos administrativos são gerenciados pelo Django Admin. Campos somente leitura enviados na requisição são ignorados pelo DRF, portanto uma resposta 200 não indica que privilégios foram aceitos.

Foram adicionados **oito testes de regressão** em `SINUCA-BACK/core/tests/test_user_privileges.py`, usando login JWT e banco de teste isolado. Antes da alteração, quatro falharam ao reproduzir concessão de privilégios por PATCH, PUT, edição de colega e criação de conta. Depois da alteração, **os oito passaram**, incluindo manutenção da edição de nome/e-mail, leitura de perfil, rejeição de anônimos e proteção do registro público contra injeção de privilégios. O acesso a outra delegação continua retornando 404 após a tentativa de autopromoção.

Validação executada com `django test core.tests --settings=sinuca_audit_settings`, usando o ambiente temporário da auditoria. Nenhuma migração de modelo foi necessária e o banco original não foi alterado. A correção ainda não foi publicada e não reverte privilégios que eventualmente tenham sido concedidos antes dela. A autorização para editar outros campos de colegas, os vínculos de delegação no cadastro e os demais achados continuam pendentes.

### S02 — Correção local de configuração e diagnóstico em 28/10/2026

Em `SINUCA-BACK/app/settings.py`, `DEBUG` passou a ser um booleano: somente `true`, `1`, `yes` e `on`, sem distinção de maiúsculas e com espaços externos removidos, ativam o diagnóstico. Ausência da variável, `False`, `0` e valores não reconhecidos o desativam. Foi removida a impressão de `DATABASES` e das demais configurações no startup.

O filtro `app/debug.py`, configurado por `DEFAULT_EXCEPTION_REPORTER_FILTER`, estende a proteção padrão do Django para ocultar `CLOUDINARY_URL` nas páginas de diagnóstico e nos relatórios de erro. Isso também protege a configuração de armazenamento quando o debug é explicitamente ativado para desenvolvimento; os filtros existentes para senhas, chaves e tokens são preservados.

As views de tarefas, cronogramas e documentos agora exigem `IsAuthenticated`. Consultas e tentativas de criação sem token retornam **401**, antes de acessar `AnonymousUser.country`, em vez dos erros 500 e das criações anônimas observadas nessas rotas. Usuários autenticados continuam recebendo somente os dados de seu país, e usuários sem país recebem listas vazias. Essa proteção resolve uma parte de S03; as permissões das demais rotas públicas e os papéis autorizados a escrever continuam pendentes.

Foram adicionados **dez testes** em `core/tests/test_debug_security.py`: leitura de valores de DEBUG, ausência de impressão de segredos, resposta pública genérica de erro 500, ocultação de credenciais mesmo em diagnóstico de desenvolvimento, autenticação nas três rotas e manutenção do filtro por delegação. A execução completa de `core.tests`, com configuração temporária `sinuca_security_test_settings`, passou nos **18 testes**, incluindo os oito de S01. O banco utilizado foi SQLite em memória, e todas as credenciais dos testes eram sintéticas. Nenhum código ou dado de produção foi acessado para executar os testes.

O `.env` e as credenciais reais não foram alterados. `DEBUG=True` explícito continua ativando o debug: produção deve configurar `DEBUG=False`. A mudança ainda não foi publicada e não revoga credenciais que já tenham sido expostas; sua rotação continua necessária quando aplicável. As evidências antigas abaixo permanecem como registro da versão auditada.

### Esclarecimento de requisitos de cadastro — 28/10/2026

A equipe confirmou que o cadastro de alunos é público por decisão do produto. Os alunos devem permanecer registrados aguardando aprovação dos organizadores, que também os colocam em delegações. Novos organizadores devem ingressar por URLs privadas de convite. Os PDFs fornecidos descrevem propostas antigas e não substituem essas regras atuais, registradas em [referências documentais](docs/design/README.md).

Portanto, **a abertura do cadastro não é, por si só, uma vulnerabilidade**. Em S05, o problema é o servidor aceitar a delegação escolhida pelo próprio solicitante e permitir acesso aos seus dados sem o fluxo previsto de aprovação e atribuição pela organização. Na revisão estática atual, não foi encontrado fluxo explícito de aprovação nem de convites. O esclarecimento não corresponde a uma correção implementada ou a uma nova rodada de testes; as evidências originais abaixo foram preservadas.

## 1. Método, ambiente e limites

Revisão de configuração, modelos, serializers, views, permissões, rotas, autenticação, uploads, stores, serviços, componentes, scripts auxiliares, migrações e dependências. Os testes de escrita ocorreram em **SQLite novo e arquivos de mídia em `/tmp/sinuca-audit`**, com contas sintéticas de duas delegações: alunos, colega da mesma delegação, aluno sem país, organizador, avaliador e administrador.

O front foi compilado a partir do código existente para `/tmp/sinuca-audit-build`. O Chrome executou essa compilação em servidores locais. As requisições ao endereço de API fixado no front foram interceptadas e encaminhadas exclusivamente ao back local. A implementação das regras da aplicação permaneceu a mesma; banco, segredo JWT de teste e armazenamento foram substituídos por configuração temporária de infraestrutura.

Ambiente principal: Python 3.12.3, Django 5.2.12, DRF 3.16.1, SimpleJWT 5.5.1, PyJWT 2.11.0, Pillow 12.1.1, Node 24.18.1, Vite 7.3.2 e Chrome 153.0.8010.36. As versões principais do back foram alinhadas ao `pdm.lock`; parte das dependências auxiliares foi resolvida pelas restrições abertas de `requirements.txt`. A lista efetiva está em [test-runtime.json](auditoria/2026-10-27/test-runtime.json).

Testes de navegador em **1366×900 e 390×844**, locale pt-BR e fuso America/Sao_Paulo. Fontes externas foram bloqueadas para manter as navegações locais; a tipografia das capturas pode diferir da instalação publicada. Service workers foram bloqueados nesses testes para tornar o encaminhamento de requisições determinístico. O manifest gerado foi verificado separadamente.

Não foram avaliados o servidor publicado, seus dados, o proxy/WAF, as credenciais efetivas de produção, o armazenamento Cloudinary remoto, restauração de backups, navegadores Safari/Firefox, entrega de e-mail, instalação real do PWA ou capacidade sob carga de evento. Não houve ataque de força bruta nem teste de esgotamento de recursos. Os achados reproduzidos descrevem o código local; a exposição pública depende da versão e da infraestrutura implantadas.

Revisões analisadas:

| Repositório | Commit | Arquivos versionados existentes alterados |
| --- | --- | --- |
| SINUCA-FRONT | `3bba36e366ec1f6e86ccf8b7ba32391cb7ec0429` | 0 |
| SINUCA-BACK | `6440560cca6b222c1e829859d47dd638a7dfa338` | 0 |

Verificação registrada em [integrity-check.json](auditoria/2026-10-27/integrity-check.json).

## 2. Resultado dos testes

Foram consolidadas **99 verificações**, incluindo reprodução de falhas, controles de acesso, operações válidas, observações de configuração e limitações de funcionalidades. **Uma reprodução bem-sucedida de vulnerabilidade não significa que a aplicação passou no teste de segurança.**

| Verificação | Resultado |
| --- | --- |
| Build de produção do front | Passou; inclusive geração do service worker e manifest |
| Migrações em banco vazio | Aplicadas com sucesso |
| `check` com infraestrutura isolada | Sem problemas reportados |
| `makemigrations --check --dry-run` | Nenhuma alteração de modelo pendente |
| Suíte existente do Django | **0 testes encontrados** |
| Scripts de teste/lint no front | Não existem no `package.json`; `format` altera arquivos e não foi executado |
| `check --deploy` na configuração original | 16 avisos: 6 de segurança e 10 de schema |
| Login JWT correto / senha incorreta | 200 / 401, conforme esperado |
| Renovação e verificação de JWT | Funcionam; renovação automática também confirmada no navegador |
| Criar, editar e excluir tarefa pela API com payload válido | 201 / 200 / 204 |
| Leitura direta de outra delegação, antes dos desvios identificados | 404 para tarefas, usuários, documentos e mensagens |
| Mensagem de aluno indicando outro país | Back força o país do próprio aluno |
| Mensagens sem login / avaliador | 401 / 403 |
| Aviso de organizador no chat da API | Criação funciona e origem da organização é indicada |
| Imagem falsa e documento HTML disfarçado de PDF | Rejeitados com 400 nas amostras testadas |
| Mural com foto válida, login e quadro em desktop/mobile | Renderizam; quadro mobile testado sem transbordamento horizontal |

Dados consolidados: [results-consolidated.json](auditoria/2026-10-27/results-consolidated.json). Verificações de projeto: [project-checks.txt](auditoria/2026-10-27/project-checks.txt). Diagnóstico original: [configuration-check.txt](auditoria/2026-10-27/configuration-check.txt).

## 3. Vulnerabilidades prioritárias

As severidades abaixo consideram o impacto neste evento e os pré-requisitos observados; não são pontuações CVSS calculadas.

| ID | Severidade | Problema | Evidência |
| --- | --- | --- | --- |
| S01 | **Crítica** | Aluno transforma o próprio usuário em superusuário | PATCH 200; leitura de outra delegação passa a 200 |
| S02 | **Crítica** | Debug permanece ativo com `"False"` e revela credenciais em erro público | GET anônimo 500 com traceback e credenciais Cloudinary no HTML |
| S03 | **Alta** | Criação, edição e exclusão anônimas de recursos do evento | POST 201, PATCH 200, DELETE 204 |
| S04 | **Alta** | Detalhe de tarefa expõe hashes de senha, inclusive de administrador | GET 200 com campo `password` aninhado |
| S05 | **Alta** | Cadastro público permite ingressar em qualquer delegação e ler mensagens | Registro 201 seguido de leitura 200 |
| S06 | **Alta** | Segredos e bases com contas/hashes estão versionados | `.env`, `db.sqlite3` e `dump.json` rastreados pelo Git |
| S07 | **Alta** | Aluno altera contas de colegas e recursos compartilhados entre países | PATCH 200, inclusive desativação de colega |
| S08 | **Alta** | Uploads anônimos e enumeração pública de mídias, sem cotas da aplicação | Upload 201 e listagem 200; amostra PDF acima de 3 MiB aceita |

### S01 — Elevação de privilégios pela edição do usuário

**Origem:** `SINUCA-BACK/core/serializers/user.py:21` e `core/views/user.py:13`.

O serializer permite escrever `is_staff`, `is_superuser`, `is_active`, `email` e `name`. Apenas `role` é explicitamente somente leitura. A view exige autenticação, mas não verifica se o autor tem permissão administrativa para alterar esses campos ou o usuário selecionado.

Reprodução local: um aluno comum, com JWT válido, enviou `PATCH /api/usuarios/SEU_ID/` com `{"is_staff": true, "is_superuser": true}`. A API respondeu **200** e persistiu os dois privilégios. Com o mesmo token, a leitura de um usuário de outro país passou a responder **200**, pois os querysets liberam todos os objetos para superusuários.

**Impacto:** uma conta de participante pode adquirir controle administrativo e atravessar a separação entre delegações. O cadastro público com escolha de país torna a obtenção dessa conta ainda mais simples.

**Correção proposta:** separar serializers de perfil e administração; permitir ao participante alterar somente campos explicitamente seguros de seu próprio perfil; reservar privilégios, papéis e gestão de contas a uma permissão administrativa verificada no servidor. Cobrir tentativa de autopromoção e alteração de colegas com testes negativos.

### S02 — Debug ativo e exposição remota de credenciais

**Origem:** `SINUCA-BACK/app/settings.py:19`, `:20`, `:123` e `core/views/task.py:18`.

`DEBUG = os.getenv("DEBUG", "False")` produz uma **string**, não um booleano. `"False"`, `"0"` e outros valores não vazios continuam verdadeiros. Até a ausência da variável deixa o padrão `"False"` verdadeiro. O `.env` local também habilita debug; o ambiente do executor apresentou outro valor não vazio, igualmente verdadeiro.

Além disso, uma requisição anônima a `/api/tarefas/`, `/api/cronogramas/` ou `/api/docs/` acessa `AnonymousUser.country` e gera **500**. No teste com `DEBUG="False"` e `Accept: text/html`, o HTML retornou o traceback e o valor completo de **`CLOUDINARY_URL`**, que contém credenciais. A evidência salva contém somente os booleanos de confirmação, sem o valor do segredo.

**Impacto:** sem autenticação, é possível obter informações internas e credenciais de armazenamento se a implantação carregar a configuração e a variável correspondentes.

**Correção proposta:** conversão explícita e restritiva para booleano, configuração de produção com debug efetivamente falso, rejeição de anônimos antes do acesso a propriedades de usuário e proteção adicional de valores sensíveis no diagnóstico. Remover o `print` de `DATABASES` em `settings.py:166`, que também pode registrar credenciais no ambiente de produção. Rotacionar as credenciais afetadas caso essa configuração tenha sido exposta.

### S03 — Escrita pública em dados do evento

**Origem:** `SINUCA-BACK/app/settings.py:151` e views de postagens, categorias, turmas, países, cronogramas e links.

Configurar autenticação JWT não obriga autenticação. Não há `DEFAULT_PERMISSION_CLASSES`; o padrão efetivo observado foi **`AllowAny`**. Diversos `ModelViewSet` também não declaram permissões.

Sem qualquer token, os testes obtiveram:

| Recurso | Criar | Editar | Excluir |
| --- | --- | --- | --- |
| `/api/postagens/` | 201 | 200 | 204 |
| `/api/categorias/` | 201 | 200 | 204 |
| `/api/turmas/` | 201 | 200 | 204 |
| `/api/paises/` | 201 | 200 | 204 |
| `/api/cronogramas/` | 201 | Não utilizado nesta reprodução | Não utilizado nesta reprodução |
| `/api/docs/` | 201 | Não utilizado nesta reprodução | Não utilizado nesta reprodução |

Um primeiro payload de edição de turma ultrapassava os sete caracteres permitidos. A repetição com nome válido confirmou PATCH 200 e DELETE 204; a consolidação registra essa correção do teste.

**Impacto:** adulteração de notícias, cadastros e programação; remoção de recursos; inserção de links indesejados. A criação pública de postagem sem foto também alcança a falha do mural descrita em F08.

**Correção proposta:** política global restritiva e permissões explícitas por ação. Leituras públicas necessárias ao mural/cadastro podem continuar públicas; escritas devem exigir o papel e o escopo adequados. A política precisa ser aplicada na API, independentemente dos botões presentes no front. O comportamento padrão é documentado pelo [Django REST framework](https://www.django-rest-framework.org/api-guide/permissions/).

### S04 — Hashes de senha expostos em tarefas

**Origem:** `SINUCA-BACK/core/serializers/task.py:13` e `:20`.

`TaskDetailSerializer` usa `fields='__all__'` com `depth=1`. A representação automática de `creator` e `user` inclui o campo **`password` com o hash de autenticação**, além de matrícula, e-mail, grupos e permissões.

O teste foi além dos colegas da delegação: um aluno sem privilégios criou uma tarefa com o administrador sintético em `user`. O serializer de escrita aceita usuários de todo o banco. A criação respondeu **201** e o detalhe respondeu **200**, contendo o hash do administrador. A tarefa temporária foi removida ao final da reprodução.

**Impacto:** exposição de material para tentativa de quebra de senhas fora do servidor, inclusive de contas administrativas. São hashes, não senhas em texto aberto; isso continua sendo informação que não deve sair pela API.

**Correção proposta:** serializers aninhados explícitos e mínimos para pessoas, sem dados de autenticação, e validação de que responsáveis pertencem ao escopo permitido. Avaliar as contas afetadas se essa versão tiver sido utilizada com dados reais. Nenhum hash foi copiado para os artefatos da auditoria.

### S05 — Ingresso não autorizado em delegações e falsa verificação de e-mail

**Origem:** `SINUCA-BACK/core/serializers/user.py:41`, `core/views/user.py:42`; `SINUCA-FRONT/src/components/forms/RegisterStepTwo.vue:12`.

O registro público aceita `country` fornecido pelo cliente sem convite, aprovação ou comprovação de vínculo. Os países podem ser listados publicamente. Uma conta nova criada com o país B conseguiu ler as mensagens privadas daquele país com **200**, sem explorar S01.

No front, o passo de token apenas exige algum texto e avança. **Qualquer código é aceito**, sem chamada a serviço de verificação. Não foi encontrado envio/validação de código de e-mail no back. Também foi possível registrar endereço fora de domínio institucional e matrícula inválida.

**Impacto:** a fronteira de privacidade entre delegações pode ser contornada pelo próprio cadastro; a interface comunica uma verificação que não acontece.

**Correção proposta:** vinculação à delegação por mecanismo autorizado no servidor e verificação real de e-mail, se ela fizer parte do processo de admissão. Rejeitar tentativas de escolher país e papel fora desse fluxo. O registro já ignora `role` e `is_superuser` extras enviados pelo cliente; esse controle específico foi confirmado, mas não resolve a escolha de delegação.

### S06 — Segredos e dados de contas no Git

**Origem:** `SINUCA-BACK/.env:3`, `.env:4`, `db.sqlite3` e `dump.json`.

O `.env` é rastreado pelo Git e contém `SECRET_KEY` e credenciais Cloudinary. Sua presença no `.gitignore` não remove um arquivo que já foi versionado. O banco contém cinco usuários, incluindo conta administrativa, e `dump.json` contém duas contas com hashes. Não foi determinado se esses registros são reais ou fixtures.

O SimpleJWT usa a chave de assinatura padrão derivada de `SECRET_KEY`; não há uma chave JWT separada configurada. **Se o segredo versionado for usado na implantação**, quem o obtiver poderá produzir assinaturas válidas de tokens. Há ainda fallback fixo e previsível em `settings.py:19` caso a variável não exista.

**Impacto:** comprometimento potencial de autenticação/armazenamento e exposição de dados ao distribuir o repositório como modelo. Não foi verificada a visibilidade do repositório remoto nem se esses segredos continuam ativos.

**Correção proposta:** retirar segredos e dados de contas do conteúdo distribuído, disponibilizar exemplos sem valores sensíveis, exigir segredos válidos no startup e rotacionar os segredos efetivamente usados. A limpeza do histórico, se necessária, exige planejamento com a equipe. Nenhuma dessas operações foi executada nesta auditoria. O [checklist oficial do Django](https://docs.djangoproject.com/en/5.2/howto/deployment/checklist/) orienta manter a chave secreta fora do controle de versão.

### S07 — Alterações indevidas por participantes autenticados

**Origem:** `SINUCA-BACK/core/views/user.py:13`, `core/views/schedule.py:7`, `core/views/link.py:7` e serializers correspondentes.

Mesmo sem autopromoção, um aluno conseguiu:

- Alterar o e-mail de um colega da mesma delegação e desativar sua conta: **200**.
- Alterar o título de um cronograma compartilhado, com a mudança visível para outra delegação: **200**.
- Alterar a URL de um documento compartilhado entre países: **200**.
- Associar uma tarefa a um usuário de outra delegação: **200**.

Filtrar o queryset pelo país restringe alguns objetos visíveis, mas não define quem pode modificar cada objeto ou campo. As alterações do teste foram restritas aos registros sintéticos.

**Correção proposta:** definir matriz de permissões por papel, ação e objeto. Separar dados de organização dos dados que alunos podem colaborar para editar; validar relações de usuários, países e documentos no servidor.

### S08 — Upload e descoberta de arquivos sem autenticação

**Origem:** `SINUCA-BACK/uploader/views.py:7`, serializers de imagem/documento e `uploader/helpers/files.py:10`.

Uma requisição anônima enviou PNG e PDF e recebeu **201**. A listagem pública de imagens respondeu **200** com URL, identificador e chave de associação. A aplicação não define dono do arquivo, restrição por delegação, cota por usuário ou limite de tamanho no serializer.

Uma amostra inofensiva de PDF com **3.145.744 bytes** também foi aceita. Esse teste demonstra ausência de um limite menor nessa camada, sem medir o máximo aceito ou realizar esgotamento de armazenamento. A análise de MIME de documentos lê o conteúdo todo para memória quando ele ainda não está em arquivo temporário.

**Impacto:** uso não autorizado de armazenamento/banda e descoberta de mídias enviadas por outras pessoas. Em produção com Cloudinary, o impacto financeiro depende das cotas e controles externos, não testados.

**Correção proposta:** acesso e propriedade explícitos; limite de bytes, dimensões e quantidade; cotas; controle de arquivos órfãos e política para listagem/URLs. Se a foto for enviada antes do cadastro, usar um fluxo temporário e limitado, associado ao registro, em vez de upload público irrestrito. A validação das amostras de imagem falsa e HTML disfarçado de PDF funcionou.

## 4. Outros riscos de segurança e operação

**Senhas e tentativas de login:** `UserRegistrationSerializer` exige oito caracteres, mas não chama os validadores de senha configurados no Django. A senha sintética `12345678` foi aceita. Não há throttles do DRF configurados; oito tentativas inválidas limitadas retornaram 401, sem 429. Isso não informa se existe proteção no proxy publicado. Prioridade: aplicar validação de senha no cadastro e política de limitação de tentativas adequada ao evento.

**Configuração de origem e transporte:** `ALLOWED_HOSTS=['*']`, CORS para todas as origens e ausência de HTTPS obrigatório, HSTS e cookies seguros foram observados. O `check --deploy` emitiu os avisos correspondentes. Alguns controles de transporte podem existir no proxy, que não foi avaliado. CORS amplo não comprova, por si só, roubo de tokens; ele amplia as origens que podem chamar/ler a API e deve seguir os domínios efetivamente usados.

**Sessões:** access token dura três horas e refresh dura um dia. Logout remove tokens somente do navegador; não há fluxo de revogação/blacklist configurado no back. Um refresh anteriormente emitido continuou aceito no teste. Guardar tokens em `localStorage` exige cuidado com conteúdo executável e dependências; não foi demonstrado XSS próprio nos templates revisados. Planejar encerramento/revogação de sessão de acordo com o uso em dispositivos compartilhados.

**Ambiente local aponta para a API publicada:** `SINUCA-FRONT/src/plugins/axios.js:6` fixa o domínio externo. A alternativa `VITE_API_BASE_URL` está comentada. Um desenvolvedor pode executar o front local e escrever em dados remotos sem perceber. É necessário separar a configuração de desenvolvimento, teste e produção antes de reutilizar o projeto.

**Scripts auxiliares:** `scripts/cria_api.py:27` interpola argumento de linha de comando em `os.system`, sem validação/escape. O risco está no uso local do gerador com entrada não confiável; não foi identificada exposição desse script por uma rota da aplicação. `scripts/set_my_ip.py` reescreve `.env`; ele não foi executado sobre o projeto original.

## 5. Falhas de funcionamento

As observações abaixo foram reproduzidas, exceto os itens explicitamente marcados como revisão estática.

| ID / prioridade | Falha e efeito | Local principal |
| --- | --- | --- |
| F01 / Alta | Cadastro normal não envia país; usuário é criado com `country=null`. Após login, a delegação lê `.country.id`, gera TypeError e fica sem contexto de país. O mesmo ocorre com organizador e avaliador sem país. O formulário de edição de usuário existente no admin também omite `country`, dificultando regularizar esse vínculo pela interface administrativa. | `src/services/userService.js:14`; `src/views/DelegationView.vue:71`; back `core/admin.py:17` |
| F02 / Alta | Escolher Organizador/Avaliador muda apresentação/query, mas o registro continua criando aluno. Não há telas de operação específicas para esses papéis; organizador sem país recebe listas vazias em recursos que só fazem exceção para `is_superuser`. Conferido por revisão de fluxo e perfis da API/navegador. | `src/views/WelcomeView.vue:36`; `src/services/userService.js:14`; back `core/views/schedule.py:9` |
| F03 / Alta | Criar tarefa sem datas envia strings vazias e recebe 400. O modal fecha imediatamente, sem aguardar a resposta ou mostrar o erro, causando falsa impressão de salvamento. Datas `null` são aceitas pela API. | `src/stores/taskStore.js:7`; `src/components/delegation/modais/CreatTaskModal.vue:53` |
| F04 / Média | Editar tarefa salva no banco, mas mantém o título antigo no quadro. ID da rota é string e o store compara com ID numérico usando `===`; o item não é encontrado. | `src/stores/taskStore.js:47` |
| F05 / Média | Apagar tarefa retorna 204 e remove do banco, mas o cartão continua no quadro pelo mesmo problema de tipo de ID. | `src/stores/taskStore.js:55` |
| F06 / Média | Tarefa recém-criada recebe categorias como IDs; o cartão espera objetos com `id/name`. A categoria aparece sem nome até recarregar. | `src/stores/taskStore.js:42`; `src/components/delegation/TasksListComponent.vue:118`; serializers de tarefa |
| F07 / Alta | Selecionar categoria sem estilo cadastrado, como ID 1 em um banco novo, gera TypeError ao acessar `.activeStyle`. Os estilos cobrem apenas IDs 2 a 7. | `src/stores/categoryStore.js:13`; `src/components/delegation/modais/CreatTaskModal.vue:132` |
| F08 / Alta | Uma postagem com `foto=null`, aceita pelo modelo/API, quebra o render do mural inteiro: `.foto.url` gera TypeError. Reproduzido com cartão válido já existente e um segundo sem foto. | `src/views/BoardView.vue:41` |
| F09 / Média | Recarregar ou abrir diretamente `/delegacao/schedule/ID` envia `/api/cronogramas/null/` e recebe 404. O ID local só é preenchido pelo clique, não pelo parâmetro da rota. | `src/views/DelegationView.vue:35`, `:54`, `:111` |
| F10 / Média | Modal de cronograma mostra todos os links da delegação, inclusive documento que não pertence a `schedule.docs`. Pode confundir a preparação para uma atividade. | `src/components/delegation/modais/ScheduleModal.vue:49`, `:128`, `:200` |
| F11 / Alta | Stores consomem só `results` da primeira página, sem buscar as demais ou oferecer paginação. No teste, 12 tarefas viraram dez cartões; o filtro atua apenas nesse subconjunto. O padrão também aparece em cronogramas, links, usuários, turmas, países e postagens. | stores e services; back `app/pagination.py:5` |
| F12 / Média | Refresh inválido remove tokens, mas não limpa `loggedIn` do store. O redirecionamento ao login é desviado novamente para delegação. Teste terminou em `/delegacao` sem access token, após refresh 401. | `src/plugins/axios.js:77`; `src/stores/userStore.js:19`; `src/router/index.js:102` |
| F13 / Média | Cadastro recebe erro, como e-mail já usado, mas `errorMessage` não é renderizado no template do último passo. `loading` também não impede novos envios. | `src/components/forms/RegisterStepThree.vue:47`, `:78` |
| F14 / Média | Matrícula inválida apenas produz uma dica; não bloqueia submissão. Uma matrícula de um dígito foi persistida. | `src/components/forms/RegisterStepThree.vue:27`, `:109`; back `core/models/user.py:78` |
| F15 / Média | Logout define `user={}`. Entrar no cadastro na mesma sessão gera TypeError em `.password.length`. No cadastro bem-sucedido também houve erro em `.matriculation.length`, pois `/usuarios/me/` substitui o objeto sem esse campo. | `src/stores/userStore.js:37`; passos de cadastro 1 e 3; back `core/serializers/user.py:23` |
| F16 / Média | Botão Mural no rodapé mobile aponta para `/`. Para usuário logado, o guard redireciona para a delegação. O botão não abre o mural. | `src/components/layout/mobile/AppTabFooter.vue:8`; `src/router/index.js:103` |
| F17 / Média | Não existe ação de logout na navegação mobile normal; ela aparece apenas na sidebar desktop. | `src/components/layout/mobile/AppHeaderMob.vue`; `AppTabFooter.vue`; sidebar desktop |
| F18 / Média | Criar link pela API ignora `country`, ausente no serializer, e salva um link sem delegação. Ele deixa de aparecer no queryset dos participantes. | back `core/serializers/link.py:11`; `core/views/link.py:14` |
| F19 / Média | `GET /api/mensagens/?country=not-a-number` com organizador retorna 500, em vez de erro de validação. GET anônimo em tarefas, cronogramas e docs também retorna 500, conforme S02. | back `core/views/message.py:21`; views com `.country` |
| F20 / Média | Datas invertidas de tarefa são aceitas: início depois do fim retornou 201. Falta validação cruzada de datas; o serializer de cronograma também não declara essa validação, por revisão estática. | back `core/serializers/task.py:20`; `core/serializers/schedule.py:6` |
| F21 / Média | `populate_sinuca_advanced.py` usa campos inexistentes: `Country.code`, `Task.points/difficulty/countries`, `Post.image_url/country`, `Schedule.start_date/end_date/countries`. Execução no banco temporário, com rollback, reportou três erros e ainda imprimiu “concluída com sucesso”. | back `populate_sinuca_advanced.py:273`, `:291`, `:353`, `:421` |
| F22 / Média | Os três ícones do manifest apontam para `../public/logo-sinuca.svg`. No build servido, todos responderam 404. A instalação do PWA precisa ser validada depois da correção. | `vite.config.js:28` |
| F23 / Limitação | Chat, notas e história são telas “em construção”. Há API de mensagens com controles próprios, mas ela não é consumida pelo chat. Não existe fluxo de notas no back atual. | `src/views/ChatView.vue`, `HistoryView.vue`; `NotesListComponent.vue` |
| F24 / Limitação | O seletor “Receber notificações” só grava um booleano. Por revisão estática, não foi encontrada implementação de envio, push, permissão de notificações ou agendamento de entrega. | `src/components/delegation/modais/CreatTaskModal.vue:175`; back `core/models/task.py:28` |
| F25 / Média | `/p` está disponível na compilação normal, sem proteção de rota, com ações de teste e várias chamadas que retornam 401/500 para visitantes. Clicar numa tarefa também referencia rota inexistente `playground-task`, por revisão estática. | `src/views/playground.vue:21`, `:67`; `src/router/index.js:89` |
| F26 / Baixa | Rota desconhecida produz área `#app` vazia, sem página 404. | `src/router/index.js` |
| F27 / Média | `.env` contém `MODE=DEVELOPENT`, diferente de `DEVELOPMENT`, acionando o ramo de armazenamento remoto. No ramo local, `MEDIA_URL` usa `https://127.0.0.1:800/media/`, incompatível com o servidor de desenvolvimento declarado em 8000. Revisão de configuração; armazenamento remoto não foi acionado. | back `.env:1`; `app/settings.py:119`; `pyproject.toml:43` |

As listas paginadas de vários modelos também não possuem ordenação estável; o Django emitiu `UnorderedObjectListWarning`. Além de buscar todas as páginas, é necessário definir ordenação consistente para evitar repetição ou omissão de itens conforme os dados mudam.

**Desempenho observado:** listar dez tarefas executou 14 consultas SQL, e listar dois usuários executou oito. Há oportunidade de `select_related`/`prefetch_related` nas relações serializadas. É uma observação de eficiência; não foi medido o limite de participantes suportados nem demonstrada indisponibilidade sob carga.

**Acessibilidade por revisão estática:** `AppInput` usa rótulo sem associação `for/id`; escolha de perfil, categorias e algumas ações de modal são elementos de clique sem semântica de botão; não há tratamento explícito de foco/teclado nos modais. Isso merece revisão antes do uso institucional. Não foi executada auditoria completa de acessibilidade com leitor de tela ou critérios WCAG.

## 6. Dependências

Consultas aos serviços de avisos do npm e PyPI foram executadas em 27/10/2026, sem atualização dos arquivos do projeto.

| Ecossistema | Resultado bruto | Interpretação |
| --- | --- | --- |
| npm | **19 pacotes sinalizados:** 14 alta, três moderada, dois baixa, zero crítica | Inclui dependências do navegador, build e desenvolvimento; o total não representa 19 explorações comprovadas nesta aplicação |
| Python / `pdm.lock` | **187 registros em 15 pacotes** | A resposta inclui duplicatas; são 133 pares pacote/identificador distintos. Inclui pacotes de desenvolvimento. Não é a contagem de vulnerabilidades exploradas |

Arquivos completos: [npm-audit.json](auditoria/2026-10-27/npm-audit.json) e [pip-audit.json](auditoria/2026-10-27/pip-audit.json).

Versões que merecem revisão prioritária: **Django 5.2.12, DRF 3.16.1, PyJWT 2.11.0, Pillow 12.1.1, Axios 1.15.0, Vue 3.5.32 e Vite 7.3.2**, além das transitivas indicadas nos arquivos. A aplicabilidade depende do caminho executado: avisos de SSRF do adaptador Node do Axios, por exemplo, não comprovam SSRF em uma SPA que usa o adaptador de navegador; aviso de SSR do Vue também não comprova XSS nesta aplicação sem SSR. A autenticação e os uploads tornam especialmente relevante revisar os avisos das bibliotecas usadas nessas áreas do back.

O build do back instala `requirements.txt`, cujas restrições são abertas, e não reproduz necessariamente `pdm.lock`. Assim, o scanner do lock não identifica as versões efetivamente publicadas. O runtime de teste também foi registrado separadamente para não confundir esses contextos.

A documentação oficial confirma correções posteriores às versões analisadas: [Django 5.2.18](https://docs.djangoproject.com/en/5.2/releases/5.2.18/) e [DRF 3.18.2/3.18.3](https://www.django-rest-framework.org/community/release-notes/). A manutenção do Axios publica [avisos no repositório oficial](https://github.com/axios/axios/security/advisories?state=published). Esses avisos devem orientar a escolha de versões corrigidas, seguida de teste de compatibilidade. Nenhum `audit fix` ou upgrade foi aplicado.

## 7. Ordem sugerida para uma próxima etapa de correção

1. **Antes de participantes reais:** bloquear autopromoção; desligar debug corretamente; proteger escrita nas rotas e uploads; remover hashes das respostas; controlar ingresso em delegações; tratar segredos já distribuídos. Validar tentativas negativas com aluno, visitante, avaliador e organizador.
2. **Antes de depender do sistema no evento:** completar atribuição de país/papéis; corrigir cadastro, tarefas sem datas, feedback de erro, atualização do quadro, mural sem foto, paginação e navegação do cronograma; disponibilizar logout mobile e corrigir expiração de sessão.
3. **Antes de transformar em modelo reutilizável:** separar configuração por ambiente, retirar dados/segredos do modelo, alinhar dependências e runtime, corrigir script de população e PWA e documentar quais recursos continuam em construção.
4. **Validação de liberação:** testes de integração das regras de autorização e isolamento; navegação ponta a ponta do cadastro à tarefa/documento; teste de recuperação de dados e carga compatível com o número previsto de participantes, em ambiente dedicado.

Essa lista descreve trabalho futuro; nenhuma correção foi aplicada neste levantamento.

## 8. Evidências e interpretação

- [Resultados consolidados](auditoria/2026-10-27/results-consolidated.json): resultado final das 99 verificações, sem pendências de reprodução. `confirmed=true` confirma a observação indicada, inclusive quando ela é uma falha.
- [API — execução principal](auditoria/2026-10-27/backend-results.json) e [testes adicionais](auditoria/2026-10-27/additional-results.json): status HTTP e confirmação de vazamentos, sem tokens reais, hashes ou segredos.
- [Navegador — execução principal](auditoria/2026-10-27/browser-results.json) e [cenários complementares](auditoria/2026-10-27/browser-targeted-results.json): navegação, erros JavaScript e reprodução dos cenários finais. A consolidação incorpora os ajustes de sincronização e a repetição com payload válido; resultados brutos anteriores não devem ser lidos isoladamente como conclusão final.
- [Admin e script de população](auditoria/2026-10-27/management-results.json): campo de país ausente na edição administrativa e incompatibilidade do seed com os modelos atuais.
- Capturas com dados exclusivamente sintéticos: [desktop](auditoria/2026-10-27/capturas/delegacao-desktop.png), [mobile](auditoria/2026-10-27/capturas/delegacao-mobile.png), [cronograma](auditoria/2026-10-27/capturas/cronograma-desktop.png), [mural válido](auditoria/2026-10-27/capturas/mural-desktop.png), [mural com foto nula](auditoria/2026-10-27/capturas/mural-null-image.png) e [perfil sem país](auditoria/2026-10-27/capturas/unassigned-delegacao.png).

Os executores e o banco de teste ficaram em `/tmp/sinuca-audit`; não foram incorporados ao código da aplicação. Os JSONs persistidos registram as operações e resultados observados. As receitas de reprodução deste relatório devem ser executadas em ambiente isolado com contas sintéticas.
