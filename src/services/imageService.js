// src/services/imageService.js

import api from '@/utils/axios'


const imageService = {
  // Get all images for an installation
  getInstallationImages(installationId) {
    return api.get(`/installations/${installationId}/images`)
  },

  // Upload new image
  uploadImage(installationId, formData) {
    return api.post(`/installations/${installationId}/images`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },

  // Get single image
  getImage(installationId, imageId) {
    return api.get(`/installations/${installationId}/images/${imageId}`)
  },

  // Delete image
  deleteImage(installationId, imageId) {
    return api.delete(`/installations/${installationId}/images/${imageId}`)
  },

  // Download image
  downloadImage(installationId, imageId) {
    return api.get(`/installations/${installationId}/images/${imageId}/download`, {
      responseType: 'blob'
    })
  }
}

export default imageService
