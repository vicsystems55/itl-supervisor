import { createApp } from 'vue'
import App from '@/App.vue'
import { registerPlugins } from '@core/utils/plugins'

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

// Configure it globally
app.use(Vue3Toastify, {
  autoClose: 3000,
  position: toast.POSITION.TOP_RIGHT,
  theme: 'colored', // or 'light' / 'dark'
})

// Mount vue app
app.mount('#app')

export { toast }
