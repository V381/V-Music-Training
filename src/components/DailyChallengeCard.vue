<template>
    <div class="challenge-section">
      <h2>Daily Challenge</h2>

      <div v-if="currentChallenge" class="challenge-card">
        <div class="challenge-header">
          <h3>{{ currentChallenge.challengeTitle }}</h3>
          <span :class="['status', isCompleted ? 'completed' : 'in-progress']">
            {{ isCompleted ? 'Completed' : 'In Progress' }}
          </span>
        </div>

        <p class="description">{{ currentChallenge.challengeDescription }}</p>

        <div class="progress-bar">
          <div
            class="progress"
            :style="{ width: `${(currentChallenge.progress / currentChallenge.targetMinutes) * 100}%` }"
          ></div>
        </div>

        <div class="progress-text">
          {{ currentChallenge.progress || 0 }} / {{ currentChallenge.targetMinutes }} minutes
        </div>

        <div class="challenge-footer">
          <button
            class="btn primary"
            @click="startChallenge"
            :disabled="isCompleted"
          >
            Start Challenge
          </button>
        </div>
      </div>

      <div v-else class="no-challenge">
        Loading today's challenge...
      </div>
    </div>
  </template>

<script setup>
import { computed } from 'vue'
import { useGoalStore } from '../stores/goals'
import { useRouter } from 'vue-router'

const goalStore = useGoalStore()
const router = useRouter()

const currentChallenge = computed(() => {
  return goalStore.goals.find(
    goal => goal.isChallenge &&
      goal.frequency === 'daily' &&
      new Date(goal.startDate).toDateString() === new Date().toDateString()
  )
})

const isCompleted = computed(() => {
  if (!currentChallenge.value) return false
  return (currentChallenge.value.progress || 0) >= currentChallenge.value.targetMinutes
})

const startChallenge = () => {
  if (!currentChallenge.value) return
  router.push('/')
  // This will trigger the practice modal and tracking
  // through your existing system
}
</script>

  <style lang="scss" scoped>
  .challenge-section {
    background: #18181B;
    padding: 30px;
    border-radius: 10px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    margin-bottom: 40px;

    h2 {
      margin-bottom: 20px;
      color: #fff;
    }
  }

  .challenge-card {
    background: rgba(255, 255, 255, 0.05);
    padding: 20px;
    border-radius: 8px;
  }

  .challenge-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;

    h3 {
      color: #c41e3a;
    }

    .status {
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 0.9em;

      &.completed {
        background: rgba(76, 175, 80, 0.2);
        color: #4CAF50;
      }

      &.in-progress {
        background: rgba(196, 30, 58, 0.2);
        color: #c41e3a;
      }
    }
  }

  .description {
    color: #D1D5DB;
    margin-bottom: 20px;
  }

  .progress-bar {
    height: 8px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
    overflow: hidden;
    margin-bottom: 10px;

    .progress {
      height: 100%;
      background: #c41e3a;
      transition: width 0.3s ease;
    }
  }

  .progress-text {
    color: #9CA3AF;
    text-align: right;
    font-size: 0.9em;
    margin-bottom: 20px;
  }

  .no-challenge {
    text-align: center;
    color: #9CA3AF;
    padding: 20px;
  }

  .btn {
    &.primary {
      background: #c41e3a;
      color: white;
      padding: 8px 20px;
      border-radius: 6px;
      border: none;
      cursor: pointer;

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
