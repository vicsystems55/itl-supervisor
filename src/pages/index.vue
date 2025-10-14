<script setup>
import { ref, onMounted, computed } from "vue";
import {
  VBtn,
  VCard,
  VCardItem,
  VCardText,
  VCardTitle,
  VChip,
  VCol,
  VIcon,
  VRow,
  VProgressCircular,
} from "vuetify/components";

import RecentActivityFeed from "@/components/RecentActivityFeed.vue";
import InstallationMap from "@/components/InstallationMap.vue";
import TotalShipmentsCard from "@/components/TotalShipmentsCard.vue";
import installationService from "@/services/installationService";

// Reactive data
const user = ref({
  name: "Guest User",
  role: "Guest",
  status: "Online",
  color: "success",
});

const kpiStats = ref({
  totalInstallations: 0,
  verifiedInstallations: 0,
  pendingVerification: 0,
  installationsByState: [],
  recentInstallations: [],
});

// NEW: Store states data with installation details
const statesData = ref([]);

const loading = ref(true);
const error = ref(null);

const getUserFromSession = () => {
  try {
    const userDataString = sessionStorage.getItem("user_data");

    if (userDataString) {
      const userData = JSON.parse(userDataString);

      if (userData && userData.name) {
        user.value = {
          name: userData.name,
          role: userData.role || "User",
          status: "Online",
          color: "success",
        };
        return;
      }
    }

    const fallbackRole = localStorage.getItem("role");
    const fallbackName = localStorage.getItem("userName") || "Project Admin";

    user.value = {
      name: fallbackName,
      role: fallbackRole || "User",
      status: "Online",
      color: "success",
    };
  } catch (err) {
    console.error("Error parsing user data from sessionStorage:", err);
    user.value = {
      name: "Project Admin",
      role: "Operations Lead",
      status: "Online",
      color: "success",
    };
  }
};

// NEW: Fetch states with installation data
const fetchStatesWithInstallations = async () => {
  try {
    const response = await installationService.getStatesWithInstallations();
    if (response.success) {
      statesData.value = response.data || [];
      console.log("States data loaded:", statesData.value);
    }
  } catch (err) {
    console.error("Error fetching states data:", err);
    error.value = "Failed to load states data";
  }
};

// Fetch dashboard data
const fetchDashboardData = async () => {
  try {
    loading.value = true;
    const statsResponse = await installationService.getStatistics();

    if (statsResponse.success) {
      const stats = statsResponse.data;
      kpiStats.value = {
        totalInstallations: stats.total_installations,
        verifiedInstallations: stats.verified_installations,
        pendingVerification: stats.pending_verification,
        installationsByState: stats.installations_by_state,
        recentInstallations: stats.recent_installations,
        installationsBySupplier: stats.installations_by_supplier,
        installationsByModel: stats.installations_by_model,
      };
    }
  } catch (err) {
    error.value = "Failed to load dashboard data";
    console.error("Dashboard error:", err);
  } finally {
    loading.value = false;
  }
};

// NEW: Process states data for display
const processedStatesData = computed(() => {
  return statesData.value.map((state) => ({
    id: state.id,
    name: state.name,
    code: state.code,
    latitude: state.latitude,
    longitude: state.longitude,
    installation_details: state.installation_details || {
      total_supposed_installations: 0,
      total_installed: 0,
      total_delivered: 0,
      installation_rate: 0,
      delivery_rate: 0,
    },
  }));
});

// NEW: Computed property for map markers from states data
const stateMapMarkers = computed(() => {
  return processedStatesData.value.map((state) => ({
    id: state.id,
    name: state.name,
    latitude: state.latitude,
    longitude: state.longitude,
    installation_details: state.installation_details,
    // You can add additional properties for the map here
    marker_color: getMarkerColor(state.installation_details.installation_rate),
    tooltip: `${state.name}: ${state.installation_details.total_installed}/${state.installation_details.total_supposed_installations} installed`,
  }));
});

// NEW: Helper function to determine marker color based on installation rate
const getMarkerColor = (installationRate) => {
  if (installationRate >= 80) return "success";
  if (installationRate >= 50) return "warning";
  return "error";
};

