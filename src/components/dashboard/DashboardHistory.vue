<template>
    <div class="history-section">
      <h2>Practice History</h2>
      <div v-if="practiceStore.isLoading" class="loading">
        Loading history...
      </div>
      <div v-else-if="practiceStore.error" class="error">
        {{ practiceStore.error }}
      </div>
      <div v-else-if="practiceStore.practiceHistory.length === 0" class="no-history">
        No practice sessions recorded yet. Start practicing!
      </div>
      <div v-else class="history-list">
        <div v-for="session in practiceStore.practiceHistory"
             :key="session.id"
             class="history-item">
          <div class="history-item-header">
            <h3>{{ session.toolName }}</h3>
            <span class="date">{{ formatDate(session.date) }}</span>
          </div>
          <div class="history-item-content">
            <p>Duration: {{ session.duration }} minutes</p>
            <p v-if="session.score">Score: {{ session.score }}</p>
            <p v-if="session.notes" class="notes">{{ session.notes }}</p>
          </div>
        </div>
      </div>
    </div>
  </template>

<script setup>
import { onMounted, watch } from 'vue'
import { usePracticeStore } from '../../stores/practice'
import { auth } from '../../config/firebase'

const practiceStore = usePracticeStore()

const formatDate = (date) => {
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(date)
}

// Watch for auth state changes
watch(() => auth.currentUser, (user) => {
  if (user) {
    practiceStore.fetchUserHistory()
  }
}, { immediate: true })

onMounted(async () => {
  if (auth.currentUser) {
    await practiceStore.fetchUserHistory()
  }
})
</script>

  <style lang="scss" scoped>
  .history-section {
    background: #18181B;
    padding: 30px;
    border-radius: 10px;
    border: 1px solid rgba(255, 255, 255, 0.1);

    h2 {
      margin-bottom: 20px;
      color: #fff;
    }
  }

  .history-item {
    background: rgba(255, 255, 255, 0.05);
    padding: 15px;
    border-radius: 8px;
    margin-bottom: 15px;

    &-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;

      h3 {
        color: #c41e3a;
      }

      .date {
        color: #9CA3AF;
        font-size: 0.9em;
      }
    }

    &-content {
      color: #D1D5DB;

      .notes {
        margin-top: 10px;
        font-style: italic;
      }
    }
  }

  .loading, .no-history {
    text-align: center;
    color: #9CA3AF;
    padding: 40px;
  }

  .error {
  color: #c41e3a;
  text-align: center;
  padding: 20px;
  background: rgba(196, 30, 58, 0.1);
  border-radius: 8px;
  margin: 20px 0;
}
  </style>
