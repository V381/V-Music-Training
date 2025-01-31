<template>
    <div class="shared-routines">
      <div class="header">
        <div class="header-content">
          <h2>Browse Shared Routines</h2>
          <div class="search-wrapper">
            <input
              v-model="searchTerm"
              type="text"
              placeholder="Search routines..."
              class="search-input"
            >
          </div>
        </div>
      </div>

      <div class="routines-grid">
        <div
          v-for="routine in filteredRoutines"
          :key="routine.id"
          class="routine-card"
        >
          <div class="routine-header">
            <h3>{{ routine.name }}</h3>
            <span class="creator">by {{ routine.createdBy }}</span>
          </div>
          <p class="description">{{ routine.description }}</p>
          <div class="routine-stats">
            <span>{{ routine.totalDuration }} minutes</span>
            <span>{{ routine.tools.length }} tools</span>
            <span>{{ routine.timesCompleted }} completions</span>
          </div>
          <div class="tools-preview">
            <span
              v-for="tool in routine.tools.slice(0, 3)"
              :key="tool.name"
              class="tool-tag"
            >
              {{ tool.name }}
            </span>
            <span v-if="routine.tools.length > 3" class="more-tools">
              +{{ routine.tools.length - 3 }} more
            </span>
          </div>
          <button
            class="btn primary"
            @click="copyRoutine(routine.id)"
            :disabled="copying"
          >
            {{ copying ? 'Copying...' : 'Copy to My Routines' }}
          </button>
        </div>
      </div>

      <div v-if="routineStore.isLoading" class="loading">
        Loading shared routines...
      </div>

      <div v-else-if="filteredRoutines.length === 0" class="no-routines">
        No shared routines found
      </div>
    </div>
  </template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoutineStore } from '../stores/routines'
import { useNotificationStore } from '../stores/notification'

const routineStore = useRoutineStore()
const notificationStore = useNotificationStore()
const searchTerm = ref('')
const copying = ref(false)

const filteredRoutines = computed(() => {
  if (!searchTerm.value) return routineStore.sharedRoutines

  const term = searchTerm.value.toLowerCase()
  return routineStore.sharedRoutines.filter(routine =>
    routine.name.toLowerCase().includes(term) ||
      routine.description.toLowerCase().includes(term) ||
      routine.tools.some(tool => tool.name.toLowerCase().includes(term))
  )
})

const copyRoutine = async (routineId) => {
  copying.value = true
  try {
    await routineStore.copyRoutine(routineId)
    notificationStore.addNotification('Routine copied successfully!', 'success')
  } catch (error) {
    notificationStore.addNotification('Failed to copy routine', 'error')
  } finally {
    copying.value = false
  }
}

onMounted(async () => {
  await routineStore.fetchSharedRoutines()
})
</script>

  <style lang="scss" scoped>
  .shared-routines {
    padding: 20px;
  }

  .header {
    margin-bottom: 30px;
    background: #18181B;
    border-radius: 10px;
    padding: 20px;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .header-content {
    h2 {
      color: #fff;
      font-size: 24px;
      margin-bottom: 15px;
    }
  }

  .search-wrapper {
    width: 100%;
    max-width: 600px;
  }

  .search-input {
    width: 100%;
    padding: 12px 16px;
    border-radius: 6px;
    background: #27272A;
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: #fff;
    font-size: 16px;

    &:focus {
      outline: none;
      border-color: #c41e3a;
    }

    &::placeholder {
      color: rgba(255, 255, 255, 0.5);
    }
  }

  .routines-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 20px;
  }

  .routine-card {
    background: #18181B;
    border-radius: 10px;
    padding: 20px;
    border: 1px solid rgba(255, 255, 255, 0.1);

    .routine-header {
      margin-bottom: 15px;

      h3 {
        color: #fff;
        font-size: 18px;
        margin-bottom: 5px;
      }

      .creator {
        color: #9CA3AF;
        font-size: 14px;
      }
    }

    .description {
      color: #D1D5DB;
      margin-bottom: 15px;
      font-size: 14px;
      line-height: 1.5;
    }

    .routine-stats {
      display: flex;
      justify-content: space-between;
      color: #9CA3AF;
      font-size: 14px;
      margin-bottom: 15px;
      background: rgba(0, 0, 0, 0.2);
      padding: 10px;
      border-radius: 6px;
    }

    .tools-preview {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-bottom: 15px;

      .tool-tag {
        background: rgba(196, 30, 58, 0.1);
        color: #c41e3a;
        padding: 6px 12px;
        border-radius: 4px;
        font-size: 14px;
      }

      .more-tools {
        color: #9CA3AF;
        font-size: 14px;
        padding: 6px 12px;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 4px;
      }
    }

    .btn {
      width: 100%;
      padding: 12px;
      border-radius: 6px;
      cursor: pointer;
      border: none;
      transition: all 0.3s ease;
      font-size: 16px;

      &.primary {
        background: #c41e3a;
        color: white;

        &:hover:not(:disabled) {
          background: darken(#c41e3a, 10%);
        }

        &:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      }
    }
  }

  .loading, .no-routines {
    text-align: center;
    color: #9CA3AF;
    padding: 40px;
    background: #18181B;
    border-radius: 10px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    font-size: 16px;
  }

  @media (max-width: 768px) {
    .shared-routines {
      padding: 15px;
    }

    .header {
      padding: 15px;
      margin-bottom: 20px;
    }

    .header-content {
      h2 {
        font-size: 20px;
        margin-bottom: 12px;
      }
    }

    .search-input {
      padding: 10px 14px;
      font-size: 14px;
    }

    .routines-grid {
      grid-template-columns: 1fr;
    }

    .routine-card {
      padding: 15px;

      .routine-stats {
        flex-direction: column;
        gap: 8px;
        align-items: flex-start;
      }

      .btn {
        padding: 10px;
        font-size: 14px;
      }
    }

    .loading, .no-routines {
      padding: 30px 15px;
      font-size: 14px;
    }
  }
  </style>
