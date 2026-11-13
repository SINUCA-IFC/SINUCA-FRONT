import axios from 'axios'
import { ref } from 'vue'
import { defineStore } from 'pinia'

import UserService from '../services/userService'
import { getAllPages } from '@/services/pagination'
import { syncPushSubscription, unsubscribeFromPush } from '@/services/pushNotificationService'

const userService = new UserService()

const getDefaultUser = () => ({
  email: '',
  name: '',
  password: '',
  foto: null,
  gang: null,
  matriculation: '',
  country: { id: null },
  approval_pending: false,
})

export const useUserStore = defineStore('auth', () => {
  const user = ref(getDefaultUser())
  const loggedIn = ref(false)
  const users = ref([])
  const pendingUsers = ref([])
  const loading = ref(false)
  const userType = ref()

  const login = async (email, password) => {
    const data = await userService.login(email, password)
    localStorage.setItem('access_token', data.access)
    localStorage.setItem('refresh_token', data.refresh)
    user.value = await userService.getUser()
    loggedIn.value = true
    await syncPushSubscription()
  }

  async function register(email, name, password, gang, matriculation, foto) {
    await userService.register(email, name, password, gang, matriculation, foto)
    await login(email, password)
  }

  async function logout() {
    try {
      await unsubscribeFromPush()
    } finally {
      user.value = getDefaultUser()
      users.value = []
      pendingUsers.value = []
      loggedIn.value = false
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
    }
  }

  async function checkAuth() {
    const token = localStorage.getItem('access_token')
    if (token) {
      try {
        user.value = await userService.getUser()
        loggedIn.value = true
        await syncPushSubscription()
      } catch {
        await logout()
      }
    }
  }

  async function getAllUsers() {
    loading.value = true
    try {
      users.value = await getAllPages(page => userService.getUsers(page))
    } finally {
      loading.value = false
    }
  }

  async function getPendingUsers(page = 1) {
    const data = await userService.getPendingUsers(page)
    pendingUsers.value = data.results
    return data
  }

  async function approveUser(id, countryId) {
    const approved = await userService.approveUser(id, countryId)
    pendingUsers.value = pendingUsers.value.filter(user => String(user.id) !== String(id))
    return approved
  }

  function uploadImage(file, description) {
    const formData = new FormData()
    formData.append('file', file)
    if (description) formData.append('description', description)
    return axios.post('media/images/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  } 


  return {
    user,
    loggedIn,
    users,
    pendingUsers,
    loading,
    login,
    register,
    logout,
    checkAuth,
    getAllUsers,
    getPendingUsers,
    approveUser,
    userType,
    uploadImage,
  }
})
