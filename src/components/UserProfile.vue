<template>
  <div class="user-profile">
    <div v-if="isLoading" class="loading-state">
      <LoadingSpinner text="Loading profile..." />
    </div>

    <div v-else-if="user" class="profile-content">
      <div class="profile-header">
        <img
          :src="user.photoURL || '/default-avatar.png'"
          :alt="user.displayName"
          class="profile-avatar"
        >
        <div class="profile-info">
          <h1>{{ user.displayName }}</h1>
          <p class="member-since">Member since {{ formatDate(user.createdAt) }}</p>
          <div class="profile-stats">
            <div class="stat">
              <span class="stat-value">{{ totalPracticeTime }}</span>
              <span class="stat-label">Practice Time</span>
            </div>
            <div class="stat">
              <span class="stat-value">{{ user.followers || 0 }}</span>
              <span class="stat-label">Followers</span>
            </div>
            <div class="stat">
              <span class="stat-value">{{ user.following || 0 }}</span>
              <span class="stat-label">Following</span>
            </div>
          </div>
        </div>
      </div>

      <div class="profile-content-tabs">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          :class="['tab-btn', { active: currentTab === tab.id }]"
          @click="currentTab = tab.id"
        >
          {{ tab.name }}
        </button>
      </div>

      <div class="tab-content">
        <!-- Recent Activity Tab -->
        <div v-if="currentTab === 'activity'" class="activity-list">
          <div v-for="activity in userActivity" :key="activity.id" class="activity-item">
            <div class="activity-header">
              <span class="activity-type">{{ activity.toolName }}</span>
              <span class="activity-date">{{ formatDate(activity.date) }}</span>
            </div>
            <p class="activity-duration">{{ activity.duration }} minutes</p>
            <p v-if="activity.notes" class="activity-notes">{{ activity.notes }}</p>
          </div>
        </div>

        <!-- Achievements Tab -->
        <div v-if="currentTab === 'achievements'" class="achievements-list">
          <div v-for="achievement in userAchievements" :key="achievement.id" class="achievement-item">
            <i :class="achievement.icon"></i>
            <div class="achievement-info">
              <h3>{{ achievement.title }}</h3>
              <p>{{ achievement.description }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="error-state">
      <p>User not found</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { doc, getDoc, collection, query, where, orderBy, getDocs, limit } from 'firebase/firestore'
import { db } from '../config/firebase'
import LoadingSpinner from './LoadingSpinner.vue'

const route = useRoute()
const user = ref(null)
const isLoading = ref(true)
const currentTab = ref('activity')
const userActivity = ref([])
const userAchievements = ref([])

const tabs = [
  { id: 'activity', name: 'Recent Activity' },
  { id: 'achievements', name: 'Achievements' }
]

const fetchUserProfile = async () => {
  try {
    const userDoc = await getDoc(doc(db, 'users', route.params.id))
    if (userDoc.exists()) {
      user.value = { id: userDoc.id, ...userDoc.data() }
    }
  } catch (err) {
    console.error('Error fetching user profile:', err)
  }
}

const fetchUserActivity = async () => {
  try {
    const q = query(
      collection(db, 'practice_sessions'),
      where('userId', '==', route.params.id),
      orderBy('date', 'desc'),
      limit(10)
    )
    const snapshot = await getDocs(q)
    userActivity.value = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
  } catch (err) {
    console.error('Error fetching user activity:', err)
  }
}

const fetchUserAchievements = async () => {
  try {
    const q = query(
      collection(db, 'user_achievements'),
      where('userId', '==', route.params.id)
    )
    const snapshot = await getDocs(q)
    userAchievements.value = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
  } catch (err) {
    console.error('Error fetching user achievements:', err)
  }
}

const formatDate = (timestamp) => {
  if (!timestamp) return ''
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
  return date.toLocaleDateString()
}

const totalPracticeTime = computed(() => {
  const total = userActivity.value.reduce((sum, activity) => sum + activity.duration, 0)
  return `${Math.floor(total / 60)}h ${total % 60}m`
})

onMounted(async () => {
  isLoading.value = true
  try {
    await Promise.all([
      fetchUserProfile(),
      fetchUserActivity(),
      fetchUserAchievements()
    ])
  } finally {
    isLoading.value = false
  }
})
</script>

<style lang="scss" scoped>
.user-profile {
  padding: 30px;
  max-width: 1200px;
  margin: 0 auto;
}

.profile-header {
  display: flex;
  gap: 30px;
  margin-bottom: 40px;
  background: #18181B;
  padding: 30px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.profile-avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
}

.profile-info {
  flex: 1;

  h1 {
    color: white;
    margin: 0 0 10px 0;
    font-size: 24px;
  }

  .member-since {
    color: #9CA3AF;
    margin-bottom: 20px;
  }
}

.profile-stats {
  display: flex;
  gap: 30px;

  .stat {
    display: flex;
    flex-direction: column;
    align-items: center;

    .stat-value {
      color: white;
      font-size: 24px;
      font-weight: 500;
    }

    .stat-label {
      color: #9CA3AF;
      font-size: 14px;
    }
  }
}

.profile-content-tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;

  .tab-btn {
    padding: 8px 16px;
    background: transparent;
    border: none;
    color: #9CA3AF;
    cursor: pointer;
    border-radius: 6px;

    &.active {
      background: #c41e3a;
      color: white;
    }
  }
}

.activity-item {
  background: #18181B;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 15px;
  border: 1px solid rgba(255, 255, 255, 0.1);

  .activity-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 10px;

    .activity-type {
      color: #c41e3a;
      font-weight: 500;
    }

    .activity-date {
      color: #9CA3AF;
    }
  }

  .activity-duration {
    color: white;
    margin-bottom: 5px;
  }

  .activity-notes {
    color: #9CA3AF;
    font-size: 14px;
  }
}

.achievement-item {
  display: flex;
  align-items: center;
  gap: 15px;
  background: #18181B;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 15px;
  border: 1px solid rgba(255, 255, 255, 0.1);

  i {
    font-size: 24px;
    color: #c41e3a;
  }

  .achievement-info {
    h3 {
      color: white;
      margin: 0 0 5px 0;
    }

    p {
      color: #9CA3AF;
      margin: 0;
      font-size: 14px;
    }
  }
}
</style>
