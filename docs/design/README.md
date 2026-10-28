# Referências documentais e análise preliminar do SINUCA

Data da análise: 28/10/2026.

Este documento registra os materiais fornecidos pela equipe e sua relação com o código atual. A análise é documental e estática. **O arquivo Figma ainda não foi inspecionado por MCP**, portanto não foram avaliados seus frames, componentes, medidas, variantes ou interações. Não se trata de uma validação visual de fidelidade ao Figma.

## Regras atuais de ingresso — confirmadas em 28/10/2026

A equipe informou que os PDFs estão desatualizados. Para cadastro e ingresso no evento, prevalecem as seguintes regras comunicadas diretamente pela equipe:

- O cadastro de alunos é público e individual.
- Os alunos ficam registrados aguardando aprovação dos organizadores.
- Os organizadores aprovam os alunos e os colocam em delegações.
- Novos organizadores entram por URLs privadas de convite.

Assim, cadastro público é uma decisão do produto. A proposta antiga de cadastro pela administração e credencial compartilhada por país foi substituída nesse fluxo.

Na implementação revisada, o cadastro público já existe, mas cria usuários com `is_active=True` e aceita o campo `country` enviado pelo cliente. Não foi encontrado um fluxo explícito de aprovação de alunos ou de convites para organizadores. `is_active` sozinho não representa esse fluxo de aprovação. Essas etapas permanecem pendentes de implementação; esta documentação não as apresenta como concluídas.

A política de login durante a espera e as regras de validade e uso dos convites ainda não foram detalhadas. Como requisito de segurança, o convite precisa ser validado pelo servidor antes de conceder o papel de organizador; esconder o endereço de uma página não constitui autorização.

## Materiais preservados

