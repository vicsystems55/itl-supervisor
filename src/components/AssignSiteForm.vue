<template>
  <div>
    <!-- Filters -->
    <VCard class="mb-4">
      <VCardText>
        <VRow>
          <VCol cols="12" md="4">
            <AppSelect
              v-model="filters.state_id"
              :items="states"
              item-title="name"
              item-value="id"
              label="Filter by State"
              placeholder="All States"
              clearable
              @update:model-value="fetchInstallations"
            />
          </VCol>
          <VCol cols="12" md="4">
            <AppSelect
              v-model="filters.lga_id"
              :items="lgas"
              item-title="name"
              item-value="id"
              label="Filter by LGA"
              placeholder="All LGAs"
              clearable
              @update:model-value="fetchInstallations"
            />
          </VCol>
          <VCol cols="12" md="4">
            <AppSelect
              v-model="filters.verified"
              :items="verificationStatuses"
              item-title="text"
              item-value="value"
              label="Verification Status"
              placeholder="All Statuses"
              clearable
              @update:model-value="fetchInstallations"
            />
          </VCol>
        </VRow>
      </VCardText>
    </VCard>

    <!-- Installations List -->
    <VCard>
      <VCardTitle class="d-flex align-center justify-space-between">
        <div class="d-flex align-center">
          <VIcon icon="tabler-list" class="me-2" />
          Installations ({{ installations.length }})
          <VChip v-if="selectedInstallations.length > 0" color="primary" size="small" class="ms-2">
            {{ selectedInstallations.length }} selected
          </VChip>
        </div>
        <VBtn
          color="primary"
          prepend-icon="tabler-check"
          :loading="updating"
          :disabled="selectedInstallations.length === 0"
          @click="updateSelectedInstallations"
        >
          Update Selected
        </VBtn>
      </VCardTitle>
      
      <VCardText>
        <VTable density="compact">
          <thead>
            <tr>
              <th width="50">
                <VCheckbox
                  :model-value="allSelected"
                  @update:model-value="toggleSelectAll"
                />
              </th>
              <th>FACILITY NAME</th>
              <th>LGA</th>
              <th>STATE</th>
            
              <th>STATUS</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="installation in installations" :key="installation.id">
              <td>
                <VCheckbox
                  :model-value="selectedInstallations.includes(installation.id)"
                  @update:model-value="toggleInstallationSelection(installation.id)"
                />
              </td>
              <td>
                <div class="d-flex align-center">
                  <VAvatar size="32" color="primary" variant="tonal" class="me-2">
                    <VIcon icon="tabler-building" size="16" />
                  </VAvatar>
                  <div>
                    <p class="text-sm font-weight-medium mb-0">
                      {{ installation.facility?.name || 'N/A' }}
                    </p>
                    <p class="text-xs text-disabled mb-0">
                      {{ installation.facility?.location || 'No location' }}
                    </p>
                  </div>
                </div>
              </td>
              <td>
                <span class="text-sm">
                  {{ installation.facility?.lga?.name || 'N/A' }}
                </span>
              </td>
              <td>
                <span class="text-sm">
                  {{ installation.facility?.state?.name || 'N/A' }}
                </span>
              </td>
            
              <td>
                <VChip
                  :color="getInstallationStatusColor(installation.status)"
                  size="small"
                >
                  {{ formatStatus(installation.status) }}
                </VChip>
              </td>
            </tr>
          </tbody>
        </VTable>

        <!-- Pagination -->
        <div class="d-flex justify-center mt-4" v-if="pagination.total > 0">
          <VPagination
            v-model="pagination.current_page"
            :length="pagination.last_page"
            :total-visible="7"
            @update:model-value="handlePageChange"
          />
        </div>

        <!-- Empty State -->
        <div v-if="installations.length === 0 && !loading" class="text-center py-8">
          <VIcon icon="tabler-package-off" size="48" class="text-disabled mb-2" />
          <p class="text-disabled">No installations found</p>
          <VBtn variant="tonal" color="primary" @click="fetchInstallations" class="mt-2">
            <VIcon icon="tabler-refresh" class="me-2" />
            Refresh
          </VBtn>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="text-center py-8">
          <VProgressCircular
            indeterminate
            color="primary"
          />
          <p class="mt-2 text-disabled">Loading installations...</p>
        </div>
      </VCardText>
    </VCard>

    <!-- Update Dialog -->
    <VDialog v-model="showUpdateDialog" max-width="500">
      <VCard>
        <VCardTitle class="d-flex align-center">
          <VIcon icon="tabler-edit" class="me-2" />
          Update {{ selectedInstallations.length }} Installation(s)
        </VCardTitle>
        <VCardText>
          <VForm @submit.prevent="confirmUpdate">
            <VRow>
              <VCol cols="12">
                <AppSelect
                  v-model="updateData.verified_by_health_officer"
                  :items="verificationOptions"
                  item-title="text"
                  item-value="value"
                  label="Verification Status"
                  placeholder="Select verification status"
                  clearable
                />
              </VCol>
              <VCol cols="12">
                <AppSelect
                  v-model="updateData.status"
                  :items="statusOptions"
                  item-title="text"
                  item-value="value"
                  label="Installation Status"
                  placeholder="Select status"
                  clearable
                />
              </VCol>
              <VCol cols="12">
                <AppTextField
                  v-model="updateData.remarks"
                  label="Remarks (Optional)"
                  placeholder="Enter update remarks..."
                  prepend-inner-icon="tabler-notes"
                  rows="2"
                  multiline
                />
              </VCol>
            </VRow>
          </VForm>
        </VCardText>
        <VCardActions>
          <VSpacer />
          <VBtn
            variant="tonal"
            color="secondary"
            @click="showUpdateDialog = false"
            :disabled="updating"
          >
            Cancel
          </VBtn>
          <VBtn
            color="primary"
            :loading="updating"
            @click="confirmUpdate"
            :disabled="!updateData.verified_by_health_officer && !updateData.status"
          >
            Update
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { toast } from 'vue3-toastify'
import api from '@/utils/axios' // Import your axios instance

