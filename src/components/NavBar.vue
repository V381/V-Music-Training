<template>
  <nav class="main-nav" v-if="authStore.isAuthenticated">
    <div class="container">
      <router-link to="/" class="logo">
        <span class="logo-text">Music Learning Tools</span>
      </router-link>

      <!-- Desktop Navigation -->
      <div class="nav-links desktop-nav">
        <router-link to="/">Tools</router-link>
        <router-link to="/dashboard">Dashboard</router-link>
        <router-link to="/leaderboard">Leaderboard</router-link>
        <router-link to="/routines">Routines</router-link>
        <router-link to="/contact">Contact</router-link>
        <a href="#" @click.prevent="handleLogout">Logout</a>
      </div>

      <!-- Mobile Navigation Button -->
      <div class="mobile-menu-button" @click="isMenuOpen = !isMenuOpen">
        <div class="hamburger" :class="{ 'is-active': isMenuOpen }">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>

      <!-- Mobile Navigation Menu -->
      <div class="mobile-menu" :class="{ 'is-open': isMenuOpen }">
        <router-link to="/" @click="isMenuOpen = false">Tools</router-link>
        <router-link to="/dashboard" @click="isMenuOpen = false">Dashboard</router-link>
        <router-link to="/leaderboard" @click="isMenuOpen = false">Leaderboard</router-link>
        <router-link to="/routines">Routines</router-link>
        <router-link to="/contact" @click="isMenuOpen = false">Contact</router-link>
        <a href="#" @click.prevent="handleLogoutMobile">Logout</a>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref } from 'vue'
import { auth } from '../config/firebase'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()
const isMenuOpen = ref(false)

const handleLogout = async () => {
  try {
    await auth.signOut()
    authStore.setAuth(false)
    router.push('/login')
  } catch (error) {
    console.error('Error logging out:', error)
  }
}

const handleLogoutMobile = async () => {
  isMenuOpen.value = false
  await handleLogout()
}
</script>

<style lang="scss" scoped>
.main-nav {
  background: #18181B;
  padding: 16px 0;
  position: relative;

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
    z-index: 1000;

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

// Desktop Navigation
.desktop-nav {
  @media (max-width: 768px) {
    display: none !important; /* Added !important to ensure it overrides other styles */
  }
}

// Mobile Menu Button
.mobile-menu-button {
  display: none;
  z-index: 1001;

  @media (max-width: 768px) {
    display: block;
  }
}

.hamburger {
  width: 30px;
  height: 20px;
  position: relative;
  cursor: pointer;

  span {
    display: block;
    position: absolute;
    height: 3px;
    width: 100%;
    background: white;
    border-radius: 3px;
    transition: all 0.3s ease;

    &:nth-child(1) { top: 0; }
    &:nth-child(2) { top: 8px; }
    &:nth-child(3) { top: 16px; }
  }

  &.is-active {
    span {
      &:nth-child(1) {
        transform: rotate(45deg);
        top: 8px;
      }
      &:nth-child(2) {
        opacity: 0;
      }
      &:nth-child(3) {
        transform: rotate(-45deg);
        top: 8px;
      }
    }
  }
}

// Mobile Menu
.mobile-menu {
  display: none;
  position: fixed;
  top: 0;
  right: -100%;
  width: 250px;
  height: 100vh;
  background: #18181B;
  padding: 80px 20px 20px;
  transition: right 0.3s ease;
  z-index: 1000;

  @media (max-width: 768px) {
    display: block;
  }

  &.is-open {
    right: 0;
  }

  a {
    display: block;
    color: white;
    text-decoration: none;
    padding: 15px 0;
    font-size: 18px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);

    &:hover {
      color: #c41e3a;
      transition: color 0.3s ease;
    }

    &:last-child {
      border-bottom: none;
    }
  }
}

// Additional mobile styles
@media (max-width: 768px) {
  .main-nav .container {
    padding: 0 15px;
  }
}

</style>
