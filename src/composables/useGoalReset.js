import { onMounted, watch } from 'vue'
import { useGoalStore } from '../stores/goals'
import { useNotificationStore } from '../stores/notification'
import { auth } from '../config/firebase'

export function useGoalReset () {
  const goalStore = useGoalStore()
  const notificationStore = useNotificationStore()

  const checkAndResetGoals = async () => {
    if (!goalStore.goals.length) return

    const currentDate = new Date()

    for (const goal of goalStore.goals) {
      const startDate = new Date(goal.startDate)

      if (goal.frequency === 'daily') {
        // Only reset if it's a different day
        if (startDate.getDate() !== currentDate.getDate() ||
            startDate.getMonth() !== currentDate.getMonth() ||
            startDate.getFullYear() !== currentDate.getFullYear()) {
          try {
            await goalStore.resetDailyGoals()
            await goalStore.checkAndGenerateChallenge()
            notificationStore.addNotification('Daily goals have been reset for a new day', 'info')
            break
          } catch (error) {
            console.error('Error resetting daily goals:', error)
            notificationStore.addNotification('Failed to reset daily goals', 'error')
          }
        }
      } else if (goal.frequency === 'weekly') {
        const weekDiff = Math.floor((currentDate - startDate) / (1000 * 60 * 60 * 24 * 7))
        if (weekDiff >= 1) {
          try {
            await goalStore.resetWeeklyGoals()
            notificationStore.addNotification('Weekly goals have been reset for a new week', 'info')
            break
          } catch (error) {
            console.error('Error resetting weekly goals:', error)
            notificationStore.addNotification('Failed to reset weekly goals', 'error')
          }
        }
      }
    }
  }

  // Check goals when user logs in
  watch(() => auth.currentUser, (user) => {
    if (user) {
      checkAndResetGoals()
    }
  })

  // Check goals on component mount
  onMounted(() => {
    if (auth.currentUser) {
      checkAndResetGoals()
    }
  })

  return {
    checkAndResetGoals
  }
}
