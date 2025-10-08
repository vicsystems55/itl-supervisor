<template>
  <div class="project-reports page-container">
    <!-- Header -->
    <v-card class="pa-6 mb-6">
      <h2 class="mb-1">Project Reports Dashboard</h2>
      <p class="text-grey">Overview of the CCE Implementation & Reporting Phases</p>
    </v-card>

    <!-- KPI Cards -->
    <v-row class="mb-6">
      <v-col
        v-for="card in kpiCards"
        :key="card.label"
        cols="12"
        sm="6"
        md="3"
      >
        <v-card :color="card.color" dark class="pa-4 text-center stat-card">
          <div class="text-h5 font-weight-bold">{{ card.value }}</div>
          <div class="text-subtitle-1">{{ card.label }}</div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Charts -->
    <v-row class="mb-6">
      <v-col cols="12" md="6">
        <v-card class="pa-4">
          <h4 class="mb-4">Phase Progress Overview</h4>
          <VueApexCharts
            type="donut"
            height="300"
            :options="phaseChartOptions"
            :series="phaseSeries"
          />
        </v-card>
      </v-col>

      <v-col cols="12" md="6">
        <v-card class="pa-4">
          <h4 class="mb-4">Installations by Province</h4>
          <VueApexCharts
            type="bar"
            height="300"
            :options="provinceChartOptions"
            :series="provinceSeries"
          />
        </v-card>
      </v-col>
    </v-row>

    <!-- Tabbed Reports Section -->
    <v-card>
      <v-tabs v-model="tab" color="primary">
        <v-tab>Distribution</v-tab>
        <v-tab>Installation</v-tab>
        <v-tab>Training</v-tab>
        <v-tab>Pre-commissioning</v-tab>
        <v-tab>Acceptance / After-sales</v-tab>
      </v-tabs>

      <v-window v-model="tab" class="pa-4">
        <!-- Distribution -->
        <v-window-item value="0">
          <h3>Distribution Report</h3>
          <v-data-table
            :headers="distHeaders"
            :items="distributionData"
            dense
            class="elevation-1"
          />
        </v-window-item>

        <!-- Installation -->
        <v-window-item value="1">
          <h3>Installation Report</h3>
          <v-data-table
            :headers="installHeaders"
            :items="installationData"
            dense
            class="elevation-1"
          />
        </v-window-item>

        <!-- Training -->
        <v-window-item value="2">
          <h3>Training Report</h3>
          <v-data-table
            :headers="trainingHeaders"
            :items="trainingData"
            dense
            class="elevation-1"
          />
        </v-window-item>

        <!-- Pre-commissioning -->
        <v-window-item value="3">
          <h3>Pre-commissioning Report</h3>
          <v-data-table
            :headers="precommHeaders"
            :items="precommData"
            dense
            class="elevation-1"
          />
        </v-window-item>

        <!-- Acceptance / After-sales -->
        <v-window-item value="4">
          <h3>Acceptance & After-sales</h3>
          <v-data-table
            :headers="afterHeaders"
            :items="afterSalesData"
            dense
            class="elevation-1"
          />
        </v-window-item>
      </v-window>

      <!-- Export Button -->
      <v-card-actions>
        <v-spacer />
        <v-btn color="primary" @click="exportReport">
          <v-icon start>mdi-download</v-icon>
          Export Report (PDF)
        </v-btn>
      </v-card-actions>
    </v-card>
  </div>
</template>

<script setup>
import { ref } from "vue";
import VueApexCharts from "vue3-apexcharts";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// === KPI CARDS ===
const kpiCards = ref([
  { label: "Total CCE Delivered", value: 1800, color: "primary" },
  { label: "Installations Completed", value: 1650, color: "success" },
  { label: "Active Technicians", value: 42, color: "info" },
  { label: "Pre-commission Reports", value: 1550, color: "warning" },
]);

// === CHART DATA ===
const phaseSeries = ref([100, 90, 85, 80, 60]);
const phaseChartOptions = ref({
  labels: [
    "Distribution",
    "Installation",
    "Training",
    "Pre-commission",
    "Acceptance",
  ],
  colors: ["#1976D2", "#4CAF50", "#FF9800", "#E91E63", "#00BCD4"],
  legend: { position: "bottom" },
  dataLabels: { enabled: true },
});

const provinceSeries = ref([
  {
    name: "Installations",
    data: [220, 180, 160, 140, 130],
  },
]);
const provinceChartOptions = ref({
  chart: { type: "bar", toolbar: { show: false } },
  xaxis: { categories: ["Lagos", "Abuja", "Kano", "Kaduna", "P. Harcourt"] },
  colors: ["#1976D2"],
  dataLabels: { enabled: true },
  grid: { borderColor: "#eee" },
});

// === TABS ===
const tab = ref(0);

// === DISTRIBUTION ===
const distHeaders = [
  { title: "Country", key: "country" },
  { title: "Province", key: "province" },
  { title: "Total Units Delivered", key: "delivered" },
  { title: "Delivery Receipts", key: "receipts" },
];
const distributionData = ref([
  { country: "Nigeria", province: "Lagos", delivered: 220, receipts: "Yes" },
  { country: "Nigeria", province: "Abuja", delivered: 180, receipts: "Yes" },
]);

// === INSTALLATION ===
const installHeaders = [
  { title: "Model", key: "model" },
  { title: "Total Installed", key: "installed" },
  { title: "Deviations", key: "deviations" },
];
const installationData = ref([
  { model: "HTD-40", installed: 500, deviations: 3 },
  { model: "HRF-100", installed: 400, deviations: 1 },
]);

// === TRAINING ===
const trainingHeaders = [
  { title: "Facility", key: "facility" },
  { title: "Trainees", key: "trainees" },
  { title: "Date", key: "date" },
];
const trainingData = ref([
  { facility: "Lagos GH", trainees: 6, date: "2025-09-10" },
  { facility: "Ibadan HC", trainees: 5, date: "2025-09-14" },
]);

// === PRECOMMISSION ===
const precommHeaders = [
  { title: "Facility", key: "facility" },
  { title: "Technician", key: "tech" },
  { title: "Stable Temperature", key: "tempStable" },
  { title: "Signed Checklist", key: "signed" },
];
const precommData = ref([
  { facility: "Abuja Clinic", tech: "John Doe", tempStable: "Yes", signed: "Yes" },
  { facility: "Kano HF", tech: "Mary Obi", tempStable: "Yes", signed: "Yes" },
]);

// === AFTER SALES ===
const afterHeaders = [
  { title: "Facility", key: "facility" },
  { title: "Maintenance Calls", key: "calls" },
  { title: "Resolved", key: "resolved" },
  { title: "Warranty Status", key: "warranty" },
];
const afterSalesData = ref([
  { facility: "Lagos GH", calls: 2, resolved: 2, warranty: "Active" },
  { facility: "Kaduna HF", calls: 1, resolved: 1, warranty: "Active" },
]);

// === EXPORT PDF ===
function exportReport() {
  const doc = new jsPDF();
  doc.text("CCE Project Reports Summary", 14, 16);
  autoTable(doc, {
    startY: 22,
    head: [["Phase", "Progress (%)"]],
    body: [
      ["Distribution", 100],
      ["Installation", 90],
      ["Training", 85],
      ["Pre-commission", 80],
      ["Acceptance", 60],
    ],
  });
  doc.save("project-report.pdf");
}
</script>

<style scoped>
.stat-card {
  border-radius: 12px;
  transition: transform 0.2s;
}
.stat-card:hover {
  transform: scale(1.03);
}
.page-container {
  padding-bottom: 80px;
}
</style>
