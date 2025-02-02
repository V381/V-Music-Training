import { defineStore } from 'pinia'
import { ref } from 'vue'
import { db, auth } from '../config/firebase'
import { collection, addDoc, query, where, getDocs, orderBy } from 'firebase/firestore'
import calculateUserStats from '../stores/follows'

export const usePracticeStore = defineStore('practice', () => {
  const practiceHistory = ref([])
  const isLoading = ref(false)
  const error = ref(null)

  const addPracticeSession = async (sessionData) => {
    if (!auth.currentUser) {
      throw new Error('No authenticated user')
    }

    try {
      const docRef = await addDoc(collection(db, 'practice_sessions'), {
        userId: auth.currentUser.uid,
        toolName: sessionData.toolName,
        duration: sessionData.duration,
        date: new Date(),
        interactions: sessionData.interactions || 0,
        rating: sessionData.rating || 0,
        notes: sessionData.notes || '',
        completed: true
      })

      // Update user stats
      await calculateUserStats(auth.currentUser.uid)

      return docRef.id
    } catch (error) {
      console.error('Error adding practice session:', error)
      throw error
    }
  }

  const fetchUserHistory = async () => {
    if (!auth.currentUser) {
      return
    }

    isLoading.value = true
    error.value = null

    try {
      const q = query(
        collection(db, 'practice_sessions'),
        where('userId', '==', auth.currentUser.uid),
        orderBy('date', 'desc')
      )
      const querySnapshot = await getDocs(q)
      practiceHistory.value = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date.toDate()
      }))
    } catch (err) {
      console.error('Error fetching practice history:', err)
      error.value = err.message
    } finally {
      isLoading.value = false
    }
  }

  return {
    practiceHistory,
    isLoading,
    error,
    addPracticeSession,
    fetchUserHistory
  }
})
