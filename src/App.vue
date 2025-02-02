<template>
  <div class="page">
    <NavBar v-if="authStore.isAuthReady"/>
    <PracticeModal
      v-if="showPracticeModal"
      v-model:show="showPracticeModal"
      :tool-name="currentTool"
      @save="handlePracticeComplete"
      @close="handleModalClose"
    />
    <NotificationSystem />
    <router-view v-if="authStore.isAuthReady"></router-view>
    <LoadingSpinner v-else text="Loading..." />
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import { useAuthStore } from './stores/auth'
import NavBar from './components/NavBar.vue'
import PracticeModal from './components/PracticeModal.vue'
import LoadingSpinner from './components/LoadingSpinner.vue'
import NotificationSystem from './components/NotificationSystem.vue'

const authStore = useAuthStore()
let unsubscribe = null

onMounted(() => {
  unsubscribe = authStore.init()
})

onUnmounted(() => {
  if (unsubscribe) {
    unsubscribe()
  }
})

const showPracticeModal = ref(false)
const currentTool = ref('')

const handlePracticeComplete = () => {
  showPracticeModal.value = false
  currentTool.value = ''
}

const handleModalClose = () => {
  showPracticeModal.value = false
  currentTool.value = ''
}
</script>

<style scoped>
.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  font-size: 1.2em;
  color: #9CA3AF;
}

.page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
</style>
