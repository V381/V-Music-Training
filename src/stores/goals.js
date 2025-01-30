import { defineStore } from 'pinia'
import { ref } from 'vue'
import { db, auth } from '../config/firebase'
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  deleteDoc
} from 'firebase/firestore'

export const useGoalStore = defineStore('goals', () => {
  const goals = ref([])
  const isLoading = ref(false)
  const error = ref(null)

  const addGoal = async (goalData) => {
    if (!auth.currentUser) {
      throw new Error('No authenticated user')
    }

    try {
      const docRef = await addDoc(collection(db, 'practice_goals'), {
        userId: auth.currentUser.uid,
        toolName: goalData.toolName,
        targetMinutes: parseInt(goalData.targetMinutes),
        frequency: goalData.frequency,
        startDate: new Date(),
        completed: false,
        progress: 0
      })

      goals.value.push({
        id: docRef.id,
        ...goalData,
        userId: auth.currentUser.uid,
        startDate: new Date(),
        completed: false,
        progress: 0
      })

      return docRef.id
    } catch (error) {
      console.error('Error adding goal:', error)
      throw error
    }
  }

  const updateGoalProgress = async (goalId, progressMinutes) => {
    if (!auth.currentUser) {
      throw new Error('No authenticated user')
    }

    try {
      const goalRef = doc(db, 'practice_goals', goalId)

      const progress = parseInt(progressMinutes) || 0

      await updateDoc(goalRef, {
        progress: progress,
        completed: progress >= goals.value.find(g => g.id === goalId)?.targetMinutes
      })

      const index = goals.value.findIndex(g => g.id === goalId)
      if (index !== -1) {
        goals.value[index].progress = progress
        goals.value[index].completed = progress >= goals.value[index].targetMinutes
      }
    } catch (error) {
      console.error('Error updating goal progress:', error)
      throw error
    }
  }

  const fetchUserGoals = async () => {
    if (!auth.currentUser) return

    isLoading.value = true
    error.value = null

    try {
      const q = query(
        collection(db, 'practice_goals'),
        where('userId', '==', auth.currentUser.uid)
      )
      const querySnapshot = await getDocs(q)
      goals.value = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        startDate: doc.data().startDate.toDate(),
        targetMinutes: parseInt(doc.data().targetMinutes),
        progress: parseInt(doc.data().progress || 0)
      }))
    } catch (err) {
      console.error('Error fetching goals:', err)
      error.value = err.message
    } finally {
      isLoading.value = false
    }
  }

  const deleteGoal = async (goalId) => {
    if (!auth.currentUser) {
      throw new Error('No authenticated user')
    }

    try {
      await deleteDoc(doc(db, 'practice_goals', goalId))
      goals.value = goals.value.filter(goal => goal.id !== goalId)
    } catch (error) {
      console.error('Error deleting goal:', error)
      throw error
    }
  }

  const resetGoals = async (frequency) => {
    if (!auth.currentUser) return

    try {
      const goalsToReset = goals.value.filter(goal => goal.frequency === frequency)
      for (const goal of goalsToReset) {
        const goalRef = doc(db, 'practice_goals', goal.id)
        await updateDoc(goalRef, {
          progress: 0,
          completed: false,
          startDate: new Date()
        })
      }
      await fetchUserGoals()
    } catch (error) {
      console.error(`Error resetting ${frequency} goals:`, error)
      throw error
    }
  }

  const resetDailyGoals = () => resetGoals('daily')
  const resetWeeklyGoals = () => resetGoals('weekly')

  return {
    goals,
    isLoading,
    error,
    addGoal,
    updateGoalProgress,
    fetchUserGoals,
    deleteGoal,
    resetDailyGoals,
    resetWeeklyGoals
  }
})
