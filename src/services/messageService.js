import axios from 'axios'
import { getAllPages } from './pagination.js'

export default class MessageService {
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
}
