<template>
  <div class="warehouse-page page-container">
    <!-- Summary Section -->
    <v-card class="pa-4 mb-6">
      <h2 class="mb-4 d-flex align-center">
        <VIcon icon="tabler-building-warehouse" color="primary" class="me-2" />
        Warehouse Overview
      </h2>

      <v-row>
        <v-col cols="12" sm="6" md="3" v-for="stat in stats" :key="stat.label">
          <v-card class="pa-4 stat-card" :color="stat.color" dark>
            <div class="d-flex align-center justify-center mb-2">
              <VIcon :icon="stat.icon" size="26" class="me-2" />
              <div class="text-h5 font-weight-bold">{{ stat.value }}</div>
            </div>
            <div class="text-subtitle-1">{{ stat.label }}</div>
          </v-card>
        </v-col>
      </v-row>
    </v-card>

    <!-- Filter Controls -->
    <v-card>
      <v-card-title>
        <div class="title-row">
          <h3 class="d-flex align-center">
            <VIcon icon="tabler-list-details" color="primary" class="me-2" />
            All Warehouses
          </h3>

          <div class="controls">
            <v-text-field
              v-model="search"
              placeholder="Search warehouses"
              dense
              hide-details
              clearable
              append-icon="tabler-search"
            />
            <v-select
              v-model="statusFilter"
              :items="statusOptions"
              dense
              hide-details
              class="status-select"
              label="Status"
            />
            <v-btn color="primary" @click="exportCsv" small>
              <VIcon icon="tabler-download" start /> Export CSV
            </v-btn>
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
          <v-btn icon size="small" color="info" @click="editWarehouse(item)">
            <VIcon icon="tabler-edit" />
          </v-btn>
          <v-btn icon size="small" color="error" @click="deleteWarehouse(item)">
            <VIcon icon="tabler-trash" />
          </v-btn>
        </template>

        <template #no-data>
          <v-card-text>No warehouses found.</v-card-text>
        </template>
      </v-data-table>
<v-dialog v-model="editDialog" max-width="600px" persistent>
  <v-card>
    <v-card-title>
      <VIcon icon="tabler-edit" class="me-2" color="primary" />
      Edit Warehouse
    </v-card-title>

    <v-card-text>
      <VForm @submit.prevent="saveWarehouse">
        <VRow>
          <!-- Name -->
          <VCol cols="12">
            <AppTextField
              v-model="selectedWarehouse.name"
              label="Name"
              placeholder="e.g. Central Warehouse"
            />
          </VCol>

          <!-- Code -->
          <VCol cols="12">
            <AppTextField
              v-model="selectedWarehouse.code"
              label="Code"
              placeholder="e.g. WH-001"
            />
          </VCol>

          <!-- City & State (side by side) -->
          <VCol cols="6">
            <AppTextField
              v-model="selectedWarehouse.city"
              label="City"
              placeholder="e.g. Lagos"
            />
          </VCol>
          <VCol cols="6">
            <AppTextField
              v-model="selectedWarehouse.state"
              label="State"
              placeholder="e.g. Lagos"
            />
          </VCol>

          <!-- Country -->
          <VCol cols="12">
            <AppTextField
              v-model="selectedWarehouse.country"
              label="Country"
              placeholder="e.g. Nigeria"
            />
          </VCol>

          <!-- Contact Person -->
          <VCol cols="12">
            <AppTextField
              v-model="selectedWarehouse.contact_person"
              label="Contact Person"
              placeholder="e.g. John Doe"
            />
          </VCol>

          <!-- Contact Phone -->
          <VCol cols="12">
            <AppTextField
              v-model="selectedWarehouse.contact_phone"
              label="Phone"
              placeholder="e.g. 08012345678"
            />
          </VCol>

          <!-- Active Switch -->
          <VCol cols="12">
            <v-switch
              v-model="selectedWarehouse.active"
              label="Active"
            />
          </VCol>

          <!-- Actions -->
          <VCol cols="12" class="d-flex justify-end">
            <VBtn variant="text" @click="editDialog = false">Cancel</VBtn>
            <VBtn color="primary" type="submit" class="ms-2">Save</VBtn>
          </VCol>
        </VRow>
      </VForm>
    </v-card-text>
  </v-card>
