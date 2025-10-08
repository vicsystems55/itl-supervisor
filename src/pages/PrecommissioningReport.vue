<template>
  <div class="precommission-page page-container">
    <v-card class="pa-4 mb-6">
      <h2 class="mb-4">Pre-Commissioning Reports</h2>
      <p class="text-body-2 text-grey-darken-1 mb-4">
        Functionality tests conducted after installation, in collaboration with health facility personnel.
        All tests and documentation must be completed before
        <strong>28 February 2026</strong>.
      </p>

      <!-- Summary Cards -->
      <v-row>
        <v-col cols="12" sm="6" md="3" v-for="s in stats" :key="s.label">
          <v-card :color="s.color" dark class="pa-4 stat-card">
            <div class="text-h5 font-weight-bold">{{ s.value }}</div>
            <div class="text-subtitle-1">{{ s.label }}</div>
          </v-card>
        </v-col>
      </v-row>
    </v-card>

    <!-- Filters -->
    <v-card class="pa-3 mb-6">
      <div class="title-row">
        <h3>Functionality Test Records</h3>
        <div class="controls">
          <v-text-field
            v-model="search"
            placeholder="Search facility or technician"
            dense hide-details clearable append-icon="mdi-magnify"
          />
          <v-select
            v-model="statusFilter"
            :items="['All', 'Pending', 'Passed', 'Failed']"
            dense hide-details class="status-select" label="Status"
          />
          <v-btn color="primary" @click="openAddDialog" small>
            <v-icon start>mdi-plus</v-icon>Add Record
          </v-btn>
          <v-btn color="success" @click="exportCsv" small>
            <v-icon start>mdi-download</v-icon>Export CSV
          </v-btn>
        </div>
      </div>
    </v-card>

    <!-- Data Table -->
    <v-data-table
      :headers="headers"
      :items="filteredRecords"
      class="elevation-1"
      :items-per-page="itemsPerPage"
      v-model:page="page"
    >
      <template #item.status="{ item }">
        <v-chip :color="chipColor(item.status)" small>{{ item.status }}</v-chip>
      </template>

      <template #item.checklist="{ item }">
        <v-btn icon small v-if="item.checklist" @click="viewChecklist(item)">
          <v-icon>mdi-file-eye</v-icon>
        </v-btn>
      </template>

      <template #no-data>
        <v-card-text>No pre-commissioning records yet.</v-card-text>
      </template>
    </v-data-table>

    <!-- Pagination -->
    <v-card-actions>
      <v-pagination v-model="page" :length="pageCount" />
      <v-spacer />
      <v-select
        v-model="itemsPerPage"
        :items="[5,10,25,50]"
        dense hide-details class="perpage-select"
      />
    </v-card-actions>

    <!-- Add Dialog -->
    <v-dialog v-model="addDialog" max-width="600px" persistent>
      <v-card>
        <v-card-title>Add Pre-Commissioning Record</v-card-title>
        <v-card-text>
          <v-text-field v-model="newRecord.facility" label="Health Facility" dense required />
          <v-text-field v-model="newRecord.province" label="Province" dense required />
          <v-text-field v-model="newRecord.technician" label="Technician Name" dense required />
          <v-menu v-model="menu" :close-on-content-click="false" transition="scale-transition" offset-y>
            <template #activator="{ props }">
              <v-text-field v-model="newRecord.date" label="Test Date" dense v-bind="props" readonly />
            </template>
            <v-date-picker v-model="newRecord.date" @input="menu = false"></v-date-picker>
          </v-menu>
          <v-select
            v-model="newRecord.status"
            :items="['Pending', 'Passed', 'Failed']"
            label="Functionality Status" dense required
          />
          <v-file-input
            v-model="newRecord.checklist"
            label="Upload Signed Checklist"
            accept=".pdf,.jpg,.png"
            prepend-icon="mdi-upload"
            dense
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer/>
          <v-btn text @click="addDialog=false">Cancel</v-btn>
          <v-btn color="primary" :disabled="!canSave" @click="addRecord">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Checklist Preview Dialog -->
    <v-dialog v-model="checklistDialog" max-width="800px">
      <v-card>
        <v-card-title>Checklist Preview</v-card-title>
        <v-card-text>
          <iframe
            v-if="selectedChecklist"
            :src="selectedChecklist"
            style="width:100%;height:500px;border:none"
          ></iframe>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";

