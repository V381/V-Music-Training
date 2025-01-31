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
  deleteDoc,
  doc,
  getDoc,
  arrayUnion,
  arrayRemove,
  onSnapshot,
  serverTimestamp,
  increment,
  orderBy,
  limit
} from 'firebase/firestore'

export const useGroupStore = defineStore('groups', () => {
  const groups = ref([])
  const isLoading = ref(false)
  const error = ref(null)

  const fetchGroups = async () => {
    if (!auth.currentUser) return

    isLoading.value = true
    error.value = null

    try {
      const q = query(
        collection(db, 'practice_groups'),
        where('members', 'array-contains', auth.currentUser.uid)
      )

      const querySnapshot = await getDocs(q)

      const groupsData = await Promise.all(
        querySnapshot.docs.map(async (doc) => {
          const data = doc.data()
          const memberDetails = await fetchMemberDetails(data.members)
          return {
            id: doc.id,
            ...data,
            memberDetails
          }
        })
      )

      groups.value = groupsData
    } catch (err) {
      console.error('Error fetching groups:', err)
      error.value = err.message
    } finally {
      isLoading.value = false
    }
  }

  const fetchMemberDetails = async (memberIds) => {
    const memberDetails = await Promise.all(
      memberIds.map(async (id) => {
        const userDoc = await getDoc(doc(db, 'users', id))
        return {
          id,
          ...userDoc.data()
        }
      })
    )
    return memberDetails
  }

  const createGroup = async (groupData) => {
    if (!auth.currentUser) return

    try {
      const group = {
        name: groupData.name,
        description: groupData.description,
        createdBy: auth.currentUser.uid,
        members: [auth.currentUser.uid],
        createdAt: serverTimestamp(),
        totalPracticeTime: 0,
        isPublic: groupData.isPublic || false,
        practiceSchedule: [],
        lastActive: serverTimestamp()
      }

      const docRef = await addDoc(collection(db, 'practice_groups'), group)
      const newGroup = {
        id: docRef.id,
        ...group,
        memberDetails: await fetchMemberDetails([auth.currentUser.uid])
      }
      groups.value.push(newGroup)
      return docRef.id
    } catch (err) {
      console.error('Error creating group:', err)
      throw err
    }
  }

  const getGroupById = async (groupId) => {
    if (!auth.currentUser) return null

    try {
      const groupRef = doc(db, 'practice_groups', groupId)
      const groupDoc = await getDoc(groupRef)

      if (!groupDoc.exists()) return null

      const groupData = groupDoc.data()
      const memberDetails = await fetchMemberDetails(groupData.members)

      return {
        id: groupDoc.id,
        ...groupData,
        memberDetails
      }
    } catch (err) {
      console.error('Error fetching group:', err)
      throw err
    }
  }

  const inviteMember = async (groupId, email) => {
    if (!auth.currentUser) return

    try {
      await addDoc(collection(db, 'group_invites'), {
        groupId,
        email,
        status: 'pending',
        createdBy: auth.currentUser.uid,
        createdAt: serverTimestamp(),
        type: 'group_invitation'
      })
    } catch (err) {
      console.error('Error inviting member:', err)
      throw err
    }
  }

  const cancelInvite = async (inviteId) => {
    try {
      await deleteDoc(doc(db, 'group_invites', inviteId))
    } catch (err) {
      console.error('Error cancelling invite:', err)
      throw err
    }
  }

  const joinGroup = async (groupId) => {
    if (!auth.currentUser) return

    try {
      const groupRef = doc(db, 'practice_groups', groupId)
      await updateDoc(groupRef, {
        members: arrayUnion(auth.currentUser.uid),
        lastActive: serverTimestamp()
      })
      await fetchGroups()
    } catch (err) {
      console.error('Error joining group:', err)
      throw err
    }
  }

  const leaveGroup = async (groupId) => {
    if (!auth.currentUser) return

    try {
      const groupRef = doc(db, 'practice_groups', groupId)
      await updateDoc(groupRef, {
        members: arrayRemove(auth.currentUser.uid),
        lastActive: serverTimestamp()
      })
      groups.value = groups.value.filter(g => g.id !== groupId)
    } catch (err) {
      console.error('Error leaving group:', err)
      throw err
    }
  }

  const deleteGroup = async (groupId) => {
    try {
      await deleteDoc(doc(db, 'practice_groups', groupId))
      groups.value = groups.value.filter(g => g.id !== groupId)
    } catch (err) {
      console.error('Error deleting group:', err)
      throw err
    }
  }

  const startGroupSession = async (sessionData) => {
    if (!auth.currentUser) return

    try {
      const docRef = await addDoc(collection(db, 'group_sessions'), {
        groupId: sessionData.groupId,
        startTime: serverTimestamp(),
        endTime: null,
        createdBy: auth.currentUser.uid,
        members: [auth.currentUser.uid],
        status: 'active'
      })
      return docRef.id
    } catch (err) {
      console.error('Error starting group session:', err)
      throw err
    }
  }

  const updateMemberTool = async (sessionId, toolName) => {
    if (!auth.currentUser) return

    try {
      const sessionRef = doc(db, 'group_sessions', sessionId)
      await updateDoc(sessionRef, {
        [`memberTools.${auth.currentUser.uid}`]: {
          toolName,
          timestamp: serverTimestamp()
        }
      })
    } catch (err) {
      console.error('Error updating member tool:', err)
      throw err
    }
  }

  const endGroupSession = async (sessionId, sessionData) => {
    if (!auth.currentUser) return

    try {
      const sessionRef = doc(db, 'group_sessions', sessionId)
      await updateDoc(sessionRef, {
        endTime: serverTimestamp(),
        duration: sessionData.duration,
        toolsUsed: sessionData.tools,
        status: 'completed'
      })
    } catch (err) {
      console.error('Error ending session:', err)
      throw err
    }
  }

  const subscribeToSessionMembers = async (sessionId, callback) => {
    if (!auth.currentUser) return () => {}

    try {
      const sessionRef = doc(db, 'group_sessions', sessionId)

      return onSnapshot(sessionRef, async (snapshot) => {
        if (!snapshot.exists()) return

        const sessionData = snapshot.data()
        const memberTools = sessionData.memberTools || {}

        const members = await Promise.all(
          Object.keys(memberTools).map(async (userId) => {
            const userDoc = await getDoc(doc(db, 'users', userId))
            return {
              id: userId,
              ...userDoc.data(),
              currentTool: memberTools[userId].toolName
            }
          })
        )

        callback(members)
      })
    } catch (err) {
      console.error('Error subscribing to session members:', err)
      return () => {}
    }
  }

  const updateGroupPracticeTime = async (groupId, duration) => {
    try {
      const groupRef = doc(db, 'practice_groups', groupId)
      await updateDoc(groupRef, {
        totalPracticeTime: increment(duration),
        lastActive: serverTimestamp()
      })

      const groupIndex = groups.value.findIndex(g => g.id === groupId)
      if (groupIndex !== -1) {
        groups.value[groupIndex].totalPracticeTime += duration
      }
    } catch (err) {
      console.error('Error updating practice time:', err)
      throw err
    }
  }

  const addSessionMessage = async (sessionId, message) => {
    if (!auth.currentUser) return

    try {
      await addDoc(collection(db, 'group_sessions', sessionId, 'messages'), {
        userId: auth.currentUser.uid,
        content: message,
        timestamp: serverTimestamp()
      })
    } catch (err) {
      console.error('Error adding session message:', err)
      throw err
    }
  }

  const getSessionMessages = async (sessionId) => {
    if (!auth.currentUser) return []

    try {
      const q = query(
        collection(db, 'group_sessions', sessionId, 'messages'),
        orderBy('timestamp', 'desc'),
        limit(50)
      )

      const snapshot = await getDocs(q)
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
    } catch (err) {
      console.error('Error fetching session messages:', err)
      return []
    }
  }

  const updateInviteStatus = async (inviteId, status) => {
    if (!auth.currentUser) return

    try {
      const inviteRef = doc(db, 'group_invites', inviteId)
      await updateDoc(inviteRef, {
        status: status,
        updatedAt: serverTimestamp()
      })
    } catch (err) {
      console.error('Error updating invite status:', err)
      throw err
    }
  }

  const fetchPendingInvites = async () => {
    if (!auth.currentUser) return []

    try {
      const userEmail = auth.currentUser.email
      const q = query(
        collection(db, 'group_invites'),
        where('email', '==', userEmail),
        where('status', '==', 'pending')
      )
      const snapshot = await getDocs(q)
      // Get group details and sender details for each invite
      const invitesWithDetails = await Promise.all(
        snapshot.docs.map(async (inviteDoc) => {
          const inviteData = inviteDoc.data()
          // Get group details
          const groupRef = doc(db, 'practice_groups', inviteData.groupId)
          const groupDoc = await getDoc(groupRef)
          const senderRef = doc(db, 'users', inviteData.createdBy)
          const senderDoc = await getDoc(senderRef)
          return {
            id: inviteDoc.id,
            ...inviteData,
            group: groupDoc.exists() ? { id: groupDoc.id, ...groupDoc.data() } : null,
            sender: senderDoc.exists() ? senderDoc.data().displayName || 'Unknown User' : 'Unknown User'
          }
        })
      )
      return invitesWithDetails.filter(invite => invite.group !== null)
    } catch (err) {
      console.error('Error fetching invites:', err)
      return []
    }
  }

  const acceptInvite = async (inviteId, groupId) => {
    const groupRef = doc(db, 'practice_groups', groupId)
    await updateDoc(groupRef, {
      members: arrayUnion(auth.currentUser.uid)
    })

    const inviteRef = doc(db, 'group_invites', inviteId)
    await updateDoc(inviteRef, {
      status: 'accepted',
      updatedAt: serverTimestamp()
    })

    await fetchGroups()
  }

  return {
    groups,
    isLoading,
    error,
    fetchGroups,
    createGroup,
    getGroupById,
    inviteMember,
    cancelInvite,
    joinGroup,
    leaveGroup,
    deleteGroup,
    startGroupSession,
    updateMemberTool,
    endGroupSession,
    subscribeToSessionMembers,
    updateGroupPracticeTime,
    addSessionMessage,
    getSessionMessages,
    fetchPendingInvites,
    acceptInvite,
    updateInviteStatus
  }
})
