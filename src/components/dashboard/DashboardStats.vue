<template>
    <div class="stats-grid">
      <div class="stat-card">
        <h3>Total Practice Time</h3>
        <p class="stat-value">{{ totalPracticeTime }} minutes</p>
      </div>
      <div class="stat-card">
        <h3>Practice Sessions</h3>
        <p class="stat-value">{{ practiceStore.practiceHistory.length }}</p>
      </div>
      <div class="stat-card">
        <h3>Most Used Tool</h3>
        <p class="stat-value">{{ mostUsedTool }}</p>
      </div>
    </div>
  </template>

<script setup>
import { computed } from 'vue'
import { usePracticeStore } from '../../stores/practice'

const practiceStore = usePracticeStore()

const totalPracticeTime = computed(() => {
  return practiceStore.practiceHistory.reduce((total, session) => total + session.duration, 0)
})

const mostUsedTool = computed(() => {
  const toolCount = {}
  practiceStore.practiceHistory.forEach(session => {
    toolCount[session.toolName] = (toolCount[session.toolName] || 0) + 1
  })
  return Object.entries(toolCount).sort((a, b) => b[1] - a[1])[0]?.[0] || 'None'
})
</script>

  <style lang="scss" scoped>
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 20px;
    margin-bottom: 40px;
  }

  .stat-card {
    background: #18181B;
    padding: 20px;
    border-radius: 10px;
    text-align: center;
    border: 1px solid rgba(255, 255, 255, 0.1);

    h3 {
      color: #9CA3AF;
      margin-bottom: 10px;
    }

    .stat-value {
      font-size: 1.8em;
      color: #c41e3a;
      font-weight: bold;
    }
  }
  </style>