// Table data
const search = ref("");
const statusFilter = ref("All");
const page = ref(1);
const itemsPerPage = ref(10);

const headers = [
  { title: "Facility", key: "facility" },
  { title: "Province", key: "province" },
  { title: "Technician", key: "technician" },
  { title: "Test Date", key: "date" },
  { title: "Status", key: "status" },
  { title: "Checklist", key: "checklist" },
];

const records = ref([
  {
    facility: "Lekki Health Center",
    province: "Lagos",
    technician: "John Doe",
    date: "2025-09-20",
    status: "Passed",
    checklist: null,
  },
  {
    facility: "Garki Clinic",
    province: "Abuja",
    technician: "Jane Smith",
    date: "2025-09-15",
    status: "Pending",
    checklist: null,
  },
]);

// Filters
const filteredRecords = computed(() => {
  const q = search.value?.toLowerCase() ?? "";
  return records.value.filter((r) => {
    const matchesStatus =
      statusFilter.value === "All" || r.status === statusFilter.value;
    const matchesSearch =
      !q ||
      r.facility.toLowerCase().includes(q) ||
      r.technician.toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });
});

const pageCount = computed(() =>
  Math.max(1, Math.ceil(filteredRecords.value.length / itemsPerPage.value))
);

// Summary cards
const stats = computed(() => {
  const total = records.value.length;
  const passed = records.value.filter((r) => r.status === "Passed").length;
  const pending = records.value.filter((r) => r.status === "Pending").length;
  const failed = records.value.filter((r) => r.status === "Failed").length;
  return [
    { label: "Total Reports", value: total, color: "primary" },
    { label: "Passed", value: passed, color: "success" },
    { label: "Pending", value: pending, color: "warning" },
    { label: "Failed", value: failed, color: "error" },
  ];
});

// Helpers
function chipColor(status) {
  switch (status) {
    case "Passed": return "success";
    case "Pending": return "warning";
    case "Failed": return "error";
    default: return "grey";
  }
}

// Add record
const addDialog = ref(false);
const menu = ref(false);
const newRecord = ref({
  facility: "",
  province: "",
  technician: "",
  date: "",
  status: "Pending",
  checklist: null,
});

const canSave = computed(() =>
  newRecord.value.facility &&
  newRecord.value.province &&
  newRecord.value.technician &&
  newRecord.value.date
);

function openAddDialog() {
  newRecord.value = {
    facility: "",
    province: "",
    technician: "",
    date: "",
    status: "Pending",
    checklist: null,
  };
  addDialog.value = true;
}

function addRecord() {
  const file = newRecord.value.checklist?.[0];
  let fileUrl = null;
  if (file) fileUrl = URL.createObjectURL(file);

  records.value.push({
    ...newRecord.value,
    checklist: fileUrl,
  });

  addDialog.value = false;
}

// Checklist Preview
const checklistDialog = ref(false);
const selectedChecklist = ref(null);
function viewChecklist(item) {
  selectedChecklist.value = item.checklist;
  checklistDialog.value = true;
}

// CSV Export
function exportCsv() {
  const headersRow = headers.map((h) => h.title).join(",");
  const rows = filteredRecords.value.map((r) =>
    [r.facility, r.province, r.technician, r.date, r.status].join(",")
  );
  const csv = [headersRow, ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "precommission_reports.csv";
  link.click();
}
</script>

<style scoped>
.title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.controls {
  display: flex;
  gap: 10px;
  align-items: center;
}
.stat-card {
  border-radius: 12px;
  text-align: center;
}
.perpage-select {
  width: 90px;
}
.status-select {
  width: 140px;
}
</style>
