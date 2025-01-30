import { ref } from 'vue'
import { usePracticeStore } from '../stores/practice'
import { useGoalStore } from '../stores/goals'

export function usePracticeTracking () {
  const practiceStore = usePracticeStore()
  const goalStore = useGoalStore()
  const startTime = ref(null)
  const interactions = ref(0)
  const currentTool = ref(null)

  const startPractice = async (toolName) => {
    startTime.value = new Date()
    interactions.value = 0
    currentTool.value = toolName
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
