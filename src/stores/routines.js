// stores/routines.js
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
  doc
} from 'firebase/firestore'

export const useRoutineStore = defineStore('routines', () => {
  const routines = ref([])
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
        timesCompleted: 0
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

  return {
    routines,
    isLoading,
    error,
    toolDurations,
    addRoutine,
    fetchRoutines,
    deleteRoutine,
    updateRoutineProgress
  }
})
