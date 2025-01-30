import { defineStore } from 'pinia'
import { ref } from 'vue'
import { db, auth } from '../config/firebase'
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  doc,
  setDoc
} from 'firebase/firestore'

export const useAssessmentStore = defineStore('assessments', () => {
  const currentAssessment = ref(null)
  const assessmentHistory = ref([])
  const isLoading = ref(false)
  const error = ref(null)

  const assessmentTypes = {
    noteReading: {
      name: 'Note Reading',
      description: 'Test your ability to identify notes on the staff',
      questions: [
        {
          type: 'noteIdentification',
          difficulty: 'beginner',
          points: 5
        },
        {
          type: 'keySignature',
          difficulty: 'intermediate',
          points: 10
        }
      ]
    }
    // rhythmPerception: {
    //   name: 'Rhythm Perception',
    //   description: 'Evaluate your understanding of rhythm and timing',
    //   questions: [
    //     {
    //       type: 'rhythmPattern',
    //       difficulty: 'beginner',
    //       points: 5
    //     },
    //     {
    //       type: 'tempoMatching',
    //       difficulty: 'intermediate',
    //       points: 10
    //     }
    //   ]
    // },
    // earTraining: {
    //   name: 'Ear Training',
    //   description: 'Test your ability to recognize intervals and chords',
    //   questions: [
    //     {
    //       type: 'intervalRecognition',
    //       difficulty: 'intermediate',
    //       points: 10
    //     },
    //     {
    //       type: 'chordIdentification',
    //       difficulty: 'advanced',
    //       points: 15
    //     }
    //   ]
    // }
  }

  const startAssessment = async (type) => {
    if (!auth.currentUser) return

    try {
      const assessment = {
        userId: auth.currentUser.uid,
        type,
        startTime: new Date(),
        completed: false,
        score: 0,
        answers: [],
        maxScore: assessmentTypes[type].questions.reduce((acc, q) => acc + q.points, 0)
      }

      const docRef = await addDoc(collection(db, 'assessments'), assessment)
      currentAssessment.value = { id: docRef.id, ...assessment }
      return docRef.id
    } catch (err) {
      console.error('Error starting assessment:', err)
      error.value = err.message
      return null
    }
  }

  const submitAnswer = async (answer) => {
    if (!currentAssessment.value) return

    try {
      const assessmentRef = doc(db, 'assessments', currentAssessment.value.id)
      currentAssessment.value.answers.push(answer)
      await setDoc(assessmentRef, {
        answers: currentAssessment.value.answers
      }, { merge: true })
    } catch (err) {
      console.error('Error submitting answer:', err)
      error.value = err.message
    }
  }

  const completeAssessment = async (finalScore) => {
    if (!currentAssessment.value) return

    try {
      const assessmentRef = doc(db, 'assessments', currentAssessment.value.id)
      await setDoc(assessmentRef, {
        completed: true,
        score: finalScore,
        endTime: new Date()
      }, { merge: true })

      currentAssessment.value = null
      await fetchAssessmentHistory()
    } catch (err) {
      console.error('Error completing assessment:', err)
      error.value = err.message
    }
  }

  const fetchAssessmentHistory = async () => {
    if (!auth.currentUser) return

    isLoading.value = true
    error.value = null

    try {
      const q = query(
        collection(db, 'assessments'),
        where('userId', '==', auth.currentUser.uid)
      )
      const querySnapshot = await getDocs(q)
      assessmentHistory.value = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        startTime: doc.data().startTime.toDate(),
        endTime: doc.data().endTime?.toDate()
      }))
    } catch (err) {
      console.error('Error fetching assessment history:', err)
      error.value = err.message
    } finally {
      isLoading.value = false
    }
  }

  return {
    currentAssessment,
    assessmentHistory,
    assessmentTypes,
    isLoading,
    error,
    startAssessment,
    submitAnswer,
    completeAssessment,
    fetchAssessmentHistory
  }
})
