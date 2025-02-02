<template>
    <div class="page">
      <header class="hero">
        <div id="particles-js" class="particles"></div>
        <div class="container">
          <h1>Discover Musicians</h1>
          <p>Find and connect with other music learners</p>
        </div>
      </header>

      <main class="main-content">
        <div class="container">
          <div class="discover-section">
            <div class="search-filters">
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Search users..."
                class="search-input"
              >
              <select v-model="selectedInstrument" class="filter-select">
                <option value="">All Instruments</option>
                <option v-for="instrument in instruments"
                        :key="instrument"
                        :value="instrument">
                  {{ instrument }}
                </option>
              </select>
            </div>

            <div v-if="isLoading" class="loading-state">
              <LoadingSpinner text="Finding users..." />
            </div>

            <div v-else class="users-grid">
              <div v-for="user in filteredUsers"
                   :key="user.id"
                   class="user-card">
                <img
                  :src="user.photoURL || '/default-avatar.png'"
                  :alt="user.displayName"
                  class="user-avatar"
                >
                <div class="user-info">
                    <h3>{{ user.displayName }}</h3>
                    <!-- TODO: IMPLEMENT THIS -->
                    <!-- <p class="instruments">
                        {{ user.instruments?.length ? user.instruments.join(', ') : 'No instruments listed' }}
                    </p>
                    <p class="practice-time">
                        {{ formatPracticeTime(user.totalPracticeTime) }} total practice
                    </p> -->
                </div>
                <div class="user-actions">
                  <button
                    @click="visitProfile(user.id)"
                    class="profile-btn"
                  >
                    View Profile
                  </button>
                  <button
                    @click="handleFollow(user)"
                    :class="['follow-btn', { following: isFollowing(user.id) }]"
                    >
                    <template v-if="isFollowing(user.id)">Unfollow</template>
                    <template v-else>Follow</template>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  </template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useFollowStore } from '../stores/follows'
import { useNotificationStore } from '../stores/notification'
import LoadingSpinner from '../components/LoadingSpinner.vue'
import { particlesConfig } from '../config/particlesConfig'
import { debounce } from '../utils/debounce'

const router = useRouter()
const followStore = useFollowStore()
const notificationStore = useNotificationStore()

const isLoading = ref(false)
const searchQuery = ref('')
const selectedInstrument = ref('')
const users = ref([])

const instruments = [
  'Piano',
  'Guitar',
  'Bass',
  'Drums',
  'Violin',
  'Vocals',
  'Flute',
  'Saxophone',
  'Trumpet'
]

const filteredUsers = computed(() => {
  let filtered = users.value

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(user =>
      user.displayName?.toLowerCase().includes(query)
    )
  }

  if (selectedInstrument.value) {
    filtered = filtered.filter(user =>
      user.instruments?.includes(selectedInstrument.value)
    )
  }

  filtered = filtered.filter(user => user && user.id)

  return filtered
})

const fetchUsers = async () => {
  isLoading.value = true
  try {
    await followStore.fetchFollowing()
    users.value = await followStore.fetchDiscoverableUsers()
    users.value = users.value.filter(user => user)
  } catch (err) {
    notificationStore.addNotification('Failed to load users', 'error')
  } finally {
    isLoading.value = false
  }
}

const handleFollow = async (user) => {
  try {
    const isCurrentlyFollowing = followStore.following.includes(user.id)

    if (isCurrentlyFollowing) {
      await followStore.unfollowUser(user.id)
      notificationStore.addNotification('Successfully unfollowed user', 'success')
    } else {
      await followStore.followUser(user.id)
      notificationStore.addNotification('Successfully followed user', 'success')
    }

    // Only refresh the following list if the operation was successful
    await followStore.fetchFollowing()
  } catch (err) {
    // If there's an error, refresh the following list to ensure consistent state
    await followStore.fetchFollowing()
    notificationStore.addNotification(
      'Failed to update follow status: ' + (err.message || 'Unknown error'),
      'error'
    )
  }
}

const isFollowing = computed(() => {
  return (userId) => followStore.following.includes(userId)
})

const visitProfile = (userId) => {
  router.push(`/profile/${userId}`)
}

// const formatPracticeTime = (minutes) => {
//   if (!minutes || isNaN(minutes)) return '0 minutes'
//   if (minutes < 60) return `${minutes} minutes`
//   const hours = Math.floor(minutes / 60)
//   const remainingMinutes = minutes % 60
//   return `${hours}h ${remainingMinutes}m`
// }

onMounted(() => {
  fetchUsers()
  if (window.particlesJS) {
    window.particlesJS('particles-js', particlesConfig)
  }
})

watch(searchQuery, debounce(async (newQuery) => {
  isLoading.value = true
  try {
    users.value = await followStore.fetchDiscoverableUsers(newQuery)
  } catch (err) {
    notificationStore.addNotification('Failed to search users', 'error')
  } finally {
    isLoading.value = false
  }
}, 300))
</script>

  <style lang="scss" scoped>
  .discover-section {
    padding: 20px;
  }

  .search-filters {
    display: flex;
    gap: 20px;
    margin-bottom: 30px;

    .search-input, .filter-select {
      padding: 12px;
      border-radius: 8px;
      background: #27272A;
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: white;
      font-size: 16px;

      &:focus {
        outline: none;
        border-color: #c41e3a;
      }
    }

    .search-input {
      flex: 1;
    }

    .filter-select {
      min-width: 200px;
    }
  }

  .users-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 20px;
  }

  .user-card {
    background: #18181B;
    border-radius: 12px;
    padding: 20px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;

    .user-avatar {
      width: 100px;
      height: 100px;
      border-radius: 50%;
      margin-bottom: 15px;
      object-fit: cover;
    }

    .user-info {
      margin-bottom: 20px;

      h3 {
        color: white;
        margin: 0 0 10px 0;
      }

      .instruments {
        color: #9CA3AF;
        margin-bottom: 5px;
      }

      .practice-time {
        color: #c41e3a;
        font-weight: 500;
      }
    }

    .user-actions {
      display: flex;
      gap: 10px;
      width: 100%;

      button {
        flex: 1;
        padding: 8px;
        border-radius: 6px;
        border: none;
        cursor: pointer;
        transition: all 0.3s ease;
      }

      .profile-btn {
        background: #374151;
        color: white;

        &:hover {
          background: darken(#374151, 10%);
        }
      }

      .follow-btn {
        background: #c41e3a;
        color: white;

        &:hover {
          background: darken(#c41e3a, 10%);
        }

        &.following {
          background: #4B5563;

          &:hover {
            background: #DC2626;
          }
        }
      }
    }
  }

  @media (max-width: 768px) {
    .search-filters {
      flex-direction: column;

      .filter-select {
        width: 100%;
      }
    }
  }

.follow-btn {
  padding: 6px 12px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;

  &:not(.following) {
    background: #c41e3a;
    color: white;

    &:hover {
      background: darken(#c41e3a, 10%);
    }
  }

  &.following {
    background: #27272A;
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: #fff;

    &:hover {
      background: #DC2626;
      border-color: transparent;
    }
  }
}

.unfollow-btn {
    background: #4B5563;
    color: white;
    padding: 6px 12px;
    border-radius: 4px;
    border: none;
    cursor: pointer;
    font-size: 12px;
    transition: background 0.3s ease;

    &:hover {
      background: #DC2626;
    }
  }
  </style>