// NEW: Computed property for state statistics summary
const statesSummary = computed(() => {
  if (!statesData.value.length) return null;

  const totalStates = statesData.value.length;
  const totalSupposedInstallations = statesData.value.reduce(
    (sum, state) =>
      sum + (state.installation_details?.total_supposed_installations || 0),
    0
  );
  const totalInstalled = statesData.value.reduce(
    (sum, state) => sum + (state.installation_details?.total_installed || 0),
    0
  );
  const totalDelivered = statesData.value.reduce(
    (sum, state) => sum + (state.installation_details?.total_delivered || 0),
    0
  );

  const overallInstallationRate =
    totalSupposedInstallations > 0
      ? Math.round((totalInstalled / totalSupposedInstallations) * 100)
      : 0;

  const overallDeliveryRate =
    totalSupposedInstallations > 0
      ? Math.round((totalDelivered / totalSupposedInstallations) * 100)
      : 0;

  return {
    totalStates,
    totalSupposedInstallations,
    totalInstalled,
    totalDelivered,
    overallInstallationRate,
    overallDeliveryRate,
  };
});

onMounted(async () => {
  getUserFromSession();

  // Fetch both dashboard stats and states data
  await Promise.all([fetchDashboardData(), fetchStatesWithInstallations()]);
});
</script>

