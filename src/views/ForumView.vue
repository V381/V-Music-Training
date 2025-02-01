<template>
    <div class="page">
      <header class="hero">
        <div id="particles-js" class="particles"></div>
        <div class="container">
          <h1>Discussion Forum</h1>
          <p>Connect, share, and learn with fellow musicians</p>
        </div>
      </header>

      <main class="main-content">
        <div class="container">
          <!-- Action Bar -->
          <div class="action-bar">
            <button class="btn primary" @click="showPostCreator = true">
              <i class="fas fa-plus"></i> New Post
            </button>
            <div class="filters">
              <select v-model="selectedTag" class="filter-select">
                <option value="">All Topics</option>
                <option v-for="tag in availableTags" :key="tag" :value="tag">
                  {{ tag }}
                </option>
              </select>
            </div>
          </div>

          <!-- Loading State -->
          <div v-if="forumStore.isLoading" class="loading-state">
            <LoadingSpinner text="Loading posts..." />
          </div>

          <!-- Error State -->
          <div v-else-if="forumStore.error" class="error-state">
            <p>{{ forumStore.error }}</p>
            <button class="btn secondary" @click="retryFetch">Retry</button>
          </div>

          <!-- Empty State -->
          <div v-else-if="!forumStore.posts.length" class="empty-state">
            <div class="empty-content">
              <div class="empty-icon">
                <i class="fas fa-comments"></i>
              </div>
              <h3>No posts yet</h3>
              <p>Be the first to start a discussion!</p>
              <button class="btn primary" @click="showPostCreator = true">
                Create Post
              </button>
            </div>
          </div>

          <!-- Posts List -->
          <div v-else class="posts-list">
            <div v-for="post in filteredPosts" :key="post.id" class="post-card">
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
                <button
                  v-if="post.userId === currentUser?.uid"
                  class="btn icon danger"
                  @click="deletePost(post.id)"
                >
                  <i class="fas fa-trash"></i>
                </button>
              </div>

              <h3 class="post-title">{{ post.title }}</h3>
              <p class="post-content">{{ post.content }}</p>

              <div class="post-tags">
                <span
                  v-for="tag in post.tags"
                  :key="tag"
                  class="tag"
                  @click="selectedTag = tag"
                >
                  {{ tag }}
                </span>
              </div>

              <div class="post-footer">
                <div class="post-stats">
                    <button
                    class="stat-btn"
                    :class="{ 'liked': forumStore.isPostLiked(post.id) }"
                    @click="likePost"
                    >
                    <i class="fas fa-heart"></i>
                    {{ post.likes || 0 }}
                    </button>
                  <button class="stat-btn" @click="viewComments(post.id)">
                    <i class="fas fa-comment"></i>
                    {{ post.comments }}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Post Creator Modal -->
          <div v-if="showPostCreator" class="modal-overlay" @click.self="showPostCreator = false">
            <div class="modal-content">
              <div class="modal-header">
                <h3>Create New Post</h3>
                <button class="close-btn" @click="showPostCreator = false">×</button>
              </div>
              <form @submit.prevent="createPost" class="post-form">
                <div class="form-group">
                  <label>Title</label>
                  <input
                    v-model="newPost.title"
                    type="text"
                    required
                    placeholder="Enter post title"
                  >
                </div>

                <div class="form-group">
                  <label>Content</label>
                  <textarea
                    v-model="newPost.content"
                    required
                    placeholder="What's on your mind?"
                    rows="4"
                  ></textarea>
                </div>

                <div class="form-group">
                  <label>Tags</label>
                  <div class="tags-input">
                    <span
                      v-for="tag in newPost.tags"
                      :key="tag"
                      class="tag"
                    >
                      {{ tag }}
                      <button @click.prevent="removeTag(tag)" class="remove-tag">×</button>
                    </span>
                    <select
                      v-model="selectedNewTag"
                      @change="addTag"
                      class="tag-select"
                    >
                      <option value="">Add a tag...</option>
                      <option
                        v-for="tag in availableTagsForPost"
                        :key="tag"
                        :value="tag"
                      >
                        {{ tag }}
                      </option>
                    </select>
                  </div>
                </div>

                <div class="form-actions">
                  <button type="button" class="btn secondary" @click="showPostCreator = false">
                    Cancel
                  </button>
                  <button type="submit" class="btn primary" :disabled="isSubmitting">
                    {{ isSubmitting ? 'Creating...' : 'Create Post' }}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  </template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useForumStore } from '../stores/forum'
