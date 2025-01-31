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
          <button
            class="btn primary"
            @click="selectRoutine(routine)"
          >
            Start Routine
          </button>
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
import RoutineCreator from './RoutineCreator.vue'
import RoutinePlayer from './RoutinePlayer.vue'

const routineStore = useRoutineStore()
const showCreator = ref(false)
const selectedRoutine = ref(null)

onMounted(async () => {
  await routineStore.fetchRoutines()
})

const handleRoutineCreated = () => {
  showCreator.value = false
}

const deleteRoutine = async (routineId) => {
  if (confirm('Are you sure you want to delete this routine?')) {
    await routineStore.deleteRoutine(routineId)
  }
}

const selectRoutine = (routine) => {
  selectedRoutine.value = routine
}

const handleRoutineComplete = () => {
  selectedRoutine.value = null
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
    border-radius: 10px;
    padding: 20px;
    border: 1px solid rgba(255, 255, 255, 0.1);

    .routine-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;

      h3 {
        color: #fff;
      }

      .delete-btn {
        background: none;
        border: none;
        color: #c41e3a;
        font-size: 20px;
        cursor: pointer;
      }
    }

    .description {
      color: #9CA3AF;
      margin-bottom: 15px;
    }

    .btn {
    margin-top: 15px;
    width: 100%;
  }

    .routine-stats {
      display: flex;
      justify-content: space-between;
      margin-bottom: 15px;
      color: #D1D5DB;
      font-size: 0.9em;
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
}
  </style>
