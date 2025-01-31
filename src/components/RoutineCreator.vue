<template>
    <div class="routine-creator">
      <h2>Create Practice Routine</h2>

      <form @submit.prevent="handleSubmit" class="routine-form">
        <div class="form-group">
          <label>Routine Name</label>
          <input
            v-model="routineData.name"
            type="text"
            required
            placeholder="e.g., Morning Practice"
          >
        </div>

        <div class="form-group">
          <label>Description</label>
          <textarea
            v-model="routineData.description"
            placeholder="Describe your routine..."
            rows="3"
          ></textarea>
        </div>

        <div class="tools-selector">
          <h3>Select Tools</h3>
          <div class="selected-tools">
            <div
              v-for="(tool, index) in routineData.tools"
              :key="index"
              class="selected-tool"
            >
              <div class="tool-info">
                <span>{{ tool.name }}</span>
                <input
                  type="number"
                  v-model="tool.duration"
                  min="1"
                  :max="60"
                  class="duration-input"
                >
                <span class="minutes">min</span>
              </div>
              <button
                type="button"
                class="remove-btn"
                @click="removeTool(index)"
              >
                ×
              </button>
            </div>
          </div>

          <div class="tool-picker">
            <select v-model="selectedTool">
              <option value="">Add a tool...</option>
              <option
                v-for="tool in availableTools"
                :key="tool"
                :value="tool"
              >
                {{ tool }}
              </option>
            </select>
            <button
              type="button"
              class="add-btn"
              @click="addTool"
              :disabled="!selectedTool"
            >
              Add Tool
            </button>
          </div>
        </div>

        <div class="routine-summary">
          <p>Total Duration: {{ totalDuration }} minutes</p>
        </div>

        <div class="form-actions">
          <button type="button" class="btn secondary" @click="$emit('cancel')">
            Cancel
          </button>
          <button
            type="submit"
            class="btn primary"
            :disabled="!routineData.tools.length"
          >
            Create Routine
          </button>
        </div>
      </form>
    </div>
  </template>

<script setup>
import { ref, computed, defineEmits } from 'vue'
import { useRoutineStore } from '../stores/routines'

const emit = defineEmits(['cancel', 'created'])
const routineStore = useRoutineStore()

const routineData = ref({
  name: '',
  description: '',
  tools: []
})

const selectedTool = ref('')

const availableTools = [
  'Note Learning Tool',
  'Guitar Notes',
  'Metronome',
  'Ear Training',
  'Piano Notes'
]

const totalDuration = computed(() => {
  return routineData.value.tools.reduce((sum, tool) => sum + tool.duration, 0)
})

const addTool = () => {
  if (!selectedTool.value) return

  routineData.value.tools.push({
    name: selectedTool.value,
    duration: routineStore.toolDurations[selectedTool.value] || 10
  })
  selectedTool.value = ''
}

const removeTool = (index) => {
  routineData.value.tools.splice(index, 1)
}

const handleSubmit = async () => {
  try {
    await routineStore.addRoutine(routineData.value)
    emit('created')
  } catch (err) {
    console.error('Error creating routine:', err)
  }
}
</script>

<style lang="scss" scoped>
  .routine-creator {
    background: #18181B;
    padding: 30px;
    border-radius: 10px;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .routine-form {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .form-group {
    label {
      display: block;
      margin-bottom: 8px;
      color: #fff;
    }

    input, textarea, select {
      width: 100%;
      padding: 8px;
      background: #27272A;
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 4px;
      color: #fff;
    }
  }

  .tools-selector {
    h3 {
      margin-bottom: 15px;
      color: #fff;
    }
  }

  .selected-tools {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-bottom: 15px;
  }

  .selected-tool {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: rgba(255, 255, 255, 0.05);
    padding: 10px;
    border-radius: 6px;

    .tool-info {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .duration-input {
      width: 60px;
      text-align: center;
    }

    .minutes {
      color: #9CA3AF;
    }

    .remove-btn {
      background: none;
      border: none;
      color: #c41e3a;
      cursor: pointer;
      font-size: 20px;
    }
  }

  .tool-picker {
    display: flex;
    gap: 10px;

    select {
      flex: 1;
    }
  }

  .routine-summary {
    text-align: right;
    color: #9CA3AF;
  }

  .form-actions {
    display: flex;
    justify-content: flex-end;
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

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    }

    &.secondary {
      background: #4B5563;
      color: white;
    }
  }
  .tool-picker {
  display: flex;
  gap: 10px;

  select {
    flex: 1;
    padding: 8px;
    background: #27272A;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 4px;
    color: #fff;
    cursor: pointer;

    &:focus {
      outline: none;
      border-color: #c41e3a;
    }

    option {
      background: #27272A;
      color: #fff;
    }
  }

  .add-btn {
    padding: 8px 20px;
    border-radius: 6px;
    background: #c41e3a;
    color: white;
    border: none;
    cursor: pointer;
    transition: background-color 0.3s ease;

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
