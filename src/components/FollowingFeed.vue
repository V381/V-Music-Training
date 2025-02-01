<template>
    <div class="following-feed">
      <div class="feed-header">
      <h2>Following Activity</h2>
      <div class="search-section">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search users to follow..."
          class="search-input"
          @input="searchUsers"
        />
        <div v-if="searchResults.length" class="search-results">
          <div
            v-for="user in searchResults"
            :key="user.id"
            class="search-result-item"
          >
            <img :src="user.photoURL || '/default-avatar.png'" :alt="user.displayName">
            <span>{{ user.displayName }}</span>
            <button
              @click="handleFollow(user.id)"
              :disabled="isFollowing(user.id)"
              class="follow-btn"
            >
              {{ isFollowing(user.id) ? 'Following' : 'Follow' }}
            </button>
          </div>
        </div>
      </div>
    </div>

      <div v-if="isLoading" class="loading-state">
        <LoadingSpinner text="Loading feed..." />
      </div>

      <div v-else-if="!followingActivity.length" class="empty-state">
        <p v-if="!following.length">
          You're not following anyone yet.
          <router-link to="/discover">Discover users to follow</router-link>
        </p>
        <p v-else>No recent activity from people you follow</p>
      </div>

      <div v-else class="activity-feed">
        <div
          v-for="activity in filteredActivity"
          :key="activity.id"
          class="activity-card"
        >
          <div class="activity-header">
            <div class="user-info">
              <img
                :src="activity.user.photoURL || '/default-avatar.png'"
                :alt="activity.user.displayName"
                class="user-avatar"
                @click="navigateToProfile(activity.user.id)"
              >
              <button
                @click.stop="handleUnfollow(activity.user.id)"
                class="unfollow-btn"
              >
                Unfollow
              </button>
              <div class="user-details">
                <span
                  class="user-name"
                  @click="navigateToProfile(activity.user.id)"
                >
                  {{ activity.user.displayName }}
                </span>
                <span class="activity-time">
                  {{ formatTimestamp(activity.date) }}
                </span>
              </div>
            </div>
            <div class="activity-type" :class="activity.type">
              {{ getActivityTypeLabel(activity.type) }}
            </div>
          </div>

          <div class="activity-content">
            <!-- Practice Session -->
              <div class="practice-details">
                <i :class="getToolIcon(activity.toolName)" class="tool-icon"></i>
                <div class="practice-info">
                  <span class="tool-name">{{ activity.toolName }}</span>
                  <span class="duration">{{ activity.duration }} minutes</span>
                </div>
                <div class="practice-stats">
                  <span v-if="activity.rating" class="rating">
                    {{ "⭐".repeat(activity.rating) }}
                  </span>
                  <span v-if="activity.accuracy" class="accuracy">
                    {{ activity.accuracy }}% accuracy
                  </span>
                </div>
              </div>
              <p v-if="activity.notes" class="practice-notes">
                {{ activity.notes }}
              </p>

            <!-- Achievement -->
            <template v-if="activity.type === 'achievement'">
              <div class="achievement-details">
                <i class="fas fa-trophy achievement-icon"></i>
                <div class="achievement-info">
                  <span class="achievement-title">{{ activity.title }}</span>
                  <span class="achievement-description">
                    {{ activity.description }}
                  </span>
                </div>
                <span class="points-earned">+{{ activity.points }} points</span>
              </div>
            </template>

            <!-- Challenge -->
            <template v-if="activity.type === 'challenge'">
              <div class="challenge-details">
                <i class="fas fa-flag challenge-icon"></i>
                <div class="challenge-info">
                  <span class="challenge-title">{{ activity.title }}</span>
                  <span class="challenge-result">
                    Completed in {{ activity.completionTime }} minutes
                  </span>
                </div>
              </div>
            </template>
          </div>

          <div class="activity-actions">
            <button
              @click="toggleLike(activity)"
              :class="['like-btn', { liked: isLiked(activity.id) }]"
            >
              <i class="fas" :class="isLiked(activity.id) ? 'fa-heart' : 'fa-heart'"></i>
              {{ activity.likes }}
            </button>
            <!-- TODO: ADD COMMENTS TO FEEDS -->
            <!-- <button @click="showComments(activity)" class="comment-btn">
              <i class="fas fa-comment"></i>
              {{ activity.comments?.length || 0 }}
            </button> -->
          </div>
        </div>
      </div>

      <!-- Comments Modal -->
      <Modal v-if="selectedActivity" @close="closeComments">
        <template #header>Comments</template>
        <template #default>
          <div class="comments-section">
            <div class="comments-list">
              <div
                v-for="comment in selectedActivity.comments"
                :key="comment.id"
                class="comment"
              >
                <img
                  :src="comment.user.photoURL || '/default-avatar.png'"
                  :alt="comment.user.displayName"
                  class="comment-avatar"
                >
                <div class="comment-content">
                  <div class="comment-header">
                    <span class="comment-author">{{ comment.user.displayName }}</span>
                    <span class="comment-time">
                      {{ formatTimestamp(comment.timestamp) }}
                    </span>
                  </div>
                  <p class="comment-text">{{ comment.text }}</p>
                </div>
              </div>
            </div>
            <div class="comment-form">
              <textarea
                v-model="newComment"
                placeholder="Add a comment..."
                @keyup.enter="addComment"
              ></textarea>
              <button
                @click="addComment"
                :disabled="!newComment.trim()"
                class="submit-comment"
              >
                Post
              </button>
            </div>
          </div>
        </template>
      </Modal>
    </div>
  </template>

