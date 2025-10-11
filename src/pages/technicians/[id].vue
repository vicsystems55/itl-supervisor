<template>
  <div>
    <!-- Header with Back Button and Actions -->
    <VCard class="mb-6">
      <VCardText class="d-flex align-center justify-space-between">
        <div class="d-flex align-center">
          <VBtn
            icon
            variant="text"
            size="small"
            @click="$router.back()"
            class="me-3"
          >
            <VIcon icon="tabler-arrow-left" />
          </VBtn>
          <div>
            <VCardTitle class="pa-0">Technician Details</VCardTitle>
            <VCardSubtitle class="pa-0">
              Manage technician information and assignments
            </VCardSubtitle>
          </div>
        </div>
        
        <div class="d-flex gap-2">
          <VBtn
            color="primary"
            prepend-icon="tabler-edit"
            @click="isEditDialogVisible = true"
          >
            Edit Technician
          </VBtn>
          <VBtn
            color="secondary"
            prepend-icon="tabler-map-pin"
            @click="isAssignSiteDialogVisible = true"
          >
            Assign Site
          </VBtn>
        </div>
      </VCardText>
    </VCard>

    <!-- Loading State -->
    <VCard v-if="loading" class="text-center py-8">
      <VProgressCircular
        indeterminate
        color="primary"
        size="64"
        class="mb-4"
      />
      <p class="text-h6">Loading technician details...</p>
    </VCard>

    <!-- Error State -->
    <VCard v-else-if="error" class="text-center py-8">
      <VIcon
        icon="tabler-alert-circle"
        size="64"
        color="error"
        class="mb-4"
      />
      <p class="text-h6 mb-2">Failed to load technician details</p>
      <p class="text-disabled mb-4">{{ error }}</p>
      <VBtn
        color="primary"
        prepend-icon="tabler-reload"
        @click="fetchTechnicianDetails"
      >
        Try Again
      </VBtn>
    </VCard>
 
    <!-- Main Content -->
    <div v-else>
      <VRow>
        <!-- Left Column - Technician Profile -->
        <VCol cols="12" md="4">
          <!-- Profile Card -->
          <VCard class="mb-6">
            <VCardText class="text-center pa-6">
              <VAvatar
                size="120"
                color="primary"
                variant="tonal"
                class="mb-4"
              >
                <VIcon icon="tabler-user" size="48" />
              </VAvatar>
              
              <h3 class="text-h5 mb-2">{{ user?.name || 'N/A' }}</h3>
              
              <VChip
                :color="technician?.active ? 'success' : 'error'"
                size="small"
                class="mb-4"
              >
                <VIcon
                  :icon="technician?.active ? 'tabler-circle-check' : 'tabler-circle-x'"
                  size="16"
                  class="me-1"
                />
                {{ technician?.active ? 'Active' : 'Inactive' }}
              </VChip>

              <VDivider class="my-4" />

              <!-- Contact Information -->
              <div class="text-left">
                <div class="d-flex align-center mb-3">
                  <VIcon icon="tabler-mail" size="20" class="me-3 text-disabled" />
                  <span>{{ user?.email || 'Not provided' }}</span>
                </div>
                
                <div class="d-flex align-center mb-3">
                  <VIcon icon="tabler-phone" size="20" class="me-3 text-disabled" />
                  <span>{{ technician?.phone || 'Not provided' }}</span>
                </div>
                
                <div class="d-flex align-center mb-3">
                  <VIcon icon="tabler-id" size="20" class="me-3 text-disabled" />
                  <span>{{ technician?.id_card_number || 'Not provided' }}</span>
                </div>
              </div>
            </VCardText>
          </VCard>

          <!-- Professional Details -->
          <VCard>
            <VCardTitle class="d-flex align-center">
              <VIcon icon="tabler-briefcase" class="me-2" />
              Professional Details
            </VCardTitle>
            <VCardText>
              <VList density="compact">
                <VListItem>
                  <VListItemTitle class="text-sm text-disabled">
                    Designation
                  </VListItemTitle>
                  <VListItemSubtitle class="text-base font-weight-medium">
                    {{ formatDesignation(technician?.designation) }}
                  </VListItemSubtitle>
                </VListItem>
                
                <VListItem>
                  <VListItemTitle class="text-sm text-disabled">
                    Specialization
                  </VListItemTitle>
                  <VListItemSubtitle class="text-base font-weight-medium">
                    {{ technician?.specialization || 'Not specified' }}
                  </VListItemSubtitle>
                </VListItem>
                
                <VListItem>
                  <VListItemTitle class="text-sm text-disabled">
                    Bank Details
                  </VListItemTitle>
                  <VListItemSubtitle>
                    <div v-if="technician?.bank_name">
                      {{ technician.bank_name }}<br>
                      {{ technician.account_number }}<br>
                      {{ technician.account_name }}
                    </div>
                    <span v-else class="text-disabled">Not provided</span>
                  </VListItemSubtitle>
                </VListItem>
              </VList>
            </VCardText>
          </VCard>
        </VCol>

        <!-- Right Column - Stats and Content -->
        <VCol cols="12" md="8">
          <!-- Summary Stats -->
          <VRow class="mb-6">
            <VCol cols="6" sm="3" v-for="stat in summaryStats" :key="stat.title">
              <SummaryCard
                :title="stat.title"
                :value="stat.value"
                :icon="stat.icon"
                :color="stat.color"
                :trend="stat.trend"
              />
            </VCol>
          </VRow>

          <!-- Assigned Sites Section -->
          <VCard class="mb-6">
            <VCardTitle class="d-flex align-center justify-space-between">
              <div class="d-flex align-center">
                <VIcon icon="tabler-map-pin" class="me-2" />
                Assigned Sites & Installations
              </div>
              <VBtn
                color="primary"
                size="small"
                prepend-icon="tabler-plus"
                @click="isAssignSiteDialogVisible = true"
              >
                Assign New Site
              </VBtn>
            </VCardTitle>
            <VCardText>
              <VTable v-if="assignedSites.length">
                <thead>
                  <tr>
                    <th>SITE NAME</th>
                    <th>LOCATION</th>
                    <th>STATUS</th>
                    <th>ASSIGNED DATE</th>
                    <th>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="site in assignedSites" :key="site.id">
                    <td>
                      <div class="d-flex align-center">
                        <VAvatar size="36" color="primary" variant="tonal" class="me-3">
                          <VIcon icon="tabler-building" size="18" />
                        </VAvatar>
                        <div>
                          <p class="text-base font-weight-medium mb-0">
                            {{ site.name }}
                          </p>
                          <p class="text-sm text-disabled mb-0">
                            {{ site.type }}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td>{{ site.location }}</td>
                    <td>
                      <VChip
                        :color="getStatusColor(site.status)"
                        size="small"
                      >
                        {{ site.status }}
                      </VChip>
                    </td>
                    <td>{{ formatDate(site.assigned_date) }}</td>
                    <td>
                      <div class="d-flex gap-1">
                        <VTooltip>
                          <template #activator="{ props }">
                            <VBtn
                              v-bind="props"
                              icon
                              size="small"
                              variant="text"
                              color="primary"
                              @click="viewSiteDetails(site.id)"
                            >
                              <VIcon icon="tabler-eye" size="18" />
                            </VBtn>
                          </template>
                          <span>View Details</span>
                        </VTooltip>
                        
                        <VTooltip>
                          <template #activator="{ props }">
                            <VBtn
                              v-bind="props"
                              icon
                              size="small"
                              variant="text"
                              color="error"
                              @click="unassignSite(site.id)"
                            >
                              <VIcon icon="tabler-trash" size="18" />
                            </VBtn>
                          </template>
                          <span>Unassign Site</span>
                        </VTooltip>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </VTable>
              
              <div v-else class="text-center py-8">
                <VIcon
                  icon="tabler-map-pin-off"
                  size="48"
                  color="disabled"
                  class="mb-2"
                />
                <p class="text-lg font-weight-medium">No sites assigned</p>
                <p class="text-disabled mb-4">This technician hasn't been assigned to any sites yet</p>
                <VBtn
                  color="primary"
                  prepend-icon="tabler-plus"
                  @click="isAssignSiteDialogVisible = true"
                >
                  Assign First Site
                </VBtn>
              </div>
            </VCardText>
          </VCard>

          <!-- Map Section -->
          <VCard class="mb-6">
            <VCardTitle class="d-flex align-center">
              <VIcon icon="tabler-map" class="me-2" />
              Site Locations
            </VCardTitle>
            <VCardText>
              <div id="technician-map" class="map-container"></div>
            </VCardText>
          </VCard>

          <!-- Recent Activity -->
          <VCard>
            <VCardTitle class="d-flex align-center">
              <VIcon icon="tabler-activity" class="me-2" />
              Recent Activity
            </VCardTitle>
            <VCardText>
              <VTimeline side="end" align="start" density="compact">
                <VTimelineItem
                  v-for="activity in recentActivities"
                  :key="activity.id"
                  :dot-color="getActivityColor(activity.type)"
                  size="small"
                >
                  <template #icon>
                    <VIcon :icon="getActivityIcon(activity.type)" size="16" />
                  </template>
                  
                  <div class="d-flex justify-space-between align-start mb-1">
                    <strong>{{ activity.title }}</strong>
                    <span class="text-sm text-disabled">{{ formatTime(activity.timestamp) }}</span>
                  </div>
                  <p class="text-sm mb-0">{{ activity.description }}</p>
                  <VChip
                    v-if="activity.site"
                    size="x-small"
                    color="primary"
                    variant="tonal"
                    class="mt-1"
                  >
                    {{ activity.site }}
                  </VChip>
                </VTimelineItem>
              </VTimeline>
            </VCardText>
          </VCard>
        </VCol>
      </VRow>

      <!-- Edit Technician Dialog -->
      <VDialog v-model="isEditDialogVisible" max-width="800">
        <VCard>
          <VCardTitle class="d-flex align-center">
            <VIcon icon="tabler-edit" class="me-2" />
            Edit Technician Details
          </VCardTitle>
          <VCardText>
         <TechnicianForm
        :technician-data="technician"
        :user-id="userIdFromUrl"
        @saved="handleTechnicianUpdated"
        @cancel="isEditDialogVisible = false"
      />
          </VCardText>
        </VCard>
      </VDialog>

      <!-- Assign Site Dialog -->
      <VDialog v-model="isAssignSiteDialogVisible" max-width="600">
        <VCard>
          <VCardTitle class="d-flex align-center">
            <VIcon icon="tabler-map-pin-plus" class="me-2" />
            Assign Site to Technician
          </VCardTitle>
          <VCardText>
            <AssignSiteForm
              :technician-id="technician?.user_id"
              @assigned="handleSiteAssigned"
              @cancel="isAssignSiteDialogVisible = false"
            />
          </VCardText>
        </VCard>
      </VDialog>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { toast } from 'vue3-toastify'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Import your axios instance
