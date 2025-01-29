<template>
  <div class="page">
    <NavBar v-if="authStore.isAuthenticated"></NavBar>
    <router-view></router-view>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useAuthStore } from './stores/auth'
import { auth } from './config/firebase'
import { onAuthStateChanged } from 'firebase/auth'
import NavBar from './components/NavBar.vue'

const authStore = useAuthStore()

onMounted(() => {
  onAuthStateChanged(auth, (user) => {
    authStore.setAuth(!!user)
  })
})
</script>
