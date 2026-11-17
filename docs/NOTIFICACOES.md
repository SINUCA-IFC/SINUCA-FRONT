# Notificações e mensagens não lidas

O PWA segue o fluxo de [Web Push da Unidade 8](https://eduardo-da-silva.github.io/desenvolvimento-mobile/unidade8/): Service Worker próprio com `injectManifest`, VAPID, inscrição do navegador, integração com sessão e pedido de permissão por ação do usuário.

- Após login, “Ativar” solicita permissão e cadastra a inscrição; “Agora não” dispensa o banner neste navegador. A permissão já concedida é sincronizada nos próximos logins/restaurações.
- Postagens avisam todos os inscritos ativos; tarefas avisam novos responsáveis; atraso avisa responsáveis de tarefas vencidas e não concluídas; chat avisa o outro lado da conversa por delegação.
- Clique abre mural, Kanban com a tarefa destacada, ou chat correspondente. Uma sessão expirada preserva o destino durante a escolha de perfil e login. Contas sem delegação podem visualizar tarefas explicitamente atribuídas pelo administrador em um modal somente leitura, mantendo as restrições de escrita existentes.
- Os arquivos públicos do build ficam em precache. Respostas autenticadas da API não são armazenadas no Service Worker.
- O menu desktop e a navegação mobile compartilham o indicador: mensagens para delegados, países com não lidas para organizadores. Na lista de países permanece a quantidade de mensagens de cada país. Acima de 99, exibe `99+`, com quantidade exata no texto acessível.
- Os contadores atualizam após leitura/marcação manual, push e retorno à aba, além de consulta a cada 10 segundos com aba visível. Não dependem de conceder permissão push. Consultar a conversa não confirma leitura; o histórico precisa estar visível e no final.
- Logout remove inscrição no servidor/navegador e estado local. Respostas antigas de conversas são ignoradas ao trocar de conta. Espera pelo Service Worker e requisições de inscrição têm limite de tempo.
- Consultas e mutações de tarefas iniciadas por uma conta não modificam o estado de outra conta após a troca de sessão. O toggle legado de notificação foi retirado do formulário, pois não representava uma preferência efetiva de push.

```bash
npm install
npm test
npm run build
```

Publique o build com HTTPS, a API atualizada e as migrações aplicadas. O backend deve ter o par VAPID configurado e executar `python manage.py notify_overdue_tasks` diariamente; os detalhes e o exemplo de cron estão em `SINUCA-BACK/docs/NOTIFICACOES.md`. O agendamento externo não é criado pelo front.

O CHORE front `df274f7` iniciou o serviço de inscrições e os helpers; o CHORE back `3b06c02` iniciou inscrições, VAPID e envio para postagens. Esta implementação completa a exibição e os cliques, adiciona tarefas/atrasos/chat e os indicadores compartilhados. O resumo cumulativo detalhado está no documento do backend.

Testes automatizados simulam o navegador/Push Service. Entrega real exige dois navegadores inscritos com VAPID válido. Os navegadores precisam suportar Web Push; no iOS, o PWA deve estar instalado na tela inicial quando exigido pelo sistema. Permissão negada é alterada nas configurações do navegador.
