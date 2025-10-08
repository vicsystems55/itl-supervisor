<script setup>
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

// Example widgets (you can later create real components for these)
import RecentActivityFeed from "@/components/RecentActivityFeed.vue";
import InstallationMap from "@/components/InstallationMap.vue";
import TotalShipmentsCard from "@/components/TotalShipmentsCard.vue";

// Fake summary data (replace with API/store data)
const user = {
  name: "Project Admin",
  role: "Operations Lead",
  status: "Online",
  color: "success",
};

const kpiStats = {
  totalShipments: 185,
  delivered: 120,
  onRoute: 45,
  delayed: 10,
  installations: 98,
  maintenance: 7,
  warehouses: 5,
};
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
        >
          View Active Routes
        </VBtn>
        <VBtn color="success" variant="outlined" prepend-icon="tabler-report">
          Generate Report
        </VBtn>
      </div>
    </div>
  </VCard>

  <!-- KPI Row -->
  <VRow class="match-height">
    <!-- Total Shipments -->
    <VCol cols="12" md="4">
      <TotalShipmentsCard
        title="Total Shipments"
        :count="kpiStats.totalShipments"
        subtitle="Overall consignments across Nigeria"
        icon="tabler-package"
        color="primary"
      />
    </VCol>

    <!-- Shipment Status: three small cards -->
    <VCol cols="12" md="4">
      <div class="d-flex flex-column gap-3">
        <VCard class="pa-3 status-card delivered" elevation="0">
          <div class="d-flex align-center justify-space-between">
            <div class="d-flex align-center gap-3">
              <VIcon icon="tabler-check" size="28" color="success" />
              <div>
                <div class="text-subtitle-1 font-weight-bold">
                  {{ kpiStats.delivered }}
                </div>
                <div class="text-caption text-secondary">Delivered</div>
              </div>
            </div>
            <div class="status-shade delivered-shade" />
          </div>
        </VCard>

        <VCard class="pa-3 status-card onroute" elevation="0">
          <div class="d-flex align-center justify-space-between">
            <div class="d-flex align-center gap-3">
              <VIcon icon="tabler-truck" size="28" color="info" />
              <div>
                <div class="text-subtitle-1 font-weight-bold">
                  {{ kpiStats.onRoute }}
                </div>
                <div class="text-caption text-secondary">On Route</div>
              </div>
            </div>
            <div class="status-shade onroute-shade" />
          </div>
        </VCard>

        <VCard class="pa-3 status-card delayed" elevation="0">
          <div class="d-flex align-center justify-space-between">
            <div class="d-flex align-center gap-3">
              <VIcon icon="tabler-clock" size="28" color="error" />
              <div>
                <div class="text-subtitle-1 font-weight-bold">
                  {{ kpiStats.delayed }}
                </div>
                <div class="text-caption text-secondary">Delayed</div>
              </div>
            </div>
            <div class="status-shade delayed-shade" />
          </div>
        </VCard>
      </div>
    </VCol>

    <!-- Installations & Maintenance -->
    <VCol cols="12" md="4">
      <VCard class="pa-4" outlined>
        <VCardItem>
          <VCardTitle class="text-h5 font-weight-bold"
            >Field Operations</VCardTitle
          >
        </VCardItem>
        <VCardText>
          <div class="d-flex flex-column gap-2">
            <div class="d-flex align-center justify-space-between">
              <span>Installations Completed</span>
              <VChip color="primary" size="small" label>{{
                kpiStats.installations
              }}</VChip>
            </div>
            <div class="d-flex align-center justify-space-between">
              <span>Maintenance Cases</span>
              <VChip color="warning" size="small" label>{{
                kpiStats.maintenance
              }}</VChip>
            </div>
            <div class="d-flex align-center justify-space-between">
              <span>Warehouses Active</span>
              <VChip color="secondary" size="small" label>{{
                kpiStats.warehouses
              }}</VChip>
            </div>
          </div>
        </VCardText>
      </VCard>
    </VCol>
  </VRow>

  <!-- Activity and Route Overview -->
  <VRow class="match-height mt-2">
    <!-- Recent Activities -->
    <VCol cols="12" md="8">
      <VCard class="pa-4 py-3" outlined>
        <VCardItem>
          <VCardTitle class="text-h5 font-weight-bold"
            >Installation Map</VCardTitle
          >
        </VCardItem>

          <InstallationMap />
     
      </VCard>
    </VCol>

    <!-- Route / Delivery Timeline -->
    <VCol cols="12" md="4">
      <VCard class="pa-4" outlined>
        <VCardItem>
          <VCardTitle class="text-h5 font-weight-bold"
            >Route Status Timeline</VCardTitle
          >
        </VCardItem>
          <RecentActivityFeed />
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

.delivered-shade {
  background: linear-gradient(
    135deg,
    rgba(40, 167, 69, 8%),
    rgba(40, 167, 69, 2%)
  );
}

.onroute-shade {
  background: linear-gradient(
    135deg,
    rgba(13, 202, 240, 8%),
    rgba(13, 202, 240, 2%)
  );
}

.delayed-shade {
  background: linear-gradient(
    135deg,
    rgba(255, 77, 77, 8%),
    rgba(255, 77, 77, 2%)
  );
}
</style>
