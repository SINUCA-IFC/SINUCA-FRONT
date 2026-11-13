# Post Push Notifications Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Notify every subscribed active user when an organizer creates a post, except the browser that created it.

**Architecture:** Django stores one Web Push subscription per browser and sends a small VAPID payload after the post transaction commits. Vue registers the browser subscription, supplies its endpoint on API requests, and uses a custom service worker to display and route notification clicks.

**Tech Stack:** Django 5, Django REST Framework, `pywebpush`, Vue 3, Pinia, Axios, Vite PWA `injectManifest`, Web Push API.

**Spec:** `docs/AFAZERES.md`, section “Notificações push — prioridade atual”; this plan implements only `post_created`.

## Global Constraints

- Follow the Unit 8 Web Push flow: VAPID, custom service worker, browser subscription, authenticated registration, and user-triggered permission request.
- Do not change profile or e-mail authentication.
- Do not implement task notifications, an internal notification center, chat notifications, or schedule notifications in this plan.
- Push failures must never undo a successfully created post.
- Never expose `VAPID_PRIVATE_KEY` to the frontend.
- Do not cache authenticated API responses in the service worker.

## Review Focus

- A subscription endpoint registered by a new account on the same browser must belong only to the current account.
- An unauthenticated client must not create or delete subscriptions.
- A malformed browser subscription must return HTTP 400 without partial data.
- Missing VAPID configuration or an unavailable Push Service must not reject post creation.
- Permission denied, unsupported browsers, and unsubscribe failures must leave login/logout usable.

---

### Task 1: Subscription API and Web Push delivery service

**Files:**
- Create: `SINUCA-BACK/core/models/push_subscription.py`
- Create: `SINUCA-BACK/core/serializers/push_subscription.py`
- Create: `SINUCA-BACK/core/views/push_subscription.py`
- Create: `SINUCA-BACK/core/services/__init__.py`
- Create: `SINUCA-BACK/core/services/push.py`
- Create: `SINUCA-BACK/core/migrations/0029_pushsubscription.py`
- Create: `SINUCA-BACK/core/tests/test_push_subscriptions.py`
- Modify: `SINUCA-BACK/core/models/__init__.py`
- Modify: `SINUCA-BACK/core/serializers/__init__.py`
- Modify: `SINUCA-BACK/core/views/__init__.py`
- Modify: `SINUCA-BACK/app/urls.py`
- Modify: `SINUCA-BACK/app/settings.py`
- Modify: `SINUCA-BACK/requirements.txt`
- Modify: `SINUCA-BACK/pyproject.toml`
- Modify: `SINUCA-BACK/pdm.lock`

**Interfaces:**
- Produces: `GET /api/vapid-public-key/`; authenticated `POST` and `DELETE /api/push-subscriptions/`; `send_push_event(payload, *, excluded_endpoint=None, user_ids=None)`.
- Consumes: subscription JSON shaped as `{endpoint, keys: {p256dh, auth}}`.

- [ ] **Step 1: Write failing API and delivery tests**

Cover public-key visibility, authentication, malformed payloads, endpoint ownership transfer, owner-only deletion, active-user filtering, origin exclusion, and 404/410 deactivation.

- [ ] **Step 2: Run tests and verify RED**

Run: `python manage.py test core.tests.test_push_subscriptions`

Expected: FAIL because routes, model, and service do not exist.

- [ ] **Step 3: Implement model, migration, API, settings, dependency, and delivery service**

Use `PushSubscription(user, endpoint, p256dh, auth, active, created_at, updated_at)`. Upsert by unique endpoint, assigning it to the authenticated user. Delete only records owned by that user. Send only to active subscriptions whose users are active; mark HTTP 404/410 responses inactive.

- [ ] **Step 4: Run backend tests and verify GREEN**

Run: `python manage.py test core.tests.test_push_subscriptions && python manage.py test`

Expected: subscription tests and full backend suite PASS.

