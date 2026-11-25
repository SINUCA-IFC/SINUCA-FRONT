# Revisão recomendada da documentação PI

Referência consultada em 25/11/2026: [SINUCA-Documentacao-PI](https://github.com/SINUCA-IFC/SINUCA-Documentacao-PI), incluindo `README.md` e `tarefas.md`. As sugestões abaixo estão prontas para orientar uma revisão; nenhum conteúdo foi publicado nesse repositório nesta entrega.

O README mistura descrição do SINUCA com instruções do modelo de Projeto Integrador e exemplos de outros sistemas. A documentação deve identificar com clareza o que é entregue, o que é requisito futuro e o que depende de homologação. [Passagem de bastão preparada](PASSAGEM-DE-BASTAO.md).

## Estrutura recomendada

```text
README.md                         apresentação, equipe, links e situação resumida
docs/PASSAGEM-DE-BASTAO.md         funcionamento, operação, avaliação e próximas entregas
docs/REQUISITOS.md                RF/RNF e critérios de aceite por perfil
docs/REGRAS-DE-NEGOCIO.md          regras reais do evento e decisões pendentes
docs/MODELO-DE-DADOS.md            MER atual e proposta futura separada
docs/HOMOLOGACAO.md                cenários, evidências, versões e limitações
docs/DECISOES.md                   decisões importantes com data e motivo
```

Começar pelo documento de passagem de bastão e pelos requisitos, sem criar arquivos vazios só para preencher essa árvore. Os READMEs técnicos dos repositórios front/back ficam responsáveis pelos comandos de instalação e execução. Links entre documentos evitam repetir instruções que depois divergem.

## Alterações específicas no README existente

| Trecho atual | Mudança recomendada |
| --- | --- |
| Título “Projeto Integrador - Modelo” | Usar SINUCA e indicar edição/equipe; remover instruções do template destinadas a quem estava iniciando o PI. |
| Contas e senhas publicadas na abertura | Retirar valores. Explicar como criar contas de teste em ambiente isolado; trocar qualquer senha que tenha sido reutilizada. |
| “Ordem de Serviço” e exemplos de compras, biblioteca, granja e vendas | Remover do documento final; escrever regras do SINUCA com exemplos de delegações, aprovação, tarefas, documentos e avaliação. |
| Duas seções numeradas como 4 | Reorganizar sumário e numeração; dar links diretos às seções. |
| MER apenas como imagem | Acrescentar fonte editável e descrição de entidades/relações. Distinguir schema atual da proposta de notas/edição anual. Não redesenhar como se notas já existissem. |
| RF006 com sufixo de edição “sss” | Corrigir texto e detalhar os verbos de manutenção da tarefa e seus responsáveis/permissões. |
| RF003 “manter resposta” | Esclarecer se significa mensagem de chat ou outra entidade. O modelo atual tem Message/MessageRead, sem recurso separado chamado Resposta. |
| RF004 administrador e RF007 organizador | Explicar diferença entre superusuário/Admin e papel organizador; evitar dois cadastros conceituais que não correspondem a duas entidades. |
| RF010 cronograma e RF011 itens do cronograma | Mapear o modelo atual: cada Schedule já é uma atividade. Decidir se haverá um contêiner separado de cronograma antes de exigir nova entidade. |
| RF013 filtrar postagem por categoria | Marcar como futuro/decisão pendente; Post não possui categoria e o mural atual não entrega esse filtro. |
| RF008 avaliação e RF009 avaliador | Marcar como **não implementados**, detalhando o fluxo aprovado e decisões pendentes da passagem de bastão. O enum de papel não basta para marcar RF009 concluído. |
| RNFs citam MySQL/MySQL Connector/Workbench e Apache Tomcat | Atualizar para ORM Django, SQLite local, PostgreSQL configurável para produção e Gunicorn/WhiteNoise. Não trocar tecnologias do código para obedecer a exemplos do template. |
| RNFs duplicados para “Sistema de Ordem de Serviço” | Substituir por requisitos únicos do SINUCA, com identificador, métrica e modo de verificação. |
| Disponibilidade “99%” sem monitoramento e hardware arbitrário | Definir meta com a hospedagem, período de medição, volume de usuários e monitoramento. Não apresentar disponibilidade como comprovada. |
| Segurança atribuída genericamente ao responsável | Registrar autorização no servidor, verificação de e-mail, proteção de uploads, TLS, gestão de segredos, backup e acesso administrativo, com responsáveis. |
| Diagrama de casos de uso com explicação genérica de notação | Manter uma explicação breve e substituir exemplos de outros domínios pelos fluxos reais. Adicionar visitante, aluno pendente/vinculado, organizador, avaliador e administrador técnico. |
| `tarefas.md` com entregas acadêmicas de 2025 | Preservar como histórico acadêmico identificado. Separar backlog técnico atual e homologação; esses prazos antigos não descrevem a situação funcional de 2026. |

## Cobertura funcional a registrar

Criar uma tabela com **ID, descrição verificável, perfil, situação, evidência no código/teste e pendência**. Situações úteis: implementado localmente, integrado com API real, homologado em produção, parcial e planejado. Uma única marca “feito” apaga diferenças importantes.

Além dos requisitos atuais, registrar:

- Cadastro, confirmação de seis dígitos, reenvio, login, Google, expiração/logout e recuperação de senha ainda pendente.
- Cadastro de turmas, aluno sem delegação, aprovação pela organização e retirada de vínculo ainda sem endpoint correspondente.
- CRUD e autorização de postagens, tarefas, cronogramas e links; recursos compartilhados e consequência de exclusão global.
- Perfil e foto, incluindo limitações atuais de remoção e de edição por pendentes.
- Chat por delegação, leitura independente por pessoa, contadores e restrição de perfis.
- Notificações de postagens, tarefas, chat e atrasos; necessidade de agendador e permissão do navegador.
- PWA instalável e cache do shell; diferenciar isso de acesso/edição offline de dados privados, que não está implementado.
- História com conteúdo mantido em arquivos locais e responsabilidade editorial.
- Upload de imagem e PDF como infraestrutura; distinguir PDF enviado de link cadastrado na delegação.

## Requisitos futuros de avaliação

Os identificadores abaixo são **sugestões novas**, a renumerar junto da lista existente, sem sobrescrever o significado de RF008/RF009 silenciosamente.

| ID sugerido | Descrição e aceite mínimo |
| --- | --- |
| RF-AV01 | Avaliador autorizado acessa seu painel e páginas de visitante; não recebe funções de aluno ou organização. API também impede os acessos. |
| RF-AV02 | Seleciona delegação e modalidade/tema disponíveis para avaliação. Informar claramente o evento/edição, se adotado. |
| RF-AV03 | Registra nota válida com autoria obtida da sessão, confirmação e recuperação de falha sem duplicar envio. |
| RF-AV04 | Servidor valida escala, precisão, duplicidade e permissão; não confia em validação apenas do front. |
| RF-AV05 | Servidor calcula média por delegação e tema e informa quantidade de avaliações. Tema sem notas não recebe zero artificial. |
| RF-AV06 | Delegação consulta resultados agrupados por tema, como Mesa de cooperação, Debate e Desafio gastronômico. |
| RF-AV07 | Revisão/publicação de notas segue regra aprovada; alterações relevantes possuem responsável e data. |

A organização ainda deve decidir escala, critérios/pesos, número de avaliações permitido, correção/exclusão, visibilidade das notas individuais, publicação, média geral/ranking, desempate, ausência de participação e histórico anual. Registrar decisões como regras de negócio; não implementar suposições escondidas.

Atualizar o MER futuro com avaliador, delegação, tema e avaliação; incluir edição do evento caso seja aprovada. As modalidades avaliativas não são automaticamente as categorias de tarefas nem os números das categorias do cronograma. “Comida típica” e “Desafio gastronômico” precisam de mapeamento acordado.

## Informações técnicas que faltam na documentação central

Registrar os dois domínios publicados, `/api` via Vite/Vercel e a exceção OAuth por cookie diretamente na API. Listar responsáveis pelo deploy, acesso a domínio/provedor, banco, SMTP, OAuth, mídia e VAPID; guardar somente **nomes de configurações e responsáveis**, nunca seus valores secretos.

Descrever instalação a partir de clone limpo, dados iniciais, backup/restauração, migração, retorno de versão, atualização do Service Worker e agendamento de atrasos. Registrar a versão de Python escolhida: há divergência entre declaração do projeto, runtime e ambiente encontrado.

Guardar evidência de homologação por versão: frontend/back utilizados, banco, navegador/dispositivo, cenários executados e resultado. Teste automatizado com API simulada e GET público em produção não comprovam cadastro real, Google, envio de mensagem entre pessoas ou entrega push. A rota ausente de retirada de participante exemplifica por que a integração real precisa de uma etapa própria.

## Ordem sugerida para revisar

1. Retirar credenciais e conteúdo de template; corrigir tecnologias e estado real das funcionalidades.
2. Publicar a passagem de bastão com commits e responsáveis e ligar os três repositórios a ela.
3. Atualizar requisitos e regras, distinguindo entregue, parcial e futuro.
4. Atualizar MER/casos de uso e detalhar avaliador/notas após fechar as decisões da organização.
5. Manter backlog e homologação por versão, em vez de acrescentar novos planos contraditórios ao README.