<script setup>
import { auth } from '@/config/firebase'
import { debounce } from '@/utils/debounce'
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useFollowStore } from '../stores/follows'
import { useNotificationStore } from '../stores/notification'
import LoadingSpinner from './LoadingSpinner.vue'
import Modal from './Modal.vue'

const router = useRouter()
const followStore = useFollowStore()
const notificationStore = useNotificationStore()

const isLoading = ref(false)
const selectedFilter = ref('all')
const selectedActivity = ref(null)
const newComment = ref('')

const following = computed(() => followStore.following)
const followingActivity = computed(() => {
  // Only show activities from users that are still being followed
  return followStore.followingActivity.filter(activity =>
    followStore.following.includes(activity.user.id)
  )
})
const filteredActivity = computed(() => {
  console.log(followingActivity.value)
  if (selectedFilter.value === 'all') return followingActivity.value
  return followingActivity.value.filter(
    activity => activity.type === selectedFilter.value
  )
})

const fetchActivity = async () => {
  isLoading.value = true
  try {
    await followStore.fetchFollowing()
    if (followStore.following.length > 0) {
      await Promise.all([
        followStore.fetchFollowingActivity(),
        followStore.fetchActivityLikes()
      ])
    }
  } catch (err) {
    notificationStore.addNotification('Failed to load activity feed', 'error')
  } finally {
    isLoading.value = false
  }
}

const navigateToProfile = (userId) => {
  router.push(`/profile/${userId}`)
}

const toggleLike = async (activity) => {
  try {
    await followStore.toggleActivityLike(activity.id)
  } catch (err) {
    notificationStore.addNotification('Failed to update like', 'error')
  }
}

const isLiked = (activityId) => {
  return followStore.isActivityLiked(activityId)
}

// const showComments = (activity) => {
//   selectedActivity.value = activity
// }

const closeComments = () => {
  selectedActivity.value = null
  newComment.value = ''
}

