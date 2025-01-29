import { ref } from 'vue'
import { usePracticeStore } from '../stores/practice'

export function usePracticeTracking () {
  const practiceStore = usePracticeStore()
  const startTime = ref(null)
  const interactions = ref(0)
  const currentTool = ref(null)

  const startPractice = (toolName) => {
    startTime.value = new Date()
    interactions.value = 0
    currentTool.value = toolName
  }

  const recordInteraction = () => {
    interactions.value++
  }

  const endPractice = async (additionalData = {}) => {
    if (!startTime.value || !currentTool.value) return

    const endTime = new Date()
    const duration = Math.round((endTime - startTime.value) / 1000 / 60)

    try {
      await practiceStore.addPracticeSession({
        toolName: currentTool.value,
        duration,
        interactions: interactions.value,
        ...additionalData
      })

      // Reset tracking
      startTime.value = null
      interactions.value = 0
      currentTool.value = null

      return true
    } catch (error) {
      console.error('Error recording practice session:', error)
      return false
    }
  }

  return {
    startPractice,
    recordInteraction,
    endPractice,
    currentTool,
    interactions
  }
}
