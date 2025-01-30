import { defineStore } from 'pinia'
import { ref } from 'vue'
import { db, auth } from '../config/firebase'
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  arrayUnion,
  increment
} from 'firebase/firestore'

export const useRewardStore = defineStore('rewards', () => {
  const userPoints = ref(0)
  const achievements = ref([])
  const isLoading = ref(false)
  const error = ref(null)

  const availableAchievements = {
    firstChallenge: {
      id: 'firstChallenge',
      title: 'First Steps',
      description: 'Complete your first daily challenge',
      icon: '🌟',
      points: 100
    },
    threeInARow: {
      id: 'threeInARow',
      title: 'Consistency is Key',
      description: 'Complete 3 daily challenges in a row',
      icon: '🔥',
      points: 300
    },
    perfectWeek: {
      id: 'perfectWeek',
      title: 'Perfect Week',
      description: 'Complete all daily challenges for a week',
      icon: '🏆',
      points: 1000
    },
    pointMilestone: {
      id: 'pointMilestone',
      title: 'Rising Star',
      description: 'Earn 5000 points',
      icon: '⭐',
      points: 500
    }
  }

  const initializeRewards = async () => {
    if (!auth.currentUser) return

    isLoading.value = true
    error.value = null

    try {
      const userDoc = await getDoc(doc(db, 'user_rewards', auth.currentUser.uid))

      if (!userDoc.exists()) {
        await setDoc(doc(db, 'user_rewards', auth.currentUser.uid), {
          points: 0,
          achievements: [],
          challengeStreak: 0,
          lastChallengeDate: null
        })
        userPoints.value = 0
        achievements.value = []
      } else {
        userPoints.value = userDoc.data().points
        achievements.value = userDoc.data().achievements
      }
    } catch (err) {
      console.error('Error initializing rewards:', err)
      error.value = err.message
    } finally {
      isLoading.value = false
    }
  }

  const addPoints = async (points) => {
    if (!auth.currentUser) return

    try {
      const userRef = doc(db, 'user_rewards', auth.currentUser.uid)
      await updateDoc(userRef, {
        points: increment(points)
      })
      userPoints.value += points

      // Check for point-based achievements
      if (userPoints.value >= 5000 && !achievements.value.includes('pointMilestone')) {
        await awardAchievement('pointMilestone')
      }
    } catch (err) {
      console.error('Error adding points:', err)
      error.value = err.message
    }
  }

  const awardAchievement = async (achievementId) => {
    if (!auth.currentUser || !availableAchievements[achievementId]) return

    try {
      const userRef = doc(db, 'user_rewards', auth.currentUser.uid)
      await updateDoc(userRef, {
        achievements: arrayUnion(achievementId),
        points: increment(availableAchievements[achievementId].points)
      })

      achievements.value.push(achievementId)
      userPoints.value += availableAchievements[achievementId].points

      return availableAchievements[achievementId]
    } catch (err) {
      console.error('Error awarding achievement:', err)
      error.value = err.message
    }
  }

  const updateChallengeStreak = async (completed) => {
    if (!auth.currentUser) return

    try {
      const userRef = doc(db, 'user_rewards', auth.currentUser.uid)
      const userDoc = await getDoc(userRef)
      const userData = userDoc.data()

      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const lastDate = userData.lastChallengeDate?.toDate() || new Date(0)
      lastDate.setHours(0, 0, 0, 0)

      const isConsecutiveDay = (today - lastDate) / (1000 * 60 * 60 * 24) === 1

      const newStreak = completed
        ? (isConsecutiveDay ? userData.challengeStreak + 1 : 1)
        : 0

      await updateDoc(userRef, {
        challengeStreak: newStreak,
        lastChallengeDate: new Date()
      })

      // Check for streak-based achievements
      if (newStreak === 3) {
        await awardAchievement('threeInARow')
      }
      if (newStreak === 7) {
        await awardAchievement('perfectWeek')
      }
    } catch (err) {
      console.error('Error updating challenge streak:', err)
      error.value = err.message
    }
  }

  return {
    userPoints,
    achievements,
    availableAchievements,
    isLoading,
    error,
    initializeRewards,
    addPoints,
    awardAchievement,
    updateChallengeStreak
  }
})
