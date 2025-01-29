import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', () => {
  const isAuthenticated = ref(false)

  const setAuth = (state) => {
    isAuthenticated.value = state
  }

  return {
    isAuthenticated,
    setAuth
  }
})
