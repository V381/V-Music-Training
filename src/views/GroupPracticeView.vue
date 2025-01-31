<template>
    <div class="group-practice-view">
      <header class="practice-header">
        <div class="container">
          <div class="header-content">
            <div class="session-info">
              <h1>{{ group?.name }}</h1>
              <div class="session-stats">
                <span class="time">Duration: {{ formatDuration(sessionDuration) }}</span>
                <span class="members">{{ activeMembers.length }} members active</span>
              </div>
            </div>
            <button @click="endSession" class="btn danger">End Session</button>
          </div>
        </div>
      </header>

      <main class="practice-content">
        <div class="container">
          <div class="practice-grid">
            <!-- Active Members Section -->
            <div class="practice-section members-section">
              <h2>Active Members</h2>
              <div class="members-list">
                <div v-for="member in activeMembers"
                     :key="member.id"
                     class="member-card"
                >
                  <img :src="member.photoURL || '/default-avatar.png'"
                       :alt="member.displayName"
                       class="member-avatar"
                  >
                  <div class="member-info">
                    <span class="member-name">{{ member.displayName }}</span>
                    <span class="member-status">
                      {{ member.currentTool || 'Observing' }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Practice Tools Section -->
            <div class="practice-section tools-section">
              <h2>Practice Tools</h2>
              <div class="tools-grid">
                <div v-for="tool in practiceTools"
                     :key="tool.name"
                     :class="['tool-card', { active: currentTool === tool.name }]"
                     @click="selectTool(tool)"
                >
                  <i :class="tool.icon"></i>
                  <h3>{{ tool.name }}</h3>
                  <p>{{ tool.description }}</p>
                </div>
              </div>
            </div>

            <!-- Group Progress Section -->
            <div class="practice-section progress-section">
              <h2>Session Progress</h2>
              <div class="progress-stats">
                <div class="stat-card">
                  <span class="stat-label">Total Practice Time</span>
                  <span class="stat-value">{{ formatDuration(sessionDuration) }}</span>
                </div>
                <div class="stat-card">
                  <span class="stat-label">Tools Used</span>
                  <span class="stat-value">{{ usedTools.length }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  </template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useGroupStore } from '../stores/groups'
import { useNotificationStore } from '../stores/notification'
import { toolUrls } from '../config/toolUrls'

const route = useRoute()
const router = useRouter()
const groupStore = useGroupStore()
const notificationStore = useNotificationStore()

const group = ref(null)
const activeMembers = ref([])
const sessionDuration = ref(0)
const currentTool = ref(null)
const usedTools = ref([])
const sessionTimer = ref(null)

const practiceTools = [
  {
    name: 'Note Learning Tool',
    icon: 'fas fa-music',
    description: 'Practice note reading together'
  },
  {
    name: 'Guitar Notes',
    icon: 'fas fa-guitar',
    description: 'Learn fretboard positions'
  },
  {
    name: 'Metronome',
    icon: 'fas fa-clock',
    description: 'Practice timing as a group'
  },
  {
    name: 'Ear Training',
    icon: 'fas fa-headphones',
    description: 'Develop your musical ear'
  }
]

const formatDuration = (minutes) => {
  if (minutes < 60) return `${minutes} minutes`
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  return `${hours}h ${remainingMinutes}m`
}

const selectTool = async (tool) => {
  try {
    currentTool.value = tool.name
    if (!usedTools.value.includes(tool.name)) {
      usedTools.value.push(tool.name)
    }

    await groupStore.updateMemberTool(route.params.sessionId, tool.name)

    if (toolUrls[tool.name]) {
      window.open(toolUrls[tool.name], '_blank')
    }
  } catch (err) {
    notificationStore.addNotification('Failed to select tool', 'error')
    console.error('Error selecting tool:', err)
  }
}

const endSession = async () => {
  if (confirm('Are you sure you want to end this practice session?')) {
    try {
      await groupStore.endGroupSession(route.params.sessionId, {
        duration: sessionDuration.value,
        tools: usedTools.value
      })
      router.push('/groups')
      notificationStore.addNotification('Practice session ended successfully', 'success')
    } catch (err) {
      notificationStore.addNotification('Failed to end session', 'error')
      console.error('Error ending session:', err)
    }
  }
}

const startSessionTimer = () => {
  sessionTimer.value = setInterval(() => {
    sessionDuration.value++
  }, 60000) // Update every minute
}

onMounted(async () => {
  try {
    // Fetch group details
    const groupData = await groupStore.getGroupById(route.params.groupId)
    group.value = groupData

    // Start session timer
    startSessionTimer()

    // Set up real-time updates for active members
    const unsubscribe = await groupStore.subscribeToSessionMembers(
      route.params.sessionId,
      (members) => {
        activeMembers.value = members
      }
    )

    // Cleanup function
    onUnmounted(() => {
      if (sessionTimer.value) clearInterval(sessionTimer.value)
      unsubscribe()
    })
  } catch (err) {
    console.error('Error initializing practice session:', err)
    notificationStore.addNotification('Failed to load practice session', 'error')
    router.push('/groups')
  }
})
</script>

  <style lang="scss" scoped>
  .group-practice-view {
    min-height: 100vh;
    background: #191919;
  }

  .practice-header {
    background: #18181B;
    padding: 20px 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);

    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 20px;
    }

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    h1 {
      color: #fff;
      margin: 0 0 10px 0;
      font-size: 24px;
    }

    .session-stats {
      display: flex;
      gap: 20px;
      color: #9CA3AF;
      font-size: 14px;
    }
  }

  .practice-content {
    padding: 40px 0;

    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 20px;
    }
  }

  .practice-grid {
    display: grid;
    grid-template-columns: 300px 1fr;
    gap: 20px;
  }

  .practice-section {
    background: #18181B;
    border-radius: 10px;
    padding: 20px;
    border: 1px solid rgba(255, 255, 255, 0.1);

    h2 {
      color: #fff;
      font-size: 20px;
      margin-bottom: 20px;
    }
  }

  .members-section {
    grid-row: span 2;

    .members-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .member-card {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 6px;

      .member-avatar {
        width: 40px;
        height: 40px;
        border-radius: 50%;
      }

      .member-info {
        flex: 1;

        .member-name {
          display: block;
          color: #fff;
          font-size: 14px;
        }

        .member-status {
          color: #9CA3AF;
          font-size: 12px;
        }
      }
    }
  }

  .tools-section {
    .tools-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 15px;
    }

    .tool-card {
      background: rgba(255, 255, 255, 0.05);
      padding: 20px;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s ease;
      text-align: center;

      &:hover {
        background: rgba(196, 30, 58, 0.1);
      }

      &.active {
        background: rgba(196, 30, 58, 0.2);
        border: 1px solid #c41e3a;
      }

      i {
        font-size: 24px;
        color: #c41e3a;
        margin-bottom: 10px;
      }

      h3 {
        color: #fff;
        font-size: 16px;
        margin-bottom: 8px;
      }

      p {
        color: #9CA3AF;
        font-size: 14px;
      }
    }
  }

  .progress-section {
    .progress-stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 15px;
    }

    .stat-card {
      background: rgba(255, 255, 255, 0.05);
      padding: 15px;
      border-radius: 8px;
      text-align: center;

      .stat-label {
        display: block;
        color: #9CA3AF;
        font-size: 12px;
        margin-bottom: 5px;
      }

      .stat-value {
        color: #fff;
        font-size: 24px;
        font-weight: 500;
      }
    }
  }

  .btn {
    padding: 10px 20px;
    border-radius: 6px;
    font-size: 14px;
    cursor: pointer;
    border: none;
    transition: all 0.3s ease;

    &.danger {
      background: #DC2626;
      color: white;

      &:hover {
        background: darken(#DC2626, 10%);
      }
    }
  }

  @media (max-width: 768px) {
    .practice-grid {
      grid-template-columns: 1fr;
    }

    .members-section {
      grid-row: auto;
    }

    .tools-section {
      .tools-grid {
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      }
    }
  }
  </style>
