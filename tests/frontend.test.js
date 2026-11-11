import assert from 'node:assert/strict'
import { afterEach, beforeEach, test } from 'node:test'
import axios from 'axios'
import { createPinia, setActivePinia } from 'pinia'
import TaskService from '../src/services/taskService.js'
import { useTaskStore } from '../src/stores/taskStore.js'
import { useGangStore } from '../src/stores/gangStore.js'
import { useCountryStore } from '../src/stores/countryStore.js'
import { UseCategoryStore } from '../src/stores/categoryStore.js'
import { useUserStore } from '../src/stores/userStore.js'
import { usePostStore } from '../src/stores/postStore.js'
import { useScheduleStore } from '../src/stores/scheduleStore.js'
import { useLinkStore } from '../src/stores/linkStore.js'

const originalAdapter = axios.defaults.adapter
beforeEach(() => setActivePinia(createPinia()))
afterEach(() => { axios.defaults.adapter = originalAdapter })

function respond(config, data) {
  return { config, data, status: 200, statusText: 'OK', headers: {} }
}

test('task dates cleared in the form become null without altering the form state', async () => {
  let sent
  axios.defaults.adapter = async config => {
    sent = JSON.parse(config.data)
    return respond(config, { id: 1, ...sent })
  }
  const input = { title: 'Estudo', startDate: '', endDate: '', category: [99], user: [1] }
  await new TaskService().createTask(input)
  assert.equal(sent.startDate, null)
  assert.equal(sent.endDate, null)
  assert.equal(input.startDate, '')
})

test('partial task edit does not clear omitted dates', async () => {
  let sent
  axios.defaults.adapter = async config => {
    sent = JSON.parse(config.data)
    return respond(config, { id: 1, ...sent })
  }
  await new TaskService().updateTask('1', { title: 'Novo título' })
  assert.equal(Object.hasOwn(sent, 'startDate'), false)
  assert.equal(Object.hasOwn(sent, 'endDate'), false)
})

test('task store updates and deletes numeric IDs received as route strings', async () => {
  const store = useTaskStore()
  store.tasks = [{ id: 7, title: 'Original', category: [] }]
  axios.defaults.adapter = async config => respond(config, { id: 7, title: 'Atualizada', category: [] })
  await store.updateTask('7', { title: 'Atualizada' })
  assert.equal(store.tasks[0].title, 'Atualizada')
  await store.deleteTask('7')
  assert.deepEqual(store.tasks, [])
})

test('a rejected deletion preserves the existing task', async () => {
  const store = useTaskStore()
  store.tasks = [{ id: 7, title: 'Original' }]
  axios.defaults.adapter = async () => { throw new Error('API unavailable') }
  await assert.rejects(store.deleteTask('7'))
  assert.equal(store.tasks[0].title, 'Original')
})

const lists = [
  ['tarefas', useTaskStore, 'getTasks', 'tasks'],
  ['categorias', UseCategoryStore, 'getCategories', 'categories'],
  ['paises', useCountryStore, 'getCountrys', 'countrys'],
  ['turmas', useGangStore, 'getGangs', 'gangs'],
  ['usuarios', useUserStore, 'getAllUsers', 'users'],
  ['postagens', usePostStore, 'getPosts', 'posts'],
  ['cronogramas', useScheduleStore, 'getSchedules', 'schedules'],
  ['docs', useLinkStore, 'getLinks', 'links'],
]

for (const [endpoint, getStore, action, property] of lists) {
  test(`${endpoint} list includes later pages instead of truncating at ten`, async () => {
    const requested = []
    axios.defaults.adapter = async config => {
      assert.equal(config.url, `/${endpoint}/`)
      const page = Number(config.params?.page || 1)
      requested.push(page)
      return respond(config, {
        page, total_pages: 2,
        results: page === 1 ? Array.from({ length: 10 }, (_, i) => ({ id: i + 1 })) : [{ id: 11 }, { id: 12 }],
      })
    }
    const store = getStore()
    await store[action]()
    assert.equal(store[property].length, 12)
    assert.deepEqual(requested, [1, 2])
    assert.equal(store[property][11].id, 12)
  })
}

test('failed pagination does not replace the current list with incomplete results', async () => {
  const store = useTaskStore()
  store.tasks = [{ id: 42 }]
  axios.defaults.adapter = async config => {
    if (config.params?.page === 2) throw new Error('Page unavailable')
    return respond(config, { page: 1, total_pages: 2, results: [{ id: 1 }] })
  }
  await assert.rejects(store.getTasks())
  assert.deepEqual(store.tasks.map(task => task.id), [42])
})

test('category without predefined style still has a visible icon and background', () => {
  const style = UseCategoryStore().getCategoryActive(99)
  assert.ok(style?.icon)
  assert.ok(style?.activeStyle)
})
