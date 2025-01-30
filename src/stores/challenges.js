import { defineStore } from 'pinia'
import { ref } from 'vue'
import { db, auth } from '../config/firebase'
import {
  collection,
  doc,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  query,
  where,
  getDocs,
  serverTimestamp
} from 'firebase/firestore'
import { useRewardStore } from './rewards'
import { useNotificationStore } from './notification'

export const useChallengeStore = defineStore('challenges', () => {
  const currentChallenge = ref(null)
  const challengeHistory = ref([])
  const isLoading = ref(false)
  const error = ref(null)
  const rewardStore = useRewardStore()
  const notificationStore = useNotificationStore()

  const challenges = {
    noteReading: {
      title: 'Note Reading Sprint',
      description: 'Identify 20 notes correctly in under 5 minutes',
      tool: 'Note Learning Tool',
      requirement: 20,
      points: 100,
      type: 'accuracy'
    },
    rhythmMaster: {
      title: 'Rhythm Master',
      description: 'Practice with the metronome for 15 minutes',
      tool: 'Metronome',
      requirement: 15,
      points: 75,
      type: 'duration'
    },
    earTraining: {
      title: 'Perfect Pitch',
      description: 'Complete 10 ear training exercises',
      tool: 'Ear Training',
      requirement: 10,
      points: 150,
      type: 'completion'
    },
    guitarNotes: {
      title: 'Fretboard Explorer',
      description: 'Learn 30 new fretboard positions',
      tool: 'Guitar Notes',
      requirement: 30,
      points: 125,
      type: 'accuracy'
    },
    pianoMaster: {
      title: 'Piano Virtuoso',
      description: 'Practice scales for 20 minutes',
      tool: 'Piano Notes',
      requirement: 20,
      points: 100,
      type: 'duration'
    }
  }

  const fetchDailyChallenge = async () => {
    if (!auth.currentUser) return

    isLoading.value = true
    error.value = null

    try {
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const challengeDoc = await getDoc(
        doc(db, 'daily_challenges', auth.currentUser.uid)
      )

      if (!challengeDoc.exists() || new Date(challengeDoc.data().date.toDate()) < today) {
        // Generate new daily challenge
        const availableChallenges = Object.entries(challenges)
        const randomChallenge = availableChallenges[Math.floor(Math.random() * availableChallenges.length)]

        const newChallenge = {
          id: randomChallenge[0],
          ...randomChallenge[1],
          date: serverTimestamp(),
          completed: false,
          progress: 0
        }

        await setDoc(doc(db, 'daily_challenges', auth.currentUser.uid), newChallenge)
        currentChallenge.value = newChallenge

        // Notify user about new challenge
        notificationStore.addNotification(
          `New daily challenge available: ${newChallenge.title}!`,
          'info'
        )
      } else {
        currentChallenge.value = challengeDoc.data()
      }
    } catch (err) {
      console.error('Error fetching daily challenge:', err)
      error.value = err.message
      notificationStore.addNotification(
        'Failed to load daily challenge',
        'error'
      )
    } finally {
      isLoading.value = false
    }
  }

  const updateChallengeProgress = async (progress) => {
    if (!auth.currentUser || !currentChallenge.value) return

    try {
      const challengeRef = doc(db, 'daily_challenges', auth.currentUser.uid)
      const wasNotCompleted = !currentChallenge.value.completed
      const completed = progress >= currentChallenge.value.requirement

      await updateDoc(challengeRef, {
        progress,
        completed
      })

      currentChallenge.value.progress = progress
      currentChallenge.value.completed = completed

      // Award points and update streak if challenge was just completed
      if (completed && wasNotCompleted) {
        await rewardStore.addPoints(currentChallenge.value.points)
        await rewardStore.updateChallengeStreak(true)

        // Check for first challenge achievement
        if (!rewardStore.achievements.includes('firstChallenge')) {
          const achievement = await rewardStore.awardAchievement('firstChallenge')
          if (achievement) {
            notificationStore.addNotification(
              `Achievement Unlocked: ${achievement.title}!`,
              'success'
            )
          }
        }

        notificationStore.addNotification(
          `Challenge completed! +${currentChallenge.value.points} points`,
          'success'
        )

        // Add to challenge history
        await addToChallengeHistory(currentChallenge.value)
      }
    } catch (err) {
      console.error('Error updating challenge progress:', err)
      error.value = err.message
      notificationStore.addNotification(
        'Failed to update challenge progress',
        'error'
      )
    }
  }

  const addToChallengeHistory = async (challenge) => {
    if (!auth.currentUser) return

    try {
      await addDoc(collection(db, 'challenge_history'), {
        userId: auth.currentUser.uid,
        challengeId: challenge.id,
        title: challenge.title,
        points: challenge.points,
        requirement: challenge.requirement,
        completedAt: serverTimestamp()
      })
    } catch (err) {
      console.error('Error adding to challenge history:', err)
    }
  }

  const fetchChallengeHistory = async () => {
    if (!auth.currentUser) return

    isLoading.value = true
    error.value = null

    try {
      const q = query(
        collection(db, 'challenge_history'),
        where('userId', '==', auth.currentUser.uid)
      )
      const querySnapshot = await getDocs(q)
      challengeHistory.value = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        completedAt: doc.data().completedAt.toDate()
      }))
    } catch (err) {
      console.error('Error fetching challenge history:', err)
      error.value = err.message
    } finally {
      isLoading.value = false
    }
  }

  const skipChallenge = async () => {
    if (!auth.currentUser || !currentChallenge.value) return

    try {
      // Reset streak since challenge was skipped
      await rewardStore.updateChallengeStreak(false)

      // Generate new challenge
      await fetchDailyChallenge()

      notificationStore.addNotification(
        'Challenge skipped. New challenge generated.',
        'info'
      )
    } catch (err) {
      console.error('Error skipping challenge:', err)
      error.value = err.message
      notificationStore.addNotification(
        'Failed to skip challenge',
        'error'
      )
    }
  }

  const getChallengeStats = async () => {
    if (!auth.currentUser) return null

    try {
      const stats = {
        totalCompleted: challengeHistory.value.length,
        totalPoints: challengeHistory.value.reduce((sum, challenge) => sum + challenge.points, 0),
        challengesByTool: {},
        averageCompletionRate: 0
      }

      // Calculate challenges by tool
      challengeHistory.value.forEach(challenge => {
        const toolName = challenges[challenge.challengeId]?.tool
        if (toolName) {
          stats.challengesByTool[toolName] = (stats.challengesByTool[toolName] || 0) + 1
        }
      })

      return stats
    } catch (err) {
      console.error('Error getting challenge stats:', err)
      error.value = err.message
      return null
    }
  }

  return {
    currentChallenge,
    challengeHistory,
    isLoading,
    error,
    challenges,
    fetchDailyChallenge,
    updateChallengeProgress,
    fetchChallengeHistory,
    skipChallenge,
    getChallengeStats
  }
})
