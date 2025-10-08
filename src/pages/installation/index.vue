<template>
  <div class="installation-page page-container">
    <!-- Header Summary Cards -->
    <v-card class="pa-4 mb-6">
      <h2 class="mb-4">Reporting on Implementation Schedule (Annex G)</h2>

      <v-row>
        <v-col
          v-for="card in summaryCards"
          :key="card.label"
          cols="12"
          sm="6"
          md="3"
        >
          <v-card class="pa-4 stat-card" :color="card.color" dark>
            <div class="text-h5 font-weight-bold">{{ card.value }}</div>
            <div class="text-subtitle-1">{{ card.label }}</div>
          </v-card>
        </v-col>
      </v-row>
    </v-card>

    <!-- Filter Controls -->
    <v-card>
      <v-card-title>
        <div class="title-row">
          <h3>Installation List</h3>
          <div class="controls">
            <v-text-field
              v-model="search"
              placeholder="Search supplier, country, or product"
              dense
              hide-details
              clearable
              append-icon="mdi-magnify"
            />
            <v-btn color="primary" @click="exportCsv" small>
              <v-icon start>mdi-download</v-icon>Export CSV
            </v-btn>
          </div>
        </div>
      </v-card-title>

      <!-- Data Table -->
      <v-data-table
        :headers="headers"
        :items="filteredInstallations"
        :items-per-page="itemsPerPage"
        v-model:page="page"
        class="elevation-1 clickable-table"
        @click:row="goToDetails"
      >
        <!-- Custom cells -->
        <template #item.plannedEnd="{ item }">
          {{ formatDate(item.plannedEnd) }}
        </template>

        <template #item.actualEnd="{ item }">
          {{ formatDate(item.actualEnd) }}
        </template>

        <template #item.deviations="{ item }">
          <v-chip
            :color="item.deviations > 0 ? 'error' : 'success'"
            small
          >
            {{ item.deviations }}
          </v-chip>
        </template>

        <!-- No data -->
        <template #no-data>
          <v-card-text>No installation records found.</v-card-text>
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
import { useRouter } from "vue-router";

const router = useRouter();

// --- State ---
const search = ref("");
const page = ref(1);
const itemsPerPage = ref(10);

// --- Table headers (Annex G structure) ---
const headers = [
  { title: "Country", key: "country" },
  { title: "Province", key: "province" },
  { title: "Supplier", key: "supplier" },
  { title: "PO Number", key: "poNumber" },
  { title: "PO Item Number", key: "poItem" },
  { title: "Service Contract Number", key: "contract" },
  { title: "Product Model", key: "product" },
  { title: "Quantity Received (After Customs)", key: "qtyReceived" },
  { title: "Date Received (After Customs)", key: "dateReceived" },
  { title: "Delivered to Facilities", key: "qtyDelivered" },
  { title: "Installed at Facilities", key: "qtyInstalled" },
  { title: "Planned Installation End", key: "plannedEnd" },
  { title: "Actual Installation End", key: "actualEnd" },
  { title: "Deviations", key: "deviations" },
  { title: "Supplier Comments", key: "comments" },
];

// --- Sample Data ---
const installations = ref([
  {
    id: 1,
    country: "Nigeria",
    province: "Lagos",
    supplier: "Techlogix Ltd",
    poNumber: "PO-1001",
    poItem: "A-45",
    contract: "SCN-2203",
    product: "Solar Inverter 10kW",
    qtyReceived: 50,
    dateReceived: "2025-07-12",
    qtyDelivered: 48,
    qtyInstalled: 45,
    plannedEnd: "2025-08-20",
    actualEnd: "2025-08-25",
    deviations: 2,
    comments: "Delay due to customs clearance.",
  },
  {
    id: 2,
    country: "Nigeria",
    province: "Abuja",
    supplier: "EnergyPro Systems",
    poNumber: "PO-1002",
    poItem: "B-32",
    contract: "SCN-2204",
    product: "Battery Bank 5kWh",
    qtyReceived: 100,
    dateReceived: "2025-06-15",
    qtyDelivered: 100,
    qtyInstalled: 100,
    plannedEnd: "2025-07-10",
    actualEnd: "2025-07-09",
    deviations: 0,
    comments: "Completed ahead of schedule.",
  },
  {
    id: 3,
    country: "Ghana",
    province: "Accra",
    supplier: "SolarWorks Africa",
    poNumber: "PO-1003",
    poItem: "C-10",
    contract: "SCN-2205",
    product: "Solar Panels 500W",
    qtyReceived: 200,
    dateReceived: "2025-05-10",
    qtyDelivered: 200,
    qtyInstalled: 180,
    plannedEnd: "2025-06-30",
    actualEnd: "2025-07-05",
    deviations: 3,
    comments: "Installation delayed due to weather.",
  },
]);

// --- Filters ---
const filteredInstallations = computed(() => {
  const q = search.value.toLowerCase();
  return installations.value.filter((i) =>
    [
      i.country,
      i.province,
      i.supplier,
      i.product,
      i.poNumber,
      i.contract,
    ]
      .join(" ")
      .toLowerCase()
      .includes(q)
  );
});

// --- Summary Cards ---
const summaryCards = computed(() => {
  const total = installations.value.length;
  const completed = installations.value.filter((i) => i.deviations === 0).length;
  const withDeviation = installations.value.filter((i) => i.deviations > 0).length;
  const totalInstalled = installations.value.reduce((sum, i) => sum + i.qtyInstalled, 0);

  return [
    { label: "Total Projects", value: total, color: "primary" },
    { label: "Completed On Time", value: completed, color: "success" },
    { label: "With Deviations", value: withDeviation, color: "error" },
    { label: "Total Units Installed", value: totalInstalled, color: "info" },
  ];
});

// --- Pagination ---
const pageCount = computed(() =>
  Math.max(1, Math.ceil(filteredInstallations.value.length / itemsPerPage.value))
);

// --- Utils ---
function formatDate(date) {
  if (!date) return "-";
  return new Date(date).toLocaleDateString();
}

// --- Export CSV ---
function exportCsv() {
  const rows = [headers.map((h) => h.title).join(",")];
  filteredInstallations.value.forEach((i) => {
    rows.push(
      [
        i.country,
        i.province,
        i.supplier,
        i.poNumber,
        i.poItem,
        i.contract,
        i.product,
        i.qtyReceived,
        i.dateReceived,
        i.qtyDelivered,
        i.qtyInstalled,
        i.plannedEnd,
        i.actualEnd,
        i.deviations,
        i.comments,
      ]
        .map((c) => `"${String(c).replace(/"/g, '""')}"`)
        .join(",")
    );
  });

  const blob = new Blob([rows.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", "installation_report.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// --- Row Click Navigation ---
function goToDetails(event, { item }) {
 router.push(`/installation/${item.id}`);
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
.spacer {
  flex: 1 1 auto;
}
.perpage-select {
  width: 90px;
}
.clickable-table tbody tr {
  cursor: pointer;
  transition: background-color 0.2s;
}
.clickable-table tbody tr:hover {
  background-color: rgba(0, 0, 0, 0.05);
}
</style>
