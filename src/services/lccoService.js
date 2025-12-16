import api from '@/utils/axios'

class LccoService {
  async create(data) {
    try {
      const response = await api.post('/lcco-pr', data)
      return response.data
    } catch (error) {
      throw error.response?.data || new Error('Failed to create LCCO record')
    }
  }

  async index(filters = {}) {
    try {
      // Allow callers to pass filters (e.g., per_page) so exports can request all records
      const response = await api.get('/lcco-pr', { params: filters })
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch LCCO records')
    }
  }

  /**
   * Fetch installations directly using native fetch to avoid axios interceptors
   * (useful for public endpoints that don't require auth token)
   */
  async getInstallationsNoAuth(filters = {}) {
    const params = new URLSearchParams()
    Object.keys(filters).forEach(key => {
      if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
        params.append(key, filters[key])
      }
    })

    const base = (import.meta.env.VITE_BACKEND_URL || '').replace(/\/$/, '')
    const url = `${base}/installations?${params}`

    try {
      const res = await fetch(url, { headers: { Accept: 'application/json' } })
      if (!res.ok) {
        const errText = await res.text()
        throw new Error(errText || `Request failed with status ${res.status}`)
      }
      const data = await res.json()
      return data
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch installations (no-auth)')
    }
  }
}

export default new LccoService()
