# Simplificação e passagem de bastão Implementation Plan

**Goal:** reduzir código morto e fornecer documentação de continuidade fiel à aplicação.

**Architecture:** manter Vue/Pinia/Axios e Django/DRF; remover redundâncias por evidência de uso e proteger os contratos com as suítes existentes.

**Spec:** ../specs/2026-11-25-passagem-de-bastao-design.md

- [x] Consultar cursos e clonar documentação pública para leitura.
- [x] Auditar front e back independentemente, registrar revisões e baseline.
- [x] Remover integrações, estados e fluxos legados sem consumidor, sem alterar funcionalidades.
- [x] Escrever passagem de bastão e recomendações para a documentação PI; atualizar READMEs.
- [x] Revisar diff, executar testes/lint/build/checks isolados e verificar local/produção.
- [x] Entregar arquivos e indicar o que depende de decisões, publicação ou validação operacional real.

## Baseline

Front a309b36d513f6517f72d190fe8f72714f6ebdec5: npm test (10 arquivos), lint e build passaram.
Back d08c0714361b0ebea6ab70b6a4e710f97ec7ee0d: 185 testes passaram com app.settings_test; sem migrações novas. Aviso VAPID esperado no ambiente isolado.

Decisões: documentação salva neste checkout do front; destino central recomendado é SINUCA-Documentacao-PI/docs/PASSAGEM-DE-BASTAO.md. O repositório externo é consultado, sem publicação ou alterações remotas.

## Resultado final

- Front: npm test passou nos dez arquivos; npm run lint e npm run build (incluindo Service Worker) passaram. Regra de variáveis sem uso reativada.
- Navegador: rodada completa com código estável, Chrome e API simulada passou **54/54** em 1,7 minuto. Seletores antigos de postagens foram alinhados ao texto real “Ler mais/menos”, preservando assertions.
- Back: **185/185** testes passaram com app.settings_test em banco em memória. Check apresentou somente o aviso esperado de VAPID vazia; makemigrations dry-run não detectou mudanças.
- Dependências: lock npm removeu 130 entradas, sem adicionar pacotes ou alterar versões remanescentes. PDM mudou somente content_hash, preservando pacotes, versões e hashes; requirements exportado não mudou.
- Documentos: links relativos conferidos, READMEs atualizados, backlog histórico sinalizado. Revisão independente não encontrou regressões nas remoções; corrigida a redação ambígua sobre o prefixo /api.
- Operação: os verificadores de localhost:5173 e produção passaram (postagens JSON/200, login vazio JSON/400). Mural, história e placeholder avaliador abriram em 390 e 1440 px nos dois ambientes, sem erro JavaScript ou overflow detectado.
- Integração pendente confirmada no resolver Django: remover-delegacao retorna Resolver404; aprovar e registro resolvem. Registrada como prioridade, sem implementar endpoint fora do escopo.
- Não foram realizados deploy, migração/carga em banco real, login em contas reais, homologação SMTP/Google/push ou publicação da documentação externa.
