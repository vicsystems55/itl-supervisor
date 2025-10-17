<template>
  <VDialog v-model="dialog" max-width="600" persistent>
    <VCard>
      <VCardTitle class="d-flex justify-space-between align-center pa-6 pb-4">
        <span class="text-h5">Upload Media</span>
        <VBtn icon variant="text" @click="closeDialog" :disabled="uploading">
          <VIcon icon="tabler-x" />
        </VBtn>
      </VCardTitle>
      
      <VCardText class="pa-6 pt-0">
        <VForm @submit.prevent="uploadImage">
          <!-- File Upload Area -->
          <VCol cols="12" class="mb-6">
            <div 
              class="file-upload-area"
              :class="{ 
                'file-upload-area--dragover': isDragging,
                'file-upload-area--has-file': form.image,
                'file-upload-area--uploading': uploading
              }"
              @click="triggerFileInput"
              @drop="handleDrop"
              @dragover="handleDragOver"
              @dragleave="handleDragLeave"
            >
              <input
                ref="fileInput"
                type="file"
                accept="image/*"
                @change="handleFileSelect"
                class="file-input"
              />
              
              <div class="file-upload-content">
                <div v-if="!form.image && !uploading" class="file-upload-placeholder">
                  <VIcon icon="tabler-cloud-upload" size="48" class="mb-3 text-medium-emphasis" />
                  <div class="text-h6 mb-2">Drop your image here</div>
                  <div class="text-body-2 text-medium-emphasis mb-4">
                    or <span class="text-primary">browse files</span>
                  </div>
                  <div class="text-caption text-disabled">
                    Supports JPG, PNG, GIF, WEBP • Max 10MB
                  </div>
                </div>
                
                <div v-else-if="uploading" class="file-upload-progress">
                  <VIcon icon="tabler-cloud-upload" size="48" class="mb-3 text-primary" />
                  <div class="text-h6 mb-2">Uploading...</div>
                  <VProgressLinear
                    :model-value="uploadProgress"
                    height="8"
                    color="primary"
                    rounded
                    class="mb-2"
                  />
                  <div class="text-caption text-medium-emphasis">
                    {{ uploadProgress }}% • {{ estimatedTime }}
                  </div>
                </div>
                
                <div v-else class="file-upload-preview">
                  <VImg
                    :src="imagePreview"
                    max-height="120"
                    contain
                    class="mb-3"
                  />
                  <div class="text-body-2 font-weight-medium text-truncate">
                    {{ form.image.name }}
                  </div>
                  <div class="text-caption text-medium-emphasis">
                    {{ formatFileSize(form.image.size) }}
                  </div>
                  <VBtn
                    variant="text"
                    color="error"
                    size="small"
                    class="mt-2"
                    @click.stop="removeFile"
                  >
                    <VIcon icon="tabler-trash" class="me-1" size="16" />
                    Remove
                  </VBtn>
                </div>
              </div>
            </div>
            
            <div v-if="errors.image" class="text-error text-caption mt-2">
              <VIcon icon="tabler-alert-circle" size="16" class="me-1" />
              {{ errors.image[0] }}
            </div>
          </VCol>

          <!-- Form Fields -->
          <VRow>
            <VCol cols="12">
              <AppTextField
                v-model="form.title"
                label="Title *"
                placeholder="Enter image title"
                :error-messages="errors.title"
                :disabled="uploading"
                required
              />
            </VCol>

            <VCol cols="12">
              <AppTextField
                v-model="form.description"
                label="Description"
                placeholder="Enter image description (optional)"
                :error-messages="errors.description"
                :disabled="uploading"
                type="textarea"
                rows="3"
              />
            </VCol>

            <VCol cols="12" sm="6">
              <AppTextField
                v-model="form.latitude"
                label="Latitude"
                placeholder="e.g., 40.7128"
                :error-messages="errors.latitude"
                :disabled="uploading"
                type="number"
                step="any"
              />
            </VCol>

            <VCol cols="12" sm="6">
              <AppTextField
                v-model="form.longitude"
                label="Longitude"
                placeholder="e.g., -74.0060"
                :error-messages="errors.longitude"
                :disabled="uploading"
                type="number"
                step="any"
              />
            </VCol>

            <!-- Location Helper -->
            <VCol cols="12">
              <VAlert
                v-if="!form.latitude || !form.longitude"
                color="info"
                variant="tonal"
                class="mb-0"
              >
                <template #prepend>
                  <VIcon icon="tabler-info-circle" />
                </template>
                <VAlertTitle class="text-body-2">
                  Location data is optional
                </VAlertTitle>
                You can add latitude and longitude coordinates for geotagging.
              </VAlert>
              
              <VAlert
                v-else
                color="success"
                variant="tonal"
                class="mb-0"
              >
                <template #prepend>
                  <VIcon icon="tabler-check" />
                </template>
                <VAlertTitle class="text-body-2">
                  Location data added
                </VAlertTitle>
                Coordinates: {{ form.latitude }}, {{ form.longitude }}
              </VAlert>
            </VCol>
          </VRow>
        </VForm>
      </VCardText>
      
      <VDivider />
      
      <VCardActions class="pa-6">
        <VSpacer />
        <VBtn 
          variant="tonal" 
          @click="closeDialog"
          :disabled="uploading"
        >
          Cancel
        </VBtn>
        <VBtn 
          color="primary" 
          @click="uploadImage"
          :loading="uploading"
          :disabled="!form.image || !form.title || uploading"
          prepend-icon="tabler-cloud-upload"
        >
          {{ uploading ? 'Uploading...' : 'Upload Image' }}
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import imageService from '@/services/imageService'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  installationId: {
    type: [String, Number],
    required: true
  }
})