import api from '@/utils/axios'

// Components
import SummaryCard from '@/components/SummaryCard.vue'
import TechnicianForm from '@/components/TechnicianForm.vue'
import AssignSiteForm from '@/components/AssignSiteForm.vue'

const route = useRoute()
const router = useRouter()
const technicianId = route.params.id

// State
const technician = ref(null)
const user = ref(null)
const isEditDialogVisible = ref(false)
const isAssignSiteDialogVisible = ref(false)
const loading = ref(false)
const error = ref(null)

// Mock data - replace with API calls
const assignedSites = ref([
  {
    id: 1,
    name: 'Lagos General Hospital',
    type: 'Hospital',
    location: 'Lagos, Nigeria',
    status: 'In Progress',
    assigned_date: '2025-09-15',
    coordinates: [6.5244, 3.3792]
  },
  {
    id: 2,
    name: 'Ibadan Health Center',
    type: 'Clinic',
    location: 'Ibadan, Nigeria',
    status: 'Completed',
    assigned_date: '2025-09-10',
    coordinates: [7.3775, 3.9470]
  }
])

const recentActivities = ref([
  {
    id: 1,
    type: 'assignment',
    title: 'Site Assigned',
    description: 'Assigned to Lagos General Hospital installation',
    site: 'Lagos General Hospital',
    timestamp: new Date('2025-09-15T09:00:00')
  },
  {
    id: 2,
    type: 'completion',
    title: 'Installation Completed',
    description: 'Successfully completed solar panel installation',
    site: 'Ibadan Health Center',
    timestamp: new Date('2025-09-14T16:30:00')
  },
  {
    id: 3,
    type: 'maintenance',
    title: 'Maintenance Check',
    description: 'Routine maintenance check performed',
    site: 'Ibadan Health Center',
    timestamp: new Date('2025-09-12T11:15:00')
  }
])

