import api from '@/utils/axios'

class InstallationService {

  // Export ALL installations (not just paginated)
async exportAllInstallations(filters = {}) {
  const params = new URLSearchParams()
  
  Object.keys(filters).forEach(key => {
    if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
      params.append(key, filters[key])
    }
  })

  try {
    const response = await api.get(`/installations/export/all?${params}`)
    return response.data
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Export failed')
  }
}
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
      const response = await api.get('/installations/statistics')
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

  // Update delivery status
  async updateDeliveryStatus(id, status) {
    try {
      const response = await api.patch(`/installations/${id}/delivery-status`, { status })
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update delivery status')
    }
  }

  // Update installation status
  async updateInstallationStatus(id, status) {
    try {
      const response = await api.patch(`/installations/${id}/installation-status`, { status })
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update installation status')
    }
  }

  // Update installation (general update for multiple fields)
  async updateInstallation(id, data) {
    try {
      const response = await api.put(`/installations/${id}`, data)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update installation')
    }
  }

  // NEW: Get states with installation details
  async getStatesWithInstallations(filters = {}) {
    const params = new URLSearchParams()
    
    // Add filters to params
    Object.keys(filters).forEach(key => {
      if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
        params.append(key, filters[key])
      }
    })

    try {
      const response = await api.get(`/states?${params}`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch states with installation data')
    }
  }
}

export default new InstallationService()
