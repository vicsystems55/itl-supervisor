import App from '@/App.vue'
import { registerPlugins } from '@core/utils/plugins'
import { createApp } from 'vue'

// Styles
import '@core/scss/template/index.scss'
import '@styles/styles.scss'

// ✅ Import vue3-toastify
import Vue3Toastify, { toast } from 'vue3-toastify'
import 'vue3-toastify/dist/index.css'


// Create vue app
const app = createApp(App)


// Register plugins
registerPlugins(app)

// Suppress noisy <Suspense> experimental warnings in development
if (import.meta.env.DEV) {
  app.config.warnHandler = (msg, vm, trace) => {
    if (typeof msg === 'string' && msg.includes('<Suspense>')) return
    // fall back to default behavior for other warnings
    // eslint-disable-next-line no-console
    console.warn(msg, trace)
  }
}

// Configure it globally
app.use(Vue3Toastify, {
  autoClose: 3000,
  position: toast.POSITION.TOP_RIGHT,
  theme: 'colored', // or 'light' / 'dark'
})

// Mount vue app
app.mount('#app')

export { toast }