</v-dialog>



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
import { ref, computed, onMounted } from "vue"
import warehouseService from "@/services/wareHouseService"
import { toast } from "vue3-toastify" // ✅ new toast import
import "vue3-toastify/dist/index.css"

// State
const warehouses = ref([])
const loading = ref(false)
const search = ref("")
const statusFilter = ref("All")
const page = ref(1)
const itemsPerPage = ref(10)

// Modal state
const editDialog = ref(false)
const selectedWarehouse = ref(null)

// Table headers
const headers = [
  { title: "Code", key: "code" },
  { title: "Name", key: "name" },
  { title: "City", key: "city" },
  { title: "State", key: "state" },
  { title: "Country", key: "country" },
  { title: "Contact Person", key: "contact_person" },
  { title: "Phone", key: "contact_phone" },
  { title: "Status", key: "active" },
  { title: "Actions", key: "actions" },
]

const statusOptions = ["All", "Active", "Inactive"]

// ✅ Fetch warehouses from API
async function loadWarehouses() {
  try {
    loading.value = true
    warehouses.value = await warehouseService.getAll()
  } catch (err) {
    console.error("Failed to load warehouses:", err)
    toast.error("Error loading warehouses ⚠️")
  } finally {
    loading.value = false
  }
}

onMounted(loadWarehouses)

// 🧮 Filters
const filteredWarehouses = computed(() => {
  const q = search.value.toLowerCase()
  return warehouses.value.filter((w) => {
    const status = w.active ? "Active" : "Inactive"
    const matchesStatus =
      statusFilter.value === "All" || status === statusFilter.value
    const matchesSearch =
      !q ||
      w.name?.toLowerCase().includes(q) ||
      w.city?.toLowerCase().includes(q) ||
      w.code?.toLowerCase().includes(q)
    return matchesStatus && matchesSearch
  })
})

const pageCount = computed(() =>
  Math.max(1, Math.ceil(filteredWarehouses.value.length / itemsPerPage.value))
)

// ✏️ Open edit dialog
function editWarehouse(item) {
  selectedWarehouse.value = { ...item } // clone
  editDialog.value = true
}

// 💾 Save warehouse update
async function saveWarehouse() {
  try {
    await warehouseService.update(selectedWarehouse.value.id, selectedWarehouse.value)
    toast.success("✅ Warehouse updated successfully")
    editDialog.value = false
    await loadWarehouses()
  } catch (err) {
    console.error("Update failed:", err)
    toast.error("❌ Failed to update warehouse")
  }
}

// 🗑 Delete warehouse with confirmation
async function deleteWarehouse(item) {
  if (!confirm(`Are you sure you want to delete "${item.name}"?`)) return
  try {
    await warehouseService.delete(item.id)
    toast.success("🗑️ Warehouse deleted")
    await loadWarehouses()
  } catch (err) {
    console.error("Delete failed:", err)
    toast.error("⚠️ Failed to delete warehouse")
  }
}

// 📦 Export CSV (unchanged)
function exportCsv() {
  const headersRow = headers.map((h) => h.title).join(",")
  const rows = filteredWarehouses.value.map((w) =>
    [
      w.code,
      w.name,
      w.city,
      w.state,
      w.country,
      w.contact_person,
      w.contact_phone,
      w.active ? "Active" : "Inactive",
    ]
      .map((c) => `"${String(c || "").replace(/"/g, '""')}"`)
      .join(",")
  )
  const csv = [headersRow, ...rows].join("\n")
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = "warehouses.csv"
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
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
