<template>
  <VContainer fluid class="pa-6">
    <!-- Header Section -->
    <VRow class="mb-6">
      <VCol cols="12">
        <div class="d-flex justify-space-between align-center">
          <div>
            <h1 class="text-h4 font-weight-bold text-primary">Installations</h1>
            <p class="text-body-1 text-medium-emphasis">Manage and monitor equipment installations</p>
          </div>
          <VBtn
            color="primary"
            prepend-icon="tabler-plus"
            @click="exportData"
          >
            Export Data
          </VBtn>
        </div>
      </VCol>
    </VRow>

    <!-- Statistics Cards -->
    <VRow class="mb-6">
      <VCol cols="12" sm="6" md="3">
        <VCard class="stat-card">
          <VCardText class="d-flex align-center">
            <VAvatar
              color="primary"
              variant="tonal"
              class="me-4"
            >
              <VIcon icon="tabler-package" />
            </VAvatar>
            <div>
              <div class="text-h6 font-weight-semibold">{{ statistics.total_installations || 0 }}</div>
              <div class="text-caption text-medium-emphasis">Total Installations</div>
            </div>
          </VCardText>
        </VCard>
      </VCol>

      <VCol cols="12" sm="6" md="3">
        <VCard class="stat-card">
          <VCardText class="d-flex align-center">
            <VAvatar
              color="success"
              variant="tonal"
              class="me-4"
            >
              <VIcon icon="tabler-check" />
            </VAvatar>
            <div>
              <div class="text-h6 font-weight-semibold">{{ statistics.verified_installations || 0 }}</div>
              <div class="text-caption text-medium-emphasis">Verified</div>
            </div>
          </VCardText>
        </VCard>
      </VCol>

      <VCol cols="12" sm="6" md="3">
        <VCard class="stat-card">
          <VCardText class="d-flex align-center">
            <VAvatar
              color="warning"
              variant="tonal"
              class="me-4"
            >
              <VIcon icon="tabler-clock" />
            </VAvatar>
            <div>
              <div class="text-h6 font-weight-semibold">{{ statistics.pending_verification || 0 }}</div>
              <div class="text-caption text-medium-emphasis">Pending Verification</div>
            </div>
          </VCardText>
        </VCard>
      </VCol>

      <VCol cols="12" sm="6" md="3">
        <VCard class="stat-card">
          <VCardText class="d-flex align-center">
            <VAvatar
              color="info"
              variant="tonal"
              class="me-4"
            >
              <VIcon icon="tabler-calendar" />
            </VAvatar>
            <div>
              <div class="text-h6 font-weight-semibold">{{ statistics.installations_this_month || 0 }}</div>
              <div class="text-caption text-medium-emphasis">This Month</div>
            </div>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>

    <!-- Filters Section -->
    <VCard class="mb-6">
      <VCardText>
        <VRow>
          <VCol cols="12" sm="6" md="3">
            <AppTextField
              v-model="filters.search"
              label="Search"
              placeholder="Search installations..."
              prepend-inner-icon="tabler-search"
              clearable
              @click:clear="clearSearch"
            />
          </VCol>

          <VCol cols="12" sm="6" md="3">
            <AppSelect
              v-model="filters.state_id"
              :items="states"
              label="State"
              placeholder="Select State"
              clearable
            />
          </VCol>

          <VCol cols="12" sm="6" md="3">
            <AppSelect
              v-model="filters.verified"
              :items="verificationOptions"
              label="Verification Status"
              clearable
            />
          </VCol>

          <VCol cols="12" sm="6" md="3">
            <AppSelect
              v-model="filters.per_page"
              :items="[10, 25, 50, 100]"
              label="Items per page"
            />
          </VCol>
        </VRow>

        <VRow class="mt-2">
          <VCol cols="12" class="d-flex gap-4">
            <VBtn
              color="primary"
              @click="fetchInstallations"
              :loading="loading"
            >
              <VIcon icon="tabler-filter" class="me-2" />
              Apply Filters
            </VBtn>

            <VBtn
              variant="tonal"
              @click="clearFilters"
            >
              <VIcon icon="tabler-rotate-2" class="me-2" />
              Clear Filters
            </VBtn>
          </VCol>
        </VRow>
      </VCardText>
    </VCard>

    <!-- Installations Table -->
    <VCard>
      <VCardText>
        <VTable class="installation-table">
          <thead>
            <tr>
              <th class="text-left">Facility</th>
              <th class="text-left">State</th>
              <th class="text-left">LGA</th>
              <th class="text-left">Supplier</th>
              <th class="text-left">Model</th>
              <th class="text-left">Health Officer</th>
              <th class="text-left">Status</th>
              <th class="text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="8" class="text-center py-8">
                <VProgressCircular
                  indeterminate
                  color="primary"
                />
                <div class="text-body-2 mt-2">Loading installations...</div>
              </td>
            </tr>

            <tr v-else-if="installations.data.length === 0">
              <td colspan="8" class="text-center py-8">
                <VIcon icon="tabler-package-off" size="48" class="text-medium-emphasis mb-2" />
                <div class="text-body-1 text-medium-emphasis">No installations found</div>
              </td>
            </tr>

            <tr
              v-else
              v-for="installation in installations.data"
              :key="installation.id"
              class="installation-row"
            >
              <td>
                <div class="d-flex align-center">
                  <VAvatar
                    size="36"
                    color="primary"
                    variant="tonal"
                    class="me-3"
                  >
                    <VIcon icon="tabler-building" />
                  </VAvatar>
                  <div>
                    <div class="font-weight-medium">{{ installation.facility?.name }}</div>
                    <div class="text-caption text-medium-emphasis">
                      {{ installation.facility?.address }}
                    </div>
                  </div>
                </div>
              </td>
              <td>
                <VChip
                  v-if="installation.facility?.state"
                  variant="tonal"
                  color="primary"
                  size="small"
                >
                  {{ installation.facility.state.name }}
                </VChip>
              </td>
              <td>
                <span class="text-body-2">{{ installation.facility?.lga?.name }}</span>
              </td>
              <td>
                <div class="d-flex align-center">
                  <VIcon icon="tabler-truck" class="me-2 text-success" size="18" />
                  <span class="font-weight-medium">{{ installation.supplier }}</span>
                </div>
              </td>
              <td>
                <VChip
                  variant="outlined"
                  size="small"
                >
                  {{ installation.product_model }}
                </VChip>
              </td>
              <td>
                <div v-if="installation.health_officer" class="d-flex align-center">
                  <VAvatar
                    size="28"
                    color="secondary"
                    variant="tonal"
                    class="me-2"
                  >
                    <VIcon icon="tabler-user" size="16" />
                  </VAvatar>
                  <span class="text-body-2">{{ installation.health_officer.name }}</span>
                </div>
                <span v-else class="text-caption text-medium-emphasis">Not assigned</span>
              </td>
              <td>
                <VChip
                  :color="installation.verified_by_health_officer ? 'success' : 'warning'"
                  variant="flat"
                  size="small"
                >
                  <VIcon
                    :icon="installation.verified_by_health_officer ? 'tabler-check' : 'tabler-clock'"
                    class="me-1"
                    size="16"
                  />
                  {{ installation.verified_by_health_officer ? 'Verified' : 'Pending' }}
                </VChip>
              </td>
              <td>
                <div class="d-flex gap-2">
                  <VBtn
                    icon
                    variant="text"
                    size="small"
                    color="primary"
                    @click="viewInstallation(installation)"
                  >
                    <VIcon icon="tabler-eye" size="20" />
                    <VTooltip activator="parent" location="top">View Details</VTooltip>
                  </VBtn>

                  <VBtn
                    icon
                    variant="text"
                    size="small"
                    :color="installation.verified_by_health_officer ? 'warning' : 'success'"
                    @click="toggleVerification(installation)"
                  >
                    <VIcon
                      :icon="installation.verified_by_health_officer ? 'tabler-x' : 'tabler-check'"
                      size="20"
                    />
                    <VTooltip activator="parent" location="top">
                      {{ installation.verified_by_health_officer ? 'Unverify' : 'Verify' }}
                    </VTooltip>
                  </VBtn>
                </div>
              </td>
            </tr>
          </tbody>
        </VTable>

        <!-- Pagination -->
        <VRow v-if="installations.data.length > 0" class="mt-4">
          <VCol cols="12" class="d-flex justify-center">
            <VPagination
              v-model="filters.page"
              :length="installations.last_page"
              :total-visible="7"
              @update:model-value="fetchInstallations"
            />
          </VCol>
        </VRow>
      </VCardText>
    </VCard>

    <!-- Installation Details Dialog -->
    <VDialog
      v-model="showDetailsDialog"
      max-width="600"
    >
      <VCard v-if="selectedInstallation">
        <VCardTitle class="d-flex justify-space-between align-center">
          <span>Installation Details</span>
          <VBtn
            icon
            variant="text"
            @click="showDetailsDialog = false"
          >
            <VIcon icon="tabler-x" />
          </VBtn>
        </VCardTitle>

        <VCardText>
          <VRow>
            <VCol cols="12" sm="6">
              <div class="detail-item">
                <label class="text-caption text-medium-emphasis">Facility</label>
                <div class="text-body-1 font-weight-medium">
                  {{ selectedInstallation.facility?.name }}
                </div>
              </div>
            </VCol>
            <VCol cols="12" sm="6">
              <div class="detail-item">
                <label class="text-caption text-medium-emphasis">State/LGA</label>
                <div class="text-body-1">
                  {{ selectedInstallation.facility?.state?.name }} / {{ selectedInstallation.facility?.lga?.name }}
                </div>
              </div>
            </VCol>
            <VCol cols="12" sm="6">
              <div class="detail-item">
                <label class="text-caption text-medium-emphasis">Supplier</label>
                <div class="text-body-1">{{ selectedInstallation.supplier }}</div>
              </div>
            </VCol>
            <VCol cols="12" sm="6">
              <div class="detail-item">
                <label class="text-caption text-medium-emphasis">Product Model</label>
                <div class="text-body-1">{{ selectedInstallation.product_model }}</div>
              </div>
            </VCol>
            <VCol cols="12" sm="6">
              <div class="detail-item">
                <label class="text-caption text-medium-emphasis">Health Officer</label>
                <div class="text-body-1">
                  {{ selectedInstallation.health_officer?.name || 'Not assigned' }}
                </div>
              </div>
            </VCol>
            <VCol cols="12" sm="6">
              <div class="detail-item">
                <label class="text-caption text-medium-emphasis">Verification Status</label>
                <div>
                  <VChip
                    :color="selectedInstallation.verified_by_health_officer ? 'success' : 'warning'"
                    size="small"
                  >
                    {{ selectedInstallation.verified_by_health_officer ? 'Verified' : 'Pending' }}
                  </VChip>
                </div>
              </div>
            </VCol>
            <VCol cols="12" v-if="selectedInstallation.remarks">
              <div class="detail-item">
                <label class="text-caption text-medium-emphasis">Remarks</label>
                <div class="text-body-1">{{ selectedInstallation.remarks }}</div>
              </div>
            </VCol>
          </VRow>
        </VCardText>
      </VCard>
    </VDialog>
  </VContainer>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import installationService from '@/services/installationService'
