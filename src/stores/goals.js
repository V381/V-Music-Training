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

  const challengeTypes = {
    noteReading: {
      title: 'Note Reading Sprint',
      description: 'Identify 20 notes correctly in under 5 minutes',
      toolName: 'Note Learning Tool',
      targetMinutes: 5,
      frequency: 'daily'
    },
    rhythmMaster: {
      title: 'Rhythm Master',
      description: 'Practice with the metronome for 15 minutes',
      toolName: 'Metronome',
      targetMinutes: 15,
      frequency: 'daily'
    },
    earTraining: {
      title: 'Perfect Pitch',
      description: 'Complete 10 ear training exercises',
      toolName: 'Ear Training',
      targetMinutes: 10,
      frequency: 'daily'
    },
    guitarPractice: {
      title: 'Fretboard Explorer',
      description: 'Practice guitar note recognition for 20 minutes',
      toolName: 'Guitar Notes',
      targetMinutes: 20,
      frequency: 'daily'
    },
    pianoPractice: {
      title: 'Piano Master',
      description: 'Complete piano exercises for 15 minutes',
      toolName: 'Piano Notes',
      targetMinutes: 15,
      frequency: 'daily'
    }
  }

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
        progress: 0,
        isChallenge: goalData.isChallenge || false,
        challengeId: goalData.challengeId || null,
        challengeTitle: goalData.challengeTitle || null,
        challengeDescription: goalData.challengeDescription || null
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

      await checkAndGenerateChallenge()
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

  const generateDailyChallenge = async () => {
    if (!auth.currentUser) return

    try {
      const availableChallenges = Object.entries(challengeTypes)
      const [id, challenge] = availableChallenges[Math.floor(Math.random() * availableChallenges.length)]

      const challengeGoal = {
        userId: auth.currentUser.uid,
        toolName: challenge.toolName,
        targetMinutes: challenge.targetMinutes,
        frequency: 'daily',
        isChallenge: true,
        challengeId: id,
        challengeTitle: challenge.title,
        challengeDescription: challenge.description
      }

      await addGoal(challengeGoal)
    } catch (err) {
      console.error('Error generating daily challenge:', err)
      error.value = err.message
    }
  }

  const checkAndGenerateChallenge = async () => {
    if (!goals.value.length) {
      await generateDailyChallenge()
      return
    }

    const todaysChallenges = goals.value.filter(
      goal => goal.isChallenge &&
      goal.frequency === 'daily' &&
      new Date(goal.startDate).toDateString() === new Date().toDateString()
    )

    if (todaysChallenges.length === 0) {
      await generateDailyChallenge()
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
    resetWeeklyGoals,
    generateDailyChallenge,
    checkAndGenerateChallenge,
    challengeTypes
  }
})