| Material | Conteúdo observado | Local |
| --- | --- | --- |
| Trabalho - Site SINUCA.docx.pdf | Artigo/resumo expandido sobre contexto, metodologia, estágio do projeto e continuidade; cinco páginas | [PDF original](<referencias/Trabalho - Site SINUCA.docx.pdf>) |
| SINUCA - SITE.pdf | Especificação inicial, identidade visual, ideias de funcionalidades, proposta e diagrama de dados; três páginas | [PDF original](<referencias/SINUCA - SITE.pdf>) |
| SINUCA - LAYOUT | Arquivo Figma indicado pela equipe; conteúdo ainda não consultado | [Abrir Figma](https://www.figma.com/design/SxdVw9n8771wtU9HICf8Jg/SINUCA---LAYOUT?node-id=0-1) |

Os dois PDFs foram copiados da pasta Downloads, sem alterações. As cópias foram comparadas aos originais por SHA-256:

```text
Trabalho - Site SINUCA.docx.pdf
d5141b3ba7cc8d45c8ca8fc3211af65f5b806cd4f13144ce04cbd4bb6a34c2a0

SINUCA - SITE.pdf
5ef876adcefe0a0e4823f7236a6d5a7199222c83a4ed0f7b007752e31ebc13e9
```

O primeiro PDF contém instruções editoriais do modelo de artigo, como orientações para escrever o resumo e as seções. Essas instruções são parte do documento de origem, não comandos para alterar o site ou reescrever o artigo. Os documentos foram tratados como fontes de contexto, sem substituir automaticamente as decisões atuais da equipe.

## Objetivo do produto apresentado pelos documentos

Centralizar a comunicação e os materiais do SINUCA, reduzindo a distribuição de avisos, documentos, cronogramas e registros em canais separados. A plataforma deve apoiar a organização do evento e a autonomia dos alunos para administrar suas tarefas.

Os materiais descrevem três papéis: participante/discente, organizador e avaliador. Também mencionam conteúdo destinado a visitantes. O artigo, nas páginas 3 a 5, diferencia o trabalho atual voltado ao discente das interfaces administrativas a serem continuadas por outra equipe.

Isso é relevante para a entrega: funcionalidades futuras precisam aparecer como pendências previstas, enquanto funcionalidades apresentadas como prontas precisam corresponder ao que efetivamente funciona. A autorização no servidor continua necessária mesmo antes de existirem telas administrativas próprias.

## Identidade visual documentada

A página 1 de `SINUCA - SITE.pdf` informa a seguinte paleta:

| Cor | Presença observada no front |
| --- | --- |
| `#01295F` | Sidebar, cabeçalho, botões e destaques |
| `#437F97` | Links e detalhes de login |
| `#849324` | Organização, estados e categorias |
| `#FFB30F` | Discente, estados e categorias |
| `#FD151B` | Avaliador, alertas, estados e categorias |
| `#F6F6F2` | Fundo principal |
| `#001228` | Não localizada como literal nos arquivos de `src` revisados |

A implementação utiliza boa parte da paleta declarada, mas isso não confirma correspondência com os estilos atuais do Figma. As cores aparecem repetidas em componentes e no store de categorias; não existe uma fonte central de variáveis CSS para toda essa paleta nos arquivos revisados.

O PDF cita **Poppins** e **Montnapha**. Poppins é importada por Google Fonts em [base.css](../../src/assets/css/base.css) e utilizada em formulários. Não foi encontrada declaração de Montnapha em `src`; o nome, a disponibilidade do arquivo e seu papel na interface precisam ser confirmados pelo design. Nenhuma fonte foi adicionada ou substituída nesta análise.

Há também um problema concreto em `base.css`: `font-weight: semibold` não é um valor CSS válido. O peso semibold normalmente é expresso numericamente, mas o peso pretendido deve ser confirmado antes de uma correção visual. Esse trecho não foi alterado.

## Documentação e implementação: pontos a esclarecer

| Tema | Materiais fornecidos | Código atual observado | Consequência para a continuidade |
| --- | --- | --- | --- |
| Criação de contas | A proposta antiga de cadastro pela administração foi substituída pela regra atual de cadastro público com aprovação | Existe `/cadastro`, mas não foi encontrado fluxo explícito de aprovação; o registro aceita país informado pelo cliente | Implementar aprovação e atribuição de delegação pelos organizadores conforme as regras atuais |
| Conta individual ou compartilhada | A especificação inicial fala em conta por país; a regra atual registra alunos individualmente para aprovação e distribuição em delegações | O back representa pessoas individualmente e associa cada usuário a um país | Manter a conta individual; tratar a credencial por país do PDF como proposta histórica |
| Privacidade do chat | O artigo, página 4, descreve comunicação privada entre um delegado específico e a organização | `Message` pertence a um país; alunos do mesmo país consultam o mesmo conjunto de mensagens | É necessário definir se a conversa é individual ou da delegação antes de considerar esse requisito atendido |
| Notificações | O artigo prevê comunicação notificada | Existe um booleano de notificação em tarefas, mas não foi encontrada integração de entrega no fluxo revisado | O seletor visual não comprova entrega de notificações |
| Cronograma | A especificação inicial menciona cronograma do evento ao longo do ano | A área de delegação consulta cronogramas filtrados por país; não há rota pública específica de calendário anual no router revisado | Confirmar se calendário público e cronograma da delegação são requisitos distintos |
| Organização e avaliação | Ambos os materiais descrevem organizadores e avaliadores; a equipe confirmou ingresso de organizadores por convite privado | Há papéis no modelo e escolha visual no login, mas sem áreas completas dedicadas ou fluxo de convites identificado | Implementar convites validados no servidor e distinguir papel no banco, permissão e interface |
| Notas | Atribuição de notas às delegações é prevista | A aba é um placeholder; não foi encontrado modelo de avaliação/notas nos modelos atuais de `core` | Critérios, escala, registro e consolidação das notas ainda precisam de definição e implementação |
| Histórico e mídias | Os materiais mencionam edições anteriores, história, imagens e eventualmente uma pasta do Drive | História está em construção; os componentes revisados não implementam uma galeria de edições | Não registrar esses recursos como entregues apenas porque aparecem na navegação |
| Aplicativo móvel | O artigo fala em site e app móvel | Este repositório configura um front Vue com PWA | Confirmar se o PWA atende ao uso pretendido ou se existe outro aplicativo/repositório |

Os PDFs permanecem como referências históricas. As regras atuais de ingresso acima substituem as propostas antigas sobre cadastro. Outras diferenças entre documentos e implementação ainda precisam ser confirmadas pela equipe. Nenhuma regra de negócio foi modificada no código nesta etapa.

### Referências no código

- Cadastro e perfis: [router](../../src/router/index.js), [serviço de usuários](../../src/services/userService.js) e [serializer de usuários](../../../SINUCA-BACK/core/serializers/user.py).
- Chat por país: [modelo Message](../../../SINUCA-BACK/core/models/message.py), [view de mensagens](../../../SINUCA-BACK/core/views/message.py) e [ChatView](../../src/views/ChatView.vue).
- Recursos em construção: [HistoryView](../../src/views/HistoryView.vue) e [NotesListComponent](../../src/components/delegation/NotesListComponent.vue).
- Cronogramas: [ScheduleViewSet](../../../SINUCA-BACK/core/views/schedule.py) e [DelegationView](../../src/views/DelegationView.vue).
- PWA: [vite.config.js](../../vite.config.js).

## Diagrama de dados do PDF

A página 2 de `SINUCA - SITE.pdf` contém um diagrama com administrador, postagem, resposta, delegação, membro, tarefa, atribuição, avaliador e avaliação. Esse desenho é diferente do modelo Django atual e deve ser identificado como uma referência anterior, não como o esquema do banco em execução.

O código atual reúne os papéis em `User`, representa a delegação por `Country` e utiliza relações próprias para tarefas, documentos e cronogramas. A avaliação desenhada no PDF ainda não tem implementação equivalente nos modelos revisados.

O diagrama também apresenta campos de senha com `VARCHAR(20)`. Isso não descreve o armazenamento atual de senhas: o projeto usa a autenticação do Django, com hashing. Não é adequado copiar esses campos do desenho para substituir a autenticação existente.

## Situação do acesso ao Figma MCP

Foi encontrado um servidor chamado `figma` no arquivo local `~/.codex/config.toml`, apontando para `https://mcp.figma.com/mcp`. Entretanto, não há ferramentas Figma expostas nesta sessão. As tentativas de consultar o servidor retornaram:

```text
resources/list failed: unknown MCP server 'figma'
resources/templates/list failed: unknown MCP server 'figma'
```

A configuração existente no disco não comprova que o servidor foi carregado ou autenticado nesta conversa. Não foi verificada a causa exata da indisponibilidade, nem foram alterados configuração, credenciais ou permissões.

Segundo a [documentação oficial do Codex sobre MCP](https://learn.chatgpt.com/docs/extend/mcp?surface=cli), é possível verificar servidores com `codex mcp list` e iniciar autenticação OAuth com `codex mcp login <server-name>`. Para o nome configurado neste computador:

```sh
codex mcp list
codex mcp login figma
```

O login só precisa ser feito se a conexão exigir autenticação. Na extensão do Codex, a lista de MCP servers oferece a ação de autenticação quando necessária e uma opção para reiniciar a extensão após alterações. Em uma sessão que disponibilize as ferramentas Figma, a análise poderá consultar o arquivo e o nó `0:1` solicitados pela equipe.

Continuam pendentes de acesso ao Figma: inventário de telas e seus estados, dimensões, espaçamentos, componentes reutilizáveis, estilos reais de tipografia, versões mobile/desktop, interações do protótipo e comparação visual com o front. Nenhum desses elementos foi inferido como se tivesse sido lido no arquivo remoto.

## Uso na documentação de continuidade

Estes materiais já podem apoiar o contexto, os objetivos, o histórico das decisões e o escopo previsto para a próxima equipe. O documento técnico de entrega ainda precisará relacionar cada funcionalidade à implementação verificável, aos passos para executá-la e às pendências correspondentes.

A [auditoria funcional e de segurança](../../AUDITORIA-2026-10-27.md) é uma fonte complementar sobre funcionamento e riscos. Os PDFs fornecidos não substituem os testes nem demonstram que uma funcionalidade descrita já foi concluída.

Nesta etapa foram adicionadas somente as referências documentais e esta análise. Não foram modificados componentes, serviços, configurações da aplicação, modelos, banco ou o projeto Figma.