import { states, verificationOptions } from '@/util/states'

// Reactive data
const loading = ref(false)
const installations = ref({ data: [] })
const statistics = ref({})
const showDetailsDialog = ref(false)
const selectedInstallation = ref(null)

// Filters
const filters = ref({
  search: '',
  state_id: null,
  verified: null,
  page: 1,
  per_page: 10
})

// Watch for filter changes and debounce search
let searchTimeout
watch(() => filters.value.search, (newSearch) => {
  clearTimeout(searchTimeout)
  if (newSearch !== null) {
    searchTimeout = setTimeout(() => {
      filters.value.page = 1
      fetchInstallations()
    }, 500)
  }
})

// Methods
const fetchInstallations = async () => {
  loading.value = true
  try {
    const response = await installationService.getInstallations(filters.value)
    if (response.success) {
      installations.value = response.data
    }
  } catch (error) {
    console.error('Error fetching installations:', error)
    // You can add a toast notification here
  } finally {
    loading.value = false
  }
}

const fetchStatistics = async () => {
  try {
    const response = await installationService.getDashboardSummary()
    if (response.success) {
      statistics.value = response.data
    }
  } catch (error) {
    console.error('Error fetching statistics:', error)
  }
}

const viewInstallation = (installation) => {
  selectedInstallation.value = installation
  showDetailsDialog.value = true
}

