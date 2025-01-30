<template>
  <div class="goal-setting">
    <h2>Practice Goals</h2>

    <!-- Add New Goal Form -->
    <div class="goal-form" v-if="showForm">
      <h3>Set New Goal</h3>
      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <label>Tool</label>
          <select v-model="newGoal.toolName" required>
            <option value="Note Learning Tool">Note Learning</option>
            <option value="Guitar Notes">Guitar Notes</option>
            <option value="Metronome">Metronome</option>
            <option value="Ear Training">Ear Training</option>
            <option value="Piano Notes">Piano Notes</option>
          </select>
        </div>

        <div class="form-group">
          <label>Target Minutes</label>
          <input
            type="number"
            v-model="newGoal.targetMinutes"
            required
            min="1"
          >
        </div>

        <div class="form-group">
          <label>Frequency</label>
          <select v-model="newGoal.frequency" required>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
          </select>
        </div>

        <div class="form-buttons">
          <button type="submit" class="btn primary">Set Goal</button>
          <button type="button" class="btn secondary" @click="showForm = false">
            Cancel
          </button>
        </div>
      </form>
    </div>

    <button
      v-else
      @click="showForm = true"
      class="btn primary add-goal-btn"
    >
      Add New Goal
    </button>

    <!-- Goals List -->
    <div class="goals-list">
      <div v-for="goal in goalStore.goals" :key="goal.id" class="goal-card">
        <div class="goal-header">
          <h3>{{ goal.toolName }}</h3>
          <button class="delete-btn" @click="deleteGoal(goal.id)">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <p>Target: {{ goal.targetMinutes }} minutes {{ goal.frequency }}</p>
        <div class="progress-bar">
          <div
            class="progress"
            :style="{ width: `${calculateProgress(goal)}%` }"
            :class="{ 'exceeded': goal.progress > goal.targetMinutes }"
          ></div>
        </div>
        <div class="progress-text">
          {{ goal.progress || 0 }} / {{ goal.targetMinutes }} minutes
          <span v-if="goal.progress > goal.targetMinutes" class="exceeded-text">
            (Exceeded by {{ goal.progress - goal.targetMinutes }} minutes!)
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useGoalStore } from '../stores/goals'
import { useGoalReset } from '../composables/useGoalReset'
import { auth } from '../config/firebase'

const goalStore = useGoalStore()
const { checkAndResetGoals } = useGoalReset()
const showForm = ref(false)
const newGoal = ref({
  toolName: '',
  targetMinutes: 30,
  frequency: 'daily'
})

const calculateProgress = (goal) => {
  if (!goal || typeof goal.progress === 'undefined' || !goal.targetMinutes) {
    return 0
  }
  const percentage = ((goal.progress || 0) / goal.targetMinutes) * 100
  return Math.min(percentage, 100)
}

const handleSubmit = async () => {
  try {
    await goalStore.addGoal(newGoal.value)
    showForm.value = false
    newGoal.value = {
      toolName: '',
      targetMinutes: 30,
      frequency: 'daily'
    }
    await goalStore.fetchUserGoals()
  } catch (error) {
    console.error('Error setting goal:', error)
  }
}

const deleteGoal = async (goalId) => {
  if (confirm('Are you sure you want to delete this goal?')) {
    try {
      await goalStore.deleteGoal(goalId)
    } catch (error) {
      console.error('Error deleting goal:', error)
    }
  }
}

// Watch for auth state changes
watch(() => auth.currentUser, (user) => {
  if (user) {
    goalStore.fetchUserGoals()
  }
})

onMounted(async () => {
  if (auth.currentUser) {
    await goalStore.fetchUserGoals()
    await checkAndResetGoals()
  }
})

watch(() => goalStore.goals, (newGoals) => {
  console.log('Goals updated:', newGoals)
}, { deep: true })
</script>

<style lang="scss" scoped>
.goal-setting {
  background: #18181B;
  padding: 30px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  margin-top: 40px;

  h2 {
    margin-bottom: 20px;
    color: #fff;
  }
}

.goal-form {
  background: rgba(255, 255, 255, 0.05);
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;

  h3 {
    margin-bottom: 15px;
    color: #fff;
  }

  .form-group {
    margin-bottom: 15px;

    label {
      display: block;
      margin-bottom: 5px;
      color: #9CA3AF;
    }

    input, select {
      width: 100%;
      padding: 8px;
      border-radius: 4px;
      background: #27272A;
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: #fff;
    }
  }
}

.form-buttons {
  display: flex;
  gap: 10px;
}

.btn {
  padding: 8px 20px;
  border-radius: 6px;
  cursor: pointer;
  border: none;

  &.primary {
    background: #c41e3a;
    color: white;

    &:hover {
      background: darken(#c41e3a, 10%);
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

.add-goal-btn {
  margin-bottom: 20px;
}

.goals-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.goal-card {
  background: rgba(255, 255, 255, 0.05);
  padding: 20px;
  border-radius: 8px;

  .goal-header {
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
      color: #9CA3AF;
      cursor: pointer;
      padding: 5px;

      &:hover {
        color: #c41e3a;
      }
    }
  }
}

.progress-bar {
  height: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  overflow: hidden;
  margin: 10px 0;

  .progress {
    height: 100%;
    background: #c41e3a;
    transition: width 0.3s ease-out;
    transform-origin: left;

    &.exceeded {
      background: #4CAF50;
    }
  }
}
.progress-text {
  color: #9CA3AF;
  font-size: 0.9em;
  text-align: right;

  .exceeded-text {
    color: #4CAF50;
    margin-left: 8px;
  }
}

@media (max-width: 768px) {
  .goal-setting {
    padding: 20px;
  }

  .goals-list {
    grid-template-columns: 1fr;
  }
}
</style>
