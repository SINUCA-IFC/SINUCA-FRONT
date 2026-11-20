import axios from 'axios'
import { savePending, clearPending, readPending, logoutSession } from '@/services/authService'
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

  let authVersion = 0
  async function completeLogin(data) {
    if (!data.access || !data.refresh) throw new Error('Resposta de autenticação inválida')
    const version = ++authVersion
    localStorage.setItem('access_token', data.access)
    localStorage.setItem('refresh_token', data.refresh)
    clearPending()
    try {
      const profile = await userService.getUser()
      if (version !== authVersion) throw new Error('Sessão alterada')
      user.value = profile
      loggedIn.value = true
      await syncPushSubscription()
    } catch (error) {
      if (version === authVersion) clearLocal()
      throw error
    }
  }
  function beginVerification(email, data) {
    clearLocal()
    savePending(email, data.session_token)
    return false
  }
  const login = async (email, password) => {
    try {
      const data = await userService.login(email, password)
      await completeLogin(data)
      return true
    } catch (error) {
      const data = error.response?.data
      if (
        error.response?.status === 401 &&
        data?.email_verification_required &&
        data.session_token
      ) {
        return beginVerification(email, data)
      }
      throw error
    }
  }
  async function register(email, name, password, gang, matriculation, foto) {
    const data = await userService.register(email, name, password, gang, matriculation, foto)
    if (!data.email_verification_required || !data.session_token)
      throw new Error('Confirmação indisponível')
    beginVerification(email, data)
  }
  function clearLocal() {
    authVersion++
    user.value = getDefaultUser()
    users.value = []
    pendingUsers.value = []
    loggedIn.value = false
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    clearPending()
  }
  async function logout() {
    const pushCleanup = unsubscribeFromPush()
    clearLocal()
    try {
      await Promise.all([pushCleanup, logoutSession()])
    } catch {
      /* Local cleanup succeeds offline too. */
    }
  }
  async function checkAuth() {
    if (readPending()) return
    const token = localStorage.getItem('access_token')
    const version = authVersion
    if (token) {
      try {
        const profile = await userService.getUser()
        if (version === authVersion) {
          user.value = profile
          loggedIn.value = true
          void syncPushSubscription()
        }
      } catch {
        if (version === authVersion) clearLocal()
      }
    }
  }

  async function getAllUsers() {
    loading.value = true
    try {
      users.value = await getAllPages((page) => userService.getUsers(page))
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
    pendingUsers.value = pendingUsers.value.filter((user) => String(user.id) !== String(id))
    return approved
  }

  function uploadImage(file, description, skipAuth = false) {
    const formData = new FormData()
    formData.append('file', file)
    if (description) formData.append('description', description)
    return axios.post('media/images/', formData, {
      skipAuth,
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  }

  async function updateProfile(changes) {
    const updated = await userService.updateProfile(user.value.id, changes)
    user.value = { ...user.value, ...updated }
  }

  return {
    user,
    loggedIn,
    users,
    pendingUsers,
    loading,
    completeLogin,
    clearLocal,
    login,
    register,
    logout,
    checkAuth,
    getAllUsers,
    getPendingUsers,
    approveUser,
    userType,
    uploadImage,
    updateProfile,
  }
})
