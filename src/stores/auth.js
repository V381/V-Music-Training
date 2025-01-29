import { ref } from 'vue'
import { defineStore } from 'pinia'
import { auth } from '../config/firebase'

export const useAuthStore = defineStore('auth', () => {
  const isAuthenticated = ref(false)
  const isAuthReady = ref(false)
  const currentUser = ref(null)

  const init = () => {
    auth.onAuthStateChanged((user) => {
      currentUser.value = user
      isAuthenticated.value = !!user
      isAuthReady.value = true
    })
  }

  const setAuth = (state) => {
    isAuthenticated.value = state
  }

  return {
    isAuthenticated,
    isAuthReady,
    currentUser,
    setAuth,
    init
  }
})
