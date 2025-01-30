<template>
    <div class="leaderboard-section">
      <h2>Leaderboards</h2>

      <!-- Region Selector -->
      <RegionSelector />

      <div class="leaderboard-tabs">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          :class="['tab-btn', { active: currentTab === tab.id }]"
          @click="currentTab = tab.id"
        >
          {{ tab.name }}
        </button>
      </div>

      <!-- Scope Selector -->
      <div class="scope-selector">
        <button
          v-for="scope in scopes"
          :key="scope.id"
          :class="['scope-btn', { active: currentScope === scope.id }]"
          @click="currentScope = scope.id"
        >
          {{ scope.name }}
        </button>
      </div>

      <!-- User Rank Display -->
      <div class="user-rank" v-if="getUserRank">
        Your {{ currentScope === 'global' ? 'Global' : 'Regional' }} Rank:
        #{{ getUserRank }}
        <span class="rank-percentage" v-if="getRelativeRank">
          ({{ getRelativeRank }})
        </span>
      </div>

      <div v-if="leaderboardStore.isLoading" class="loading">
        <LoadingSpinner text="Loading leaderboards..." />
      </div>

      <div v-else-if="!currentLeaderboard.length" class="no-data">
        No practice data available for this period
      </div>

      <div v-else class="leaderboard-content">
        <!-- Stats Summary -->
        <div class="stats-summary" v-if="leaderboardStore.userStats">
          <div class="stat-item">
            <span class="stat-label">Total Practice Time</span>
            <span class="stat-value">{{ formatTime(leaderboardStore.userStats.totalTime) }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Average Session</span>
            <span class="stat-value">{{ formatTime(leaderboardStore.userStats.averageSession) }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Total Sessions</span>
            <span class="stat-value">{{ leaderboardStore.userStats.totalSessions }}</span>
          </div>
        </div>

        <!-- Leaderboard List -->
        <div class="leaderboard-list">
          <div
            v-for="(entry, index) in currentLeaderboard"
            :key="entry.userId"
            :class="['leaderboard-item', { 'current-user': entry.userId === currentUser?.uid }]"
          >
            <div class="rank">
              {{ index + 1 }}
              <span class="medal" v-if="index < 3">{{ medals[index] }}</span>
            </div>
            <div class="user-info">
              <div class="user-details">
                <span class="username">
                  {{ entry.userName }}
                  <span v-if="entry.userId === currentUser?.uid">(You)</span>
                </span>
                <span class="region-tag" v-if="entry.region">
                  {{ regions.find(r => r.code === entry.region)?.name || entry.region }}
                </span>
                <span class="user-stats">
                  {{ entry.sessions }} sessions
                </span>
              </div>
              <div class="practice-stats">
                <span class="practice-time">{{ formatTime(entry.totalTime) }}</span>
                <span class="average-time">avg: {{ formatTime(entry.averageTime) }}/session</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useLeaderboardStore } from '../stores/leaderboard'
import { auth } from '../config/firebase'
import LoadingSpinner from './LoadingSpinner.vue'
import RegionSelector from './RegionSelector.vue'

const leaderboardStore = useLeaderboardStore()
const currentTab = ref('weekly')
const currentScope = ref('global')
const currentUser = computed(() => auth.currentUser)

const tabs = [
  { id: 'weekly', name: 'This Week' },
  { id: 'monthly', name: 'This Month' },
  { id: 'allTime', name: 'All Time' }
]

const scopes = [
  { id: 'global', name: 'Global' },
  { id: 'regional', name: 'Regional' }
]

const regions = [
  { code: 'NA', name: 'North America' },
  { code: 'EU', name: 'Europe' },
  { code: 'AS', name: 'Asia' },
  { code: 'SA', name: 'South America' },
  { code: 'AF', name: 'Africa' },
  { code: 'OC', name: 'Oceania' }
]

const medals = ['🥇', '🥈', '🥉']

const currentLeaderboard = computed(() => {
  if (currentScope.value === 'global') {
    return leaderboardStore.leaderboards[currentTab.value] || []
  }
  return leaderboardStore.userRegion
    ? leaderboardStore.regionalLeaderboards[currentTab.value][leaderboardStore.userRegion] || []
    : []
})

const getUserRank = computed(() => {
  return leaderboardStore.getUserPosition(currentTab.value, currentScope.value === 'regional')
})

const getRelativeRank = computed(() => {
  return leaderboardStore.getRelativeRank(currentTab.value, currentScope.value === 'regional')
})

const formatTime = (minutes) => {
  if (!minutes) return '0 minutes'
  if (minutes < 60) return `${minutes} minutes`
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  if (remainingMinutes === 0) return `${hours} hour${hours > 1 ? 's' : ''}`
  return `${hours} hour${hours > 1 ? 's' : ''} ${remainingMinutes} min`
}

watch(() => auth.currentUser, (user) => {
  if (user) {
    leaderboardStore.fetchUserRegion().then(() => {
      leaderboardStore.fetchLeaderboards()
    })
  }
})

watch([() => currentTab.value, () => currentScope.value], () => {
  if (auth.currentUser) {
    leaderboardStore.fetchLeaderboards()
  }
})

onMounted(async () => {
  if (auth.currentUser) {
    await leaderboardStore.fetchUserRegion()
    await leaderboardStore.fetchLeaderboards()
  }
})
</script>

  <style lang="scss" scoped>
  .leaderboard-section {
    background: #18181B;
    padding: 30px;
    border-radius: 10px;
    border: 1px solid rgba(255, 255, 255, 0.1);

    h2 {
      color: #fff;
      margin-bottom: 20px;
      font-size: 1.8em;
    }
  }

  .leaderboard-tabs {
    display: flex;
    gap: 10px;
    margin-bottom: 20px;

    .tab-btn {
      padding: 8px 16px;
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 6px;
      background: transparent;
      color: #fff;
      cursor: pointer;
      transition: all 0.3s ease;

      &.active {
        background: #c41e3a;
        border-color: #c41e3a;
      }

      &:hover {
        background: rgba(196, 30, 58, 0.2);
      }
    }
  }

  .scope-selector {
    display: flex;
    gap: 10px;
    margin: 20px 0;

    .scope-btn {
      padding: 8px 16px;
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 6px;
      background: transparent;
      color: #fff;
      cursor: pointer;
      transition: all 0.3s ease;

      &.active {
        background: #c41e3a;
        border-color: #c41e3a;
      }

      &:hover {
        background: rgba(196, 30, 58, 0.2);
      }
    }
  }

  .user-rank {
    background: rgba(196, 30, 58, 0.1);
    padding: 15px;
    border-radius: 8px;
    margin: 20px 0;
    text-align: center;
    font-weight: bold;
    color: #fff;

    .rank-percentage {
      color: #9CA3AF;
      margin-left: 5px;
    }
  }

  .stats-summary {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 20px;
    margin-bottom: 30px;
    padding: 20px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 8px;

    .stat-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;

      .stat-label {
        color: #9CA3AF;
        margin-bottom: 5px;
      }

      .stat-value {
        color: #fff;
        font-size: 1.2em;
        font-weight: bold;
      }
    }
  }

  .leaderboard-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .leaderboard-item {
    display: flex;
    align-items: center;
    padding: 15px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 8px;
    transition: transform 0.3s ease;

    &:hover {
      transform: translateX(5px);
    }

    &.current-user {
      background: rgba(196, 30, 58, 0.2);
      border-left: 4px solid #c41e3a;
    }

    .rank {
      width: 40px;
      font-size: 1.2em;
      font-weight: bold;
      color: #fff;
      display: flex;
      align-items: center;
      gap: 5px;

      .medal {
        font-size: 1.2em;
      }
    }

    .user-info {
      flex: 1;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 20px;

      .user-details {
        display: flex;
        flex-direction: column;

        .username {
          color: #fff;
          font-weight: bold;

          span {
            color: #c41e3a;
            font-size: 0.9em;
            margin-left: 5px;
          }
        }

        .region-tag {
          color: #9CA3AF;
          font-size: 0.8em;
          background: rgba(255, 255, 255, 0.1);
          padding: 2px 6px;
          border-radius: 4px;
          display: inline-block;
          margin-top: 4px;
        }

        .user-stats {
          color: #9CA3AF;
          font-size: 0.9em;
        }
      }

      .practice-stats {
        display: flex;
        flex-direction: column;
        align-items: flex-end;

        .practice-time {
          color: #fff;
          font-weight: 500;
        }

        .average-time {
          color: #9CA3AF;
          font-size: 0.9em;
        }
      }
    }
  }

  .loading {
    display: flex;
    justify-content: center;
    padding: 40px;
  }

  .no-data {
    text-align: center;
    color: #9CA3AF;
    padding: 40px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 8px;
  }

  @media (max-width: 768px) {
    .leaderboard-section {
      padding: 20px;
    }

    .leaderboard-item {
      .user-info {
        flex-direction: column;
        align-items: flex-start;
        gap: 10px;

        .practice-stats {
          align-items: flex-start;
        }
      }
    }

    .stats-summary {
      grid-template-columns: 1fr;
    }

    .leaderboard-tabs,
    .scope-selector {
      flex-wrap: wrap;
    }
  }
  </style>
