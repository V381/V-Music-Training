import { createRouter, createWebHistory } from 'vue-router'
import { auth } from '../config/firebase'
import IndexView from '../views/IndexView.vue'
import ContactView from '../views/ContactView.vue'
import LoginView from '../views/LoginView.vue'
import DashboardView from '../views/DashboardView.vue'

let authReady = false

auth.onAuthStateChanged(() => {
  authReady = true
})

const routes = [
  {
    path: '/',
    name: 'home',
    component: IndexView,
    meta: { requiresAuth: true }
  },
  {
    path: '/contact',
    name: 'contact',
    component: ContactView,
    meta: { requiresAuth: true }
  },
  {
    path: '/login',
    name: 'login',
    component: LoginView
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: DashboardView,
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

router.beforeEach(async (to, from, next) => {
  if (!authReady) {
    await new Promise(resolve => {
      const unsubscribe = auth.onAuthStateChanged(() => {
        unsubscribe()
        resolve()
      })
    })
  }

  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const isAuthenticated = auth.currentUser

  if (requiresAuth && !isAuthenticated) {
    next('/login')
  } else {
    next()
  }
})

export default router
