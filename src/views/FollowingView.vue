<template>
    <div class="page">
      <header class="hero">
        <div id="particles-js" class="particles"></div>
        <div class="container">
          <h1>Following Activity</h1>
          <p>Stay updated with your music learning community</p>
        </div>
      </header>

      <main class="main-content">
        <div class="container">
          <FollowingFeed />
        </div>
      </main>
    </div>
  </template>

<script setup>
import FollowingFeed from '../components/FollowingFeed.vue'
import { onMounted } from 'vue'
import { particlesConfig } from '../config/particlesConfig'

onMounted(() => {
  if (window.particlesJS) {
    window.particlesJS('particles-js', particlesConfig)
  }
})
</script>
