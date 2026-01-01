<template>
  <VContainer fluid class="pa-1">
    <!-- Header Section -->
    <VRow class="mb-6">
      <VCol cols="12">
        <div class="d-flex justify-space-between align-center">
          <div>
            <h1 class="text-h4 font-weight-bold text-primary">Installations</h1>
            <p class="text-body-1 text-medium-emphasis">
              Manage and monitor equipment installations
            </p>
          </div>
          <!-- Export ALL data -->
          <SimpleExportButton
            :filters="currentFilters"
            button-text="Export All Data"
            tooltip="Export ALL installations with current filters"
            @export-success="handleAllExportSuccess"
          />

          <VBtn
            color="primary"
            variant="elevated"
            class="ms-3"
            @click="exportLccoDetails"
            :loading="isExportingLcco"
          >
            <VIcon icon="tabler-file-export" class="me-2" />
            Export LCCO Details
          </VBtn>

          <VBtn
            color="secondary"
            variant="elevated"
            class="ms-3"
            @click="exportInstallationsWithLcco"
            :loading="isExportingInstallationsWithLcco"
          >
            <VIcon icon="tabler-file-export" class="me-2" />
            Export Installations (with LCCO)
          </VBtn>
        </div>
      </VCol>
    </VRow>

    <!-- Export LCCO Details button -->

    <!-- Statistics Cards -->
    <VRow class="mb-6">
      <VCol cols="12" sm="6" md="3">
        <VCard
          class="stat-card"
          @click="filterByStatus(null)"
          style="cursor: pointer"
        >
          <VCardText class="d-flex align-center">
            <VAvatar color="primary" variant="tonal" class="me-4">
              <VIcon icon="tabler-package" />
            </VAvatar>
            <div>
              <div class="text-h6 font-weight-semibold">
                {{ statistics.total_installations || 0 }}
              </div>
              <div class="text-caption text-medium-emphasis">
                Total Installations
              </div>
            </div>
          </VCardText>
        </VCard>
      </VCol>

      <VCol cols="12" sm="6" md="3">
        <VCard
          class="stat-card"
          @click="filterByStatus(true)"
          style="cursor: pointer"
        >
          <VCardText class="d-flex align-center">
            <VAvatar color="success" variant="tonal" class="me-4">
              <VIcon icon="tabler-check" />
            </VAvatar>
            <div>
              <div class="text-h6 font-weight-semibold">
                {{ statistics.verified_installations || 0 }}
              </div>
              <div class="text-caption text-medium-emphasis">Installed</div>
            </div>
          </VCardText>
        </VCard>
      </VCol>

      <VCol cols="12" sm="6" md="3">
        <VCard
          class="stat-card"
          @click="filterByStatus(false)"
          style="cursor: pointer"
        >
          <VCardText class="d-flex align-center">
            <VAvatar color="warning" variant="tonal" class="me-4">
              <VIcon icon="tabler-clock" />
            </VAvatar>
            <div>
              <div class="text-h6 font-weight-semibold">
                {{ statistics.pending_verification || 0 }}
              </div>
              <div class="text-caption text-medium-emphasis">Delivered</div>
            </div>
          </VCardText>
        </VCard>
      </VCol>

      <VCol cols="12" sm="6" md="3">
        <VCard class="stat-card">
          <VCardText class="d-flex align-center">
            <VAvatar color="info" variant="tonal" class="me-4">
              <VIcon icon="tabler-calendar" />
            </VAvatar>
            <div>
              <div class="text-h6 font-weight-semibold">
                {{ statistics.installations_this_month || 0 }}
              </div>
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
              :items="stateOptions"
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

            <VBtn variant="tonal" @click="clearFilters">
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
            Showing {{ installations.from || 0 }} to
            {{ installations.to || 0 }} of
            {{ installations.total || 0 }} entries
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
              <VTooltip activator="parent" location="top"
                >Show fewer rows</VTooltip
              >
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
              <VTooltip activator="parent" location="top"
                >Show more rows</VTooltip
              >
            </VBtn>
          </div>
        </div>

        <VTable class="installation-table">
          <thead>
            <tr>
              <th class="text-left">Facility</th>
              <th class="text-left">State</th>
              <th class="text-left">LGA</th>
              <th class="text-left">State CCO</th>
              <th class="text-left">Delivery Status</th>
              <th class="text-left">Installation Status</th>
              <th class="text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="7" class="text-center py-8">
                <VProgressCircular indeterminate color="primary" />
                <div class="text-body-2 mt-2">Loading installations...</div>
              </td>
            </tr>

            <tr v-else-if="installations.data.length === 0">
              <td colspan="7" class="text-center py-8">
                <VIcon
                  icon="tabler-package-off"
                  size="48"
                  class="text-medium-emphasis mb-2"
                />
                <div class="text-body-1 text-medium-emphasis">
                  No installations found
                </div>
                <VBtn variant="tonal" class="mt-2" @click="clearFilters">
                  Clear Filters
                </VBtn>
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
                    <div class="font-weight-medium text-primary">
                      {{ installation.facility?.name }}
                    </div>
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
                <span class="text-body-2">{{
                  installation.facility?.lga?.name
                }}</span>
              </td>

              <td>
                <div
                  v-if="installation.health_officer"
                  class="d-flex align-center"
                >
                  <VAvatar
                    size="28"
                    color="secondary"
                    variant="tonal"
                    class="me-2"
                  >
                    <VIcon icon="tabler-user" size="16" />
                  </VAvatar>
                  <span class="text-body-2">{{
                    installation.health_officer.name
                  }}</span>
                </div>
                <span v-else class="text-caption text-medium-emphasis"
                  >Not assigned</span
                >
              </td>

              <td>
                <VChip
                  :color="getDeliveryStatusColor(installation.delivery_status)"
                  variant="flat"
                  size="small"
                  @click.stop="openUpdateDialog(installation, 'delivery')"
                  style="cursor: pointer"
                >
                  <VIcon
                    :icon="getDeliveryStatusIcon(installation.delivery_status)"
                    class="me-1"
                    size="16"
                  />
                  {{ formatStatus(installation.delivery_status) }}
                </VChip>
              </td>

              <td>
                <VChip
                  :color="
                    getInstallationStatusColor(installation.installation_status)
                  "
                  variant="flat"
                  size="small"
                  @click.stop="openUpdateDialog(installation, 'installation')"
                  style="cursor: pointer"
                >
                  <VIcon
                    :icon="
                      getInstallationStatusIcon(
                        installation.installation_status
                      )
                    "
                    class="me-1"
                    size="16"
                  />
                  {{ formatStatus(installation.installation_status) }}
                </VChip>
              </td>

              <td>
                <div class="d-flex gap-2">
                  <VBtn
                    icon
                    variant="text"
                    size="small"
                    color="primary"
                    @click.stop="openUpdateDialog(installation, 'both')"
                  >
                    <VIcon icon="tabler-edit" size="20" />
                    <VTooltip activator="parent" location="top"
                      >Update Status</VTooltip
                    >
                  </VBtn>

                  <VBtn
                    icon
                    variant="text"
                    size="small"
                    color="info"
                    @click.stop="goToInstallationDetail(installation.id)"
                  >
                    <VIcon icon="tabler-eye" size="20" />
                    <VTooltip activator="parent" location="top"
                      >View Details</VTooltip
                    >
                  </VBtn>

                  <VBtn
                    icon
                    variant="text"
                    size="small"
                    :color="
                      installation.verified_by_health_officer
                        ? 'warning'
                        : 'success'
                    "
                    @click.stop="toggleVerification(installation)"
                  >
                    <VIcon
                      :icon="
                        installation.verified_by_health_officer
                          ? 'tabler-x'
                          : 'tabler-check'
                      "
                      size="20"
                    />
                    <VTooltip activator="parent" location="top">
                      {{
                        installation.verified_by_health_officer
                          ? "Unverify"
                          : "Verify"
                      }}
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
              Page {{ installations.current_page }} of
              {{ installations.last_page }}
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

    <!-- Update Status Dialog -->
    <VDialog v-model="showUpdateDialog" max-width="500px">
      <VCard>
        <VCardTitle class="d-flex justify-space-between align-center">
          <span>Update Installation Status</span>
          <VBtn icon variant="text" @click="closeUpdateDialog">
            <VIcon icon="tabler-x" />
          </VBtn>
        </VCardTitle>

        <VCardText>
          <VRow>
            <!-- Facility Info -->
            <VCol cols="12">
              <div class="facility-info mb-4 pa-3 rounded bg-grey-lighten-4">
                <div class="text-h6">
                  {{ selectedInstallation?.facility?.name }}
                </div>
                <div class="text-caption text-medium-emphasis">
                  {{ selectedInstallation?.facility?.state?.name }} •
                  {{ selectedInstallation?.facility?.lga?.name }}
                </div>
              </div>
            </VCol>

            <!-- Delivery Status -->
            <VCol cols="12" v-if="updateType !== 'installation'">
              <AppSelect
                v-model="updateData.delivery_status"
                :items="deliveryStatusOptions"
                label="Delivery Status"
                placeholder="Select delivery status"
              />
            </VCol>

            <!-- Installation Status -->
            <VCol cols="12" v-if="updateType !== 'delivery'">
              <AppSelect
                v-model="updateData.installation_status"
                :items="installationStatusOptions"
                label="Installation Status"
                placeholder="Select installation status"
              />
            </VCol>

            <!-- Quick Status Buttons -->
            <VCol
              cols="12"
              v-if="updateType === 'delivery' || updateType === 'both'"
            >
              <div class="quick-actions mb-4">
                <div class="text-caption text-medium-emphasis mb-2">
                  Quick Delivery Actions:
                </div>
                <div class="d-flex flex-wrap gap-2">
                  <VBtn
                    v-for="status in deliveryStatuses"
                    :key="status"
                    size="small"
                    :color="
                      updateData.delivery_status === status
                        ? 'primary'
                        : 'secondary'
                    "
                    variant="outlined"
                    @click="updateData.delivery_status = status"
                  >
                    {{ formatStatus(status) }}
                  </VBtn>
                </div>
              </div>
            </VCol>

            <VCol
              cols="12"
              v-if="updateType === 'installation' || updateType === 'both'"
            >
              <div class="quick-actions mb-4">
                <div class="text-caption text-medium-emphasis mb-2">
                  Quick Installation Actions:
                </div>
                <div class="d-flex flex-wrap gap-2">
                  <VBtn
                    v-for="status in installationStatuses"
                    :key="status"
                    size="small"
                    :color="
                      updateData.installation_status === status
                        ? 'primary'
                        : 'secondary'
                    "
                    variant="outlined"
                    @click="updateData.installation_status = status"
                  >
                    {{ formatStatus(status) }}
                  </VBtn>
                </div>
              </div>
            </VCol>

            <!-- Remarks -->
            <VCol cols="12">
              <AppTextField
                v-model="updateData.remarks"
                label="Remarks"
                placeholder="Add any remarks or notes..."
                multiline
                rows="3"
              />
            </VCol>
          </VRow>
        </VCardText>

        <VCardActions>
          <VSpacer />
          <VBtn variant="tonal" @click="closeUpdateDialog">Cancel</VBtn>
          <VBtn
            color="primary"
            @click="updateInstallationStatus"
            :loading="updating"
            :disabled="!isStatusChanged"
          >
            Update Status
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
  </VContainer>
