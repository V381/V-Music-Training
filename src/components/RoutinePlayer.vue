<template>
    <div class="routine-player">
      <div class="current-tool" v-if="isPlaying">
        <h3>Current Tool: {{ currentTool.name }}</h3>
        <div class="timer">{{ formatTime(remainingTime) }}</div>
        <div class="progress-bar">
          <div
            class="progress"
            :style="{ width: `${(currentTool.duration * 60 - remainingTime) / (currentTool.duration * 60) * 100}%` }"
          ></div>
        </div>
        <p class="next-tool" v-if="nextTool">
          Next: {{ nextTool.name }} ({{ nextTool.duration }} min)
        </p>
        <button class="btn secondary" @click="pauseRoutine" v-if="!isPaused">
          Pause
        </button>
        <button class="btn primary" @click="resumeRoutine" v-else>
          Resume
        </button>
        <button class="btn danger" @click="stopRoutine">
          Stop Routine
        </button>
      </div>

      <div class="routine-preview" v-else>
        <h3>{{ routine.name }}</h3>
        <p class="description">{{ routine.description }}</p>
        <div class="tools-list">
          <div
            v-for="(tool, index) in routine.tools"
            :key="index"
            class="tool-item"
          >
            <span class="tool-name">{{ tool.name }}</span>
            <span class="tool-duration">{{ tool.duration }} min</span>
          </div>
        </div>
        <p class="total-time">
          Total Time: {{ routine.totalDuration }} minutes
        </p>
        <button class="btn primary" @click="startRoutine">
          Start Routine
        </button>
      </div>
    </div>
  </template>

<script setup>
import { ref, computed, onBeforeUnmount, defineEmits, defineProps } from 'vue'
import { useRoutineStore } from '../stores/routines'
import { usePracticeTracking } from '../composables/userPracticeTracking'
import { toolUrls } from '../config/toolUrls'

const props = defineProps({
  routine: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['complete'])
const routineStore = useRoutineStore()
const { startPractice, endPractice } = usePracticeTracking()

const isPlaying = ref(false)
const isPaused = ref(false)
const currentToolIndex = ref(0)
const remainingTime = ref(0)
const timer = ref(null)

const currentTool = computed(() => {
  return props.routine.tools[currentToolIndex.value]
})

const nextTool = computed(() => {
  return props.routine.tools[currentToolIndex.value + 1]
})

const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

const startRoutine = async () => {
  isPlaying.value = true
  currentToolIndex.value = 0
  await startTool()
}

const startTool = async () => {
  if (!currentTool.value) return stopRoutine()

  remainingTime.value = currentTool.value.duration * 60
  await startPractice(currentTool.value.name, {
    notes: `Routine practice: ${props.routine.name}`,
    fromRoutine: true,
    routineName: props.routine.name
  })

  const toolUrl = toolUrls[currentTool.value.name]
  if (toolUrl) {
    window.open(toolUrl, '_blank')
  }

  startTimer()
}

const startTimer = () => {
  timer.value = setInterval(() => {
    if (remainingTime.value > 0) {
      remainingTime.value--
    } else {
      clearInterval(timer.value)
      completeCurrentTool()
    }
  }, 1000)
}

const pauseRoutine = () => {
  isPaused.value = true
  clearInterval(timer.value)
}

const resumeRoutine = () => {
  isPaused.value = false
  startTimer()
}

const completeCurrentTool = async () => {
  await endPractice()
  currentToolIndex.value++

  if (currentToolIndex.value < props.routine.tools.length) {
    await startTool()
  } else {
    await routineStore.updateRoutineProgress(props.routine.id)
    emit('complete')
  }
}

const stopRoutine = async () => {
  clearInterval(timer.value)
  if (isPlaying.value) {
    await endPractice()
  }
  isPlaying.value = false
  isPaused.value = false
  currentToolIndex.value = 0
  emit('complete')
}

onBeforeUnmount(() => {
  clearInterval(timer.value)
})
</script>

  <style lang="scss" scoped>
  .routine-player {
    background: #18181B;
    padding: 30px;
    border-radius: 10px;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .current-tool {
    text-align: center;

    h3 {
      color: #fff;
      margin-bottom: 20px;
    }

    .timer {
      font-size: 48px;
      font-weight: bold;
      color: #c41e3a;
      margin-bottom: 20px;
    }
  }

  .progress-bar {
    width: 100%;
    height: 8px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
    overflow: hidden;
    margin-bottom: 20px;

    .progress {
      height: 100%;
      background: #c41e3a;
      transition: width 1s linear;
    }
  }

  .next-tool {
    color: #9CA3AF;
    margin-bottom: 20px;
  }

  .routine-preview {
    .description {
      color: #9CA3AF;
      margin-bottom: 20px;
    }

    .tools-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
      margin-bottom: 20px;
    }

    .tool-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 6px;

      .tool-name {
        color: #fff;
      }

      .tool-duration {
        color: #c41e3a;
      }
    }

    .total-time {
      text-align: right;
      color: #9CA3AF;
      margin-bottom: 20px;
    }
  }

  .btn {
    padding: 8px 20px;
    border-radius: 6px;
    cursor: pointer;
    border: none;
    margin: 0 5px;

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

    &.danger {
      background: #DC2626;
      color: white;

      &:hover {
        background: darken(#DC2626, 10%);
      }
    }
  }
  </style>
