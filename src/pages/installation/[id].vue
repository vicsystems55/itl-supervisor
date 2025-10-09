<template>
  <VContainer fluid class="pa-6">
    <!-- Loading State -->
    <div v-if="loading" class="text-center py-8">
      <VProgressCircular
        indeterminate
        color="primary"
        size="64"
      />
      <div class="text-body-1 mt-4">Loading installation details...</div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="text-center py-8">
      <VIcon icon="tabler-alert-circle" size="64" color="error" class="mb-4" />
      <div class="text-h6 text-error mb-2">Failed to load installation</div>
      <div class="text-body-1 text-medium-emphasis mb-4">{{ error }}</div>
      <VBtn
        color="primary"
        @click="fetchInstallation"
      >
        <VIcon icon="tabler-refresh" class="me-2" />
        Try Again
      </VBtn>
      <VBtn
        variant="tonal"
        class="ml-2"
        @click="$router.push('/installations')"
      >
        <VIcon icon="tabler-arrow-left" class="me-2" />
        Back to Installations
      </VBtn>
    </div>

    <!-- Installation Details -->
    <div v-else-if="installation">
      <!-- Header -->
      <VRow class="mb-6">
        <VCol cols="12">
          <div class="d-flex justify-space-between align-start">
            <div>
              <VBtn
                variant="text"
                @click="$router.push('/installations')"
                class="mb-4"
              >
                <VIcon icon="tabler-arrow-left" class="me-2" />
                Back to Installations
              </VBtn>
              <h1 class="text-h4 font-weight-bold text-primary">
                {{ installation.facility?.name }}
              </h1>
              <p class="text-body-1 text-medium-emphasis">
                Installation ID: {{ installation.id }} • 
                <VChip
                  :color="installation.verified_by_health_officer ? 'success' : 'warning'"
                  variant="flat"
                  size="small"
                  class="ml-2"
                >
                  <VIcon
                    :icon="installation.verified_by_health_officer ? 'tabler-check' : 'tabler-clock'"
                    class="me-1"
                    size="16"
                  />
                  {{ installation.verified_by_health_officer ? 'Verified' : 'Pending Verification' }}
                </VChip>
              </p>
            </div>
            <div class="d-flex gap-2">
              <VBtn
                variant="tonal"
                @click="toggleVerification"
              >
                <VIcon
                  :icon="installation.verified_by_health_officer ? 'tabler-x' : 'tabler-check'"
                  class="me-2"
                />
                {{ installation.verified_by_health_officer ? 'Unverify' : 'Verify' }}
              </VBtn>
              <VBtn
                color="primary"
                @click="editInstallation"
              >
                <VIcon icon="tabler-edit" class="me-2" />
                Edit Installation
              </VBtn>
            </div>
          </div>
        </VCol>
      </VRow>

      <!-- Main Content -->
      <VRow>
        <!-- Left Column - Installation Details -->
        <VCol cols="12" md="8">
          <VRow>
            <!-- Facility Information -->
            <VCol cols="12">
              <VCard class="mb-6">
                <VCardTitle class="d-flex align-center">
                  <VIcon icon="tabler-building" class="me-2 text-primary" />
                  Facility Information
                </VCardTitle>
                <VDivider />
                <VCardText>
                  <VRow>
                    <VCol cols="12" sm="6">
                      <DetailItem label="Facility Name" :value="installation.facility?.name" />
                    </VCol>
                    <VCol cols="12" sm="6">
                      <DetailItem label="Facility Type" :value="installation.facility?.facility_type" />
                    </VCol>
                    <VCol cols="12">
                      <DetailItem label="Address" :value="installation.facility?.address" />
                    </VCol>
                    <VCol cols="12" sm="6">
                      <DetailItem label="Supply Chain Level" :value="installation.facility?.supply_chain_level" />
                    </VCol>
                    <VCol cols="12" sm="6">
                      <DetailItem 
                        label="Road Access" 
                        :value="installation.facility?.road_accessible ? 'Yes' : 'No'" 
                      />
                    </VCol>
                    <VCol cols="12" sm="6">
                      <DetailItem 
                        label="Distance from Hub" 
                        :value="installation.facility?.distance_from_hub_km + ' km'" 
                      />
                    </VCol>
                    <VCol cols="12" sm="6">
                      <DetailItem label="Road Quality" :value="installation.facility?.road_quality" />
                    </VCol>
                  </VRow>
                </VCardText>
              </VCard>
            </VCol>

            <!-- Equipment Details -->
            <VCol cols="12">
              <VCard class="mb-6">
                <VCardTitle class="d-flex align-center">
                  <VIcon icon="tabler-package" class="me-2 text-primary" />
                  Equipment Details
                </VCardTitle>
                <VDivider />
                <VCardText>
                  <VRow>
                    <VCol cols="12" sm="6">
                      <DetailItem label="Supplier" :value="installation.supplier" />
                    </VCol>
                    <VCol cols="12" sm="6">
                      <DetailItem label="Product Model" :value="installation.product_model" />
                    </VCol>
                    <VCol cols="12" sm="6">
                      <DetailItem label="Quantity Installed" :value="installation.total_quantity_installed" />
                    </VCol>
                    <VCol cols="12" sm="6">
                      <DetailItem label="Country" :value="installation.country" />
                    </VCol>
                    <VCol cols="12" sm="6">
                      <DetailItem label="Province/State" :value="installation.province" />
                    </VCol>
                    <VCol cols="12" sm="6">
                      <DetailItem label="PO Number" :value="installation.po_number" />
                    </VCol>
                  </VRow>
                </VCardText>
              </VCard>
            </VCol>

            <!-- Location Map -->
            <VCol cols="12" v-if="hasLocation">
              <VCard>
                <VCardTitle class="d-flex align-center">
                  <VIcon icon="tabler-map-pin" class="me-2 text-primary" />
                  Location
                </VCardTitle>
                <VDivider />
                <VCardText class="pa-0">
                  <div id="map" class="installation-map"></div>
                </VCardText>
              </VCard>
            </VCol>

            <!-- Additional Information -->
            <VCol cols="12" v-if="installation.remarks || installation.supplier_comments">
              <VCard>
                <VCardTitle class="d-flex align-center">
                  <VIcon icon="tabler-note" class="me-2 text-primary" />
                  Additional Information
                </VCardTitle>
                <VDivider />
                <VCardText>
                  <VRow>
                    <VCol cols="12" v-if="installation.remarks">
                      <DetailItem label="Remarks" :value="installation.remarks" />
                    </VCol>
                    <VCol cols="12" v-if="installation.supplier_comments">
                      <DetailItem label="Supplier Comments" :value="installation.supplier_comments" />
                    </VCol>
                  </VRow>
                </VCardText>
              </VCard>
            </VCol>
          </VRow>
        </VCol>

        <!-- Right Column - Sidebar -->
        <VCol cols="12" md="4">
          <!-- Location Information -->
          <VCard class="mb-6">
            <VCardTitle class="d-flex align-center">
              <VIcon icon="tabler-map-pin" class="me-2 text-primary" />
              Location Details
            </VCardTitle>
            <VDivider />
            <VCardText>
              <DetailItem label="State" :value="installation.facility?.state?.name" />
              <DetailItem label="LGA" :value="installation.facility?.lga?.name" />
              <DetailItem 
                label="Coordinates" 
                :value="installation.lat && installation.lng ? `${installation.lat.toFixed(4)}, ${installation.lng.toFixed(4)}` : 'Not available'" 
              />
              <div v-if="!hasLocation" class="text-center text-medium-emphasis mt-4">
                <VIcon icon="tabler-map-off" size="48" class="mb-2" />
                <div>Location coordinates not available</div>
              </div>
            </VCardText>
          </VCard>

          <!-- Health Officer -->
          <VCard class="mb-6">
            <VCardTitle class="d-flex align-center">
              <VIcon icon="tabler-user" class="me-2 text-primary" />
              Health Officer
            </VCardTitle>
            <VDivider />
            <VCardText>
              <div v-if="installation.health_officer" class="text-center">
                <VAvatar
                  size="64"
                  color="primary"
                  variant="tonal"
                  class="mb-3"
                >
                  <VIcon icon="tabler-user" size="32" />
                </VAvatar>
                <div class="text-h6 font-weight-medium">{{ installation.health_officer.name }}</div>
                <div class="text-body-2 text-medium-emphasis mb-2">
                  {{ installation.health_officer.designation }}
                </div>
                <div class="text-caption" v-if="installation.health_officer.phone_number">
                  <VIcon icon="tabler-phone" size="16" class="me-1" />
                  {{ installation.health_officer.phone_number }}
                </div>
                <div class="text-caption" v-if="installation.health_officer.email">
                  <VIcon icon="tabler-mail" size="16" class="me-1" />
                  {{ installation.health_officer.email }}
                </div>
              </div>
              <div v-else class="text-center text-medium-emphasis">
                <VIcon icon="tabler-user-off" size="48" class="mb-2" />
                <div>No health officer assigned</div>
              </div>
            </VCardText>
          </VCard>

          <!-- Installation Timeline -->
          <VCard>
            <VCardTitle class="d-flex align-center">
              <VIcon icon="tabler-timeline" class="me-2 text-primary" />
              Timeline
            </VCardTitle>
            <VDivider />
            <VCardText>
              <div class="timeline">
                <div class="timeline-item">
                  <div class="timeline-dot success"></div>
                  <div class="timeline-content">
                    <div class="timeline-title">Created</div>
                    <div class="timeline-date">
                      {{ formatDate(installation.created_at) }}
                    </div>
                  </div>
                </div>
                <div class="timeline-item">
                  <div class="timeline-dot" :class="installation.verified_by_health_officer ? 'success' : 'warning'"></div>
                  <div class="timeline-content">
                    <div class="timeline-title">Verification</div>
                    <div class="timeline-date">
                      {{ installation.verified_by_health_officer ? 'Verified' : 'Pending' }}
                    </div>
                  </div>
                </div>
                <div v-if="installation.updated_at !== installation.created_at" class="timeline-item">
                  <div class="timeline-dot info"></div>
                  <div class="timeline-content">
                    <div class="timeline-title">Last Updated</div>
                    <div class="timeline-date">
                      {{ formatDate(installation.updated_at) }}
                    </div>
                  </div>
                </div>
              </div>
            </VCardText>
          </VCard>
        </VCol>
      </VRow>
    </div>
  </VContainer>