</template>

<script setup>
import SimpleExportButton from "@/components/SimpleExportButton.vue";
import installationService from "@/services/installationService";
import lccoService from "@/services/lccoService";
import frontendExport from "@/utils/fontendExport";
import { computed, onMounted, ref, watch } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

// Reactive data
const loading = ref(false);
const updating = ref(false);
const installations = ref({ data: [] });
const statistics = ref({});
const statesData = ref([]);
const isExportingLcco = ref(false);
const isExportingInstallationsWithLcco = ref(false);

// Status arrays
const deliveryStatuses = ref([
  "not delivered",
  "in transit",
  "delivered",
  "partially delivered",
]);
const installationStatuses = ref([
  "not installed",
  "in progress",
  "installed",
  "partially installed",
]);

// Dialog state
const showUpdateDialog = ref(false);
const selectedInstallation = ref(null);
const updateType = ref("both"); // 'delivery', 'installation', or 'both'

// Update form data
const updateData = ref({
  delivery_status: "",
  installation_status: "",
  remarks: "",
});

// Page size options
const pageSizeOptions = ref([
  { title: "10 rows", value: 10 },
  { title: "25 rows", value: 25 },
  { title: "50 rows", value: 50 },
  { title: "100 rows", value: 100 },
  { title: "All", value: 1000 },
]);

