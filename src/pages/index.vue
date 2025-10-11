<script setup>
import { ref, onMounted } from 'vue'
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
} from "vuetify/components";

import RecentActivityFeed from "@/components/RecentActivityFeed.vue";
import InstallationMap from "@/components/InstallationMap.vue";
import TotalShipmentsCard from "@/components/TotalShipmentsCard.vue";
import installationService from '@/services/installationService'

// Reactive data
const user = ref({
  name: "Project Admin",
  role: "Operations Lead",
  status: "Online",
  color: "success",
});

const kpiStats = ref({
  totalInstallations: 0,
  verifiedInstallations: 0,
  pendingVerification: 0,
  installationsByState: [],
  recentInstallations: []
});

const loading = ref(true)
const error = ref(null)

// Fetch dashboard data
const fetchDashboardData = async () => {
  try {
    loading.value = true
    const statsResponse = await installationService.getStatistics()
    
    if (statsResponse.success) {
      const stats = statsResponse.data
      kpiStats.value = {
        totalInstallations: stats.total_installations,
        verifiedInstallations: stats.verified_installations,
        pendingVerification: stats.pending_verification,
        installationsByState: stats.installations_by_state,
        recentInstallations: stats.recent_installations,
        installationsBySupplier: stats.installations_by_supplier,
        installationsByModel: stats.installations_by_model
      }
    }
  } catch (err) {
    error.value = 'Failed to load dashboard data'
    console.error('Dashboard error:', err)
  } finally {
    loading.value = false
  }
}

// Example delivery stats (you might want to create separate endpoints for these)
const deliveryStats = ref({
  delivered: 120,
  onRoute: 45,
  delayed: 10,
  installations: 98,
  maintenance: 7,
  warehouses: 5,
})

onMounted(() => {
  fetchDashboardData()
})
</script>

<template>
  <!-- Greeting / Header Card -->
  <VCard class="pa-5 mb-4" rounded="lg" elevation="1">
    <div
      class="d-flex flex-column flex-sm-row justify-space-between align-center gap-4"
    >
      <!-- Left: Greeting -->
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

      <!-- Right: Actions -->
      <div class="d-flex gap-3">
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
                <div class="text-caption text-secondary">Verified</div>
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
                <div class="text-caption text-secondary">Pending Verification</div>
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
          <VCardTitle class="text-h6 font-weight-bold">
            Top States
          </VCardTitle>
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
            <div v-if="kpiStats.installationsByState.length > 3" class="text-caption text-center text-medium-emphasis">
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
  <VRow class="match-height mt-2">
    <!-- Installation Map -->
    <VCol cols="12" md="8">
      <VCard class="pa-4 py-3" outlined>
        <VCardItem>
          <VCardTitle class="text-h5 font-weight-bold">
            Installation Map
          </VCardTitle>
        </VCardItem>
       <InstallationMap :installations="kpiStats.recentInstallations" />
      </VCard>
    </VCol>

    <!-- Recent Activity -->
    <VCol cols="12" md="4">
      <VCard class="pa-4" outlined>
        <VCardItem>
          <VCardTitle class="text-h5 font-weight-bold">
            Recent Installations
          </VCardTitle>
        </VCardItem>
        <!-- <RecentActivityFeed :installations="kpiStats.recentInstallations" /> -->
      </VCard>
    </VCol>
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
