<template>
  <nav class="main-nav" v-if="authStore.isAuthenticated">
    <div class="container">
      <router-link to="/" class="logo">Music Learning Tools</router-link>

      <div class="nav-links">
        <router-link to="/">Tools</router-link>
        <router-link to="/dashboard">Dashboard</router-link>
        <router-link to="/contact">Contact</router-link>
        <a href="#" @click.prevent="handleLogout">Logout</a>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { auth } from '../config/firebase'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const handleLogout = async () => {
  try {
    await auth.signOut()
    authStore.setAuth(false)
    router.push('/login')
  } catch (error) {
    console.error('Error logging out:', error)
  }
}
</script>

<style lang="scss" scoped>
.main-nav {
  background: #18181B;
  padding: 16px 0;

  .container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
  }

  .logo {
    font-size: 20px;
    font-weight: bold;
    color: white;
    text-decoration: none;

    &:hover {
      color: #c41e3a;
      transition: color 0.3s ease;
    }
  }

  .nav-links {
    display: flex;
    gap: 20px;

    a {
      color: white;
      text-decoration: none;

      &:hover {
        color: #c41e3a;
        transition: color 0.3s ease;
      }
    }
  }
}
</style>