const handleExportSuccess = (result) => {
  console.log(`Exported ${result.count} installations successfully`);
  // Show success message
};

// Status options for dropdowns
const deliveryStatusOptions = computed(() => {
  return deliveryStatuses.value.map((status) => ({
    title: formatStatus(status),
    value: status,
  }));
});

const installationStatusOptions = computed(() => {
  return installationStatuses.value.map((status) => ({
    title: formatStatus(status),
    value: status,
  }));
});

const verificationOptions = ref([
  { title: "Verified", value: true },
  { title: "Not Verified", value: false },
]);

// State options computed from states data
const stateOptions = computed(() => {
  return statesData.value.map((state) => ({
    title: state.name,
    value: state.id,
  }));
});

// Filters
const filters = ref({
  search: "",
  state_id: null,
  verified: null,
  page: 1,
  per_page: 25,
});

// Check if status has changed
const isStatusChanged = computed(() => {
  if (!selectedInstallation.value) return false;

  const deliveryChanged =
    updateType.value !== "installation" &&
    updateData.value.delivery_status !==
      selectedInstallation.value.delivery_status;

  const installationChanged =
    updateType.value !== "delivery" &&
    updateData.value.installation_status !==
      selectedInstallation.value.installation_status;

  return (
    deliveryChanged ||
    installationChanged ||
    updateData.value.remarks.trim() !== ""
  );
});

