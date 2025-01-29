<template>
  <div class="page">
    <NavBar v-if="authStore.isAuthReady"/>
    <router-view v-if="authStore.isAuthReady"></router-view>
    <div v-else class="loading">Loading...</div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useAuthStore } from './stores/auth'
import NavBar from './components/NavBar.vue'

const authStore = useAuthStore()

onMounted(() => {
  authStore.init()
})
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
</style>
