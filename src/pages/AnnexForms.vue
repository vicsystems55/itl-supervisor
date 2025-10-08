<template>
  <div class="annex-forms page-container">
    <!-- Header -->
    <v-card class="pa-6 mb-6">
      <h2 class="mb-1">Annex Forms Library</h2>
      <p class="text-grey">
        Central repository for all official project annex documents and checklists.
      </p>
    </v-card>

    <!-- Upload Section -->
    <v-card class="pa-4 mb-6">
      <v-row align="center" justify="space-between">
        <v-col cols="12" sm="8">
          <v-file-input
            v-model="newFile"
            label="Upload Annex Document"
            accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.jpg,.png"
            prepend-icon="mdi-upload"
            show-size
            dense
            outlined
          />
        </v-col>

        <v-col cols="12" sm="4" class="text-right">
          <v-btn
            color="primary"
            :disabled="!newFile"
            @click="uploadFile"
            block
          >
            <v-icon start>mdi-cloud-upload</v-icon>
            Upload
          </v-btn>
        </v-col>
      </v-row>
    </v-card>

    <!-- Files Grid -->
    <v-row>
      <v-col
        v-for="(doc, i) in annexFiles"
        :key="i"
        cols="12"
        sm="6"
        md="4"
      >
        <v-card class="pa-4 annex-card">
          <div class="d-flex align-center justify-between mb-3">
            <v-icon size="28" color="primary">
              {{ getFileIcon(doc.type) }}
            </v-icon>
            <v-chip size="small" color="grey-lighten-2">{{ doc.type.toUpperCase() }}</v-chip>
          </div>

          <div class="font-weight-medium mb-1">{{ doc.name }}</div>
          <div class="text-grey text-body-2 mb-3">Uploaded: {{ doc.date }}</div>

          <div class="d-flex justify-end gap-2">
            <v-btn icon size="small" @click="downloadFile(doc)">
              <v-icon>mdi-download</v-icon>
            </v-btn>
            <v-btn icon size="small" color="error" @click="removeFile(i)">
              <v-icon>mdi-delete</v-icon>
            </v-btn>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- No Data -->
    <v-card v-if="!annexFiles.length" class="pa-8 text-center text-grey">
      <v-icon size="40" class="mb-2">mdi-folder-open</v-icon>
      <div>No annex documents uploaded yet.</div>
    </v-card>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { saveAs } from "file-saver";

// Mock Annex Files
const annexFiles = ref([
  {
    name: "Annex 1 - Distribution List.pdf",
    type: "pdf",
    date: "2025-09-15",
    url: "#",
  },
  {
    name: "Annex 2 - Delivery Note.docx",
    type: "docx",
    date: "2025-09-20",
    url: "#",
  },
  {
    name: "Annex 3 - Installation Checklist.xlsx",
    type: "xlsx",
    date: "2025-09-22",
    url: "#",
  },
]);

const newFile = ref(null);

function getFileIcon(type) {
  switch (type) {
    case "pdf":
      return "mdi-file-pdf-box";
    case "doc":
    case "docx":
      return "mdi-file-word-box";
    case "xls":
    case "xlsx":
    case "csv":
      return "mdi-file-excel-box";
    case "jpg":
    case "png":
      return "mdi-file-image";
    default:
      return "mdi-file-document-outline";
  }
}

function uploadFile() {
  if (!newFile.value) return;
  const file = newFile.value;
  annexFiles.value.push({
    name: file.name,
    type: file.name.split(".").pop(),
    date: new Date().toLocaleDateString(),
    url: URL.createObjectURL(file),
  });
  newFile.value = null;
}

function removeFile(index) {
  annexFiles.value.splice(index, 1);
}

function downloadFile(doc) {
  saveAs(doc.url, doc.name);
}
</script>

<style scoped>
.annex-card {
  border-radius: 12px;
  transition: transform 0.2s;
}
.annex-card:hover {
  transform: scale(1.02);
}
.page-container {
  padding-bottom: 80px;
}
</style>