// Watch for filter changes
let searchTimeout;
watch(
  () => filters.value.search,
  (newSearch) => {
    clearTimeout(searchTimeout);
    if (newSearch !== null) {
      searchTimeout = setTimeout(() => {
        filters.value.page = 1;
        fetchInstallations();
      }, 500);
    }
  }
);

watch(
  () => filters.value.per_page,
  () => {
    filters.value.page = 1;
    fetchInstallations();
  }
);

// Methods
const fetchInstallations = async () => {
  loading.value = true;
  try {
    const response = await installationService.getInstallations(filters.value);
    if (response.success) {
      installations.value = response.data;
    }
  } catch (error) {
    console.error("Error fetching installations:", error);
  } finally {
    loading.value = false;
  }
};

const fetchStatistics = async () => {
  try {
    const response = await installationService.getDashboardSummary();
    if (response.success) {
      statistics.value = response.data;
    }
  } catch (error) {
    console.error("Error fetching statistics:", error);
  }
};

const fetchStates = async () => {
  try {
    const response = await installationService.getStatesWithInstallations();
    if (response.success) {
      statesData.value = response.data;
    }
  } catch (error) {
    console.error("Error fetching states:", error);
  }
};

const goToInstallationDetail = (installationId) => {
  router.push(`/installation/${installationId}`);
};

const openUpdateDialog = (installation, type = "both") => {
  selectedInstallation.value = installation;
  updateType.value = type;

  // Initialize form data
  updateData.value = {
    delivery_status: installation.delivery_status || "",
    installation_status: installation.installation_status || "",
    remarks: installation.remarks || "",
  };

  showUpdateDialog.value = true;
};

const closeUpdateDialog = () => {
  showUpdateDialog.value = false;
  selectedInstallation.value = null;
  updateData.value = {
    delivery_status: "",
    installation_status: "",
    remarks: "",
  };
};

const updateInstallationStatus = async () => {
  if (!selectedInstallation.value || !isStatusChanged.value) return;

  updating.value = true;
  try {
    // Use the specific update methods for status changes
    if (
      updateType.value !== "installation" &&
      updateData.value.delivery_status !==
        selectedInstallation.value.delivery_status
    ) {
      await installationService.updateDeliveryStatus(
        selectedInstallation.value.id,
        updateData.value.delivery_status
      );
      selectedInstallation.value.delivery_status =
        updateData.value.delivery_status;
    }

    if (
      updateType.value !== "delivery" &&
      updateData.value.installation_status !==
        selectedInstallation.value.installation_status
    ) {
      await installationService.updateInstallationStatus(
        selectedInstallation.value.id,
        updateData.value.installation_status
      );
      selectedInstallation.value.installation_status =
        updateData.value.installation_status;
    }

    // Update remarks using the general update method if changed
    if (
      updateData.value.remarks.trim() !==
      (selectedInstallation.value.remarks || "")
    ) {
      await installationService.updateInstallation(
        selectedInstallation.value.id,
        {
          remarks: updateData.value.remarks,
        }
      );
      selectedInstallation.value.remarks = updateData.value.remarks;
    }

    // Refresh data
    fetchInstallations();
    fetchStatistics();

    closeUpdateDialog();
  } catch (error) {
    console.error("Error updating installation:", error);
  } finally {
    updating.value = false;
  }
};