const addComment = async () => {
  if (!newComment.value.trim()) return

  try {
    isLoading.value = true
    await followStore.addActivityComment(selectedActivity.value.id, {
      text: newComment.value.trim(),
      timestamp: new Date(),
      userId: auth.currentUser.uid,
      userName: auth.currentUser.displayName,
      userPhotoURL: auth.currentUser.photoURL
    })

    // Update local state
    if (!selectedActivity.value.comments) {
      selectedActivity.value.comments = []
    }
    selectedActivity.value.comments.push({
      id: Date.now().toString(),
      text: newComment.value.trim(),
      timestamp: new Date(),
      user: {
        id: auth.currentUser.uid,
        displayName: auth.currentUser.displayName,
        photoURL: auth.currentUser.photoURL
      }
    })

    newComment.value = ''
    notificationStore.addNotification('Comment added successfully', 'success')
  } catch (err) {
    notificationStore.addNotification('Failed to add comment', 'error')
    console.error('Error adding comment:', err)
  } finally {
    isLoading.value = false
  }
}

const formatTimestamp = (timestamp) => {
  if (!timestamp) return ''

  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
  const now = new Date()
  const diff = now - date

  if (diff < 60000) return 'Just now'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
  return date.toLocaleDateString()
}

const getToolIcon = (toolName) => {
  const icons = {
    'Note Learning Tool': 'fas fa-music',
    'Guitar Notes': 'fas fa-guitar',
    Metronome: 'fas fa-clock',
    'Ear Training': 'fas fa-headphones',
    'Piano Notes': 'fas fa-keyboard'
  }
  return icons[toolName] || 'fas fa-question'
}

const getActivityTypeLabel = (type) => {
  const labels = {
    practice: 'Practice Session',
    achievement: 'Achievement Unlocked',
    challenge: 'Challenge Completed'
  }
  return labels[type] || type
}

const handleUnfollow = async (userId) => {
  try {
    await followStore.unfollowUser(userId)
    await fetchActivity() // Refresh the feed
  } catch (err) {
    notificationStore.addNotification('Failed to unfollow user', 'error')
  }
}

const searchQuery = ref('')
const searchResults = ref([])

const searchUsers = debounce(async () => {
  if (!searchQuery.value.trim()) {
    searchResults.value = []
    return
  }

  try {
    const users = await followStore.fetchDiscoverableUsers(searchQuery.value)
    searchResults.value = users
  } catch (err) {
    notificationStore.addNotification('Failed to search users', 'error')
  }
}, 300)

const handleFollow = async (userId) => {
  try {
    await followStore.followUser(userId)
    await fetchActivity()
    searchQuery.value = ''
    searchResults.value = []
  } catch (err) {
    notificationStore.addNotification('Failed to follow user', 'error')
  }
}

const isFollowing = (userId) => {
  return following.value.includes(userId)
}

onMounted(() => {
  fetchActivity()
})
</script>

<style lang="scss" scoped>
.following-feed {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.feed-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;

  h2 {
    color: white;
    font-size: 24px;
    margin: 0;
  }
}

.filter-select {
  padding: 8px 12px;
  border-radius: 6px;
  background: #27272A;
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 14px;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: #c41e3a;
  }
}

.loading-state, .empty-state {
  text-align: center;
  padding: 40px;
  color: #9CA3AF;

  a {
    color: #c41e3a;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
}

.activity-feed {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.activity-card {
  background: #18181B;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.activity-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;

  .user-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    object-fit: cover;
    cursor: pointer;
  }

  .user-details {
    display: flex;
    flex-direction: column;

    .user-name {
      color: white;
      font-weight: 500;
      cursor: pointer;

      &:hover {
        color: #c41e3a;
      }
    }

    .activity-time {
      color: #9CA3AF;
      font-size: 12px;
    }
  }
}

.activity-type {
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 4px;

  &.practice {
    background: rgba(196, 30, 58, 0.1);
    color: #c41e3a;
  }

  &.achievement {
    background: rgba(245, 158, 11, 0.1);
    color: #F59E0B;
  }

  &.challenge {
    background: rgba(37, 99, 235, 0.1);
    color: #2563EB;
  }
}

.activity-content {
  margin-bottom: 15px;
}

.practice-details, .achievement-details, .challenge-details {
  display: flex;
  align-items: center;
  gap: 15px;
  background: rgba(255, 255, 255, 0.05);
  padding: 15px;
  border-radius: 8px;

  .tool-icon, .achievement-icon, .challenge-icon {
    font-size: 24px;
    color: #c41e3a;
  }
}

.practice-info, .achievement-info, .challenge-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 5px;

  .tool-name, .achievement-title, .challenge-title {
    color: white;
    font-weight: 500;
  }

  .duration, .achievement-description, .challenge-result {
    color: #9CA3AF;
    font-size: 14px;
  }
}

