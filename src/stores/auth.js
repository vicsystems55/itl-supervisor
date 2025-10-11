import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  // Initialize from localStorage to persist on refresh
  const user = ref(null)
  const token = ref(localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token') || null)
  const error = ref(null)
  const isLoading = ref(false)

  const isAuthenticated = computed(() => !!token.value)

  // Login method
// Login method
const login = async (credentials) => {
  isLoading.value = true
  error.value = null

  try {
    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(credentials),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Login failed')
    }

    // Store the token
    token.value = data.access_token
    
    // Save to localStorage if "remember me" is checked, otherwise sessionStorage
    if (credentials.remember) {
      localStorage.setItem('auth_token', data.access_token)
      sessionStorage.removeItem('auth_token') // Clear session storage
    } else {
      sessionStorage.setItem('auth_token', data.access_token)
      localStorage.removeItem('auth_token') // Clear local storage
    }

    // Store user data WITH ROLE if returned
    if (data.user) {
      // Create user object with role from the separate roles field
      const userData = {
        ...data.user,
        role: data.roles && data.roles.length > 0 ? data.roles[0] : 'User', // Get first role or default to 'User'
        permissions: data.permissions || [] // Store permissions too if needed
      }
      
      user.value = userData
      
      if (credentials.remember) {
        localStorage.setItem('user_data', JSON.stringify(userData))
                localStorage.setItem('role', data.roles && data.roles.length > 0 ? data.roles[0] : 'User') // No JSON.stringify

      } else {
        sessionStorage.setItem('user_data', JSON.stringify(userData))
        localStorage.setItem('role', data.roles && data.roles.length > 0 ? data.roles[0] : 'User') // No JSON.stringify

      }
    }

    return true
  } catch (err) {
    error.value = err.message
    return false
  } finally {
    isLoading.value = false
  }
}

  // Logout method - redirect to login page
  const logout = async () => {
    try {
      // Only call logout endpoint if we have a token
      if (token.value) {
        await fetch(`${import.meta.env.VITE_BACKEND_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token.value}`,
            'Accept': 'application/json',
          },
        })
      }
    } catch (err) {
      console.error('Logout error:', err)
    } finally {
      // Clear all local state and storage
      token.value = null
      user.value = null
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user_data')
      sessionStorage.removeItem('auth_token')
      sessionStorage.removeItem('user_data')
      
      // Redirect to login page
      window.location.href = '/login'
    }
  }

  // Initialize user data from storage on page load
  const initializeAuth = () => {
    const storedToken = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token')
    const storedUser = localStorage.getItem('user_data') || sessionStorage.getItem('user_data')
    
    if (storedToken) {
      token.value = storedToken
      console.log('Auth token restored from storage')
    }
    
    if (storedUser) {
      try {
        user.value = JSON.parse(storedUser)
        console.log('User data restored from storage')
      } catch (e) {
        console.error('Error parsing stored user data:', e)
        user.value = null
      }
    }
    
    console.log('Auth initialization complete. Authenticated:', !!token.value)
  }

  // Get current user
  const getCurrentUser = async () => {
    if (!token.value) return null

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/auth/user`, {
        headers: {
          'Authorization': `Bearer ${token.value}`,
          'Accept': 'application/json',
        },
      })

      if (response.ok) {
        user.value = await response.json()
        // Update storage with fresh user data
        const storage = localStorage.getItem('auth_token') ? localStorage : sessionStorage
        storage.setItem('user_data', JSON.stringify(user.value))
        return user.value
      } else if (response.status === 401) {
        // Token expired, logout
        logout()
      }
    } catch (err) {
      console.error('Get user error:', err)
    }

    return null
  }

  // ✅ AUTO-INITIALIZE WHEN STORE IS CREATED
  initializeAuth()

  return {
    user,
    token,
    error,
    isLoading,
    isAuthenticated,
    login,
    logout,
    getCurrentUser,
    initializeAuth,
  }
})
