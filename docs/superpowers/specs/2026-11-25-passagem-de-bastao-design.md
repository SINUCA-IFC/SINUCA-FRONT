# Simplificação e passagem de bastão

Objetivo: tornar front e back compreensíveis para alunos dos materiais de Vue/Pinia/Axios/PWA e Django/DRF indicados pelo usuário. Fazer uma varredura dos dois repositórios e remover código sem consumidor e redundâncias comprovadas, preservando funcionalidades, contratos, permissões e testes. Não implementar avaliações.

Abordagem: manter componentes, stores e serviços existentes e modelos/serializers/viewsets do DRF. Uma reescrita de arquitetura ou remoção de controles de sessão, upload, autorização e notificações teria risco e dificultaria a continuidade. Excluir somente integrações órfãs, telas não roteadas, estados de exemplo e caminhos legados duplicados. Tornar comandos operacionais explícitos.

Entregas: simplificações verificadas; READMEs atuais; `docs/PASSAGEM-DE-BASTAO.md` com arquitetura, inventário, operação, situação verificada, pendências priorizadas e requisitos futuros de avaliador/notas; `docs/REVISAO-DOCUMENTACAO-PI.md` com recomendações específicas para o repositório de documentação. Recomendar o repositório documental como destino final do documento central.

Avaliações futuras: avaliador escolhe delegação e registra nota por modalidade/tema. O sistema calcula médias e a delegação consulta resultados separados por tema. A área de avaliador oferece avaliação e páginas públicas já acessíveis ao visitante. Não criar modelos, endpoints ou telas desse sistema nesta entrega. Escala, pesos, critérios, edição de notas e publicação precisam de decisão futura.

Validação: testes do front e back (SQLite em memória e settings_test), lint/build, navegação com API simulada e consulta somente de leitura à produção. Não publicar, alterar banco real, reescrever migrações nem copiar credenciais para os documentos.
