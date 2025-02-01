<template>
    <div class="page">
      <div class="container">
        <!-- Loading State -->
        <div v-if="isLoading" class="loading-state">
          <LoadingSpinner text="Loading post..." />
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="error-state">
          <p>{{ error }}</p>
          <button class="btn secondary" @click="loadPost">Retry</button>
        </div>

        <!-- Post Content -->
        <div v-else-if="post" class="post-details">
          <div class="post-card">
            <div class="post-header">
              <div class="user-info">
                <img
                  :src="post.userPhotoURL || '/default-avatar.png'"
                  :alt="post.userName"
                  class="user-avatar"
                  @error="handleAvatarError"
                >
                <span class="user-name">{{ post.userName }}</span>
                <span class="post-date">{{ formatDate(post.createdAt) }}</span>
              </div>
            </div>

            <h1 class="post-title">{{ post.title }}</h1>
            <p class="post-content">{{ post.content }}</p>

            <div class="post-tags">
              <span v-for="tag in post.tags" :key="tag" class="tag">
                {{ tag }}
              </span>
            </div>

            <div class="post-stats">
                <button
                class="stat-btn"
                :class="{ 'liked': forumStore.isPostLiked(post.id) }"
                @click="likePost"
                >
                <i class="fas fa-heart"></i>
                {{ post.likes || 0 }}
                </button>
              <span class="stat-btn">
                <i class="fas fa-comment"></i>
                {{ post.comments }}
              </span>
            </div>
          </div>

          <!-- Comments Section -->
          <div class="comments-section">
            <h2>Comments</h2>

            <!-- New Comment Form -->
            <form @submit.prevent="addComment" class="comment-form">
              <textarea
                v-model="newComment"
                placeholder="Write a comment..."
                rows="3"
                required
              ></textarea>
              <button type="submit" class="btn primary" :disabled="isSubmittingComment">
                {{ isSubmittingComment ? 'Posting...' : 'Post Comment' }}
              </button>
            </form>

            <!-- Comments List -->
            <div class="comments-list">
              <div v-for="comment in comments" :key="comment.id" class="comment-card">
                <div class="comment-header">
                  <div class="user-info">
                    <img
                      :src="comment.userPhotoURL || '/default-avatar.png'"
                      :alt="comment.userName"
                      class="user-avatar"
                      @error="handleAvatarError"
                    >
                    <span class="user-name">{{ comment.userName }}</span>
                    <span class="comment-date">{{ formatDate(comment.createdAt) }}</span>
                  </div>
                  <button
                    v-if="comment.userId === currentUser?.uid"
                    class="btn icon danger"
                    @click="deleteComment(comment.id)"
                  >
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
                <p class="comment-content">{{ comment.content }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useForumStore } from '../stores/forum'
import { useNotificationStore } from '../stores/notification'
import { auth } from '../config/firebase'
import LoadingSpinner from '../components/LoadingSpinner.vue'

const route = useRoute()
const forumStore = useForumStore()
const notificationStore = useNotificationStore()

const post = ref(null)
const comments = ref([])
const newComment = ref('')
const isLoading = ref(true)
const error = ref(null)
const isSubmittingComment = ref(false)

const currentUser = computed(() => auth.currentUser)

const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const loadPost = async () => {
  isLoading.value = true
  error.value = null

  try {
    const postDoc = forumStore.posts.find(p => p.id === route.params.id)
    if (postDoc) {
      post.value = postDoc
    } else {
      await forumStore.fetchPosts()
      post.value = forumStore.posts.find(p => p.id === route.params.id)
    }

    if (!post.value) {
      error.value = 'Post not found'
      return
    }

    comments.value = await forumStore.fetchComments(route.params.id)
  } catch (err) {
    error.value = 'Error loading post'
    console.error('Error loading post:', err)
  } finally {
    isLoading.value = false
  }
}

const addComment = async () => {
  if (isSubmittingComment.value) return

  try {
    isSubmittingComment.value = true
    await forumStore.addComment(route.params.id, {
      content: newComment.value
    })
    newComment.value = ''
    comments.value = await forumStore.fetchComments(route.params.id)
    notificationStore.addNotification('Comment added successfully', 'success')
  } catch (err) {
    notificationStore.addNotification('Failed to add comment', 'error')
  } finally {
    isSubmittingComment.value = false
  }
}