import { useNotificationStore } from '../stores/notification'
import { auth } from '../config/firebase'
import { useRouter } from 'vue-router'
import LoadingSpinner from '../components/LoadingSpinner.vue'
import { particlesConfig } from '../config/particlesConfig'

const forumStore = useForumStore()
const notificationStore = useNotificationStore()
const router = useRouter()

const showPostCreator = ref(false)
const selectedTag = ref('')
const isSubmitting = ref(false)
const selectedNewTag = ref('')

const currentUser = computed(() => auth.currentUser)

const newPost = ref({
  title: '',
  content: '',
  tags: []
})

const availableTags = [
  'General',
  'Guitar',
  'Piano',
  'Theory',
  'Practice Tips',
  'Beginners',
  'Advanced',
  'Sheet Music',
  'Ear Training',
  'Technique'
]

const availableTagsForPost = computed(() => {
  return availableTags.filter(tag => !newPost.value.tags.includes(tag))
})

const filteredPosts = computed(() => {
  if (!selectedTag.value) return forumStore.posts
  return forumStore.posts.filter(post => post.tags.includes(selectedTag.value))
})

const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const createPost = async () => {
  if (isSubmitting.value) return

  try {
    isSubmitting.value = true
    await forumStore.createPost(newPost.value)
    showPostCreator.value = false
    notificationStore.addNotification('Post created successfully!', 'success')
    newPost.value = { title: '', content: '', tags: [] }
    await forumStore.fetchPosts()
  } catch (err) {
    notificationStore.addNotification('Failed to create post', 'error')
  } finally {
    isSubmitting.value = false
  }
}

const deletePost = async (postId) => {
  if (confirm('Are you sure you want to delete this post?')) {
    try {
      await forumStore.deletePost(postId)
      notificationStore.addNotification('Post deleted successfully', 'success')
    } catch (err) {
      notificationStore.addNotification('Failed to delete post', 'error')
    }
  }
}

const likePost = async (postId) => {
  try {
    await forumStore.likePost(postId)
    await forumStore.fetchPosts()
  } catch (err) {
    notificationStore.addNotification('Failed to like post', 'error')
  }
}

const viewComments = (postId) => {
  router.push(`/forum/post/${postId}`)
}

const addTag = () => {
  if (selectedNewTag.value && !newPost.value.tags.includes(selectedNewTag.value)) {
    newPost.value.tags.push(selectedNewTag.value)
    selectedNewTag.value = ''
  }
}

const removeTag = (tag) => {
  newPost.value.tags = newPost.value.tags.filter(t => t !== tag)
}

const handleAvatarError = (event) => {
  event.target.src = '/default-avatar.png'
}

const retryFetch = () => {
  forumStore.fetchPosts()
}

onMounted(async () => {
  forumStore.fetchPosts()
  await forumStore.fetchUserLikes()
  if (window.particlesJS) {
    window.particlesJS('particles-js', particlesConfig)
  }
})

</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: #191919;
}

.hero {
  background: #c41e3a;
  color: white;
  text-align: center;
  padding: 60px 0;
  position: relative;
  margin-bottom: 40px;

  .container {
    position: relative;
    z-index: 1;
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
  }

  h1 {
    font-size: 40px;
    margin-bottom: 20px;
    font-weight: bold;
  }

  p {
    font-size: 18px;
    opacity: 0.9;
  }

  .particles {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }
}

.main-content {
  padding: 0 0 60px;

  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
  }
}

.action-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;

  .filters {
    display: flex;
    gap: 10px;
  }

  .filter-select {
    padding: 8px;
    background: #27272A;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 6px;
    color: white;
    cursor: pointer;

    &:focus {
      outline: none;
      border-color: #c41e3a;
    }
  }
}

