import api from '@/utils/axios'

class InstallationService {
  // Get all installations with optional filters
  async getInstallations(filters = {}) {
    const params = new URLSearchParams()
    
    // Add filters to params
    Object.keys(filters).forEach(key => {
      if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
        params.append(key, filters[key])
      }
    })

    try {
      const response = await api.get(`/installations?${params}`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch installations')
    }
  }

  // Get installation by ID
  async getInstallation(id) {
    try {
      const response = await api.get(`/installations/${id}`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch installation')
    }
  }

  // Get dashboard statistics
  async getStatistics() {
    try {
      const response = await api.get('/installations/statistics')
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch statistics')
    }
  }

  // Get dashboard summary
  async getDashboardSummary() {
    try {
      const response = await api.get('/installations/dashboard/summary')
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch dashboard summary')
    }
  }

  // Search installations
  async searchInstallations(searchTerm) {
    try {
      const response = await api.get(`/installations/search?search=${encodeURIComponent(searchTerm)}`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Search failed')
    }
  }

  // Update verification status
  async updateVerification(id, verified) {
    try {
      const response = await api.patch(`/installations/${id}/verification`, { verified })
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update verification')
    }
  }

  // Get installations by state
  async getByState(stateId) {
    try {
      const response = await api.get(`/installations/state/${stateId}`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch state installations')
    }
  }

  // Export installations
  async exportInstallations(filters = {}) {
    const params = new URLSearchParams()
    
    Object.keys(filters).forEach(key => {
      if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
        params.append(key, filters[key])
      }
    })

    try {
      const response = await api.get(`/installations/export?${params}`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Export failed')
    }
  }
}

export default new InstallationService()
