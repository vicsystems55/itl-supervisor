<template>
  <div class="all-shipments page-container">
    <v-card>
      <v-card-title>
        <div class="title-row">
          <h3>All Shipments</h3>
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

            <v-btn color="primary" @click="exportCsv" small> Export CSV </v-btn>
          </div>
        </div>
      </v-card-title>

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
            <td>
              <v-btn icon small @click="viewShipment(item)">
                <v-icon>mdi-eye</v-icon>
              </v-btn>
              <v-btn icon small color="error" @click="deleteShipment(item)">
                <v-icon>mdi-delete</v-icon>
              </v-btn>
            </td>
          </tr>
        </template>

        <template #no-data>
          <v-card-text>No shipments found.</v-card-text>
        </template>
      </v-data-table>

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
  { title: "Actions", key: "actions" },
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
  },
  {
    trackingId: "ST-1002",
    recipient: "Beta Ltd",
    origin: "Port Harcourt",
    destination: "Lagos",
    status: "On Route",
  },
  {
    trackingId: "ST-1003",
    recipient: "Gamma Inc",
    origin: "Kano",
    destination: "Kaduna",
    status: "Delayed",
  },
]);

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

const pageCount = computed(() =>
  Math.max(1, Math.ceil(filteredShipments.value.length / itemsPerPage.value))
);

function viewShipment(item) {
  console.log("view", item);
}

function deleteShipment(item) {
  const idx = shipments.value.findIndex((s) => s.trackingId === item.trackingId);
  if (idx !== -1) shipments.value.splice(idx, 1);
}

function exportCsv() {
  const rows = [headers.map((h) => h.title).join(",")];
  filteredShipments.value.forEach((r) => {
    rows.push(
      [r.trackingId, r.recipient, r.origin, r.destination, r.status]
        .map((c) => `"${String(c).replace(/"/g, '""')}"`)
        .join(",")
    );
  });

  const blob = new Blob([rows.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", "shipments.csv");
  document.body.appendChild(link);
  link.click();

  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
</script>

<style scoped>
.all-shipments .title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  inline-size: 100%;
}

.all-shipments .controls {
  display: flex;
  align-items: center;
  gap: 12px;
}

.all-shipments .spacer {
  flex: 1 1 auto;
}

.status-select {
  min-inline-size: 140px;
}

.perpage-select {
  inline-size: 90px;
}
</style>
