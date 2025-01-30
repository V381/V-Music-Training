import { ref } from 'vue'
import { defineStore } from 'pinia'
import { auth, db } from '../config/firebase'
import { doc, setDoc, getDoc } from 'firebase/firestore'

export const useAuthStore = defineStore('auth', () => {
  const isAuthenticated = ref(false)
  const isAuthReady = ref(false)
  const currentUser = ref(null)

  const createUserDocument = async (user) => {
    try {
      const userRef = doc(db, 'users', user.uid)
      const userDoc = await getDoc(userRef)

      if (!userDoc.exists()) {
        await setDoc(userRef, {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || 'Anonymous',
          photoURL: user.photoURL || null,
          region: null,
          createdAt: new Date()
        })
      }
    } catch (error) {
      console.error('Error creating user document:', error)
    }
  }

  const init = () => {
    auth.onAuthStateChanged((user) => {
      currentUser.value = user
      isAuthenticated.value = !!user
      isAuthReady.value = true

      if (user) {
        createUserDocument(user)
      }
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