// State
const loading = ref(false)
const updating = ref(false)
const showUpdateDialog = ref(false)

const installations = ref([])
const selectedInstallations = ref([])
const states = ref([])
const lgas = ref([])

const props = defineProps({

  technicianId: {
    type: [String, Number],
    default: null
  }
})

const filters = ref({
  state_id: null,
  lga_id: null,
  verified: null
})

const pagination = ref({
  current_page: 1,
  last_page: 1,
  per_page: 15,
  total: 0
})

const updateData = ref({
  verified_by_health_officer: null,
  status: '',
  remarks: ''
})

// Constants
const verificationStatuses = [
  { text: 'Verified', value: true },
  { text: 'Not Verified', value: false }
]

const verificationOptions = [
  { text: 'Verified', value: true },
  { text: 'Not Verified', value: false }
]

const statusOptions = [
  { text: 'Assigned', value: 'assigned' },
  { text: 'In Progress', value: 'in_progress' },
  { text: 'Completed', value: 'completed' },
  { text: 'Cancelled', value: 'cancelled' },
  { text: 'On Hold', value: 'on_hold' }
]

// Computed
const allSelected = computed(() => {
  return installations.value.length > 0 && 
         selectedInstallations.value.length === installations.value.length
})

// Methods
const fetchInstallations = async (page = 1) => {
  loading.value = true
  try {
    const params = {
      page: page,
      per_page: pagination.value.per_page,
      ...filters.value
    }

    // Remove null/undefined filters
    Object.keys(params).forEach(key => {
      if (!params[key]) {
        delete params[key]
      }
    })

    const response = await api.get('/installations', { params })
    
    if (response.data.success) {
      installations.value = response.data.data.data
      pagination.value = {
        current_page: response.data.data.current_page,
        last_page: response.data.data.last_page,
        per_page: response.data.data.per_page,
        total: response.data.data.total
      }
    } else {
      throw new Error(response.data.message)
    }
  } catch (error) {
    console.error('Error fetching installations:', error)
    toast.error('Failed to load installations')
    installations.value = []
  } finally {
    loading.value = false
  }
}

const fetchStatesAndLGAs = async () => {
  try {
    // You might want to fetch these from your backend as well
    // For now using mock data
    states.value = [
      { id: 1, name: 'Lagos State' },
      { id: 2, name: 'Oyo State' },
      { id: 3, name: 'Abuja FCT' }
    ]

    lgas.value = [
      { id: 1, name: 'Lagos Island', state_id: 1 },
      { id: 2, name: 'Ikeja', state_id: 1 },
      { id: 3, name: 'Ibadan North', state_id: 2 },
      { id: 4, name: 'Garki', state_id: 3 }
    ]
  } catch (error) {
    console.error('Error fetching states and LGAs:', error)
  }
}

const toggleInstallationSelection = (installationId) => {
  const index = selectedInstallations.value.indexOf(installationId)
  if (index > -1) {
    selectedInstallations.value.splice(index, 1)
  } else {
    selectedInstallations.value.push(installationId)
  }
}

const toggleSelectAll = () => {
  if (allSelected.value) {
    selectedInstallations.value = []
  } else {
    selectedInstallations.value = installations.value.map(inst => inst.id)
  }
}

const updateSelectedInstallations = () => {
  // Reset update data
  updateData.value = {
    verified_by_health_officer: null,
    status: '',
    remarks: ''
  }
  showUpdateDialog.value = true
}

const confirmUpdate = async () => {
  if (!updateData.value.verified_by_health_officer && !updateData.value.status) {
    toast.error('Please select at least one field to update')
    return
  }

  updating.value = true
  try {
    const payload = {
      installation_ids: selectedInstallations.value,
      user_id: props.technicianId,
      ...updateData.value
    }

    // Remove null values
    Object.keys(payload).forEach(key => {
      if (payload[key] === null || payload[key] === '') {
        delete payload[key]
      }
    })

    const response = await api.post('/installation-assignments/bulk-assign', payload)

    if (response.data.success) {
      toast.success(`Successfully updated ${selectedInstallations.value.length} installation(s)`)
      showUpdateDialog.value = false
      selectedInstallations.value = []
      fetchInstallations(pagination.value.current_page)
    } else {
      throw new Error(response.data.message)
    }
  } catch (error) {
    console.error('Error updating installations:', error)
    toast.error('Failed to update installations')
  } finally {
    updating.value = false
  }
}

const handlePageChange = (page) => {
  pagination.value.current_page = page
  fetchInstallations(page)
}

const getInstallationStatusColor = (status) => {
  const colors = {
    'assigned': 'primary',
    'in_progress': 'warning',
    'completed': 'success',
    'cancelled': 'error',
    'on_hold': 'info'
  }
  return colors[status] || 'secondary'
}

const formatStatus = (status) => {
  const statusMap = {
    'assigned': 'Assigned',
    'in_progress': 'In Progress',
    'completed': 'Completed',
    'cancelled': 'Cancelled',
    'on_hold': 'On Hold'
  }
  return statusMap[status] || status
}

// Lifecycle
onMounted(() => {
  fetchInstallations()
  fetchStatesAndLGAs()
})
</script>

<style scoped>
:deep(.v-data-table) {
  border-radius: 8px;
}

:deep(.v-data-table thead th) {
  background-color: rgb(var(--v-theme-surface));
  font-weight: 600;
}
</style>