</template>

<script setup>
import { ref, onMounted, computed, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import installationService from '@/services/installationService'

// Leaflet CSS (import in your main CSS file or here)
import 'leaflet/dist/leaflet.css'

// Import Leaflet
let L = null

const route = useRoute()
const router = useRouter()

const loading = ref(true)
const error = ref(null)
const installation = ref(null)
const map = ref(null)

// Compute if installation has location data
const hasLocation = computed(() => {
  return installation.value?.lat && installation.value?.lng
})

// Mock location data for demonstration
// In real app, this would come from your API
const getLocationData = (installationData) => {
  // For demo purposes, let's add mock coordinates based on state
  const stateCoordinates = {
    'Lagos': { lat: 6.5244, lng: 3.3792 },
    'Abia': { lat: 5.5320, lng: 7.4860 },
    'Kano': { lat: 12.0022, lng: 8.5919 },
    'Rivers': { lat: 4.8156, lng: 7.0498 },
    'Delta': { lat: 5.5320, lng: 5.8987 },
    // Add more states as needed
  }
  
  const stateName = installationData.facility?.state?.name
  if (stateName && stateCoordinates[stateName]) {
    return {
      ...installationData,
      lat: stateCoordinates[stateName].lat,
      lng: stateCoordinates[stateName].lng
    }
  }
  
  return installationData
}

const fetchInstallation = async () => {
  loading.value = true
  error.value = null
  try {
    const response = await installationService.getInstallation(route.params.id)
    if (response.success) {
      // Add mock location data for demonstration
      installation.value = getLocationData(response.data)
      
      // Initialize map after data is loaded
      if (hasLocation.value) {
        await initializeMap()
      }
    } else {
      error.value = 'Installation not found'
    }
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

const initializeMap = async () => {
  // Dynamically import Leaflet to avoid SSR issues
  if (typeof window !== 'undefined') {
    L = await import('leaflet')
    
    // Fix for default markers in webpack
    delete L.Icon.Default.prototype._getIconUrl
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    })
    
    // Initialize map
    if (hasLocation.value) {
      setTimeout(() => {
        map.value = L.map('map').setView(
          [installation.value.lat, installation.value.lng], 
          13
        )
        
        // Add tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 18,
        }).addTo(map.value)
        
        // Add marker
        L.marker([installation.value.lat, installation.value.lng])
          .addTo(map.value)
          .bindPopup(`
            <div class="map-popup">
              <h4><strong>${installation.value.facility?.name}</strong></h4>
              <p><strong>Product:</strong> ${installation.value.product_model}</p>
              <p><strong>Supplier:</strong> ${installation.value.supplier}</p>
              <p><strong>Address:</strong> ${installation.value.facility?.address}</p>
              <p><strong>Status:</strong> ${installation.value.verified_by_health_officer ? 'Verified' : 'Pending'}</p>
            </div>
          `)
          .openPopup()
        
        // Fit map to marker with some padding
        map.value.fitBounds([
          [installation.value.lat, installation.value.lng]
        ], { padding: [20, 20] })
      }, 100)
    }
  }
}

