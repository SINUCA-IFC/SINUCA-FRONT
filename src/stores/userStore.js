import axios from 'axios'
import { ref } from 'vue'
import { defineStore } from 'pinia'
import { computed } from 'vue'

import UserService from '../services/userService'

const userService = new UserService()

export const useUserStore = defineStore('auth', () => {
  const user = ref({
    email: '',
    name: '',
    password: '',
    foto: null,
    gang: null,
    matriculation: '',
    role: null,  
    country: { id: null },
  })
  const loggedIn = ref(false)
  const users = ref([])
  const loading = ref(false)

  //tipo
  const userType = computed(() => user.value?.role)
  const isOrganizer = computed(() => user.value?.role === 'organizer')
  const isStudent = computed(() => user.value?.role === 'student')
  const isAvailable = computed(() => user.value?.role === 'available')
  

  const login = async (email, password) => {
    const data = await userService.login(email, password)
    localStorage.setItem('access_token', data.access)
    localStorage.setItem('refresh_token', data.refresh)
    user.value = await userService.getUser()
    loggedIn.value = true
  }

  async function register(email, name, password, gang, matriculation, foto) {
    await userService.register(email, name, password, gang, matriculation, foto)
    await login(email, password)
  }

  function logout() {
    user.value = {}
    loggedIn.value = false
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
  }

  async function checkAuth() {
    const token = localStorage.getItem('access_token')
    if (token) {
      try {
        user.value = await userService.getUser()
        loggedIn.value = true
      } catch {
        logout()
      }
    }
  }

  async function getAllUsers() {
    loading.value = true
    try {
      const data = await userService.getUsers()
      users.value = data.results
    } finally {
      loading.value = false
    }
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
    loading,
    userType,
    isOrganizer,
    isStudent,
    isAvailable,
    login,
    register,
    logout,
    checkAuth,
    getAllUsers,
    uploadImage,
  }
})
