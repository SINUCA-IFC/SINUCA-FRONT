import assert from 'node:assert/strict'
import { beforeEach, afterEach, test } from 'node:test'
import { createPinia, setActivePinia } from 'pinia'
import axios from 'axios'
import { useUserStore } from '../src/stores/userStore.js'

const originalAdapter = axios.defaults.adapter
const { useChatStore } = await import('../src/stores/chatStore.js')
const respond = (config, rows) => ({
  config,
  data: { results: rows, total_pages: 1 },
  status: 200,
  headers: {},
})

beforeEach(() => {
  setActivePinia(createPinia())
  globalThis.localStorage = { getItem: () => null, setItem() {}, removeItem() {} }
})
afterEach(() => {
  axios.defaults.adapter = originalAdapter
})

test('chat badges count messages for delegates and countries for organizers', async () => {
  assert.equal(typeof useChatStore, 'function')
  const auth = useUserStore()
  auth.loggedIn = true
  auth.user = { id: 1, role: 'student', country: { id: 7 } }
  axios.defaults.adapter = async (config) => respond(config, [{ id: 7, unread_count: 12 }])
  const chat = useChatStore()
  await chat.refresh()
  assert.equal(chat.unreadCount, 12)
  auth.user = { id: 2, role: 'organizer' }
  axios.defaults.adapter = async (config) =>
    respond(config, [
      { id: 7, unread_count: 12 },
      { id: 8, unread_count: 1 },
      { id: 9, unread_count: 0 },
    ])
  await chat.refresh()
  assert.equal(chat.unreadCount, 2)
})

test('shared refresh deduplicates requests and reset ignores old account response', async () => {
  assert.equal(typeof useChatStore, 'function')
  const auth = useUserStore()
  auth.loggedIn = true
  auth.user = { id: 1, role: 'organizer' }
  let release
  let calls = 0
  axios.defaults.adapter = (config) => {
    calls += 1
    return new Promise((resolve) => {
      release = () => resolve(respond(config, [{ id: 7, unread_count: 9 }]))
    })
  }
  const chat = useChatStore()
  const first = chat.refresh()
  const second = chat.refresh()
  await new Promise((resolve) => setTimeout(resolve, 0))
  assert.equal(calls, 1)
  chat.reset()
  auth.user = { id: 2, role: 'organizer' }
  release()
  await Promise.all([first, second])
  assert.deepEqual(chat.conversations, [])
  assert.equal(chat.unreadCount, 0)
})

test('accounts without chat access never request conversations', async () => {
  assert.equal(typeof useChatStore, 'function')
  const auth = useUserStore()
  const chat = useChatStore()
  let calls = 0
  axios.defaults.adapter = async (config) => {
    calls++
    return respond(config, [])
  }
  for (const user of [
    { id: 1, role: 'evaluator' },
    { id: 2, role: 'student', country: null },
  ]) {
    auth.loggedIn = true
    auth.user = user
    await chat.refresh()
    assert.equal(chat.unreadCount, 0)
  }
  assert.equal(calls, 0)
})

test('a task refresh from a previous account cannot restore private task state', async () => {
  const { useTaskStore } = await import('../src/stores/taskStore.js')
  const auth = useUserStore()
  auth.loggedIn = true
  auth.user = { id: 1, role: 'student', country: { id: 7 } }
  const tasks = useTaskStore()
  let release
  axios.defaults.adapter = (config) =>
    new Promise((resolve) => {
      release = () => resolve(respond(config, [{ id: 9, title: 'Conta anterior' }]))
    })
  const request = tasks.getTasks()
  await new Promise((resolve) => setTimeout(resolve, 0))
  auth.user = { id: 2, role: 'student', country: { id: 8 } }
  release()
  await request
  assert.deepEqual(tasks.tasks, [])
})

test('refresh after a read receipt waits for older polling and fetches the updated count', async () => {
  const auth = useUserStore()
  auth.loggedIn = true
  auth.user = { id: 1, role: 'organizer' }
  const chat = useChatStore()
  let release
  let calls = 0
  axios.defaults.adapter = (config) => {
    calls++
    if (calls === 1)
      return new Promise((resolve) => {
        release = () => resolve(respond(config, [{ id: 7, unread_count: 2 }]))
      })
    return Promise.resolve(respond(config, [{ id: 7, unread_count: 0 }]))
  }
  const polling = chat.refresh()
  await new Promise((resolve) => setTimeout(resolve, 0))
  const afterRead = chat.refresh({ force: true })
  release()
  await Promise.all([polling, afterRead])
  assert.equal(calls, 2)
  assert.equal(chat.unreadCount, 0)
})

test('task mutations from a previous account cannot change the current account tasks', async () => {
  const { useTaskStore } = await import('../src/stores/taskStore.js')
  for (const operation of ['create', 'update', 'delete']) {
    setActivePinia(createPinia())
    const auth = useUserStore()
    auth.loggedIn = true
    auth.user = { id: 1, role: 'student', country: { id: 7 } }
    const tasks = useTaskStore()
    let release
    axios.defaults.adapter = (config) =>
      new Promise((resolve) => {
        release = () => resolve({ ...respond(config, []), data: { id: 9, title: 'Conta A' } })
      })
    const request =
      operation === 'create'
        ? tasks.createTask({ title: 'Conta A' })
        : operation === 'update'
          ? tasks.updateTask(9, { title: 'Conta A' })
          : tasks.deleteTask(9)
    await new Promise((resolve) => setTimeout(resolve, 0))
    auth.user = { id: 2, role: 'student', country: { id: 8 } }
    tasks.tasks = [{ id: 9, title: 'Conta B' }]
    release()
    await request
    assert.deepEqual(tasks.tasks, [{ id: 9, title: 'Conta B' }], operation)
  }
})

test('a pending task move cannot reorder tasks loaded by another account', async () => {
  const { useTaskStore } = await import('../src/stores/taskStore.js')
  const auth = useUserStore()
  auth.loggedIn = true
  auth.user = { id: 1 }
  const tasks = useTaskStore()
  tasks.tasks = [
    { id: 9, status: 1 },
    { id: 10, status: 2 },
  ]
  let release
  axios.defaults.adapter = (config) =>
    new Promise((resolve) => {
      release = () => resolve({ ...respond(config, []), data: { id: 9, status: 2 } })
    })
  const request = tasks.moveTask(9, 2, 10)
  await new Promise((resolve) => setTimeout(resolve, 0))
  auth.user = { id: 2 }
  tasks.tasks = [
    { id: 8, title: 'Conta B' },
    { id: 9, title: 'Conta B' },
  ]
  release()
  await request
  assert.deepEqual(tasks.tasks, [
    { id: 8, title: 'Conta B' },
    { id: 9, title: 'Conta B' },
  ])
})