.posts-list {
  display: grid;
  gap: 20px;
}

.post-card {
  background: #18181B;
  border-radius: 10px;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);

  .post-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;

    .user-info {
      display: flex;
      align-items: center;
      gap: 10px;

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
    font-size: 1.25rem;
    margin-bottom: 10px;
  }

  .post-content {
    color: #D1D5DB;
    margin-bottom: 15px;
    line-height: 1.5;
  }

  .post-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 15px;
  }

  .post-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .post-stats {
      display: flex;
      gap: 15px;
    }
  }
}

.tag {
  background: rgba(196, 30, 58, 0.1);
  color: #c41e3a;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.9em;
  cursor: pointer;

  &:hover {
    background: rgba(196, 30, 58, 0.2);
  }
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

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.75);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: #18181B;
  border-radius: 10px;
  width: 90%;
  max-width: 600px;
  border: 1px solid rgba(255, 255, 255, 0.1);

  .modal-header {
    padding: 20px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    display: flex;
    justify-content: space-between;
    align-items: center;

    h3 {
      color: white;
      margin: 0;
    }

    .close-btn {
      background: none;
      border: none;
      color: #9CA3AF;
      font-size: 24px;
      cursor: pointer;
      padding: 0;
      line-height: 1;

      &:hover {
        color: white;
      }
    }
  }
}
.post-form {
  padding: 20px;

  .form-group {
    margin-bottom: 20px;

    label {
      display: block;
      color: white;
      margin-bottom: 8px;
    }

    input, textarea {
      width: 100%;
      padding: 10px;
      background: #27272A;
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 6px;
      color: white;
      font-size: 0.95em;

      &:focus {
        outline: none;
        border-color: #c41e3a;
      }
    }

    textarea {
      resize: vertical;
      min-height: 100px;
    }
  }

  .tags-input {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    padding: 8px;
    background: #27272A;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 6px;

    .tag {
      display: flex;
      align-items: center;
      gap: 5px;

      .remove-tag {
        background: none;
        border: none;
        color: #c41e3a;
        cursor: pointer;
        padding: 0;
        font-size: 1.1em;
      }
    }

    .tag-select {
      background: none;
      border: none;
      color: #9CA3AF;
      padding: 4px;
      cursor: pointer;

      &:focus {
        outline: none;
      }

      option {
        background: #27272A;
        color: white;
      }
    }
  }
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
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

  &.danger {
    background: #DC2626;
    color: white;

    &:hover {
      background: darken(#DC2626, 10%);
    }
  }

  &.icon {
    padding: 8px;
    font-size: 1em;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.loading-state, .error-state, .empty-state {
  text-align: center;
  padding: 60px 20px;
  background: #18181B;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.empty-state {
  .empty-icon {
    font-size: 48px;
    color: #c41e3a;
    margin-bottom: 20px;
    opacity: 0.8;
  }

  h3 {
    color: white;
    font-size: 24px;
    margin-bottom: 10px;
  }

  p {
    color: #9CA3AF;
    margin-bottom: 20px;
  }
}

.error-state {
  p {
    color: #DC2626;
    margin-bottom: 20px;
  }
}

@media (max-width: 768px) {
  .hero {
    padding: 40px 0;

    h1 {
      font-size: 32px;
    }

    p {
      font-size: 16px;
    }
  }

  .action-bar {
    flex-direction: column;
    gap: 15px;
    align-items: stretch;

    .filters {
      justify-content: stretch;

      .filter-select {
        flex: 1;
      }
    }
  }

  .post-card {
    .post-header {
      .user-info {
        flex-wrap: wrap;
      }
    }

    .post-footer {
      flex-direction: column;
      gap: 15px;
    }
  }

  .modal-content {
    width: 95%;
    margin: 20px;
  }

  .form-actions {
    flex-direction: column;

    .btn {
      width: 100%;
    }
  }
}

@media (max-width: 480px) {
  .hero {
    h1 {
      font-size: 28px;
    }

    p {
      font-size: 14px;
    }
  }

  .post-card {
    padding: 15px;
  }
}

</style>
