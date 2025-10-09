<template>
  <div class="authorization-page page-container">
    <!-- Header -->
    <v-card class="pa-6 mb-6">
      <h2 class="mb-1 d-flex align-center">
        <VIcon icon="tabler-lock" color="primary" class="me-2" />
        Roles & Permissions Matrix
      </h2>
      <p class="text-grey">
        Manage and assign permissions for each role below. Scroll to view all
        roles and permissions.
      </p>
    </v-card>

    <!-- Summary Cards -->
    <v-row class="mb-6">
      <v-col cols="12" sm="6" md="3">
        <v-card class="pa-4 stat-card" color="primary" dark>
          <div class="text-h5 font-weight-bold">{{ roles.length }}</div>
          <div class="text-subtitle-1">Total Roles</div>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card class="pa-4 stat-card" color="success" dark>
          <div class="text-h5 font-weight-bold">{{ permissions.length }}</div>
          <div class="text-subtitle-1">Total Permissions</div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Scrollable Matrix -->
    <v-card>
      <v-card-title class="d-flex justify-space-between align-center">
        <div class="d-flex align-center">
          <VIcon icon="tabler-shield-lock" color="primary" class="me-2" />
          <span class="text-h6">Permissions Matrix</span>
        </div>
        <v-btn color="primary" small @click="saveMatrix">
          <VIcon icon="tabler-device-floppy" start /> Save Changes
        </v-btn>
      </v-card-title>

      <!-- Scrollable area (both X and Y) -->
      <div class="matrix-scroll" style="max-height: 900px; overflow: auto">
        <v-data-table
          :headers="headers"
          :items="permissions"
          :items-per-page="-1"
          class="elevation-1 matrix-table"
          item-value="id"
          hide-default-footer
          density="comfortable"
          fixed-header
          height="700px"
        >
          <!-- Permission Name Column -->
          <template #item.permission="{ item }">
            <strong>{{ item.name }}</strong>
          </template>

          <!-- Dynamic Role Columns -->
          <template
            v-for="role in roles"
            :key="'col-' + role.id"
            v-slot:[`item.${role.name}`]="{ item }"
          >
            <div class="text-center">
              <v-checkbox
                density="compact"
                hide-details
                color="primary"
                v-model="matrix[role.id]"
                :value="item.id"
                @change="togglePermission(role.id, item.id)"
              />
            </div>
          </template>

          <template #no-data>
            <v-card-text>No permissions found.</v-card-text>
          </template>
        </v-data-table>
      </div>
    </v-card>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import {
  fetchRoles,
  fetchPermissions,
  updateRole,
} from "@/services/rolesServices";

const roles = ref([]);
const permissions = ref([]);
const matrix = ref({});

// Dynamic table headers
const headers = computed(() => {
  const base = [
    { title: "Permission", key: "permission", align: "start", width: "250px" },
  ];
  const roleHeaders = roles.value.map((r) => ({
    title: r.name,
    key: r.name,
    align: "center",
    sortable: false,
    width: "150px",
  }));
  return [...base, ...roleHeaders];
});

// Fetch data
onMounted(async () => {
  await loadData();
});

// Load all data properly
async function loadData() {
  const [rolesData, permissionsData] = await Promise.all([
    fetchRoles(),
    fetchPermissions(),
  ]);

  roles.value = rolesData;
  permissions.value = permissionsData;

  // Ensure permissions are unique and complete
  const allPermsMap = new Map();
  permissions.value.forEach((p) => allPermsMap.set(p.id, p));
  roles.value.forEach((role) => {
    (role.permissions || []).forEach((p) => {
      if (!allPermsMap.has(p.id)) allPermsMap.set(p.id, p);
    });
  });

  permissions.value = Array.from(allPermsMap.values()).sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  buildMatrix();
}

// Build initial role → permission mapping
function buildMatrix() {
  roles.value.forEach((role) => {
    matrix.value[role.id] = role.permissions?.map((p) => p.id) || [];
  });
}

// Toggle permission in the matrix
function togglePermission(roleId, permId) {
  const rolePerms = matrix.value[roleId];
  const index = rolePerms.indexOf(permId);
  if (index === -1) rolePerms.push(permId);
  else rolePerms.splice(index, 1);
}

// Save updates
async function saveMatrix() {
  try {
    for (const role of roles.value) {
      await updateRole(role.id, {
        name: role.name,
        permissions: matrix.value[role.id],
      });
    }
    alert("Permissions updated successfully.");
  } catch (err) {
    console.error(err);
    alert("Error saving permissions.");
  }
}
</script>

<style scoped>
.page-container {
  padding-bottom: 40px;
}

/* Summary Cards */
.stat-card {
  border-radius: 12px;
  text-align: center;
  transition: transform 0.2s;
}
.stat-card:hover {
  transform: scale(1.03);
}

/* Scrollable Table Area */
.matrix-scroll {
  overflow-x: auto;
  overflow-y: auto;
  min-height: 700px;
  max-width: 100%;
  border-radius: 12px;
}

/* Table Styling */
.matrix-table {
  min-width: 900px;
  border-radius: 12px;
}

.v-data-table {
  font-size: 14px;
}

.v-data-table th {
  text-align: center;
  font-weight: 600;
  white-space: nowrap;
  position: sticky;
  top: 0;
  background-color: #1e1e1e;
  z-index: 1;
}

.v-data-table td {
  text-align: center;
  vertical-align: middle;
}
</style>
