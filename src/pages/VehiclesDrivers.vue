<template>
  <div class="vehicles-page page-container">
    <!-- Summary Cards -->
    <v-card class="pa-4 mb-6">
      <h2 class="mb-4">Fleet Overview</h2>

      <v-row>
        <v-col
          v-for="stat in stats"
          :key="stat.label"
          cols="12"
          sm="6"
          md="3"
        >
          <v-card class="pa-4 stat-card" :color="stat.color" dark>
            <div class="text-h5 font-weight-bold">{{ stat.value }}</div>
            <div class="text-subtitle-1">{{ stat.label }}</div>
          </v-card>
        </v-col>
      </v-row>
    </v-card>

    <!-- Filter Controls -->
    <v-card>
      <v-card-title>
        <div class="title-row">
          <h3>All Vehicles & Drivers</h3>
          <div class="controls">
            <v-text-field
              v-model="search"
              placeholder="Search vehicle or driver"
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

      <!-- Vehicles Table -->
      <v-data-table
        :headers="headers"
        :items="filteredVehicles"
        :items-per-page="itemsPerPage"
        v-model:page="page"
        class="elevation-1"
      >
        <!-- Status -->
        <template #item.status="{ item }">
          <v-chip
            :color="item.status === 'In Transit'
              ? 'info'
              : item.status === 'Idle'
              ? 'warning'
              : 'success'"
            small
          >
            {{ item.status }}
          </v-chip>
        </template>

        <!-- Driver Info -->
        <template #item.driver="{ item }">
          <div>
            <div class="font-weight-medium">{{ item.driver.name }}</div>
            <div class="text-caption grey--text">{{ item.driver.phone }}</div>
          </div>
        </template>

        <!-- Actions -->
        <template #item.actions="{ item }">
          <v-btn icon small @click="viewVehicle(item)">
            <v-icon>mdi-eye</v-icon>
          </v-btn>
          <v-btn icon small color="error" @click="deleteVehicle(item)">
            <v-icon>mdi-delete</v-icon>
          </v-btn>
        </template>

        <!-- No Data -->
        <template #no-data>
          <v-card-text>No vehicles found.</v-card-text>
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
const statusFilter = ref("All");
const page = ref(1);
const itemsPerPage = ref(10);

const headers = [
  { title: "Vehicle ID", key: "id" },
  { title: "Plate Number", key: "plate" },
  { title: "Model", key: "model" },
  { title: "Driver", key: "driver" },
  { title: "Status", key: "status" },
  { title: "Last Location", key: "location" },
  { title: "Actions", key: "actions" },
];

const statusOptions = ["All", "In Transit", "Idle", "Maintenance"];

// Mock Data
const vehicles = ref([
  {
    id: "VH-001",
    plate: "LAG-2345A",
    model: "Mercedes Actros",
    driver: { name: "John Doe", phone: "+234 802 123 4567" },
    status: "In Transit",
    location: "Abuja - Kaduna Expressway",
  },
  {
    id: "VH-002",
    plate: "ABJ-9876Z",
    model: "Volvo FH16",
    driver: { name: "Sarah Adams", phone: "+234 807 654 3210" },
    status: "Idle",
    location: "Lagos Depot",
  },
  {
    id: "VH-003",
    plate: "KAN-5623X",
    model: "DAF XF 105",
    driver: { name: "Ibrahim Musa", phone: "+234 803 334 1122" },
    status: "In Transit",
    location: "Zaria Road",
  },
  {
    id: "VH-004",
    plate: "ENU-2210P",
    model: "MAN TGX",
    driver: { name: "Blessing Okafor", phone: "+234 806 991 7788" },
    status: "Maintenance",
    location: "Workshop - Enugu",
  },
]);

// Computed Filters
const filteredVehicles = computed(() => {
  const q = search.value?.toLowerCase() ?? "";
  return vehicles.value.filter((v) => {
    const matchesStatus =
      statusFilter.value === "All" || v.status === statusFilter.value;
    const matchesSearch =
      !q ||
      v.plate.toLowerCase().includes(q) ||
      v.driver.name.toLowerCase().includes(q) ||
      v.model.toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });
});

// Stats
const stats = computed(() => {
  const total = vehicles.value.length;
  const inTransit = vehicles.value.filter((v) => v.status === "In Transit").length;
  const idle = vehicles.value.filter((v) => v.status === "Idle").length;
  const maintenance = vehicles.value.filter((v) => v.status === "Maintenance").length;
  const activeDrivers = total - maintenance;

  return [
    { label: "Total Vehicles", value: total, color: "primary" },
    { label: "In Transit", value: inTransit, color: "info" },
    { label: "Idle Vehicles", value: idle, color: "warning" },
    { label: "Active Drivers", value: activeDrivers, color: "success" },
  ];
});

const pageCount = computed(() =>
  Math.max(1, Math.ceil(filteredVehicles.value.length / itemsPerPage.value))
);

// Actions
function viewVehicle(item) {
  console.log("View vehicle:", item);
}

function deleteVehicle(item) {
  const index = vehicles.value.findIndex((v) => v.id === item.id);
  if (index !== -1) vehicles.value.splice(index, 1);
}

// Export CSV
function exportCsv() {
  const rows = [headers.map((h) => h.title).join(",")];
  filteredVehicles.value.forEach((v) => {
    rows.push(
      [
        v.id,
        v.plate,
        v.model,
        v.driver.name,
        v.status,
        v.location,
      ]
        .map((c) => `"${String(c).replace(/"/g, '""')}"`)
        .join(",")
    );
  });

  const blob = new Blob([rows.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", "vehicles.csv");
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
}
.controls {
  display: flex;
  align-items: center;
  gap: 12px;
}
.stat-card {
  border-radius: 12px;
  text-align: center;
  transition: transform 0.2s;
}
.stat-card:hover {
  transform: scale(1.03);
}
.status-select {
  min-inline-size: 140px;
}
.perpage-select {
  inline-size: 90px;
}
.spacer {
  flex: 1 1 auto;
}
</style>
