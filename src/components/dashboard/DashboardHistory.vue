<template>
  <div class="history-section">
    <div class="history-header">
      <h2>Practice History</h2>
      <div class="sort-control">
        <button class="sort-btn" @click="toggleSort">
          Sort by {{ sortOrder === 'desc' ? 'Oldest' : 'Newest' }}
          <i :class="['fas', sortOrder === 'desc' ? 'fa-arrow-down' : 'fa-arrow-up']"></i>
        </button>
      </div>
    </div>

    <LoadingSpinner v-if="practiceStore.isLoading" text="Loading history..." />
    <div v-else-if="practiceStore.error" class="error">
      {{ practiceStore.error }}
    </div>
    <div v-else-if="sortedHistory.length === 0" class="no-history">
      No practice sessions recorded yet. Start practicing!
    </div>
    <div v-else class="history-list">
      <div v-for="session in sortedHistory"
           :key="session.id"
           class="history-item">
        <div class="history-item-header">
          <h3>{{ session.toolName }}</h3>
          <span class="date">{{ formatDate(session.date) }}</span>
        </div>
        <div class="history-item-content">
          <p>Duration: {{ session.duration }} minutes</p>
          <p v-if="session.score">Score: {{ session.score }}</p>
          <p v-if="session.fromRoutine" class="routine-info">
            From routine: {{ session.routineName }}
          </p>
          <p v-if="session.notes" class="notes">{{ session.notes }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { usePracticeStore } from '../../stores/practice'
import { auth } from '../../config/firebase'
import LoadingSpinner from '../../components/LoadingSpinner.vue'

const practiceStore = usePracticeStore()
const sortOrder = ref('desc') // 'desc' for newest first, 'asc' for oldest first

const sortedHistory = computed(() => {
  return [...practiceStore.practiceHistory].sort((a, b) => {
    const comparison = a.date - b.date
    return sortOrder.value === 'desc' ? -comparison : comparison
  })
})

const toggleSort = () => {
  sortOrder.value = sortOrder.value === 'desc' ? 'asc' : 'desc'
}

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
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;

  h2 {
    color: #fff;
  }

  .sort-control {
    .sort-btn {
      background: rgba(255, 255, 255, 0.1);
      color: #fff;
      border: 1px solid rgba(255, 255, 255, 0.1);
      padding: 8px 16px;
      border-radius: 6px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
      transition: background-color 0.3s ease;

      &:hover {
        background: rgba(255, 255, 255, 0.2);
      }

      i {
        font-size: 12px;
      }
    }
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

    .routine-info {
      color: #c41e3a;
      font-size: 0.9em;
      margin-top: 5px;
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

@media (max-width: 768px) {
  .history-section {
    padding: 20px;
  }

  .history-header {
    flex-direction: column;
    gap: 15px;
    text-align: center;

    .sort-control {
      width: 100%;
      .sort-btn {
        width: 100%;
        justify-content: center;
      }
    }
  }
}
</style>