// Computed
const summaryStats = computed(() => [
  {
    title: 'Total Sites',
    value: assignedSites.value.length,
    icon: 'tabler-building',
    color: 'primary',
    trend: '+2'
  },
  {
    title: 'Completed',
    value: assignedSites.value.filter(site => site.status === 'Completed').length,
    icon: 'tabler-check',
    color: 'success',
    trend: '+1'
  },
  {
    title: 'In Progress',
    value: assignedSites.value.filter(site => site.status === 'In Progress').length,
    icon: 'tabler-clock',
    color: 'warning',
    trend: '0'
  },
  {
    title: 'Pending',
    value: assignedSites.value.filter(site => site.status === 'Pending').length,
    icon: 'tabler-hourglass',
    color: 'info',
    trend: '+1'
  }
])


// Compute userId from URL
const userIdFromUrl = computed(() => {
  const userId = route.params.id
  console.log('Extracted userId from URL:', userId)
  return userId
})

// Methods
const fetchTechnicianDetails = async () => {
  loading.value = true
  error.value = null
  try {
    const response = await api.get(`/technician-user-data/${technicianId}`)
    const data = response.data

    if (data.success) {
      user.value = data.user
      // If you need the technician data separately, you might need another endpoint
      // For now, we'll assume the user data contains what we need
      technician.value = data.technician
      console.log('Fetched technician data:', technician.value)
    } else {
      throw new Error(data.message || 'Failed to load technician data')
    }
  } catch (err) {
    error.value = err.response?.data?.message || err.message
    toast.error('Failed to load technician details')
    console.error('Error fetching technician:', err)
  } finally {
    loading.value = false
  }
}

