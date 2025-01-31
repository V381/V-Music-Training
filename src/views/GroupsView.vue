<template>
    <div class="page">
      <header class="hero">
        <div id="particles-js" class="particles"></div>
        <div class="container">
          <h1>Practice Groups</h1>
          <p>Practice together, grow together</p>
        </div>
      </header>

      <main class="main-content">
        <div class="container">
          <PendingInvites />
          <PracticeGroups />
        </div>
      </main>
    </div>
  </template>

<script setup>
import PracticeGroups from '../components/PracticeGroups.vue'
import { particlesConfig } from '../config/particlesConfig'
import { onMounted } from 'vue'
import PendingInvites from '../components/PendingInvites.vue'

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
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    p {
      font-size: 18px;
      max-width: 800px;
      margin: 0 auto;
      opacity: 0.9;
      line-height: 1.5;
    }

    .particles {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
    }
  }

  .main-content {
    flex: 1;
    padding: 0 0 60px 0;

    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 20px;
    }
  }

  // Animations
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .hero {
    animation: fadeIn 0.8s ease-out;
  }

  // Responsive styles
  @media (max-width: 768px) {
    .hero {
      padding: 40px 0;
      margin-bottom: 30px;

      h1 {
        font-size: 32px;
        margin-bottom: 15px;
      }

      p {
        font-size: 16px;
      }
    }

    .main-content {
      padding: 0 0 40px 0;

      .container {
        padding: 0 15px;
      }
    }
  }

  @media (max-width: 480px) {
    .hero {
      padding: 30px 0;
      margin-bottom: 20px;

      h1 {
        font-size: 28px;
      }

      p {
        font-size: 14px;
      }
    }
  }

  // Dark mode enhancements
  @media (prefers-color-scheme: dark) {
    .page {
      background: #191919;
    }

    .hero {
      h1, p {
        color: #ffffff;
      }
    }
  }

  // Print styles
  @media print {
    .particles {
      display: none;
    }

    .hero {
      background: none;
      color: #000;
      padding: 20px 0;

      h1 {
        color: #000;
        text-shadow: none;
      }

      p {
        color: #333;
      }
    }
  }
  </style>
