import { setupLayouts } from 'virtual:meta-layouts'
import { createRouter, createWebHistory } from 'vue-router/auto'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior(to) {
    if (to.hash) return { el: to.hash, behavior: 'smooth', top: 60 }
    return { top: 0 }
  },
  extendRoutes: pages => setupLayouts(pages),
})

// Public routes - no authentication required
const publicRoutes = ['login', 'register', 'forgot-password', 'lcco-details']

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  
  // Check if route requires authentication
  const isPublicRoute = publicRoutes.includes(to.name) || publicRoutes.includes(to.path)
  
  if (!isPublicRoute && !authStore.isAuthenticated) {
    // Redirect to login for protected routes without auth
    next({
      name: 'login',
      query: { redirect: to.fullPath }
    })
  } else if (authStore.isAuthenticated && to.name === 'login') {
    // Redirect away from login if already authenticated - go to intended page or root
    const redirect = from.query.redirect || '/'
    next(redirect)
  } else {
    // Continue to the route
    next()
  }
})

export default function (app) {
  app.use(router)
}

export { router }
