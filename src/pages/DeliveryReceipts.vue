<template>
  <div class="delivery-report page-container">
    <v-card class="pa-4 mb-6">
      <h2 class="mb-4">Delivery Report</h2>

      <!-- Counter Cards -->
      <v-row>
        <v-col cols="12" sm="6" md="3" v-for="stat in stats" :key="stat.label">
          <v-card class="pa-4 stat-card" :color="stat.color" dark>
            <div class="text-h5 font-weight-bold">{{ stat.value }}</div>
            <div class="text-subtitle-1">{{ stat.label }}</div>
          </v-card>
        </v-col>
      </v-row>
    </v-card>

    <!-- Filters and Controls -->
    <v-card>
      <v-card-title>
        <div class="title-row">
          <h3>Shipments</h3>
          <div class="controls">
            <v-text-field
              v-model="search"
              placeholder="Search shipments"
              dense
              hide-details
              clearable
              append-icon="mdi-magnify"
            />

            <v-select
              v-model="statusFilter"
              :items="statusOptions"
              dense
              hide-details
              class="status-select"
              label="Status"
            />

            <v-btn color="primary" @click="exportCsv" small>Export CSV</v-btn>
          </div>
        </div>
      </v-card-title>

      <!-- Data Table -->
      <v-data-table
        :headers="headers"
        :items="filteredShipments"
        :items-per-page="itemsPerPage"
        class="elevation-1"
        v-model:page="page"
      >
        <template #item="{ item }">
          <tr>
            <td>{{ item.trackingId }}</td>
            <td>{{ item.recipient }}</td>
            <td>{{ item.origin }}</td>
            <td>{{ item.destination }}</td>
            <td>{{ item.status }}</td>
            <td>{{ item.date }}</td>
          </tr>
        </template>

        <template #no-data>
          <v-card-text>No shipments found.</v-card-text>
        </template>
      </v-data-table>

      <!-- Pagination -->
      <v-card-actions>
        <v-pagination v-model="page" :length="pageCount" />
        <div class="spacer" />
        <v-select
          v-model="itemsPerPage"
          :items="[5, 10, 25, 50]"
          dense
          hide-details
          class="perpage-select"
        />
      </v-card-actions>
    </v-card>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";

const search = ref("");
const statusFilter = ref(null);
const page = ref(1);
const itemsPerPage = ref(10);

const headers = [
  { title: "Tracking ID", key: "trackingId" },
  { title: "Recipient", key: "recipient" },
  { title: "Origin", key: "origin" },
  { title: "Destination", key: "destination" },
  { title: "Status", key: "status" },
  { title: "Date", key: "date" },
];

const statusOptions = ["All", "Delivered", "On Route", "Delayed"];

// Mock data
const shipments = ref([
  {
    trackingId: "ST-1001",
    recipient: "Acme Corp",
    origin: "Lagos",
    destination: "Abuja",
    status: "Delivered",
    date: "2025-09-12",
  },
  {
    trackingId: "ST-1002",
    recipient: "Beta Ltd",
    origin: "Port Harcourt",
    destination: "Lagos",
    status: "On Route",
    date: "2025-09-15",
  },
  {
    trackingId: "ST-1003",
    recipient: "Gamma Inc",
    origin: "Kano",
    destination: "Kaduna",
    status: "Delayed",
    date: "2025-09-18",
  },
  {
    trackingId: "ST-1004",
    recipient: "Delta LLC",
    origin: "Abuja",
    destination: "Lagos",
    status: "Delivered",
    date: "2025-09-21",
  },
]);

// Filtering logic
const filteredShipments = computed(() => {
  const q = search.value?.toLowerCase();
  return shipments.value.filter((s) => {
    if (statusFilter.value && statusFilter.value !== "All" && s.status !== statusFilter.value)
      return false;
    if (!q) return true;
    return (
      s.trackingId.toLowerCase().includes(q) ||
      s.recipient.toLowerCase().includes(q) ||
      s.origin.toLowerCase().includes(q) ||
      s.destination.toLowerCase().includes(q)
    );
  });
});

// Stats for counter cards
const stats = computed(() => {
  const total = shipments.value.length;
  const delivered = shipments.value.filter((s) => s.status === "Delivered").length;
  const onRoute = shipments.value.filter((s) => s.status === "On Route").length;
  const delayed = shipments.value.filter((s) => s.status === "Delayed").length;

  return [
    { label: "Total Shipments", value: total, color: "primary" },
    { label: "Delivered", value: delivered, color: "success" },
    { label: "On Route", value: onRoute, color: "info" },
    { label: "Delayed", value: delayed, color: "error" },
  ];
});

const pageCount = computed(() =>
  Math.max(1, Math.ceil(filteredShipments.value.length / itemsPerPage.value))
);

function exportCsv() {
  const rows = [headers.map((h) => h.title).join(",")];
  filteredShipments.value.forEach((r) => {
    rows.push(
      [r.trackingId, r.recipient, r.origin, r.destination, r.status, r.date]
        .map((c) => `"${String(c).replace(/"/g, '""')}"`)
        .join(",")
    );
  });

  const blob = new Blob([rows.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", "delivery_report.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
</script>

<style scoped>
.title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  inline-size: 100%;
}

.controls {
  display: flex;
  align-items: center;
  gap: 12px;
}

.spacer {
  flex: 1 1 auto;
}

.status-select {
  min-inline-size: 140px;
}

.perpage-select {
  inline-size: 90px;
}

.stat-card {
  border-radius: 12px;
  text-align: center;
  transition: transform 0.2s;
}
.stat-card:hover {
  transform: scale(1.03);
}
</style>