const deleteComment = async (commentId) => {
  if (confirm('Are you sure you want to delete this comment?')) {
    try {
      await forumStore.deleteComment(commentId)
      comments.value = comments.value.filter(c => c.id !== commentId)
      notificationStore.addNotification('Comment deleted successfully', 'success')
    } catch (err) {
      notificationStore.addNotification('Failed to delete comment', 'error')
    }
  }
}

const likePost = async () => {
  try {
    await forumStore.likePost(route.params.id)
    await loadPost()
  } catch (err) {
    notificationStore.addNotification('Failed to like post', 'error')
  }
}

const handleAvatarError = (event) => {
  event.target.src = '/default-avatar.png'
}

onMounted(async () => {
  loadPost()
  await forumStore.fetchUserLikes()
})
</script>

  <style lang="scss" scoped>
  .page {
    min-height: 100vh;
    background: #191919;
    padding: 40px 0;
  }

  .container {
    max-width: 800px;
    margin: 0 auto;
    padding: 0 20px;
  }

  .post-details {
    margin-bottom: 40px;
  }

  .post-card {
    background: #18181B;
    border-radius: 10px;
    padding: 30px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    margin-bottom: 30px;

    .post-header {
      margin-bottom: 20px;

      .user-info {
        display: flex;
        align-items: center;
        gap: 12px;

        .user-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
        }

        .user-name {
          color: white;
          font-weight: 500;
        }

        .post-date {
          color: #9CA3AF;
          font-size: 0.9em;
        }
      }
    }

    .post-title {
      color: white;
      font-size: 1.8rem;
      margin-bottom: 15px;
    }

    .post-content {
      color: #D1D5DB;
      line-height: 1.6;
      margin-bottom: 20px;
    }

    .post-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-bottom: 20px;
    }

    .post-stats {
      display: flex;
      gap: 20px;
    }
  }

  .comments-section {
    h2 {
      color: white;
      margin-bottom: 20px;
    }
  }

  .comment-form {
    background: #18181B;
    border-radius: 10px;
    padding: 20px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    margin-bottom: 30px;

    textarea {
      width: 100%;
      padding: 12px;
      background: #27272A;
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 6px;
      color: white;
      margin-bottom: 15px;
      resize: vertical;

      &:focus {
        outline: none;
        border-color: #c41e3a;
      }
    }
  }

  .comments-list {
    display: flex;
    flex-direction: column;
    gap: 15px;
  }

  .comment-card {
    background: #18181B;
    border-radius: 10px;
    padding: 20px;
    border: 1px solid rgba(255, 255, 255, 0.1);

    .comment-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;

      .user-info {
        display: flex;
        align-items: center;
        gap: 10px;

        .user-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
        }

        .user-name {
          color: white;
          font-weight: 500;
        }

        .comment-date {
          color: #9CA3AF;
          font-size: 0.9em;
        }
      }
    }

    .comment-content {
      color: #D1D5DB;
      line-height: 1.5;
    }
  }

  .tag {
    background: rgba(196, 30, 58, 0.1);
    color: #c41e3a;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 0.9em;
  }

  .stat-btn {
  background: none;
  border: none;
  color: #9CA3AF;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.9em;
  transition: all 0.2s ease;

  &.liked {
    color: #c41e3a;

    i {
      transform: scale(1.1);
    }
  }

  &:hover {
    color: #c41e3a;
  }

  i {
    font-size: 1.1em;
    transition: transform 0.2s ease;
  }
}

  .btn {
    padding: 8px 20px;
    border-radius: 6px;
    font-size: 0.95em;
    cursor: pointer;
    border: none;
    transition: all 0.3s ease;

    &.primary {
      background: #c41e3a;
      color: white;

      &:hover:not(:disabled) {
        background: darken(#c41e3a, 10%);
      }
    }

    &.secondary {
      background: #4B5563;
      color: white;

      &:hover:not(:disabled) {
        background: darken(#4B5563, 10%);
      }
    }

    &.icon {
      padding: 6px;
      font-size: 1em;
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }

  .loading-state, .error-state {
    text-align: center;
    padding: 60px 20px;
    background: #18181B;
    border-radius: 10px;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .error-state {
    p {
      color: #DC2626;
      margin-bottom: 20px;
    }
  }

  @media (max-width: 768px) {
    .page {
      padding: 20px 0;
    }

    .post-card {
      padding: 20px;

      .post-title {
        font-size: 1.5rem;
      }
    }

    .comment-card {
      .comment-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 10px;
      }
    }
  }
  </style>
