<template>
  <div class="page">
    <div id="particles-js" class="particles"></div>
    <div class="login-container">
      <!-- Region Selection Modal -->
      <div v-if="showRegionModal" class="region-modal">
        <div class="modal-content">
          <h2>Select Your Region</h2>
          <p>Please select your region to continue</p>

          <div class="region-grid">
            <div
              v-for="region in regions"
              :key="region.code"
              :class="['region-card', { active: selectedRegion === region.code }]"
              @click="selectedRegion = region.code"
            >
              <span class="region-flag">{{ region.flag }}</span>
              <span class="region-name">{{ region.name }}</span>
            </div>
          </div>

          <button @click="confirmRegion" :disabled="!selectedRegion" class="btn continue-btn">
            Continue
          </button>
        </div>
      </div>

      <div class="login-card" v-if="!showRegionModal">
        <img src="../assets/logo.png" alt="logo">
        <br />
        <h1><span class="v-letter"></span> Music Teacher</h1>
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
import { auth, googleProvider, githubProvider, db } from '../config/firebase'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import { particlesConfig } from '../config/particlesConfig'

const authStore = useAuthStore()
const error = ref('')
const router = useRouter()
const showRegionModal = ref(false)
const selectedRegion = ref('')
const tempUser = ref(null)

const regions = [
  { code: 'NA', name: 'North America', flag: '🇺🇸' },
  { code: 'EU', name: 'Europe', flag: '🇪🇺' },
  { code: 'AS', name: 'Asia', flag: '🌏' },
  { code: 'SA', name: 'South America', flag: '🇧🇷' },
  { code: 'AF', name: 'Africa', flag: '🌍' },
  { code: 'OC', name: 'Oceania', flag: '🇦🇺' }
]

const handleGoogleLogin = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider)
    const userDoc = await getDoc(doc(db, 'users', result.user.uid))

    if (!userDoc.exists()) {
      tempUser.value = result.user
      showRegionModal.value = true
    } else {
      await completeLogin(result.user)
    }
  } catch (err) {
    error.value = 'Failed to sign in with Google'
    console.error('Google sign-in error:', err)
  }
}

const handleGithubLogin = async () => {
  try {
    const result = await signInWithPopup(auth, githubProvider)
    const userDoc = await getDoc(doc(db, 'users', result.user.uid))

    if (!userDoc.exists()) {
      tempUser.value = result.user
      showRegionModal.value = true
    } else {
      await completeLogin(result.user)
    }
  } catch (err) {
    error.value = 'Failed to sign in with GitHub'
    console.error('GitHub sign-in error:', err)
  }
}

const confirmRegion = async () => {
  if (!tempUser.value || !selectedRegion.value) return

  try {
    await setDoc(doc(db, 'users', tempUser.value.uid), {
      uid: tempUser.value.uid,
      email: tempUser.value.email,
      displayName: tempUser.value.displayName || 'Anonymous',
      photoURL: tempUser.value.photoURL || null,
      region: selectedRegion.value,
      createdAt: new Date()
    })

    await completeLogin(tempUser.value)
  } catch (err) {
    error.value = 'Failed to set region'
    console.error('Region setting error:', err)
  }
}

const completeLogin = async (user) => {
  authStore.setAuth(true)
  router.push('/')
}

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
  text-align: center;
  img {
    width: 60px;
    height: 60px;
  }

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
  border-radius: 6px;
  font-size: 16px;
  cursor: pointer;
  border: none;
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

.region-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;

  .modal-content {
    background: #18181B;
    padding: 30px;
    border-radius: 12px;
    text-align: center;
    max-width: 500px;
    width: 90%;
    border: 1px solid rgba(255, 255, 255, 0.1);

    h2 {
      color: white;
      margin-bottom: 10px;
    }

    p {
      color: #9CA3AF;
      margin-bottom: 20px;
    }

    .region-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 15px;
      margin-bottom: 25px;
    }

    .region-card {
      background: rgba(255, 255, 255, 0.05);
      border: 2px solid transparent;
      border-radius: 8px;
      padding: 15px;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 10px;

      &:hover {
        background: rgba(255, 255, 255, 0.1);
      }

      &.active {
        border-color: #c41e3a;
        background: rgba(196, 30, 58, 0.1);
      }

      .region-flag {
        font-size: 2.5em;
      }

      .region-name {
        color: white;
        font-weight: 500;
      }
    }

    .continue-btn {
      width: 100%;
      background: #c41e3a;
      color: white;
      padding: 12px;
      border: none;
      border-radius: 6px;
      font-size: 16px;
      cursor: pointer;
      transition: all 0.3s ease;

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      &:hover:not(:disabled) {
        background: darken(#c41e3a, 10%);
      }
    }
  }
}

@media (max-width: 640px) {
  .login-container {
    padding: 0 15px;
  }

  .login-card {
    padding: 30px 20px;
  }

  h1 {
    font-size: 2em;
  }
}
</style>
