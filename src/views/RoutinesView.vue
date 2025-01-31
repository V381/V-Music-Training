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
          <div class="tabs">
            <button
              :class="['tab-btn', { active: currentTab === 'my-routines' }]"
              @click="currentTab = 'my-routines'"
            >
              My Routines
            </button>
            <button
              :class="['tab-btn', { active: currentTab === 'shared' }]"
              @click="currentTab = 'shared'"
            >
              Browse Shared
            </button>
          </div>

          <PracticeRoutines v-if="currentTab === 'my-routines'" />
          <SharedRoutines v-else />
        </div>
      </main>
    </div>
  </template>

<script setup>
import { ref, onMounted } from 'vue'
import PracticeRoutines from '../components/PracticeRoutines.vue'
import SharedRoutines from '../components/SharedRoutines.vue'
import { particlesConfig } from '../config/particlesConfig'

const currentTab = ref('my-routines')

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

.tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 30px;
}

.tab-btn {
  padding: 12px 24px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  background: transparent;
  color: #fff;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 16px;

  &.active {
    background: #c41e3a;
    border-color: #c41e3a;
  }

  &:hover:not(.active) {
    background: rgba(196, 30, 58, 0.2);
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

  .tabs {
    flex-direction: row;
    flex-wrap: wrap;

    .tab-btn {
      flex: 1;
      min-width: 150px;
      text-align: center;
      padding: 10px 16px;
    }
  }

  .container {
    padding: 0 15px;
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

  .tabs {
    .tab-btn {
      font-size: 14px;
      padding: 8px 12px;
    }
  }
}
</style>
