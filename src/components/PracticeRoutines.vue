<template>
    <div class="practice-routines">
      <div class="routines-header">
        <h2>Practice Routines</h2>
        <button class="btn primary" @click="showCreator = true" v-if="!showCreator">
          Create New Routine
        </button>
      </div>

      <RoutineCreator
        v-if="showCreator"
        @cancel="showCreator = false"
        @created="handleRoutineCreated"
      />

      <div v-else class="routines-grid">
        <div
          v-for="routine in routineStore.routines"
          :key="routine.id"
          class="routine-card"
        >
          <div class="routine-header">
            <h3>{{ routine.name }}</h3>
            <button class="delete-btn" @click="deleteRoutine(routine.id)">×</button>
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

          <div class="routine-actions">
            <button
              class="btn secondary"
              @click="toggleShare(routine)"
            >
              {{ routine.isShared ? 'Unshare' : 'Share' }}
            </button>
            <button
              class="btn primary"
              @click="selectRoutine(routine)"
            >
              Start Routine
            </button>
          </div>
        </div>
      </div>

      <div v-if="selectedRoutine" class="routine-overlay">
        <div class="routine-modal">
          <button class="close-btn" @click="selectedRoutine = null">×</button>
          <RoutinePlayer
            :routine="selectedRoutine"
            @complete="handleRoutineComplete"
          />
        </div>
      </div>
    </div>
  </template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoutineStore } from '../stores/routines'
import { useNotificationStore } from '../stores/notification'
import RoutineCreator from './RoutineCreator.vue'
import RoutinePlayer from './RoutinePlayer.vue'

const routineStore = useRoutineStore()
const notificationStore = useNotificationStore()
const showCreator = ref(false)
const selectedRoutine = ref(null)

onMounted(async () => {
  await routineStore.fetchRoutines()
})

const handleRoutineCreated = () => {
  showCreator.value = false
  notificationStore.addNotification('Routine created successfully!', 'success')
}

const deleteRoutine = async (routineId) => {
  if (confirm('Are you sure you want to delete this routine?')) {
    try {
      await routineStore.deleteRoutine(routineId)
      notificationStore.addNotification('Routine deleted successfully', 'success')
    } catch (error) {
      notificationStore.addNotification('Failed to delete routine', 'error')
    }
  }
}

const selectRoutine = (routine) => {
  selectedRoutine.value = routine
}

const handleRoutineComplete = () => {
  selectedRoutine.value = null
  notificationStore.addNotification('Routine completed!', 'success')
}

const toggleShare = async (routine) => {
  try {
    if (routine.isShared) {
      await routineStore.unshareRoutine(routine.id)
      notificationStore.addNotification('Routine is no longer shared', 'info')
    } else {
      await routineStore.shareRoutine(routine.id)
      notificationStore.addNotification('Routine is now shared with the community', 'success')
    }
  } catch (error) {
    notificationStore.addNotification('Failed to update sharing status', 'error')
  }
}
</script>

<style lang="scss" scoped>
.practice-routines {
  padding: 30px;
}

.routines-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;

  h2 {
    color: #fff;
    font-size: 24px;
  }
}

.routines-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.routine-card {
  background: #18181B;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);

  .routine-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;

    h3 {
      color: #fff;
      font-size: 1.2em;
    }

    .delete-btn {
      background: none;
      border: none;
      color: #c41e3a;
      font-size: 24px;
      cursor: pointer;
      padding: 0;
      line-height: 1;
    }
  }

  .description {
    color: #D1D5DB;
    margin-bottom: 15px;
  }

  .routine-stats {
    display: flex;
    justify-content: space-between;
    color: #9CA3AF;
    font-size: 0.9em;
    margin-bottom: 15px;
  }

  .tools-preview {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 15px;

    .tool-tag {
      background: rgba(196, 30, 58, 0.1);
      color: #c41e3a;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 0.9em;
    }

    .more-tools {
      color: #9CA3AF;
      font-size: 0.9em;
    }
  }

  .routine-actions {
    display: flex;
    gap: 10px;

    .btn {
      flex: 1;
    }
  }
}

.routine-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.routine-modal {
  background: #18181B;
  border-radius: 10px;
  padding: 30px;
  max-width: 600px;
  width: 90%;
  position: relative;

  .close-btn {
    position: absolute;
    top: 10px;
    right: 10px;
    background: none;
    border: none;
    color: #9CA3AF;
    font-size: 24px;
    cursor: pointer;
  }
}

.btn {
  padding: 8px 20px;
  border-radius: 6px;
  cursor: pointer;
  border: none;
  transition: background-color 0.3s ease;

  &.primary {
    background: #c41e3a;
    color: white;

    &:hover {
      background: darken(#c41e3a, 10%);
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }

  &.secondary {
    background: #4B5563;
    color: white;

    &:hover {
      background: darken(#4B5563, 10%);
    }
  }
}

@media (max-width: 768px) {
  .practice-routines {
    padding: 20px;
  }

  .routines-header {
    flex-direction: column;
    gap: 15px;
    align-items: stretch;
  }

  .routine-actions {
    flex-direction: column;
  }
}
</style>
