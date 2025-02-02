import { defineStore } from 'pinia'
import { ref } from 'vue'
import { db, auth } from '../config/firebase'
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  startAt,
  endAt,
  getDoc,
  arrayUnion,
  arrayRemove,
  deleteDoc,
  serverTimestamp,
  doc,
  updateDoc,
  orderBy,
  limit
} from 'firebase/firestore'
import { useNotificationStore } from './notification'

export const useFollowStore = defineStore('follows', () => {
  const following = ref([])
  const followers = ref([])
  const suggestedUsers = ref([])
  const followingActivity = ref([])
  const isLoading = ref(false)
  const activityLikes = ref({})
  const error = ref(null)
  const notificationStore = useNotificationStore()

  const isActivityLiked = (activityId) => {
    return activityLikes.value[activityId] || false
  }

  const fetchActivityLikes = async () => {
    if (!auth.currentUser) return

    try {
      const q = query(
        collection(db, 'activity_likes'),
        where('userId', '==', auth.currentUser.uid)
      )
      const snapshot = await getDocs(q)
      const likes = {}
      snapshot.docs.forEach(doc => {
        likes[doc.data().activityId] = true
      })
      activityLikes.value = likes
    } catch (err) {
      console.error('Error fetching activity likes:', err)
    }
  }

  const toggleActivityLike = async (activityId) => {
    if (!auth.currentUser) return

    try {
      const q = query(
        collection(db, 'activity_likes'),
        where('userId', '==', auth.currentUser.uid),
        where('activityId', '==', activityId)
      )

      const snapshot = await getDocs(q)

      if (snapshot.empty) {
        // Add like
        await addDoc(collection(db, 'activity_likes'), {
          userId: auth.currentUser.uid,
          activityId,
          timestamp: new Date()
        })
        activityLikes.value[activityId] = true
      } else {
        // Remove like
        await deleteDoc(snapshot.docs[0].ref)
        delete activityLikes.value[activityId]
      }
    } catch (err) {
      console.error('Error toggling activity like:', err)
      throw err
    }
  }

  const followUser = async (userId) => {
    if (!auth.currentUser) return

    try {
      // Check if already following
      if (following.value.includes(userId)) {
        throw new Error('Already following this user')
      }

      // Create follow document
      const docRef = await addDoc(collection(db, 'user_follows'), {
        followerId: auth.currentUser.uid,
        followingId: userId,
        timestamp: new Date()
      })

      // Wait for the operation to complete before updating local state
      if (docRef.id) {
        following.value = [...following.value, userId]
      }

      return docRef.id
    } catch (err) {
      console.error('Error following user:', err)
      // If error occurs, revert local state
      following.value = following.value.filter(id => id !== userId)
      throw err
    }
  }

  const unfollowUser = async (userId) => {
    if (!auth.currentUser) return

    try {
      const q = query(
        collection(db, 'user_follows'),
        where('followerId', '==', auth.currentUser.uid),
        where('followingId', '==', userId)
      )

      const snapshot = await getDocs(q)
      if (!snapshot.empty) {
        // Update local state first
        following.value = following.value.filter(id => id !== userId)

        // Remove activities from unfollowed user
        followingActivity.value = followingActivity.value.filter(
          activity => activity.user.id !== userId
        )

        // Perform the delete operation
        await deleteDoc(snapshot.docs[0].ref)
      }
    } catch (err) {
      console.error('Error unfollowing user:', err)
      await fetchFollowing()
      throw err
    }
  }

  // Check if following a specific user
  const checkIfFollowing = async (userId) => {
    const q = query(
      collection(db, 'user_follows'),
      where('followerId', '==', auth.currentUser.uid),
      where('followingId', '==', userId)
    )

    const snapshot = await getDocs(q)
    return snapshot.empty ? null : { id: snapshot.docs[0].id, ...snapshot.docs[0].data() }
  }

  // Fetch users being followed

  const fetchFollowing = async () => {
    if (!auth.currentUser) return

    isLoading.value = true
    try {
      const q = query(
        collection(db, 'user_follows'),
        where('followerId', '==', auth.currentUser.uid)
      )

      const snapshot = await getDocs(q)
      following.value = snapshot.docs.map(doc => doc.data().followingId)
    } catch (err) {
      console.error('Error fetching following:', err)
    } finally {
      isLoading.value = false
    }
  }

  // Fetch followers
  const fetchFollowers = async () => {
    if (!auth.currentUser) return

    isLoading.value = true
    try {
      const q = query(
        collection(db, 'user_follows'),
        where('followingId', '==', auth.currentUser.uid)
      )

      const snapshot = await getDocs(q)
      followers.value = await Promise.all(
        snapshot.docs.map(async (doc) => {
          const userData = await getDoc(doc(db, 'users', doc.data().followerId))
          return {
            id: userData.id,
            followId: doc.id,
            ...userData.data()
          }
        })
      )
    } catch (err) {
      console.error('Error fetching followers:', err)
      error.value = err.message
    } finally {
      isLoading.value = false
    }
  }

  // Fetch suggested users to follow
  const fetchSuggestedUsers = async () => {
    if (!auth.currentUser) return

    isLoading.value = true
    try {
      // Get current user's following list
      const followingIds = following.value.map(f => f.id)

      // Query users with similar interests/instruments
      const userRef = doc(db, 'users', auth.currentUser.uid)
      const userData = await getDoc(userRef)
      const userInstruments = userData.data()?.instruments || []

      const q = query(
        collection(db, 'users'),
        where('instruments', 'array-contains-any', userInstruments),
        limit(10)
      )

      const snapshot = await getDocs(q)
      suggestedUsers.value = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(user =>
          user.id !== auth.currentUser.uid &&
          !followingIds.includes(user.id)
        )
    } catch (err) {
      console.error('Error fetching suggested users:', err)
      error.value = err.message
    } finally {
      isLoading.value = false
    }
  }

  // Fetch activity feed of followed users
  const fetchFollowingActivity = async () => {
    if (!auth.currentUser || !following.value.length) return

    try {
      // Create a Set to track unique activity IDs
      const uniqueActivities = new Set()

      const q = query(
        collection(db, 'practice_sessions'),
        where('userId', 'in', following.value),
        orderBy('date', 'desc'),
        limit(50)
      )

      const snapshot = await getDocs(q)
      followingActivity.value = await Promise.all(
        snapshot.docs
          .filter(docSnapshot => {
            // Only include if we haven't seen this activity ID before
            if (uniqueActivities.has(docSnapshot.id)) return false
            uniqueActivities.add(docSnapshot.id)
            return true
          })
          .map(async (docSnapshot) => {
            const userDocRef = doc(db, 'users', docSnapshot.data().userId)
            const userDocSnap = await getDoc(userDocRef)
            return {
              id: docSnapshot.id,
              ...docSnapshot.data(),
              user: userDocSnap.exists()
                ? { id: userDocSnap.id, ...userDocSnap.data() }
                : null
            }
          })
      )
    } catch (err) {
      console.error('Error fetching following activity:', err)
      throw err
    }
  }
  // Block a user
  const blockUser = async (userId) => {
    if (!auth.currentUser) return

    try {
      // First unfollow if following
      const followDoc = await checkIfFollowing(userId)
      if (followDoc) {
        await unfollowUser(userId)
      }

      // Add to blocked users
      await updateDoc(doc(db, 'users', auth.currentUser.uid), {
        blockedUsers: arrayUnion(userId)
      })

      notificationStore.addNotification('User blocked successfully', 'success')
    } catch (err) {
      console.error('Error blocking user:', err)
      notificationStore.addNotification('Failed to block user', 'error')
      throw err
    }
  }

  // Unblock a user
  const unblockUser = async (userId) => {
    if (!auth.currentUser) return

    try {
      await updateDoc(doc(db, 'users', auth.currentUser.uid), {
        blockedUsers: arrayRemove(userId)
      })

      notificationStore.addNotification('User unblocked successfully', 'success')
    } catch (err) {
      console.error('Error unblocking user:', err)
      notificationStore.addNotification('Failed to unblock user', 'error')
      throw err
    }
  }

  const fetchDiscoverableUsers = async (searchQuery = '') => {
    if (!auth.currentUser) return []

    try {
      let usersQuery

      if (searchQuery.trim()) {
        usersQuery = query(
          collection(db, 'users'),
          where('uid', '!=', auth.currentUser.uid),
          orderBy('displayName'),
          startAt(searchQuery),
          endAt(searchQuery + '\uf8ff'),
          limit(50)
        )
      } else {
        usersQuery = query(
          collection(db, 'users'),
          where('uid', '!=', auth.currentUser.uid),
          limit(50)
        )
      }

      const snapshot = await getDocs(usersQuery)
      const users = await Promise.all(snapshot.docs.map(async doc => {
        const userData = doc.data()
        // If stats are older than 1 hour or don't exist, recalculate
        if (!userData.lastUpdated ||
            (userData.lastUpdated.toDate() < new Date(Date.now() - 3600000))) {
          const stats = await calculateUserStats(doc.id)
          return {
            id: doc.id,
            ...userData,
            ...stats
          }
        }
        return {
          id: doc.id,
          ...userData
        }
      }))

      return users
    } catch (err) {
      console.error('Error fetching discoverable users:', err)
      throw err
    }
  }

  const addActivityComment = async (activityId, commentData) => {
    if (!auth.currentUser) return

    try {
      const commentRef = await addDoc(collection(db, 'activity_comments'), {
        activityId,
        ...commentData
      })
      return commentRef.id
    } catch (err) {
      console.error('Error adding comment:', err)
      throw err
    }
  }

  const calculateUserStats = async (userId) => {
    try {
      // Only calculate stats for the current user
      if (userId !== auth.currentUser.uid) {
        const userDoc = await getDoc(doc(db, 'users', userId))
        return {
          totalPracticeTime: userDoc.data()?.totalPracticeTime || 0,
          instruments: userDoc.data()?.instruments || []
        }
      }

      // Get all practice sessions for user
      const practiceQuery = query(
        collection(db, 'practice_sessions'),
        where('userId', '==', userId)
      )
      const practiceSnapshot = await getDocs(practiceQuery)

      // Calculate total practice time
      const totalPracticeTime = practiceSnapshot.docs.reduce((total, doc) => {
        return total + (doc.data().duration || 0)
      }, 0)

      // Get unique tools used (instruments)
      const instruments = [...new Set(practiceSnapshot.docs.map(doc => doc.data().toolName))]

      // Update user document with stats
      await updateDoc(doc(db, 'users', userId), {
        totalPracticeTime,
        instruments,
        lastUpdated: serverTimestamp()
      })

      return { totalPracticeTime, instruments }
    } catch (err) {
      console.error('Error calculating user stats:', err)
      return { totalPracticeTime: 0, instruments: [] }
    }
  }

  return {
    following,
    followers,
    suggestedUsers,
    followingActivity,
    isLoading,
    error,
    calculateUserStats,
    followUser,
    unfollowUser,
    checkIfFollowing,
    fetchFollowing,
    fetchFollowers,
    fetchSuggestedUsers,
    fetchFollowingActivity,
    blockUser,
    unblockUser,
    fetchDiscoverableUsers,
    isActivityLiked,
    fetchActivityLikes,
    toggleActivityLike,
    addActivityComment
  }
})
