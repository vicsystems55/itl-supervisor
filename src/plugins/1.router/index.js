// src/plugins/router.js
import { setupLayouts } from 'virtual:meta-layouts'
import { createRouter, createWebHistory } from 'vue-router/auto'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior(to) {
    if (to.hash) return { el: to.hash, behavior: 'smooth', top: 60 }
    return { top: 0 }
  },
  extendRoutes: pages => setupLayouts(pages),
})

const hasAuthToken = () => {
  return !!localStorage.getItem('auth_token')
}

// Start with only these as public - you can add more later
const publicRoutes = ['login', 'register', 'index', '/']

router.beforeEach((to, from, next) => {
  const isPublicRoute = publicRoutes.includes(to.name) || publicRoutes.includes(to.path)
  
  if (!isPublicRoute && !hasAuthToken()) {
    next({ name: 'login', query: { redirect: to.fullPath } })
  } else if (hasAuthToken() && to.name === 'login') {
    next({ path: '/' }) // Change this to your main app route
  } else {
    next()
  }
})

export default function (app) {
  app.use(router)
}

export { router }
