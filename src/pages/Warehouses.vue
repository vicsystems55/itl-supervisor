<template>
  <div class="warehouse-page page-container">
    <!-- Summary Section -->
    <v-card class="pa-4 mb-6">
      <h2 class="mb-4">Warehouse Overview</h2>

      <v-row>
        <v-col cols="12" sm="6" md="3" v-for="stat in stats" :key="stat.label">
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
          <h3>All Warehouses</h3>
          <div class="controls">
            <v-text-field
              v-model="search"
              placeholder="Search warehouses"
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

      <!-- Table -->
      <v-data-table
        :headers="headers"
        :items="filteredWarehouses"
        :items-per-page="itemsPerPage"
        v-model:page="page"
        class="elevation-1"
      >
        <template #item.status="{ item }">
          <v-chip :color="item.status === 'Active' ? 'success' : 'error'" small>
            {{ item.status }}
          </v-chip>
        </template>

        <template #item.actions="{ item }">
          <v-btn icon small @click="viewWarehouse(item)">
            <v-icon>mdi-eye</v-icon>
          </v-btn>
          <v-btn icon small color="error" @click="deleteWarehouse(item)">
            <v-icon>mdi-delete</v-icon>
          </v-btn>
        </template>

        <template #no-data>
          <v-card-text>No warehouses found.</v-card-text>
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

// Reactive state
const search = ref("");
const statusFilter = ref("All");
const page = ref(1);
const itemsPerPage = ref(10);

// Data headers
const headers = [
  { title: "Warehouse ID", key: "id" },
  { title: "Name", key: "name" },
  { title: "Location", key: "location" },
  { title: "Capacity (tons)", key: "capacity" },
  { title: "Used Capacity (%)", key: "used" },
  { title: "Status", key: "status" },
  { title: "Actions", key: "actions" },
];

const statusOptions = ["All", "Active", "Inactive"];

// Mock Data
const warehouses = ref([
  {
    id: "WH-001",
    name: "Central Warehouse",
    location: "Lagos",
    capacity: 5000,
    used: 80,
    status: "Active",
  },
  {
    id: "WH-002",
    name: "Northern Depot",
    location: "Abuja",
    capacity: 3000,
    used: 60,
    status: "Active",
  },
  {
    id: "WH-003",
    name: "Eastern Hub",
    location: "Enugu",
    capacity: 2500,
    used: 40,
    status: "Inactive",
  },
  {
    id: "WH-004",
    name: "Western Storage",
    location: "Ibadan",
    capacity: 3500,
    used: 75,
    status: "Active",
  },
]);

// Computed Filters
const filteredWarehouses = computed(() => {
  const q = search.value?.toLowerCase() ?? "";
  return warehouses.value.filter((w) => {
    const matchesStatus =
      statusFilter.value === "All" || w.status === statusFilter.value;
    const matchesSearch =
      !q ||
      w.name.toLowerCase().includes(q) ||
      w.location.toLowerCase().includes(q) ||
      w.id.toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });
});

// Summary Cards
const stats = computed(() => {
  const total = warehouses.value.length;
  const active = warehouses.value.filter((w) => w.status === "Active").length;
  const inactive = total - active;
  const avgUsed =
    Math.round(
      warehouses.value.reduce((sum, w) => sum + w.used, 0) / total
    ) || 0;

  return [
    { label: "Total Warehouses", value: total, color: "primary" },
    { label: "Active Warehouses", value: active, color: "success" },
    { label: "Inactive", value: inactive, color: "error" },
    { label: "Avg. Capacity Used (%)", value: avgUsed, color: "info" },
  ];
});

const pageCount = computed(() =>
  Math.max(1, Math.ceil(filteredWarehouses.value.length / itemsPerPage.value))
);

// Actions
function viewWarehouse(item) {
  console.log("View warehouse:", item);
}

function deleteWarehouse(item) {
  const index = warehouses.value.findIndex((w) => w.id === item.id);
  if (index !== -1) warehouses.value.splice(index, 1);
}

// Export CSV
function exportCsv() {
  const rows = [headers.map((h) => h.title).join(",")];
  filteredWarehouses.value.forEach((w) => {
    rows.push(
      [w.id, w.name, w.location, w.capacity, w.used, w.status]
        .map((c) => `"${String(c).replace(/"/g, '""')}"`)
        .join(",")
    );
  });

  const blob = new Blob([rows.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", "warehouses.csv");
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
