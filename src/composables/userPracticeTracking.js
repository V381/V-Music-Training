import { ref } from 'vue'
import { usePracticeStore } from '../stores/practice'
import { useGoalStore } from '../stores/goals'

export function usePracticeTracking () {
  const practiceStore = usePracticeStore()
  const goalStore = useGoalStore()
  const startTime = ref(null)
  const interactions = ref(0)
  const currentTool = ref(null)
  const practiceData = ref(null)

  const startPractice = async (toolName, additionalData = {}) => {
    startTime.value = new Date()
    interactions.value = 0
    currentTool.value = toolName
    practiceData.value = additionalData
    await goalStore.fetchUserGoals()
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
        date: new Date(),
        notes: practiceData.value?.notes || additionalData?.notes,
        fromRoutine: practiceData.value?.fromRoutine || false,
        routineName: practiceData.value?.routineName,
        rating: additionalData?.rating || 0,
        ...additionalData
      })

      const toolGoals = goalStore.goals.filter(
        goal => goal.toolName === currentTool.value
      )

      for (const goal of toolGoals) {
        const currentProgress = goal.progress || 0
        const newProgress = currentProgress + duration

        await goalStore.updateGoalProgress(goal.id, newProgress)
      }

      await goalStore.fetchUserGoals()

      startTime.value = null
      interactions.value = 0
      currentTool.value = null
      practiceData.value = null

      return true
    } catch (error) {
      console.error('Error recording practice session:', error)
      return false
    }
  }

  const getCurrentPracticeDuration = () => {
    if (!startTime.value) return 0
    const now = new Date()
    return Math.round((now - startTime.value) / 1000 / 60)
  }

  const isCurrentlyPracticing = () => {
    return !!startTime.value
  }

  return {
    startPractice,
    recordInteraction,
    endPractice,
    getCurrentPracticeDuration,
    isCurrentlyPracticing,
    currentTool,
    interactions
  }
}
