import { ref, computed } from 'vue';
import { defineStore } from 'pinia';

import UserService from '../services/userService';

const userService = new UserService();

export const useUserStore = defineStore('auth', () => {
  const user = ref({});
  const loggedIn = ref(false);

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

  return {
    user, loggedIn,
    isCliente, isVendedor, isGerente, isAdmin, canManage,
    login, register, logout, checkAuth
  };
});