<template>
  <!-- Greeting / Header Card -->
  <VCard class="pa-5 mb-4" rounded="lg" elevation="1">
    <div
      class="d-flex flex-column flex-sm-row justify-space-between align-center gap-4"
    >
    <VRow>
      <VCol cols="6" md="6">
        <div>
          <h4 class="text-h5 font-weight-medium mb-2">
            👋 Welcome back, {{ user.name }}
          </h4>
          <div class="d-flex align-center">
            <VIcon icon="tabler-user" color="primary" class="me-2" />
            <span class="text-body-1">
              Role: <strong>{{ user.role }}</strong>
            </span>
          </div>
          <div class="mt-1">
            <VChip :color="user.color" size="small" label>
              Status: {{ user.status }}
            </VChip>
          </div>
        </div>
      </VCol>

      <VCol cols="6" md="6">
        <!-- Right: Actions -->
        <div class="d-flex gap-1">
          <VBtn
            color="primary"
            variant="flat"
            prepend-icon="tabler-truck-delivery"
            :to="{ name: 'installation' }"
          >
            View Installations
          </VBtn>
          <VBtn color="success" variant="outlined" prepend-icon="tabler-report">
            Generate Report
          </VBtn>
        </div>
      </VCol>
      <!-- Left: Greeting -->

    </VRow>
    </div>
  </VCard>

  <!-- Loading State -->
  <div v-if="loading" class="text-center py-8">
    <VProgressCircular indeterminate size="64" />
    <div class="mt-2">Loading dashboard data...</div>
  </div>

  <!-- Error State -->
  <div v-else-if="error" class="text-center py-8">
    <VIcon icon="tabler-alert-circle" size="64" color="error" />
    <div class="mt-2 text-error">{{ error }}</div>
    <VBtn @click="fetchDashboardData" class="mt-4" color="primary">
      Retry
    </VBtn>
  </div>

  <!-- KPI Row -->
  <VRow v-else class="match-height">
    <!-- Total Installations -->
    <VCol cols="12" md="3">
      <TotalShipmentsCard
        title="Total Installations"
        :count="kpiStats.totalInstallations"
        subtitle="Overall installations across Nigeria"
        icon="tabler-package"
        color="primary"
      />
    </VCol>

    <!-- Verification Status -->
    <VCol cols="12" md="3">
      <div class="d-flex flex-column gap-3">
        <VCard class="pa-3 status-card verified" elevation="0">
          <div class="d-flex align-center justify-space-between">
            <div class="d-flex align-center gap-3">
              <VIcon icon="tabler-check" size="28" color="success" />
              <div>
                <div class="text-subtitle-1 font-weight-bold">
                  {{ kpiStats.verifiedInstallations }}
                </div>
                <div class="text-caption text-secondary">Installations</div>
              </div>
            </div>
            <div class="status-shade verified-shade" />
          </div>
        </VCard>

        <VCard class="pa-3 status-card pending" elevation="0">
          <div class="d-flex align-center justify-space-between">
            <div class="d-flex align-center gap-3">
              <VIcon icon="tabler-clock" size="28" color="warning" />
              <div>
                <div class="text-subtitle-1 font-weight-bold">
                  {{ kpiStats.pendingVerification }}
                </div>
                <div class="text-caption text-secondary">
                  Deliveries
                </div>
              </div>
            </div>
            <div class="status-shade pending-shade" />
          </div>
        </VCard>
      </div>
    </VCol>

    <!-- State Distribution -->
    <VCol cols="12" md="3">
      <VCard class="pa-4" outlined>
        <VCardItem>
          <VCardTitle class="text-h6 font-weight-bold"> Top States </VCardTitle>
        </VCardItem>
        <VCardText>
          <div class="d-flex flex-column gap-2">
            <div
              v-for="state in kpiStats.installationsByState.slice(0, 3)"
              :key="state.id"
              class="d-flex align-center justify-space-between"
            >
              <span class="text-truncate" :title="state.name">
                {{ state.name }}
              </span>
              <VChip color="primary" size="small" label>
                {{ state.installations_count }}
              </VChip>
            </div>
            <div
              v-if="kpiStats.installationsByState.length > 3"
              class="text-caption text-center text-medium-emphasis"
            >
              +{{ kpiStats.installationsByState.length - 3 }} more states
            </div>
          </div>
        </VCardText>
      </VCard>
    </VCol>

    <!-- Quick Stats -->
    <VCol cols="12" md="3">
      <VCard class="pa-4" outlined>
        <VCardItem>
          <VCardTitle class="text-h6 font-weight-bold">
            Quick Stats
          </VCardTitle>
        </VCardItem>
        <VCardText>
          <div class="d-flex flex-column gap-2">
            <div class="d-flex align-center justify-space-between">
              <span>Suppliers</span>
              <VChip color="secondary" size="small" label>
                {{ kpiStats.installationsBySupplier?.length || 0 }}
              </VChip>
            </div>
            <div class="d-flex align-center justify-space-between">
              <span>Product Models</span>
              <VChip color="info" size="small" label>
                {{ kpiStats.installationsByModel?.length || 0 }}
              </VChip>
            </div>
            <div class="d-flex align-center justify-space-between">
              <span>Recent Activity</span>
              <VChip color="success" size="small" label>
                {{ kpiStats.recentInstallations?.length || 0 }}
              </VChip>
            </div>
          </div>
        </VCardText>
      </VCard>
    </VCol>
  </VRow>

  <!-- Activity and Map Overview -->
  <VRow class="match-heigh mt-2">
    <!-- Installation Map -->
    <VCol cols="12" md="12"  >
      <!-- Pass the processed installations to the map -->
      
         <InstallationMap :installations="processedStatesData" />
       
    </VCol>

    <!-- Recent Activity -->
    <!-- <VCol cols="12" md="4">
      <VCard class="pa-4" outlined>
        <VCardItem>
          <VCardTitle class="text-h5 font-weight-bold">
            Recent Installations
          </VCardTitle>
        </VCardItem> -->
    <!-- <RecentActivityFeed :installations="kpiStats.recentInstallations" /> -->
    <!-- </VCard>
    </VCol> -->
  </VRow>
</template>

<style scoped>
.welcome-card {
  background: linear-gradient(135deg, #f9fafb 0%, #fff 100%);
}

.status-card {
  position: relative;
  border-radius: 8px;
}

.status-card .status-shade {
  border-radius: 8px;
  block-size: 56px;
  inline-size: 56px;
}

.verified-shade {
  background: linear-gradient(
    135deg,
    rgba(40, 167, 69, 8%),
    rgba(40, 167, 69, 2%)
  );
}

.pending-shade {
  background: linear-gradient(
    135deg,
    rgba(255, 193, 7, 8%),
    rgba(255, 193, 7, 2%)
  );
}
</style>