const toggleVerification = async () => {
  if (!installation.value) return
  
  try {
    const newStatus = !installation.value.verified_by_health_officer
    await installationService.updateVerification(installation.value.id, newStatus)
    installation.value.verified_by_health_officer = newStatus
  } catch (err) {
    console.error('Error updating verification:', err)
  }
}

const editInstallation = () => {
  // Navigate to edit page or open edit dialog
  console.log('Edit installation:', installation.value.id)
}

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Clean up map when component is destroyed
onUnmounted(() => {
  if (map.value) {
    map.value.remove()
  }
})

onMounted(() => {
  fetchInstallation()
})
</script>

<style scoped>
.installation-map {
  height: 400px;
  width: 100%;
  border-radius: 0 0 4px 4px;
}

.timeline {
  position: relative;
}

.timeline-item {
  display: flex;
  align-items: flex-start;
  margin-bottom: 16px;
}

.timeline-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: #e0e0e0;
  margin-right: 12px;
  margin-top: 4px;
  flex-shrink: 0;
}

.timeline-dot.success {
  background-color: #4caf50;
}

.timeline-dot.warning {
  background-color: #ff9800;
}

.timeline-dot.info {
  background-color: #2196f3;
}

.timeline-content {
  flex: 1;
}

.timeline-title {
  font-weight: 500;
  margin-bottom: 2px;
}

.timeline-date {
  font-size: 0.875rem;
  color: rgba(var(--v-theme-on-surface), var(--v-medium-emphasis-opacity));
}

/* Map popup styling */
:deep(.map-popup) {
  font-family: inherit;
}

:deep(.map-popup h4) {
  margin: 0 0 8px 0;
  color: #1976d2;
}

:deep(.map-popup p) {
  margin: 4px 0;
  font-size: 0.875rem;
}

:deep(.map-popup strong) {
  color: #424242;
}
</style>

<!-- DetailItem Component -->
<script>
const DetailItem = {
  props: {
    label: String,
    value: [String, Number]
  },
  template: `
    <div class="detail-item mb-3">
      <div class="text-caption text-medium-emphasis">{{ label }}</div>
      <div class="text-body-1 font-weight-medium">{{ value || 'Not specified' }}</div>
    </div>
  `
}
</script>
