<template>
  <div class="technicians-page page-container">
    <!-- Header Summary Cards -->
    <v-card class="pa-4 mb-6">
      <h2 class="mb-4">Technicians & Teams</h2>

      <v-row>
        <v-col
          v-for="stat in stats"
          :key="stat.label"
          cols="12" sm="6" md="3"
        >
          <v-card :color="stat.color" dark class="pa-4 stat-card">
            <div class="text-h5 font-weight-bold">{{ stat.value }}</div>
            <div class="text-subtitle-1">{{ stat.label }}</div>
          </v-card>
        </v-col>
      </v-row>
    </v-card>

    <!-- Search and Controls -->
    <v-card class="pa-3 mb-4">
      <div class="title-row">
        <h3>Technicians Directory</h3>
        <div class="controls">
          <v-text-field
            v-model="search"
            placeholder="Search name, phone, or designation"
            dense hide-details clearable append-icon="mdi-magnify"
          />
          <v-btn color="primary" small @click="openAddDialog">
            <v-icon start>mdi-plus</v-icon> Add Technician
          </v-btn>
        </div>
      </div>
    </v-card>

    <!-- Technicians Table -->
    <v-data-table
      :headers="headers"
      :items="filteredTechnicians"
      :items-per-page="itemsPerPage"
      v-model:page="page"
      class="elevation-1 clickable-table"
      @click:row="goToDetails"
    >
      <template #item.avatar="{ item }">
        <v-avatar size="36"><img :src="item.avatar" /></v-avatar>
      </template>

      <template #item.designation="{ item }">
        <v-chip
          :color="item.designation === 'Team Lead' ? 'primary' : 'info'"
          small
        >
          {{ item.designation }}
        </v-chip>
      </template>

      <template #item.status="{ item }">
        <v-chip :color="item.status === 'online' ? 'success' : 'grey'" small>
          <v-icon start size="14">
            {{ item.status === 'online' ? 'mdi-circle' : 'mdi-circle-outline' }}
          </v-icon>
          {{ item.status }}
        </v-chip>
      </template>

      <template #item.sites="{ item }">
        <div class="flex flex-wrap gap-1">
          <v-chip
            v-for="site in item.sites"
            :key="site"
            color="secondary"
            small
            label
          >
            {{ site }}
          </v-chip>
        </div>
      </template>

      <template #no-data>
        <v-card-text>No technicians found.</v-card-text>
      </template>
    </v-data-table>

    <v-card-actions>
      <v-pagination v-model="page" :length="pageCount" />
      <v-spacer />
      <v-select
        v-model="itemsPerPage"
        :items="[5, 10, 25, 50]"
        dense
        hide-details
        class="perpage-select"
      />
    </v-card-actions>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const search = ref("");
const page = ref(1);
const itemsPerPage = ref(10);

const technicians = ref([
  {
    id: 1,
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "+234 801 123 4567",
    designation: "Team Lead",
    sites: ["Lagos", "Ibadan", "Abuja"],
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    status: "online",
    installsCompleted: 25,
  },
  {
    id: 2,
    name: "Mary Johnson",
    email: "mary.j@example.com",
    phone: "+234 802 987 6543",
    designation: "Helper",
    sites: ["Accra", "Kumasi"],
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    status: "offline",
    installsCompleted: 10,
  },
  {
    id: 3,
    name: "Samuel Adeyemi",
    email: "samuel.a@example.com",
    phone: "+234 805 222 8888",
    designation: "Team Lead",
    sites: ["Kano", "Kaduna"],
    avatar: "https://randomuser.me/api/portraits/men/47.jpg",
    status: "online",
    installsCompleted: 30,
  },
  {
    id: 4,
    name: "Fatima Bello",
    email: "fatima.b@example.com",
    phone: "+234 803 999 3333",
    designation: "Ad-hoc",
    sites: ["Jos"],
    avatar: "https://randomuser.me/api/portraits/women/65.jpg",
    status: "offline",
    installsCompleted: 6,
  },
]);

// Table headers
const headers = [
  { title: "Avatar", key: "avatar", align: "start" },
  { title: "Name", key: "name" },
  { title: "Email", key: "email" },
  { title: "Phone", key: "phone" },
  { title: "Designation", key: "designation" },
  { title: "Sites", key: "sites" },
  { title: "Status", key: "status" },
];

// Search and filters
const filteredTechnicians = computed(() => {
  const q = search.value.toLowerCase();
  return technicians.value.filter((t) =>
    [t.name, t.email, t.phone, t.designation]
      .join(" ")
      .toLowerCase()
      .includes(q)
  );
});

// Pagination
const pageCount = computed(() =>
  Math.max(1, Math.ceil(filteredTechnicians.value.length / itemsPerPage.value))
);

// Summary stats
const stats = computed(() => {
  const leads = technicians.value.filter((t) => t.designation === "Team Lead").length;
  const helpers = technicians.value.filter((t) => t.designation === "Helper").length;
  const adhoc = technicians.value.filter((t) => t.designation === "Ad-hoc").length;
  const installs = technicians.value.reduce((sum, t) => sum + t.installsCompleted, 0);
  return [
    { label: "Total Team Leads", value: leads, color: "primary" },
    { label: "Total Helpers", value: helpers, color: "info" },
    { label: "Total Ad-hoc Techs", value: adhoc, color: "warning" },
    { label: "Total Installs Completed", value: installs, color: "success" },
  ];
});

// Navigation
function goToDetails(event, { item }) {
  router.push(`/technicians/${item.id}`);
}

function openAddDialog() {
  alert("Add technician modal will go here");
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
  gap: 12px;
  align-items: center;
}
.stat-card {
  border-radius: 12px;
  text-align: center;
  transition: transform 0.2s;
}
.stat-card:hover {
  transform: scale(1.03);
}
.clickable-table tbody tr {
  cursor: pointer;
  transition: background-color 0.2s;
}
.clickable-table tbody tr:hover {
  background-color: rgba(0, 0, 0, 0.04);
}
.perpage-select {
  width: 90px;
}
</style>
