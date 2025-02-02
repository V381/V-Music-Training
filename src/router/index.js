import { createRouter, createWebHistory } from 'vue-router'
import { auth } from '../config/firebase'
import IndexView from '../views/IndexView.vue'
import ContactView from '../views/ContactView.vue'
import LoginView from '../views/LoginView.vue'
import DashboardView from '../views/DashboardView.vue'
import LeaderboardView from '../views/LeaderboardView.vue'
import RoutinesView from '../views/RoutinesView.vue'
import FollowingFeed from '@/components/FollowingFeed.vue'
import UserProfile from '@/components/UserProfile.vue'
import DiscoverView from '../views/DiscoverView.vue'
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
  },
  {
    path: '/leaderboard',
    name: 'leaderboard',
    component: LeaderboardView,
    meta: { requiresAuth: true }
  },
  {
    path: '/routines',
    name: 'routines',
    component: RoutinesView,
    meta: { requiresAuth: true }
  },
  {
    path: '/forum',
    name: 'forum',
    component: () => import('../views/ForumView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/forum/post/:id',
    name: 'forum-post',
    component: () => import('../views/ForumPostView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/groups',
    name: 'groups',
    component: () => import('../views/GroupsView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/profile/:userId',
    name: 'userProfile',
    component: UserProfile,
    meta: { requiresAuth: true }
  },
  {
    path: '/following',
    name: 'following',
    component: FollowingFeed,
    meta: { requiresAuth: true }
  },
  {
    path: '/discover',
    name: 'discover',
    component: DiscoverView,
    meta: { requiresAuth: true }
  },
  {
    path: '/profile/:id',
    name: 'userProfile',
    component: () => import('../components/UserProfile.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/groups/:groupId/practice/:sessionId',
    name: 'group-practice',
    component: () => import('../views/GroupPracticeView.vue'),
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
        authReady = true
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
