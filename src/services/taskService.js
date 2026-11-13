import axios from 'axios'

export default class TaskService {
  async getAssignedTasks(userId) {
    if (userId == null) return []
    const assigned = []
    let page = 1
    let hasMore = true
    while (hasMore) {
      const { data } = await axios.get('/tarefas/', { params: { page, page_size: 100 } })
      const tasks = Array.isArray(data) ? data : data.results
      // The list serializer omits assignees. Limit simultaneous detail requests.
      for (let start = 0; start < tasks.length; start += 5) {
        const details = await Promise.all(
          tasks
            .slice(start, start + 5)
            .map((task) => (Array.isArray(task.user) ? task : this.getTask(task.id))),
        )
        assigned.push(
          ...details.filter((task) =>
            task.user?.some((user) => String(user.id ?? user) === String(userId)),
          ),
        )
      }
      hasMore =
        !Array.isArray(data) &&
        (data.total_pages != null ? page < data.total_pages : Boolean(data.next))
      page += 1
    }
    return assigned
  }
  async getTasks() {
    const { data } = await axios.get('/tarefas/')
    return data
  }
  async getTask(id) {
    const { data } = await axios.get(`/tarefas/${id}/`)
    return data
  }
  async createTask(task) {
    const { data } = await axios.post('/tarefas/', task)
    return data
  }
  async updateTask(id, task) {
    const { data } = await axios.patch(`/tarefas/${id}/`, task)
    return data
  }
  async deleteTask(id) {
    await axios.delete(`/tarefas/${id}/`)
  }
}