### Task 2: Emit `post_created` after commit

**Files:**
- Create: `SINUCA-BACK/core/tests/test_post_push_notifications.py`
- Modify: `SINUCA-BACK/core/views/post.py`

**Interfaces:**
- Consumes: `send_push_event(payload, *, excluded_endpoint=None, user_ids=None)` from Task 1.
- Produces: `post_created` payload with `event`, `title`, `body`, and `data: {post_id, url}`.

- [ ] **Step 1: Write failing post notification tests**

Cover successful creation, `X-Push-Endpoint` exclusion, all subscribed active recipients, exact navigation data, and a Push Service failure that still returns HTTP 201 and persists the post.

- [ ] **Step 2: Run tests and verify RED**

Run: `python manage.py test core.tests.test_post_push_notifications`

Expected: FAIL because post creation does not emit push.

- [ ] **Step 3: Implement post event emission**

Override `PostViewSet.perform_create`. Save first, then register `transaction.on_commit` with the request origin endpoint. Keep payload content minimal and route clicks to `/mural`.

- [ ] **Step 4: Run backend tests and verify GREEN**

Run: `python manage.py test core.tests.test_post_push_notifications && python manage.py test`

Expected: post notification tests and full backend suite PASS.

### Task 3: Browser subscription, permission prompt, and service worker

**Files:**
- Create: `src/services/pushNotificationService.js`
- Create: `src/components/NotificationPrompt.vue`
- Create: `src/sw.js`
- Create: `tests/pushNotifications.test.js`
- Modify: `src/App.vue`
- Modify: `src/plugins/axios.js`
- Modify: `src/stores/userStore.js`
- Modify: `src/components/layout/desktop/AppSidebarDesktop.vue`
- Modify: `vite.config.js`

**Interfaces:**
- Consumes: Task 1 endpoints and subscription JSON contract.
- Produces: `subscribeToPush()`, `unsubscribeFromPush()`, `syncPushSubscription()`, `requestPushPermission()`, and local `push_endpoint` state used by Axios.

- [ ] **Step 1: Write failing frontend service tests**

Cover unsupported browser, denied permission, VAPID conversion, authenticated subscription registration, unsubscribe cleanup despite API failure, login auto-sync when permission is already granted, logout cleanup, and `X-Push-Endpoint` injection.

- [ ] **Step 2: Run tests and verify RED**

Run: `npm test`

Expected: FAIL because the push service and integrations do not exist.

- [ ] **Step 3: Implement browser service and account integration**

Register the existing browser subscription or create one with the public VAPID key. Persist only its endpoint locally. Make logout wait for cleanup but clear session in `finally`; push failure cannot block logout.

- [ ] **Step 4: Implement custom service worker and prompt**

Switch Vite PWA to `injectManifest`. Precache only build assets. Handle `push` and `notificationclick`, focus an existing window or open `/mural`, and notify the application through `postMessage`. Show “Ativar” and “Agora não” only to authenticated users while permission is `default`.

- [ ] **Step 5: Run frontend tests and build**

Run: `npm test && npm run build`

Expected: frontend suite PASS and production build completes with injected service worker manifest.

### Task 4: Cross-stack verification and task register

**Files:**
- Modify: `docs/AFAZERES.md`

**Interfaces:**
- Consumes: completed backend and frontend behavior from Tasks 1–3.
- Produces: checked backlog items only for the delivered `post_created` scope.

- [ ] **Step 1: Verify migrations and configuration**

Run: `python manage.py makemigrations --check --dry-run && python manage.py check`

Expected: no pending model changes and no system-check errors.

- [ ] **Step 2: Run both complete suites and inspect diffs**

Run: `python manage.py test`, then `npm test && npm run build`, then `git diff --check` in both repositories.

Expected: all tests PASS, build completes, and both diff checks return no output.

- [ ] **Step 3: Mark only completed post-notification tasks**

Keep task-assignment and overdue-notification work unchecked.
