import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useNotificationStore = defineStore('notification', () => {
  const notifications = ref([])
  let nextId = 0

  const addNotification = (message, type = 'info') => {
    const id = nextId++
    notifications.value.push({
      id,
      message,
      type
    })

    // Automatically remove notification after 5 seconds
    setTimeout(() => {
      removeNotification(id)
    }, 5000)

    // Limit the number of notifications shown
    if (notifications.value.length > 5) {
      notifications.value.shift()
    }
  }

  const removeNotification = (id) => {
    const index = notifications.value.findIndex(n => n.id === id)
    if (index !== -1) {
      notifications.value.splice(index, 1)
    }
  }

  const clearAllNotifications = () => {
    notifications.value = []
  }

  return {
    notifications,
    addNotification,
    removeNotification,
    clearAllNotifications
  }
})