// Individual status update methods
const updateDeliveryStatus = async (status) => {
  if (!selectedInstallation.value) return;

  try {
    await installationService.updateDeliveryStatus(
      selectedInstallation.value.id,
      status
    );
    selectedInstallation.value.delivery_status = status;
    // Refresh data
    fetchInstallations();
    fetchStatistics();
  } catch (err) {
    console.error("Error updating delivery status:", err);
  }
};

const updateInstallationStatusIndividual = async (status) => {
  if (!selectedInstallation.value) return;

  try {
    await installationService.updateInstallationStatus(
      selectedInstallation.value.id,
      status
    );
    selectedInstallation.value.installation_status = status;
    // Refresh data
    fetchInstallations();
    fetchStatistics();
  } catch (err) {
    console.error("Error updating installation status:", err);
  }
};

const toggleVerification = async (installation) => {
  try {
    const newStatus = !installation.verified_by_health_officer;
    await installationService.updateVerification(installation.id, newStatus);

    // Update local state
    installation.verified_by_health_officer = newStatus;

    // Refresh statistics
    fetchStatistics();
  } catch (error) {
    console.error("Error updating verification:", error);
  }
};

const filterByStatus = (status) => {
  filters.value.verified = status;
  filters.value.page = 1;
  fetchInstallations();
};

const clearFilters = () => {
  filters.value = {
    search: "",
    state_id: null,
    verified: null,
    page: 1,
    per_page: 25,
  };
  fetchInstallations();
};

const clearSearch = () => {
  filters.value.search = "";
  fetchInstallations();
};

const increasePageSize = () => {
  const currentIndex = pageSizeOptions.value.findIndex(
    (opt) => opt.value === filters.value.per_page
  );
  if (currentIndex < pageSizeOptions.value.length - 1) {
    filters.value.per_page = pageSizeOptions.value[currentIndex + 1].value;
  }
};

const decreasePageSize = () => {
  const currentIndex = pageSizeOptions.value.findIndex(
    (opt) => opt.value === filters.value.per_page
  );
  if (currentIndex > 0) {
    filters.value.per_page = pageSizeOptions.value[currentIndex - 1].value;
  }
};

const exportData = async () => {
  try {
    const response = await installationService.exportInstallations(
      filters.value
    );
    if (response.success) {
      console.log("Export data:", response.data);
      // Handle file download here
    }
  } catch (error) {
    console.error("Error exporting data:", error);
  }
};

const exportLccoDetails = async () => {
  isExportingLcco.value = true;
  try {
    // fetch LCCO records (request all rows to avoid pagination truncation)
    const lccoRes = await lccoService.index({ per_page: 9999 });
    let lccoData = [];
    if (lccoRes && lccoRes.success && Array.isArray(lccoRes.data))
      lccoData = lccoRes.data;
    else if (
      lccoRes &&
      lccoRes.success &&
      lccoRes.data &&
      Array.isArray(lccoRes.data.data)
    )
      lccoData = lccoRes.data.data;

    if (!lccoData || lccoData.length === 0) {
      console.info("No LCCO records to export");
      return;
    }

    // fetch all installations to build map
    // Fetch full installation records (includes id and nested facility data)
    const instRes = await installationService.getInstallations({
      ...filters.value,
      per_page: 9999,
    });
    let allInst = [];
    if (instRes && instRes.success && Array.isArray(instRes.data))
      allInst = instRes.data;
    else if (
      instRes &&
      instRes.success &&
      instRes.data &&
      Array.isArray(instRes.data.data)
    )
      allInst = instRes.data.data;

    const instMap = {};
    allInst.forEach((i) => {
      if (i && i.id) instMap[i.id] = i;
    });

    frontendExport.exportLccoDetails(lccoData, instMap);
    console.log(`Exported ${lccoData.length} LCCO records`);
  } catch (err) {
    console.error("Failed to export LCCO details", err);
  } finally {
    isExportingLcco.value = false;
  }
};

