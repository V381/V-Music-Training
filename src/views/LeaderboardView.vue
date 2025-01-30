<template>
    <div class="page">
      <header class="hero">
        <div id="particles-js" class="particles"></div>
        <div class="container">
          <h1>Leaderboard</h1>
          <p>See how you stack up against other musicians in the community</p>
        </div>
      </header>

      <main class="main-content">
        <div class="container">
          <Leaderboard />
        </div>
      </main>
    </div>
  </template>

<script setup>
import { onMounted } from 'vue'
import Leaderboard from '../components/Leaderboard.vue'
import { particlesConfig } from '../config/particlesConfig'

onMounted(() => {
  if (window.particlesJS) {
    window.particlesJS('particles-js', particlesConfig)
  }
})
</script>

  <style lang="scss" scoped>
  .page {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  .hero {
    background: #c41e3a;
    color: white;
    text-align: center;
    padding: 60px 0;
    position: relative;

    .container {
      position: relative;
      z-index: 1;
    }

    h1 {
      font-size: 40px;
      margin-bottom: 20px;
      font-weight: bold;
    }

    p {
      font-size: 18px;
      max-width: 800px;
      margin: 0 auto;
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
    flex: 1;
    padding: 60px 0;

    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 20px;
    }
  }
  </style>
