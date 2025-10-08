<template>
  <div class="oas-page page-container">
    <!-- Header -->
    <v-card class="pa-6 mb-6">
      <h2 class="mb-1">OAS Upload & Export</h2>
      <p class="text-grey">
        Manage data synchronization with the Overseas Aftersales System (OAS). Upload project reports or export verified datasets.
      </p>
    </v-card>

    <!-- Upload Section -->
    <v-card class="pa-6 mb-8">
      <h3 class="mb-4">📤 Upload Data to OAS</h3>
      <v-row align="center" justify="space-between">
        <v-col cols="12" sm="6" md="8">
          <v-file-input
            v-model="uploadFile"
            label="Select report or document"
            accept=".csv,.xlsx,.xls,.pdf"
            prepend-icon="mdi-upload"
            dense
            outlined
            show-size
          />
        </v-col>

        <v-col cols="12" sm="6" md="4" class="text-right">
          <v-btn
            color="primary"
            :disabled="!uploadFile"
            @click="uploadToOAS"
            block
          >
            <v-icon start>mdi-cloud-upload</v-icon>
            Upload to OAS
          </v-btn>
        </v-col>
      </v-row>

      <v-progress-linear
        v-if="uploading"
        indeterminate
        color="primary"
        class="mt-4"
      />
      <v-alert
        v-if="uploadSuccess"
        type="success"
        class="mt-4"
        border="start"
        variant="tonal"
      >
        File successfully uploaded to OAS.
      </v-alert>
    </v-card>

    <!-- Export Section -->
    <v-card class="pa-6">
      <h3 class="mb-4">📥 Export Data from OAS</h3>

      <v-row align="center" class="mb-4">
        <v-col cols="12" sm="6" md="4">
          <v-select
            v-model="exportType"
            label="Select Report Type"
            :items="reportTypes"
            outlined
            dense
          />
        </v-col>

        <v-col cols="12" sm="6" md="4">
          <v-select
            v-model="exportFormat"
            label="Select Format"
            :items="['CSV', 'XLSX', 'PDF']"
            outlined
            dense
          />
        </v-col>

        <v-col cols="12" sm="12" md="4" class="text-right">
          <v-btn
            color="success"
            :disabled="!exportType || !exportFormat"
            @click="exportData"
            block
          >
            <v-icon start>mdi-download</v-icon>
            Export Data
          </v-btn>
        </v-col>
      </v-row>

      <v-progress-linear
        v-if="exporting"
        indeterminate
        color="success"
        class="mt-4"
      />

      <v-alert
        v-if="exportSuccess"
        type="success"
        class="mt-4"
        border="start"
        variant="tonal"
      >
        {{ exportType }} report exported successfully as {{ exportFormat }}.
      </v-alert>
    </v-card>
  </div>
</template>

<script setup>
import { ref } from "vue";

const uploadFile = ref(null);
const uploading = ref(false);
const uploadSuccess = ref(false);

const exportType = ref("");
const exportFormat = ref("");
const exporting = ref(false);
const exportSuccess = ref(false);

const reportTypes = [
  "Installation Report",
  "Pre-Commissioning Report",
  "Training Attendance",
  "Delivery Receipts",
  "Site Readiness Checklist",
  "Project Summary",
];

// Simulate upload
function uploadToOAS() {
  uploading.value = true;
  uploadSuccess.value = false;
  setTimeout(() => {
    uploading.value = false;
    uploadSuccess.value = true;
    uploadFile.value = null;
  }, 2000);
}

// Simulate export
function exportData() {
  exporting.value = true;
  exportSuccess.value = false;
  setTimeout(() => {
    exporting.value = false;
    exportSuccess.value = true;
  }, 1500);
}
</script>

<style scoped>
.oas-page {
  padding-bottom: 80px;
}
</style>
