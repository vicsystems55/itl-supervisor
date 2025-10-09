// src/plugins/router.js
import { setupLayouts } from 'virtual:meta-layouts'
import { createRouter, createWebHistory } from 'vue-router/auto'

// Create router with layouts applied safely
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior(to) {
    if (to.hash) return { el: to.hash, behavior: 'smooth', top: 60 }
    return { top: 0 }
  },
  extendRoutes: pages => {
    // Let setupLayouts handle all routes automatically
    return setupLayouts(pages)
  },
})

// Vue plugin to register router
export default function (app) {
  app.use(router)
}

export { router }
