<template>
  <div>
    <div class="d-flex justify-space-between align-center mb-6">
      <VCardTitle class="pa-0">Facility Media</VCardTitle>
      <VBtn color="primary" prepend-icon="tabler-plus" @click="showUploadDialog = true">
        Add Media
      </VBtn>
    </div>
    
    <!-- Media Grid -->
    <VRow v-if="mediaItems && mediaItems.length > 0">
      <VCol
        v-for="(item, index) in paginatedMedia"
        :key="item.id"
        cols="12"
        sm="6"
        md="4"
      >
        <VCard 
          class="media-card"
          @click="showGallery((currentPage - 1) * itemsPerPage + index)"
        >
          <VImg
            :src="item.url"
            :alt="item.title"
            aspect-ratio="1"
            cover
            class="media-image"
          />
          <VCardText class="py-3">
            <div class="text-body-2 font-weight-medium text-truncate">
              {{ item.title }}
            </div>
            <div class="text-caption text-medium-emphasis">
              {{ formatDate(item.created_at) }}
            </div>
            <div class="text-caption text-medium-emphasis">
              Uploaded by: {{ item.uploaded_by }}
            </div>
          </VCardText>
          <VCardActions class="px-4 pb-4">
            <VBtn
              variant="text"
              color="primary"
              size="small"
              prepend-icon="tabler-download"
              @click.stop="downloadMedia(item)"
            >
              Download
            </VBtn>
            <VSpacer />
            <VBtn
              variant="text"
              color="error"
              size="small"
              icon="tabler-trash"
              @click.stop="deleteMedia(item.id)"
            />
          </VCardActions>
        </VCard>
      </VCol>
    </VRow>
    
    <!-- Pagination -->
    <div v-if="mediaItems && mediaItems.length > itemsPerPage" class="d-flex justify-center mt-6">
      <VPagination
        v-model="currentPage"
        :length="totalPages"
        :total-visible="7"
        rounded
      />
    </div>
    
    <VAlert
      v-else-if="!mediaItems || mediaItems.length === 0"
      type="info"
      variant="tonal"
    >
      <VAlertTitle>No media available</VAlertTitle>
      No media files have been uploaded for this facility yet.
    </VAlert>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-8">
      <VProgressCircular indeterminate color="primary" size="64" />
      <div class="text-body-1 mt-4">Loading media...</div>
    </div>

    <!-- Vue Easy Lightbox -->
    <vue-easy-lightbox
      :visible="visible"
      :imgs="lightboxImgs"
      :index="lightboxIndex"
      @hide="handleHide"
    />

    <!-- Upload Dialog -->
    <ImageUploadDialog
      v-model="showUploadDialog"
      :installation-id="installationId"
      @image-uploaded="handleImageUploaded"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import VueEasyLightbox from 'vue-easy-lightbox'
import imageService from '@/services/imageService'
import ImageUploadDialog from '@/components/dialogs/ImageUploadDialogue.vue'

const props = defineProps({
  installationId: {
    type: [String, Number],
    required: true
  },
  facilityName: {
    type: String,
    default: 'Facility'
  }
})

const emit = defineEmits(['media-added', 'media-deleted', 'media-downloaded'])

// Reactive state
const loading = ref(false)
const mediaItems = ref([])
const visible = ref(false)
const lightboxIndex = ref(0)
const showUploadDialog = ref(false)
const currentPage = ref(1)
const itemsPerPage = 6

// Computed properties
const totalPages = computed(() => {
  if (!mediaItems.value || mediaItems.value.length === 0) return 0
  return Math.ceil(mediaItems.value.length / itemsPerPage)
})

const paginatedMedia = computed(() => {
  if (!mediaItems.value || mediaItems.value.length === 0) return []
  
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return mediaItems.value.slice(start, end)
})

const lightboxImgs = computed(() => {
  if (!mediaItems.value || mediaItems.value.length === 0) return []
  return mediaItems.value.map(item => ({
    src: item.url,
    title: item.title,
    alt: item.description
  }))
})

// Methods
const showGallery = (index) => {
  lightboxIndex.value = index
  visible.value = true
}

const handleHide = () => {
  visible.value = false
}

const fetchMedia = async () => {
  loading.value = true
  try {
    const response = await imageService.getInstallationImages(props.installationId)
    if (response.data.success) {
      mediaItems.value = response.data.data
    }
  } catch (error) {
    console.error('Error fetching media:', error)
    mediaItems.value = []
  } finally {
    loading.value = false
  }
}

const downloadMedia = async (item) => {
  try {
    const response = await imageService.downloadImage(props.installationId, item.id)
    
    // Create blob link and download
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', item.file_name)
    document.body.appendChild(link)
    link.click()
    link.remove()
    
    emit('media-downloaded', item)
  } catch (error) {
    console.error('Error downloading media:', error)
  }
}

const deleteMedia = async (imageId) => {
  if (!confirm('Are you sure you want to delete this image?')) return
  
  try {
    await imageService.deleteImage(props.installationId, imageId)
    await fetchMedia() // Refresh the list
    emit('media-deleted', imageId)
  } catch (error) {
    console.error('Error deleting media:', error)
  }
}

const handleImageUploaded = () => {
  showUploadDialog.value = false
  fetchMedia() // Refresh the list
  emit('media-added')
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// Lifecycle
onMounted(() => {
  fetchMedia()
})
</script>
