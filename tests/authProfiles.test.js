import assert from 'node:assert/strict'
import { test } from 'node:test'
import axios from '../src/plugins/axios.js'
import UserService from '../src/services/userService.js'
import { validateProfileEmail } from '../src/services/authProfiles.js'

test('evaluator email requires the exact IFC domain', () => {
  for (const email of ['a@gmail.com', 'a@aluno.ifc.edu.br', 'a@ifc.edu.br.evil', '@ifc.edu.br']) {
    assert.throws(() => validateProfileEmail(email, 'evaluator'), /@ifc.edu.br/)
  }
  assert.doesNotThrow(() => validateProfileEmail('A@IFC.EDU.BR', 'evaluator'))
  assert.doesNotThrow(() => validateProfileEmail('a@example.com', 'student'))
})

test('login sends selected role and rejects evaluator email before requesting', async () => {
  const original = axios.defaults.adapter
  const calls = []
  axios.defaults.adapter = async (config) => {
    calls.push(JSON.parse(config.data))
    return { config, data: {}, status: 200, headers: {} }
  }
  try {
    const service = new UserService()
    await service.login('a@example.com', 'password', 'organizer')
    assert.deepEqual(calls, [{ email: 'a@example.com', password: 'password', role: 'organizer' }])
    await assert.rejects(service.login('a@example.com', 'password', 'evaluator'), /@ifc.edu.br/)
    await assert.rejects(
      service.register('a@example.com', 'Ana', 'password', null, '', null, 'evaluator'),
      /@ifc.edu.br/,
    )
    assert.equal(calls.length, 1)
  } finally {
    axios.defaults.adapter = original
  }
})
