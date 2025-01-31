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
  increment,
  doc,
  getDoc
} from 'firebase/firestore'

export const useRoutineStore = defineStore('routines', () => {
  const routines = ref([])
  const sharedRoutines = ref([])
  const isLoading = ref(false)
  const error = ref(null)

  // Routine template with default durations
  const toolDurations = {
    'Note Learning Tool': 10,
    'Guitar Notes': 15,
    Metronome: 5,
    'Ear Training': 10,
    'Piano Notes': 15
  }

  const addRoutine = async (routineData) => {
    if (!auth.currentUser) return

    try {
      const routine = {
        userId: auth.currentUser.uid,
        name: routineData.name,
        description: routineData.description,
        tools: routineData.tools,
        totalDuration: routineData.tools.reduce((sum, tool) => sum + tool.duration, 0),
        createdAt: new Date(),
        timesCompleted: 0,
        isShared: false
      }

      const docRef = await addDoc(collection(db, 'practice_routines'), routine)
      routines.value.push({ id: docRef.id, ...routine })
      return docRef.id
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  const fetchRoutines = async () => {
    if (!auth.currentUser) return

    isLoading.value = true
    error.value = null

    try {
      const q = query(
        collection(db, 'practice_routines'),
        where('userId', '==', auth.currentUser.uid)
      )
      const snapshot = await getDocs(q)
      routines.value = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
    } catch (err) {
      error.value = err.message
    } finally {
      isLoading.value = false
    }
  }

  const deleteRoutine = async (routineId) => {
    try {
      await deleteDoc(doc(db, 'practice_routines', routineId))
      routines.value = routines.value.filter(r => r.id !== routineId)
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  const updateRoutineProgress = async (routineId) => {
    try {
      const routineRef = doc(db, 'practice_routines', routineId)
      await updateDoc(routineRef, {
        timesCompleted: increment(1),
        lastCompleted: new Date()
      })
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  const shareRoutine = async (routineId) => {
    if (!auth.currentUser) return

    try {
      const routineRef = doc(db, 'practice_routines', routineId)
      await updateDoc(routineRef, {
        isShared: true,
        sharedAt: new Date()
      })

      // Update local state
      const routine = routines.value.find(r => r.id === routineId)
      if (routine) {
        routine.isShared = true
        routine.sharedAt = new Date()
      }
    } catch (err) {
      console.error('Error sharing routine:', err)
      error.value = err.message
      throw err
    }
  }

  const unshareRoutine = async (routineId) => {
    if (!auth.currentUser) return

    try {
      const routineRef = doc(db, 'practice_routines', routineId)
      await updateDoc(routineRef, {
        isShared: false,
        sharedAt: null
      })

      // Update local state
      const routine = routines.value.find(r => r.id === routineId)
      if (routine) {
        routine.isShared = false
        routine.sharedAt = null
      }
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  const fetchSharedRoutines = async () => {
    if (!auth.currentUser) return

    isLoading.value = true
    error.value = null

    try {
      const q = query(
        collection(db, 'practice_routines'),
        where('isShared', '==', true)
      )

      const snapshot = await getDocs(q)

      const routinesWithUsers = await Promise.all(
        snapshot.docs.map(async (routineDoc) => {
          const routine = { id: routineDoc.id, ...routineDoc.data() }
          // Fix: Use doc() to create reference
          const userDoc = await getDoc(doc(db, 'users', routine.userId))
          return {
            ...routine,
            createdBy: userDoc.data()?.displayName || 'Anonymous'
          }
        })
      )

      console.log('Final shared routines:', routinesWithUsers)

      sharedRoutines.value = routinesWithUsers
    } catch (err) {
      console.error('Error fetching shared routines:', err)
      error.value = err.message
    } finally {
      isLoading.value = false
    }
  }

  const copyRoutine = async (routineId) => {
    if (!auth.currentUser) return

    try {
      const originalRoutine = sharedRoutines.value.find(r => r.id === routineId)
      if (!originalRoutine) return

      const newRoutine = {
        userId: auth.currentUser.uid,
        name: `Copy of ${originalRoutine.name}`,
        description: originalRoutine.description,
        tools: originalRoutine.tools,
        totalDuration: originalRoutine.totalDuration,
        createdAt: new Date(),
        timesCompleted: 0,
        isShared: false,
        copiedFrom: {
          routineId: originalRoutine.id,
          userId: originalRoutine.userId,
          userName: originalRoutine.createdBy
        }
      }

      const docRef = await addDoc(collection(db, 'practice_routines'), newRoutine)
      routines.value.push({ id: docRef.id, ...newRoutine })
      return docRef.id
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  const updateRoutine = async (routineId, updates) => {
    try {
      const routineRef = doc(db, 'practice_routines', routineId)
      await updateDoc(routineRef, {
        ...updates,
        updatedAt: new Date()
      })

      // Update local state
      const index = routines.value.findIndex(r => r.id === routineId)
      if (index !== -1) {
        routines.value[index] = {
          ...routines.value[index],
          ...updates,
          updatedAt: new Date()
        }
      }
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  return {
    routines,
    sharedRoutines,
    isLoading,
    error,
    toolDurations,
    addRoutine,
    fetchRoutines,
    deleteRoutine,
    updateRoutineProgress,
    shareRoutine,
    unshareRoutine,
    fetchSharedRoutines,
    copyRoutine,
    updateRoutine
  }
})
