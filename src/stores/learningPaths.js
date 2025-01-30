import { defineStore } from 'pinia'
import { ref } from 'vue'
import { db, auth } from '../config/firebase'
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  arrayUnion
} from 'firebase/firestore'

export const useLearningPathsStore = defineStore('learningPaths', () => {
  const currentPath = ref(null)
  const userProgress = ref({})
  const isLoading = ref(false)
  const error = ref(null)

  const paths = ref({
    beginner: {
      name: 'Beginner',
      description: 'Perfect for those just starting their musical journey',
      stages: [
        {
          id: 'basics',
          name: 'Musical Basics',
          description: 'Learn fundamental music concepts',
          tools: [
            {
              name: 'Note Learning Tool',
              minimumPracticeTime: 30,
              requirements: ['Identify basic notes', 'Understand note durations']
            }
          ]
        },
        {
          id: 'rhythm',
          name: 'Rhythm Foundation',
          description: 'Master basic timing and rhythm',
          tools: [
            {
              name: 'Simple Metronome',
              minimumPracticeTime: 20,
              requirements: ['Practice with different tempos', 'Basic rhythm patterns']
            }
          ]
        }
      ]
    },
    intermediate: {
      name: 'Intermediate',
      description: 'For musicians with basic knowledge seeking to advance',
      stages: [
        {
          id: 'advanced-theory',
          name: 'Advanced Theory',
          description: 'Dive deeper into music theory',
          tools: [
            {
              name: 'Ear Training',
              minimumPracticeTime: 45,
              requirements: ['Identify intervals', 'Recognize chord progressions']
            }
          ]
        },
        {
          id: 'instrument-mastery',
          name: 'Instrument Mastery',
          description: 'Advanced instrument-specific skills',
          tools: [
            {
              name: 'Guitar Notes',
              minimumPracticeTime: 60,
              requirements: ['Advanced fretboard navigation', 'Scale patterns']
            },
            {
              name: 'Piano Notes',
              minimumPracticeTime: 60,
              requirements: ['Complex chord progressions', 'Advanced scales']
            }
          ]
        }
      ]
    }
  })

  const initializeUserProgress = async () => {
    if (!auth.currentUser) return

    isLoading.value = true
    error.value = null

    try {
      const userDoc = await getDoc(doc(db, 'user_progress', auth.currentUser.uid))

      if (!userDoc.exists()) {
        await setDoc(doc(db, 'user_progress', auth.currentUser.uid), {
          currentPath: null,
          completedStages: [],
          currentStage: null
        })
        userProgress.value = {
          currentPath: null,
          completedStages: [],
          currentStage: null
        }
      } else {
        userProgress.value = userDoc.data()
        currentPath.value = userProgress.value.currentPath
      }
    } catch (err) {
      console.error('Error initializing user progress:', err)
      error.value = err.message
    } finally {
      isLoading.value = false
    }
  }

  const selectPath = async (pathId) => {
    if (!auth.currentUser) return

    try {
      await updateDoc(doc(db, 'user_progress', auth.currentUser.uid), {
        currentPath: pathId,
        currentStage: paths.value[pathId].stages[0].id
      })

      currentPath.value = pathId
      userProgress.value.currentPath = pathId
      userProgress.value.currentStage = paths.value[pathId].stages[0].id
    } catch (err) {
      console.error('Error selecting path:', err)
      error.value = err.message
    }
  }

  const completeStage = async (stageId) => {
    if (!auth.currentUser) return

    try {
      await updateDoc(doc(db, 'user_progress', auth.currentUser.uid), {
        completedStages: arrayUnion(stageId)
      })

      userProgress.value.completedStages.push(stageId)
    } catch (err) {
      console.error('Error completing stage:', err)
      error.value = err.message
    }
  }

  return {
    paths,
    currentPath,
    userProgress,
    isLoading,
    error,
    initializeUserProgress,
    selectPath,
    completeStage
  }
})