const emit = defineEmits(['update:modelValue', 'image-uploaded'])

// Refs
const dialog = ref(false)
const uploading = ref(false)
const uploadProgress = ref(0)
const isDragging = ref(false)
const imagePreview = ref(null)
const fileInput = ref(null)
const uploadStartTime = ref(null)

const form = ref({
  image: null,
  title: '',
  description: '',
  latitude: null,
  longitude: null
})

const errors = ref({})

// Computed
const estimatedTime = computed(() => {
  if (uploadProgress.value === 0 || !uploadStartTime.value) return 'Calculating...'
  
  const elapsed = (Date.now() - uploadStartTime.value) / 1000
  const totalTime = (elapsed / uploadProgress.value) * 100
  const remaining = totalTime - elapsed
  
  if (remaining < 60) {
    return `${Math.ceil(remaining)}s remaining`
  } else {
    return `${Math.ceil(remaining / 60)}m remaining`
  }
})

// Watchers
watch(() => props.modelValue, (value) => {
  dialog.value = value
})

watch(dialog, (value) => {
  emit('update:modelValue', value)
  if (!value) {
    resetForm()
  }
})

// Methods
const triggerFileInput = () => {
  if (!uploading.value) {
    fileInput.value?.click()
  }
}

const handleFileSelect = (event) => {
  const file = event.target.files[0]
  if (file) {
    validateAndSetFile(file)
  }
}

const handleDrop = (event) => {
  event.preventDefault()
  isDragging.value = false
  
  const files = event.dataTransfer.files
  if (files.length > 0) {
    validateAndSetFile(files[0])
  }
}

const handleDragOver = (event) => {
  event.preventDefault()
  isDragging.value = true
}

const handleDragLeave = (event) => {
  event.preventDefault()
  isDragging.value = false
}

const validateAndSetFile = (file) => {
  // Validate file type
  const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  if (!validTypes.includes(file.type)) {
    errors.value.image = ['Please select a valid image file (JPEG, PNG, GIF, WEBP)']
    return
  }
  
  // Validate file size (10MB)
  const maxSize = 10 * 1024 * 1024
  if (file.size > maxSize) {
    errors.value.image = ['File size must be less than 10MB']
    return
  }
  
  errors.value.image = null
  form.value.image = file
  
  // Create preview
  const reader = new FileReader()
  reader.onload = (e) => {
    imagePreview.value = e.target.result
  }
  reader.readAsDataURL(file)
}

const removeFile = () => {
  form.value.image = null
  imagePreview.value = null
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const uploadImage = async () => {
  if (!form.value.image || !form.value.title) return
  
  uploading.value = true
  uploadProgress.value = 0
  uploadStartTime.value = Date.now()
  errors.value = {}

  try {
    const formData = new FormData()
    formData.append('image', form.value.image)
    formData.append('title', form.value.title)
    formData.append('description', form.value.description || '')
    
    if (form.value.latitude) {
      formData.append('latitude', form.value.latitude)
    }
    if (form.value.longitude) {
      formData.append('longitude', form.value.longitude)
    }

    // Simulate progress (in real implementation, you'd use axios progress events)
    const progressInterval = setInterval(() => {
      if (uploadProgress.value < 90) {
        uploadProgress.value += 10
      }
    }, 200)

    await imageService.uploadImage(props.installationId, formData)
    
    clearInterval(progressInterval)
    uploadProgress.value = 100
    
    // Small delay to show 100% completion
    setTimeout(() => {
      emit('image-uploaded')
      closeDialog()
    }, 500)
    
  } catch (error) {
    if (error.response?.data?.errors) {
      errors.value = error.response.data.errors
    } else {
      console.error('Error uploading image:', error)
      errors.value.general = ['Failed to upload image. Please try again.']
    }
  } finally {
    uploading.value = false
    uploadProgress.value = 0
  }
}

const closeDialog = () => {
  if (!uploading.value) {
    dialog.value = false
  }
}

const resetForm = () => {
  form.value = {
    image: null,
    title: '',
    description: '',
    latitude: null,
    longitude: null
  }
  imagePreview.value = null
  errors.value = {}
  uploadProgress.value = 0
  isDragging.value = false
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}
</script>

<style scoped>
.file-upload-area {
  border: 2px dashed rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 8px;
  padding: 48px 24px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: rgba(var(--v-theme-surface), 0.5);
  position: relative;
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.file-upload-area:hover {
  border-color: rgb(var(--v-theme-primary));
  background: rgba(var(--v-theme-primary), 0.02);
}

.file-upload-area--dragover {
  border-color: rgb(var(--v-theme-primary));
  background: rgba(var(--v-theme-primary), 0.08);
  transform: scale(1.02);
}

.file-upload-area--has-file {
  border-style: solid;
  border-color: rgb(var(--v-theme-primary));
  background: rgba(var(--v-theme-primary), 0.02);
}

.file-upload-area--uploading {
  cursor: not-allowed;
  opacity: 0.7;
}

.file-input {
  position: absolute;
  width: 0;
  height: 0;
  opacity: 0;
  pointer-events: none;
}

.file-upload-content {
  width: 100%;
}

.file-upload-placeholder {
  color: rgba(var(--v-theme-on-surface), var(--v-medium-emphasis-opacity));
}

.file-upload-progress {
  color: rgb(var(--v-theme-primary));
}

.file-upload-preview {
  max-width: 100%;
}

.text-primary {
  color: rgb(var(--v-theme-primary)) !important;
}
</style>
