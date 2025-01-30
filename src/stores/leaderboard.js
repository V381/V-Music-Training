import { defineStore } from 'pinia'
import { ref } from 'vue'
import { db, auth } from '../config/firebase'
import {
  collection,
  query,
  getDocs,
  getDoc,
  doc,
  where,
  Timestamp,
  updateDoc
} from 'firebase/firestore'

export const useLeaderboardStore = defineStore('leaderboard', () => {
  const leaderboards = ref({
    weekly: [],
    monthly: [],
    allTime: []
  })
  const regionalLeaderboards = ref({
    weekly: {},
    monthly: {},
    allTime: {}
  })
  const isLoading = ref(false)
  const error = ref(null)
  const userRank = ref({
    weekly: null,
    monthly: null,
    allTime: null,
    regional: {
      weekly: null,
      monthly: null,
      allTime: null
    }
  })
  const userStats = ref({
    totalTime: 0,
    averageSession: 0,
    totalSessions: 0
  })
  const userRegion = ref(null)

  const getDateRange = (period) => {
    const now = new Date()
    const start = new Date()

    switch (period) {
      case 'weekly':
        start.setDate(now.getDate() - 7)
        break
      case 'monthly':
        start.setMonth(now.getMonth() - 1)
        break
      default:
        start.setFullYear(2000) // All time
    }

    return {
      start: Timestamp.fromDate(start),
      end: Timestamp.fromDate(now)
    }
  }

  const setUserRegion = async (region) => {
    if (!auth.currentUser) return

    try {
      await updateDoc(doc(db, 'users', auth.currentUser.uid), {
        region
      })
      userRegion.value = region
      console.log(userRegion)
      await fetchLeaderboards()
    } catch (err) {
      console.error('Error setting user region:', err)
      error.value = err.message
    }
  }

  const fetchUserRegion = async () => {
    if (!auth.currentUser) return

    try {
      const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid))
      userRegion.value = userDoc.data()?.region || null
    } catch (err) {
      console.error('Error fetching user region:', err)
    }
  }

  const fetchLeaderboards = async () => {
    if (!auth.currentUser) return

    isLoading.value = true
    error.value = null

    try {
      // Fetch global leaderboards one at a time to avoid overwhelming Firestore
      await fetchPeriodLeaderboard('weekly')
      await fetchPeriodLeaderboard('monthly')
      await fetchPeriodLeaderboard('allTime')

      // If user has a region, fetch regional leaderboards
      if (userRegion.value) {
        await fetchRegionalLeaderboard('weekly', userRegion.value)
        await fetchRegionalLeaderboard('monthly', userRegion.value)
        await fetchRegionalLeaderboard('allTime', userRegion.value)
      }

      // Fetch user stats
      await fetchUserStats()
    } catch (err) {
      console.error('Error fetching leaderboards:', err)
      error.value = err.message
    } finally {
      isLoading.value = false
    }
  }

  const fetchPeriodLeaderboard = async (period) => {
    try {
      const { start, end } = getDateRange(period)

      const baseQuery = query(
        collection(db, 'practice_sessions'),
        where('date', '>=', start),
        where('date', '<=', end)
      )

      const snapshot = await getDocs(baseQuery)
      const userTotals = {}

      // Process practice sessions
      snapshot.docs.forEach(doc => {
        const data = doc.data()
        if (!userTotals[data.userId]) {
          userTotals[data.userId] = {
            totalTime: 0,
            sessions: 0
          }
        }
        userTotals[data.userId].totalTime += data.duration
        userTotals[data.userId].sessions++
      })

      // Build leaderboard data
      const leaderboardData = await Promise.all(
        Object.entries(userTotals).map(async ([userId, data]) => {
          try {
            const userRef = doc(db, 'users', userId)
            const userDoc = await getDoc(userRef)
            const userData = userDoc.data() || {}

            return {
              userId,
              userName: userData.displayName || 'Anonymous',
              photoURL: userData.photoURL || null,
              region: userData.region,
              totalTime: data.totalTime,
              averageTime: Math.round(data.totalTime / data.sessions),
              sessions: data.sessions
            }
          } catch (err) {
            console.error(`Error fetching user data for ${userId}:`, err)
            return null
          }
        })
      )

      // Filter out null entries and sort
      const validData = leaderboardData.filter(entry => entry !== null)
      validData.sort((a, b) => b.totalTime - a.totalTime)

      // Update store
      leaderboards.value[period] = validData

      // Update user rank
      if (auth.currentUser) {
        const userIndex = validData.findIndex(
          entry => entry.userId === auth.currentUser.uid
        )
        userRank.value[period] = userIndex !== -1 ? userIndex + 1 : null
      }
    } catch (err) {
      console.error(`Error in fetchPeriodLeaderboard for ${period}:`, err)
      throw err
    }
  }

  const fetchRegionalLeaderboard = async (period, region) => {
    try {
      const { start, end } = getDateRange(period)

      // First get all users from the specified region only
      const usersQuery = query(
        collection(db, 'users'),
        where('region', '==', region)
      )
      const userSnapshots = await getDocs(usersQuery)
      const regionalUserIds = userSnapshots.docs.map(doc => doc.id)

      // If no users in this region, return empty array
      if (regionalUserIds.length === 0) {
        regionalLeaderboards.value[period][region] = []
        userRank.value.regional[period] = null // Reset rank if no users in region
        return
      }

      const baseQuery = query(
        collection(db, 'practice_sessions'),
        where('date', '>=', start),
        where('date', '<=', end)
      )

      const snapshot = await getDocs(baseQuery)
      const userTotals = {}

      // Only process sessions from users in the selected region
      for (const docSnap of snapshot.docs) {
        const data = docSnap.data()
        // Only process if user is in the regional users list
        if (regionalUserIds.includes(data.userId)) {
          if (!userTotals[data.userId]) {
            const userRef = doc(db, 'users', data.userId)
            const userDoc = await getDoc(userRef)
            const userData = userDoc.data()

            // Double check region match
            if (userData?.region === region) {
              userTotals[data.userId] = {
                totalTime: 0,
                sessions: 0,
                userData
              }
            }
          }

          if (userTotals[data.userId]) {
            userTotals[data.userId].totalTime += data.duration
            userTotals[data.userId].sessions++
          }
        }
      }

      const leaderboardData = Object.entries(userTotals)
        .filter(([_, data]) => data.userData.region === region) // Extra region check
        .map(([userId, data]) => ({
          userId,
          userName: data.userData.displayName || 'Anonymous',
          photoURL: data.userData.photoURL || null,
          region: data.userData.region,
          totalTime: data.totalTime,
          averageTime: Math.round(data.totalTime / data.sessions),
          sessions: data.sessions
        }))

      leaderboardData.sort((a, b) => b.totalTime - a.totalTime)
      regionalLeaderboards.value[period][region] = leaderboardData

      // Only set rank if user is in this region
      if (auth.currentUser) {
        // Check if current user belongs to this region
        const userRef = doc(db, 'users', auth.currentUser.uid)
        const userDoc = await getDoc(userRef)
        const userData = userDoc.data()

        if (userData?.region === region) {
          const userIndex = leaderboardData.findIndex(
            entry => entry.userId === auth.currentUser.uid
          )
          userRank.value.regional[period] = userIndex !== -1 ? userIndex + 1 : null
        } else {
          userRank.value.regional[period] = null // Reset rank if user not in region
        }
      }
    } catch (err) {
      console.error(`Error in fetchRegionalLeaderboard for ${period}, ${region}:`, err)
      throw err
    }
  }

  const fetchUserStats = async () => {
    if (!auth.currentUser) return

    try {
      const userSessionsQuery = query(
        collection(db, 'practice_sessions'),
        where('userId', '==', auth.currentUser.uid)
      )

      const snapshot = await getDocs(userSessionsQuery)
      let totalTime = 0
      const sessions = snapshot.docs.length

      snapshot.docs.forEach(doc => {
        totalTime += doc.data().duration
      })

      userStats.value = {
        totalTime,
        averageSession: sessions > 0 ? Math.round(totalTime / sessions) : 0,
        totalSessions: sessions
      }
    } catch (err) {
      console.error('Error fetching user stats:', err)
    }
  }

  const getTopPerformers = async (period = 'weekly', limit = 3) => {
    if (!leaderboards.value[period]) return []
    return leaderboards.value[period].slice(0, limit)
  }

  const getUserPosition = (period = 'weekly', isRegional = false) => {
    if (isRegional) {
      return userRank.value.regional[period]
    }
    return userRank.value[period]
  }

  const getRelativeRank = (period = 'weekly', isRegional = false) => {
    const rank = getUserPosition(period, isRegional)
    const total = isRegional
      ? regionalLeaderboards.value[period][userRegion.value]?.length
      : leaderboards.value[period].length

    if (!rank || !total) return null

    const percentage = (rank / total) * 100
    if (percentage <= 10) return 'Top 10%'
    if (percentage <= 25) return 'Top 25%'
    if (percentage <= 50) return 'Top 50%'
    return 'Bottom 50%'
  }

  return {
    leaderboards,
    regionalLeaderboards,
    isLoading,
    error,
    userRank,
    userStats,
    userRegion,
    fetchLeaderboards,
    setUserRegion,
    fetchUserRegion,
    getTopPerformers,
    getUserPosition,
    getRelativeRank
  }
})
