<template>
    <div class="page">
      <header class="hero">
        <div id="particles-js" class="particles"></div>
        <div class="container">
          <h1>Practice Routines</h1>
          <p>Create and manage your custom practice sessions</p>
        </div>
      </header>

      <main class="main-content">
        <div class="container">
          <PracticeRoutines />
        </div>
      </main>
    </div>
  </template>

<script setup>
import { onMounted } from 'vue'
import PracticeRoutines from '../components/PracticeRoutines.vue'
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
    background: #191919;
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
      max-width: 800px;
      margin: 0 auto;
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
    flex: 1;
    padding: 40px 0;

    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 20px;
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

    .main-content {
      padding: 20px 0;
    }
  }
  </style>
