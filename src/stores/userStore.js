import { ref, computed } from 'vue';
import { defineStore } from 'pinia';

import UserService from '../services/userService';

const userService = new UserService();

export const useUserStore = defineStore('auth', () => {
  const user = ref({});
  const loggedIn = ref(false);
  const usuarios = ref([]);
  const carregando = ref(false);

  const login = async (email, password) => {
    const data = await userService.login(email, password);
    localStorage.setItem('access_token', data.access);
    localStorage.setItem('refresh_token', data.refresh);
    user.value = await userService.getUser();
    loggedIn.value = true;
  }

  async function register(email, name, password) {
    await userService.register(email, name, password);
    await login(email, password);
  }

  function logout() {
    user.value = {};
    loggedIn.value = false;
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }

  async function checkAuth() {
    const token = localStorage.getItem('access_token');
    if (token) {
      try {
        user.value = await userService.getUser();
        loggedIn.value = true;
      } catch {
        logout();
      }
    }
  }

  async function getAllUsers() {
    carregando.value = true;
    try {
          const data = await userService.getUsers();
          usuarios.value = data.results;

    } finally {
      carregando.value = false;
    }
  }
  return {
    user, loggedIn, usuarios, carregando,
    login, register, logout, checkAuth, getAllUsers
  };
});