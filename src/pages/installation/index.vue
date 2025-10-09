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
            prepend-icon="tabler-download"
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
        <VCard class="stat-card" @click="filterByStatus(null)" style="cursor: pointer;">
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
        <VCard class="stat-card" @click="filterByStatus(true)" style="cursor: pointer;">
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
        <VCard class="stat-card" @click="filterByStatus(false)" style="cursor: pointer;">
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
              :items="pageSizeOptions"
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
      <VCardText class="pa-0">
        <!-- Table Header with Row Count -->
        <div class="d-flex justify-space-between align-center pa-4 border-b">
          <div class="text-body-1 font-weight-medium">
            Showing {{ installations.from || 0 }} to {{ installations.to || 0 }} of {{ installations.total || 0 }} entries
          </div>
          <div class="d-flex align-center gap-2">
            <VBtn
              icon
              variant="text"
              size="small"
              :disabled="filters.per_page <= 10"
              @click="decreasePageSize"
            >
              <VIcon icon="tabler-chevron-left" />
              <VTooltip activator="parent" location="top">Show fewer rows</VTooltip>
            </VBtn>
            
            <span class="text-caption">Show: {{ filters.per_page }}</span>
            
            <VBtn
              icon
              variant="text"
              size="small"
              :disabled="filters.per_page >= 100"
              @click="increasePageSize"
            >
              <VIcon icon="tabler-chevron-right" />
              <VTooltip activator="parent" location="top">Show more rows</VTooltip>
            </VBtn>
          </div>
        </div>

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
                <VBtn
                  variant="tonal"
                  class="mt-2"
                  @click="clearFilters"
                >
                  Clear Filters
                </VBtn>
              </td>
            </tr>

            <tr
              v-else
              v-for="installation in installations.data"
              :key="installation.id"
              class="installation-row"
              @click="goToInstallationDetail(installation.id)"
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
                    <div class="font-weight-medium text-primary">{{ installation.facility?.name }}</div>
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
                  @click.stop="toggleVerification(installation)"
                  style="cursor: pointer;"
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
                    @click.stop="goToInstallationDetail(installation.id)"
                  >
                    <VIcon icon="tabler-eye" size="20" />
                    <VTooltip activator="parent" location="top">View Details</VTooltip>
                  </VBtn>

                  <VBtn
                    icon
                    variant="text"
                    size="small"
                    :color="installation.verified_by_health_officer ? 'warning' : 'success'"
                    @click.stop="toggleVerification(installation)"
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
        <VRow v-if="installations.data.length > 0" class="mt-4 pa-4 border-t">
          <VCol cols="12" class="d-flex justify-space-between align-center">
            <div class="text-caption text-medium-emphasis">
              Page {{ installations.current_page }} of {{ installations.last_page }}
            </div>
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
  </VContainer>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import installationService from '@/services/installationService'
// import { states, verificationOptions } from '@/util/states'

const router = useRouter()

// Reactive data
const loading = ref(false)
const installations = ref({ data: [] })
const statistics = ref({})

// Page size options - starting with 25 as default
const pageSizeOptions = ref([
  { title: '10 rows', value: 10 },
  { title: '25 rows', value: 25 },
  { title: '50 rows', value: 50 },
  { title: '100 rows', value: 100 },
  { title: 'All', value: 1000 }
])

// Filters - default to 25 rows per page
const filters = ref({
  search: '',
  state_id: null,
  verified: null,
  page: 1,
  per_page: 25
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

// Watch for page size changes
watch(() => filters.value.per_page, () => {
  filters.value.page = 1
  fetchInstallations()
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

const goToInstallationDetail = (installationId) => {
  router.push(`/installation/${installationId}`)
}

const toggleVerification = async (installation) => {
  try {
    const newStatus = !installation.verified_by_health_officer
    await installationService.updateVerification(installation.id, newStatus)
    
    // Update local state
    installation.verified_by_health_officer = newStatus
    
    // Refresh statistics
    fetchStatistics()
  } catch (error) {
    console.error('Error updating verification:', error)
  }
}

const filterByStatus = (status) => {
  filters.value.verified = status
  filters.value.page = 1
  fetchInstallations()
}

const clearFilters = () => {
  filters.value = {
    search: '',
    state_id: null,
    verified: null,
    page: 1,
    per_page: 25
  }
  fetchInstallations()
}

const clearSearch = () => {
  filters.value.search = ''
  fetchInstallations()
}

const increasePageSize = () => {
  const currentIndex = pageSizeOptions.value.findIndex(opt => opt.value === filters.value.per_page)
  if (currentIndex < pageSizeOptions.value.length - 1) {
    filters.value.per_page = pageSizeOptions.value[currentIndex + 1].value
  }
}

const decreasePageSize = () => {
  const currentIndex = pageSizeOptions.value.findIndex(opt => opt.value === filters.value.per_page)
  if (currentIndex > 0) {
    filters.value.per_page = pageSizeOptions.value[currentIndex - 1].value
  }
}

const exportData = async () => {
  try {
    const response = await installationService.exportInstallations(filters.value)
    if (response.success) {
      console.log('Export data:', response.data)
    }
  } catch (error) {
    console.error('Error exporting data:', error)
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

.installation-row {
  cursor: pointer;
  transition: all 0.2s ease;
}

.installation-row:hover {
  background-color: rgba(var(--v-theme-primary), 0.04);
  transform: translateX(2px);
}

.installation-row:active {
  background-color: rgba(var(--v-theme-primary), 0.08);
}

.border-b {
  border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.border-t {
  border-top: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}
</style>