.practice-stats {
  display: flex;
  gap: 10px;

  .rating, .accuracy {
    color: #9CA3AF;
    font-size: 14px;
  }
}

.practice-notes {
  margin-top: 10px;
  color: #D1D5DB;
  font-size: 14px;
  line-height: 1.5;
}

.points-earned {
  color: #10B981;
  font-weight: 500;
}

.activity-actions {
  display: flex;
  gap: 15px;

  button {
    display: flex;
    align-items: center;
    gap: 5px;
    padding: 6px 12px;
    border-radius: 6px;
    border: none;
    background: transparent;
    color: #9CA3AF;
    cursor: pointer;
    transition: all 0.3s ease;

    i {
      font-size: 16px;
    }

    &:hover {
      color: white;
    }

    &.liked {
      color: #c41e3a;
    }
  }
}

.comments-section {
  .comments-list {
    max-height: 400px;
    overflow-y: auto;
    margin-bottom: 20px;
  }

  .comment {
    display: flex;
    gap: 12px;
    padding: 12px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);

    &:last-child {
      border-bottom: none;
    }

    .comment-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
    }

    .comment-content {
      flex: 1;
    }

    .comment-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 5px;

      .comment-author {
        color: white;
        font-weight: 500;
      }

      .comment-time {
        color: #9CA3AF;
        font-size: 12px;
      }
    }

    .comment-text {
      color: #D1D5DB;
      font-size: 14px;
      line-height: 1.5;
    }
  }

  .comment-form {
    display: flex;
    gap: 10px;

    textarea {
      flex: 1;
      padding: 10px;
      border-radius: 6px;
      background: #27272A;
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: white;
      resize: vertical;
      min-height: 60px;

      &:focus {
        outline: none;
        border-color: #c41e3a;
      }
    }

    .submit-comment {
      padding: 8px 16px;
      border-radius: 6px;
      background: #c41e3a;
      color: white;
      border: none;
      cursor: pointer;
      align-self: flex-end;

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      &:hover:not(:disabled) {
        background: darken(#c41e3a, 10%);
      }
    }
  }
}

@media (max-width: 640px) {
  .following-feed {
    padding: 15px;
  }

  .feed-header {
    flex-direction: column;
    gap: 15px;
    text-align: center;
  }

  .activity-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .practice-details, .achievement-details, .challenge-details {
    flex-direction: column;
    text-align: center;

    .practice-stats {
      justify-content: center;
    }
  }

  .activity-actions {
    justify-content: space-around;
  }

  .comment-form {
    flex-direction: column;

    .submit-comment {
      width: 100%;
    }
  }
}

.search-section {
  position: relative;
  width: 100%;
  max-width: 300px;
  margin-bottom: 20px;

  .search-input {
    width: 100%;
    padding: 8px 12px;
    border-radius: 6px;
    background: #27272A;
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: white;
  }

  .search-results {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: #18181B;
    border-radius: 6px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    max-height: 300px;
    overflow-y: auto;
    z-index: 1000;
  }

  .search-result-item {
    display: flex;
    align-items: center;
    padding: 10px;
    gap: 10px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);

    img {
      width: 32px;
      height: 32px;
      border-radius: 50%;
    }

    .follow-btn {
      margin-left: auto;
      padding: 4px 12px;
      border-radius: 4px;
      background: #c41e3a;
      color: white;
      border: none;
      cursor: pointer;

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
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
