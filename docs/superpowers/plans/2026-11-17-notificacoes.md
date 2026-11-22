# Notificações Implementation Plan

> **For agentic workers:** Execute inline with superpowers:executing-plans and test-driven-development. Do not commit or publish automatically.

**Goal:** Complete push and shared unread badges across Django and Vue.
**Architecture:** Existing Web Push service, transaction callbacks, daily Django overdue command, custom PWA worker and shared Pinia conversations.
**Tech Stack:** Django/DRF, pywebpush, Vue/Pinia, Vite PWA/Workbox.
**Spec:** ../specs/2026-11-17-notificacoes-design.md (approved).

## Global Constraints
- Keep feature branches/workspaces supplied by the user; no commits or deploy.
- Failure of push cannot reject the underlying action. No authenticated API caching.
- Preserve explicit read receipts and account isolation. No new server services.

## Review Focus
- Session changes and stalled worker registration cannot hang login/logout or leak prior state.
- New deadlines, completed tasks, absent subscriptions and retries must behave consistently.
- Recipients must match chat side/country and newly assigned task users.
- Badge refresh must work without push permission and ignore stale requests.
- Notification clicks must stay local and survive login.

### Task 1: Backend events and overdue command
Files: core/services/push.py, core/services/notifications.py, core/views/task.py, core/views/message.py, core/models/task.py, core/migrations/0030_taskoverduenotification.py, core/management/commands/notify_overdue_tasks.py, app/settings.py, core/tests/test_task_push_notifications.py, core/tests/test_chat_push_notifications.py.
Interfaces: send_push_event returns delivered subscription count; schedule_push_event(payload, excluded_endpoint=None, user_ids=None) sends safely after commit; notify_overdue_tasks command registers successful delivery per task/user/deadline.
- [x] Write tests for task assignment differences, chat sides, failure isolation, overdue eligibility/idempotence/retry/deadline changes and CORS; observe RED.
- [x] Implement minimal event callbacks, receipt model/migration and command; observe GREEN.
- [x] Run backend suite and migration check.

### Task 2: Browser subscription and PWA
Files: src/services/pushNotificationService.js, src/services/pushNotificationPayload.js, src/sw.js, src/components/NotificationPrompt.vue, src/App.vue, src/router/index.js, src/stores/userStore.js, vite.config.js, package.json/package-lock.json, tests/pushNotifications.test.js.
Interfaces: subscribeToPush/syncPushSubscription/unsubscribeFromPush; getPushTarget, getPushPresentation, handlePushNotificationClick; worker messages PUSH_RECEIVED/PUSH_NOTIFICATION_CLICKED; local notification targets after auth.
- [x] Add behavioral tests for routing, bounded worker wait and logout failures; observe RED.
- [x] Complete worker, prompt, click navigation/data refresh, session cleanup; observe GREEN.
- [x] Run front suite and production build.

### Task 3: Shared conversations and indicators
Files: src/stores/chatStore.js, src/components/chat/UnreadBadge.vue, src/components/chat/DelegationChatList.vue, src/components/layout/desktop/AppSidebarDesktop.vue, src/components/layout/mobile/AppTabFooter.vue, src/views/ChatView.vue, tests/chatStore.test.js, src/App.vue.
Interfaces: useChatStore.conversations/unreadCount/refresh/reset; one polling owner in App.vue; chat reads and sends refresh this store.
- [x] Write counter/isolation/request-deduplication tests; observe RED.
- [x] Share conversation state and badge, preserve receipt behavior; observe GREEN.
- [x] Run suites/build; review complete diff.

### Task 4: Documentation and verification
Files: docs/NOTIFICACOES.md in back and front docs/AFAZERES.md.
- [x] Document environment keys, migrations, HTTPS, daily cron and limits/retries.
- [x] Document cumulative CHORE-to-feature changes, verify suites/build/migrations and review with fresh reviewer.

## Progress and rulings
- Design approved by user. Baselines: front df274f7, back 3b06c02.
- Ruling: use existing feature branches feat-99/feat-61 and leave edits uncommitted for review in IDE.
- Task 1: complete; task/chat/overdue tests observed RED then GREEN; backend suite 117 passed before final review fixes, migrations 0029/0030 applied in temporary in-memory database, migration drift check passed.
- Task 2: complete; browser/worker tests cover click routing, invalid payload, registration failure/timeouts, logout cleanup and registration/logout race; production build generated injectManifest worker.
- Task 3: complete; counts, shared refresh, forced refresh after read and account isolation observed RED then GREEN; UI reuses UnreadBadge across desktop/mobile/country list.
- Final review: fresh read-only reviewer found four Important issues, no Critical/Minor. Network failures per endpoint, TTL=0, assigned users without country, stale task mutations. Regression tests reproduced all four before fixes.
- Ruling: allow reading only explicitly assigned tasks for accounts without country and show notification target in read-only modal; preserve pending-student write restrictions and unrelated delegation access. Cost: accounts without delegation cannot edit through this notification preview.
- Ruling: retain notifications in Push Service for up to 24 hours. Cost: an accepted notification can describe an event that changed afterward; opening it fetches current data.
- Final review scope: real-browser delivery, HTTPS/VAPID and production scheduler require published environment; documented as deployment steps.
- Final verification: `npm test` passed; `node --import ./tests/register.js --test --test-isolation=none tests/*.test.js` passed 49/49; `npm run build` generated `dist/sw.js` with injectManifest. Backend `DATABASE_URL=sqlite:///:memory: /tmp/sinuca-notifications-venv/bin/python manage.py test --noinput` passed 121/121. Ruff passed for changed backend files, migration drift check reported no changes, both diffs passed whitespace check.
- Task 4: complete. Operational steps and cumulative changes are in front/back `docs/NOTIFICACOES.md`; AFAZERES separates implemented work from production validation. All four review findings reproduced RED and passed GREEN after fixes; no deferred code findings. Workspace changes intentionally remain uncommitted.
