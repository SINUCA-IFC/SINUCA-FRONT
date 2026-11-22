import axios from 'axios'
import { getAllPages } from './pagination.js'

export default class MessageService {
  async getConversations() {
    const countries = await getAllPages(async (page) => {
      const { data } = await axios.get('/mensagens/conversas/', { params: { page } })
      return data
    })
    // A API já ordena por não lidas e atividade recente, antes de paginar.
    return [...new Map(countries.map((country) => [country.id, country])).values()]
  }

  async getMessages(country) {
    const messages = await getAllPages(async (page) => {
      const { data } = await axios.get('/mensagens/', { params: { page, country } })
      return data
    })
    const uniqueMessages = [...new Map(messages.map((message) => [message.id, message])).values()]
    return uniqueMessages.sort(
      (a, b) => Date.parse(a.created_at) - Date.parse(b.created_at) || a.id - b.id,
    )
  }

  async sendMessage(text, country) {
    const { data } = await axios.post('/mensagens/', { text: text.trim(), country })
    return data
  }

  async markAsRead(country, lastMessageId) {
    const { data } = await axios.post('/mensagens/lidas/', {
      country,
      last_message_id: lastMessageId,
    })
    return data
  }

  async markAsUnread(country) {
    const { data } = await axios.post('/mensagens/nao-lidas/', { country })
    return data
  }
}
