import { test } from 'node:test'
import assert from 'node:assert/strict'
import axios from 'axios'
import TaskService from '../src/services/taskService.js'
import UserService from '../src/services/userService.js'

test('loads every page and includes only tasks assigned to the current user', async (t) => {
  const pages = []
  t.mock.method(axios, 'get', async (url, config) => {
    if (url === '/tarefas/') {
      pages.push(config.params.page)
      return {
        data: {
          total_pages: 2,
          results:
            config.params.page === 1
              ? [{ id: 1 }, { id: 2 }]
              : [
                  { id: 3, user: [7] },
                  { id: 4, user: [] },
                ],
        },
      }
    }
    return {
      data: {
        id: Number(url.split('/')[2]),
        user: url === '/tarefas/1/' ? [{ id: '7' }] : [{ id: 8 }],
      },
    }
  })
  const result = await new TaskService().getAssignedTasks(7)
  assert.deepEqual(pages, [1, 2])
  assert.deepEqual(
    result.map((task) => task.id),
    [1, 3],
  )
})

test('does not request activities without an authenticated user ID', async (t) => {
  const get = t.mock.method(axios, 'get', () => {
    throw new Error('Unexpected request')
  })
  assert.deepEqual(await new TaskService().getAssignedTasks(null), [])
  assert.equal(get.mock.callCount(), 0)
})

test('propagates detail failures instead of returning a misleading partial list', async (t) => {
  t.mock.method(axios, 'get', async (url) => {
    if (url === '/tarefas/') return { data: { results: [{ id: 1 }], total_pages: 1 } }
    throw new Error('Network unavailable')
  })
  await assert.rejects(new TaskService().getAssignedTasks(7), /Network unavailable/)
})

test('updates the authenticated profile with the image attachment key', async (t) => {
  const changes = { name: 'Ana Silva', foto_attachment_key: 'uploaded-photo-key' }
  t.mock.method(axios, 'patch', async (url, payload) => {
    assert.equal(url, '/usuarios/7/')
    assert.deepEqual(payload, changes)
    return { data: { id: 7, name: payload.name, foto: { url: '/photo.png' } } }
  })
  assert.equal((await new UserService().updateProfile(7, changes)).name, 'Ana Silva')
})