const toggleVerification = async (installation) => {
  try {
    const newStatus = !installation.verified_by_health_officer
    await installationService.updateVerification(installation.id, newStatus)
    
    // Update local state
    installation.verified_by_health_officer = newStatus
    
    // You can add a success toast here
    console.log(`Installation ${newStatus ? 'verified' : 'unverified'} successfully`)
  } catch (error) {
    console.error('Error updating verification:', error)
    // You can add an error toast here
  }
}

const clearFilters = () => {
  filters.value = {
    search: '',
    state_id: null,
    verified: null,
    page: 1,
    per_page: 10
  }
  fetchInstallations()
}

const clearSearch = () => {
  filters.value.search = ''
  fetchInstallations()
}

const exportData = async () => {
  try {
    const response = await installationService.exportInstallations(filters.value)
    if (response.success) {
      // You can implement download logic here
      console.log('Export data:', response.data)
      // Add toast notification for success
    }
  } catch (error) {
    console.error('Error exporting data:', error)
    // Add toast notification for error
  }
}

// Lifecycle
onMounted(() => {
  fetchInstallations()
  fetchStatistics()
})
</script>

<style scoped>
.stat-card {
  transition: all 0.3s ease;
  cursor: pointer;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.installation-table {
  width: 100%;
}

.installation-row:hover {
  background-color: rgba(var(--v-theme-primary), 0.04);
}

.detail-item {
  margin-bottom: 16px;
}

.detail-item label {
  display: block;
  margin-bottom: 4px;
}
</style>