// New: Export installations list but enrich rows with aggregated LCCO columns
const exportInstallationsWithLcco = async () => {
  isExportingInstallationsWithLcco.value = true;
  try {
    // Fetch LCCO records and full installations in parallel
    const [lccoRes, instRes] = await Promise.all([
      lccoService.index({ per_page: 9999 }),
      installationService.getInstallations({
        ...filters.value,
        per_page: 9999,
      }),
    ]);

    let lccoData = [];
    if (lccoRes && lccoRes.success && Array.isArray(lccoRes.data))
      lccoData = lccoRes.data;
    else if (
      lccoRes &&
      lccoRes.success &&
      lccoRes.data &&
      Array.isArray(lccoRes.data.data)
    )
      lccoData = lccoRes.data.data;

    let allInst = [];
    if (instRes && instRes.success && Array.isArray(instRes.data))
      allInst = instRes.data;
    else if (
      instRes &&
      instRes.success &&
      instRes.data &&
      Array.isArray(instRes.data.data)
    )
      allInst = instRes.data.data;

    if (!allInst || allInst.length === 0) {
      console.info("No installations to export");
      return;
    }

    // Build map of LCCOs grouped by installation_id
    const lccoMap = {};
    lccoData.forEach((r) => {
      if (!r) return;
      const key =
        r.installation_id ?? (r.installation ? r.installation.id : null);
      if (!key) return;
      if (!lccoMap[key]) lccoMap[key] = [];
      lccoMap[key].push(r);
    });

    // Call new export method
    frontendExport.exportInstallationsWithLcco(allInst, lccoMap);
    console.log(`Exported ${allInst.length} installations with LCCO info`);
  } catch (err) {
    console.error("Failed to export installations with LCCO", err);
  } finally {
    isExportingInstallationsWithLcco.value = false;
  }
};

// Status formatting helpers
const formatStatus = (status) => {
  return status
    ? status
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ")
    : "Unknown";
};

const getDeliveryStatusColor = (status) => {
  switch (status) {
    case "delivered":
      return "success";
    case "partially delivered":
      return "warning";
    case "in transit":
      return "info";
    case "not delivered":
      return "error";
    default:
      return "secondary";
  }
};

const getInstallationStatusColor = (status) => {
  switch (status) {
    case "installed":
      return "success";
    case "partially installed":
      return "warning";
    case "in progress":
      return "info";
    case "not installed":
      return "error";
    default:
      return "secondary";
  }
};

const getDeliveryStatusIcon = (status) => {
  switch (status) {
    case "delivered":
      return "tabler-check";
    case "partially delivered":
      return "tabler-package";
    case "in transit":
      return "tabler-truck-delivery";
    case "not delivered":
      return "tabler-x";
    default:
      return "tabler-package";
  }
};

const getInstallationStatusIcon = (status) => {
  switch (status) {
    case "installed":
      return "tabler-check";
    case "partially installed":
      return "tabler-settings";
    case "in progress":
      return "tabler-tools";
    case "not installed":
      return "tabler-x";
    default:
      return "tabler-settings";
  }
};

// Lifecycle
onMounted(() => {
  fetchInstallations();
  fetchStatistics();
  fetchStates();
});
</script>

<style scoped>
.stat-card {
  cursor: pointer;
  transition: all 0.3s ease;
}

.stat-card:hover {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 10%);
  transform: translateY(-2px);
}

.installation-table {
  inline-size: 100%;
}

.installation-row {
  transition: all 0.2s ease;
}

.installation-row:hover {
  background-color: rgba(var(--v-theme-primary), 0.04);
}

.border-b {
  border-block-end: 1px solid
    rgba(var(--v-border-color), var(--v-border-opacity));
}

.border-t {
  border-block-start: 1px solid
    rgba(var(--v-border-color), var(--v-border-opacity));
}

.facility-info {
  border-inline-start: 4px solid rgb(var(--v-theme-primary));
}

.quick-actions {
  padding: 12px;
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 8px;
  background: rgba(var(--v-theme-surface), 0.5);
}
</style>
