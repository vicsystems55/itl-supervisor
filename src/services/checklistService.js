import api from '@/utils/axios'

class ChecklistService {
  // Get active checklist structure
  async getActiveChecklist() {
    try {
      const response = await api.get('/checklists/active/current')
      return response.data
    } catch (error) {
      console.error('Error fetching active checklist:', error)
      throw error
    }
  }

  // Get checklist structure for installation
  async getInstallationChecklistStructure(installationId) {
    try {
      const response = await api.get(`/installations/${installationId}/checklist/structure`)
      return response.data
    } catch (error) {
      console.error('Error fetching checklist structure:', error)
      throw error
    }
  }

  // Get draft for installation checklist
  async getDraft(installationId) {
    try {
      const response = await api.get(`/installations/${installationId}/checklist/draft`)
      return response.data
    } catch (error) {
      console.error('Error fetching draft:', error)
      throw error
    }
  }

  // Save draft
  async saveDraft(installationId, draftData) {
    try {
      const response = await api.post(`/installations/${installationId}/checklist/draft`, draftData)
      return response.data
    } catch (error) {
      console.error('Error saving draft:', error)
      throw error
    }
  }

  // Submit checklist
  async submitChecklist(installationId, formData) {
    try {
      const response = await api.post(`/installations/${installationId}/checklist/submit`, formData)
      return response.data
    } catch (error) {
      console.error('Error submitting checklist:', error)
      throw error
    }
  }

  // Delete draft
  async deleteDraft(installationId) {
    try {
      const response = await api.delete(`/installations/${installationId}/checklist/draft`)
      return response.data
    } catch (error) {
      console.error('Error deleting draft:', error)
      throw error
    }
  }
}

export default new ChecklistService()
