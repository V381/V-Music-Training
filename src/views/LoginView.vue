<template>
    <div class="page">
      <div id="particles-js" class="particles"></div>
      <div class="login-container">
        <div class="login-card">
          <h1><span class="v-letter">V</span>-Music Teacher</h1>
          <div class="login-buttons">
            <button @click="handleGoogleLogin" class="btn google-btn">
              <i class="fab fa-google"></i>
              Continue with Google
            </button>
            <button @click="handleGithubLogin" class="btn github-btn">
              <i class="fab fa-github"></i>
              Continue with GitHub
            </button>
          </div>
          <p v-if="error" class="error">{{ error }}</p>
        </div>
      </div>
    </div>
  </template>

<script setup>
import { ref, onMounted } from 'vue'
import { signInWithPopup } from 'firebase/auth'
import { auth, googleProvider, githubProvider } from '../config/firebase'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { particlesConfig } from '../config/particlesConfig'

const authStore = useAuthStore()

const error = ref('')
const router = useRouter()

onMounted(() => {
  if (window.particlesJS) {
    const customConfig = {
      ...particlesConfig,
      particles: {
        ...particlesConfig.particles,
        color: {
          value: '#c41e3a'
        },
        line_linked: {
          ...particlesConfig.line_linked,
          color: '#c41e3a'
        }
      }
    }
    window.particlesJS('particles-js', customConfig)
  }
})

const handleGoogleLogin = async () => {
  try {
    await signInWithPopup(auth, googleProvider)
    authStore.setAuth(true)
    router.push('/')
  } catch (err) {
    error.value = 'Failed to sign in with Google'
  }
}

const handleGithubLogin = async () => {
  try {
    await signInWithPopup(auth, githubProvider)
    authStore.setAuth(true)
    router.push('/')
  } catch (err) {
    error.value = 'Failed to sign in with GitHub'
  }
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: #18181B;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.particles {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.login-container {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 400px;
  padding: 0 20px;
}

.login-card {
  background: rgba(24, 24, 27, 0.9);
  padding: 40px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);

  h1 {
    color: white;
    text-align: center;
    margin-bottom: 30px;
    font-size: 2.5em;
    font-weight: bold;

    .v-letter {
      color: #c41e3a;
    }
  }
}

.login-buttons {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.btn {
  width: 100%;
  padding: 12px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  transition: all 0.3s ease;

  i {
    font-size: 20px;
  }

  &.google-btn {
    background: white;
    color: #333;

    &:hover {
      background: darken(white, 10%);
    }
  }

  &.github-btn {
    background: #333;
    color: white;

    &:hover {
      background: darken(#333, 10%);
    }
  }
}

.error {
  color: #c41e3a;
  margin-top: 15px;
  text-align: center;
}
</style>