const formatDesignation = (designation) => {
  const designations = {
    team_lead: 'Team Lead',
    technician: 'Technician',
    helper: 'Helper',
    adhoc: 'Adhoc'
  }
  return designations[designation] || designation
}

const getStatusColor = (status) => {
  const colors = {
    'Completed': 'success',
    'In Progress': 'warning',
    'Pending': 'info',
    'Cancelled': 'error'
  }
  return colors[status] || 'secondary'
}

const getActivityColor = (type) => {
  const colors = {
    assignment: 'primary',
    completion: 'success',
    maintenance: 'info',
    issue: 'error'
  }
  return colors[type] || 'secondary'
}

const getActivityIcon = (type) => {
  const icons = {
    assignment: 'tabler-map-pin',
    completion: 'tabler-check',
    maintenance: 'tabler-tool',
    issue: 'tabler-alert-triangle'
  }
  return icons[type] || 'tabler-circle'
}

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const formatTime = (timestamp) => {
  return new Date(timestamp).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

const viewSiteDetails = (siteId) => {
  router.push(`/sites/${siteId}`)
}

const unassignSite = async (siteId) => {
  if (confirm('Are you sure you want to unassign this site?')) {
    try {
      // API call to unassign site
      assignedSites.value = assignedSites.value.filter(site => site.id !== siteId)
      toast.success('Site unassigned successfully')
    } catch (error) {
      toast.error('Failed to unassign site')
    }
  }
}

const handleTechnicianUpdated = (updatedTechnician) => {
  technician.value = { ...technician.value, ...updatedTechnician }
  isEditDialogVisible.value = false
  toast.success('Technician details updated successfully')
}

const handleSiteAssigned = (newSite) => {
  assignedSites.value.push(newSite)
  isAssignSiteDialogVisible.value = false
  toast.success('Site assigned successfully')
}

// Initialize map
const initializeMap = () => {
  const mapElement = document.getElementById('technician-map')
  if (!mapElement) return

  const map = L.map('technician-map').setView([7.5, 4.0], 6)
  
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: '© OpenStreetMap contributors'
  }).addTo(map)

  // Add markers for assigned sites
  assignedSites.value.forEach(site => {
    if (site.coordinates) {
      L.marker(site.coordinates)
        .addTo(map)
        .bindPopup(`
          <div class="text-center">
            <strong>${site.name}</strong><br>
            ${site.type}<br>
            <span style="color: ${getStatusColor(site.status)}">${site.status}</span>
          </div>
        `)
    }
  })
}

// Lifecycle
onMounted(() => {
  fetchTechnicianDetails()
  // Initialize map after a short delay to ensure DOM is ready
  setTimeout(initializeMap, 300)
})
</script>

<style scoped>
.map-container {
  height: 300px;
  border-radius: 8px;
  overflow: hidden;
}

:deep(.leaflet-popup-content) {
  margin: 8px 12px;
}

:deep(.leaflet-popup-content-wrapper) {
  border-radius: 8px;
}
</style>
