import assert from 'node:assert/strict'
import { afterEach, test } from 'node:test'
import axios from 'axios'

const originalAdapter = axios.defaults.adapter
afterEach(() => {
  axios.defaults.adapter = originalAdapter
})

const response = (config, data) => ({ config, data, status: 200, statusText: 'OK', headers: {} })

test('chat loads all pages for the chosen delegation in chronological order', async () => {
  const { default: MessageService } = await import('../src/services/messageService.js')
  const pages = []
  axios.defaults.adapter = async (config) => {
    assert.equal(config.url, '/mensagens/')
    assert.equal(config.params.country, 7)
    pages.push(config.params.page)
    return response(config, {
      page: config.params.page,
      total_pages: 2,
      results:
        config.params.page === 1
          ? [{ id: 3, text: 'Recente', created_at: '2026-11-11T12:00:00-03:00' }]
          : [
              { id: 2, text: 'Segunda', created_at: '2026-11-11T11:00:00-03:00' },
              { id: 1, text: 'Primeira', created_at: '2026-11-11T11:00:00-03:00' },
            ],
    })
  }
  const messages = await new MessageService().getMessages(7)
  assert.deepEqual(
    messages.map((message) => message.id),
    [1, 2, 3],
  )
  assert.deepEqual(pages, [1, 2])
})

test('chat sends text and delegation without trusting a client-supplied author', async () => {
  const { default: MessageService } = await import('../src/services/messageService.js')
  let body
  axios.defaults.adapter = async (config) => {
    assert.equal(config.url, '/mensagens/')
    assert.equal(config.method, 'post')
    body = JSON.parse(config.data)
    return response(config, { id: 4, ...body, creator: 1, is_mine: true })
  }
  const sent = await new MessageService().sendMessage('  Olá!\nUma dúvida.  ', 7)
  assert.deepEqual(body, { text: 'Olá!\nUma dúvida.', country: 7 })
  assert.equal(sent.id, 4)
})

test('empty conversation returns an empty list', async () => {
  const { default: MessageService } = await import('../src/services/messageService.js')
  axios.defaults.adapter = async (config) =>
    response(config, { page: 1, total_pages: 1, results: [] })
  assert.deepEqual(await new MessageService().getMessages(7), [])
})

test('messages arriving during pagination do not duplicate existing messages', async () => {
  const { default: MessageService } = await import('../src/services/messageService.js')
  const message = (id) => ({ id, created_at: '2026-11-11T12:00:00-03:00' })
  axios.defaults.adapter = async (config) =>
    response(config, {
      page: config.params.page,
      total_pages: 2,
      results: (config.params.page === 1 ? [3, 2] : [2, 1]).map(message),
    })
  const messages = await new MessageService().getMessages(7)
  assert.deepEqual(
    messages.map((item) => item.id),
    [1, 2, 3],
  )
})

test('conversation pages keep server priority and unread counts without duplicate countries', async () => {
  const { default: MessageService } = await import('../src/services/messageService.js')
  axios.defaults.adapter = async (config) => {
    assert.equal(config.url, '/mensagens/conversas/')
    return response(config, {
      page: config.params.page,
      total_pages: 2,
      results:
        config.params.page === 1
          ? [
              {
                id: 8,
                name: 'Brasil',
                political_name: 'República do Brasil',
                flag: null,
                unread_count: 1,
                last_message_at: '2026-11-11T10:00:00Z',
              },
              {
                id: 3,
                name: 'Colômbia',
                political_name: 'República da Colômbia',
                flag: null,
                unread_count: 0,
                last_message_at: '2026-11-11T11:00:00Z',
              },
            ]
          : [
              {
                id: 3,
                name: 'Colômbia',
                political_name: 'República da Colômbia',
                flag: null,
                unread_count: 0,
                last_message_at: '2026-11-11T11:00:00Z',
              },
              {
                id: 1,
                name: 'Sem mensagens',
                political_name: 'País',
                flag: null,
                unread_count: 0,
                last_message_at: null,
              },
            ],
    })
  }
  const conversations = await new MessageService().getConversations()
  assert.deepEqual(
    conversations.map((item) => [item.id, item.unread_count]),
    [
      [8, 1],
      [3, 0],
      [1, 0],
    ],
  )
})

test('read receipt sends the last loaded message and its delegation', async () => {
  const { default: MessageService } = await import('../src/services/messageService.js')
  axios.defaults.adapter = async (config) => {
    assert.equal(config.url, '/mensagens/lidas/')
    assert.deepEqual(JSON.parse(config.data), { country: 7, last_message_id: 23 })
    return response(config, { country: 7 })
  }
  await new MessageService().markAsRead(7, 23)
})

test('manual unread action targets the selected delegation', async () => {
  const { default: MessageService } = await import('../src/services/messageService.js')
  axios.defaults.adapter = async (config) => {
    assert.equal(config.url, '/mensagens/nao-lidas/')
    assert.deepEqual(JSON.parse(config.data), { country: 7 })
    return response(config, { country: 7 })
  }
  await new MessageService().markAsUnread(7)
})
