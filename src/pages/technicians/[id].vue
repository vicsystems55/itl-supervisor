<template>
  <div class="technician-details page-container">
    <!-- Header -->
    <v-btn icon @click="$router.back()"><v-icon>mdi-arrow-left</v-icon></v-btn>

    <v-card class="pa-5 mt-3 mb-6">
      <v-row>
        <v-col cols="12" sm="4" class="text-center">
          <v-avatar size="120" class="mb-3">
            <img :src="technician?.avatar" />
          </v-avatar>
          <h3>{{ technician?.name }}</h3>
          <v-chip
            :color="technician?.status === 'online' ? 'success' : 'grey'"
            small
          >
            <v-icon start size="14">
              {{ technician?.status === 'online' ? 'mdi-circle' : 'mdi-circle-outline' }}
            </v-icon>
            {{ technician?.status }}
          </v-chip>
        </v-col>

        <v-col cols="12" sm="8">
          <v-list dense>
            <v-list-item>
              <v-list-item-title><b>Email:</b> {{ technician?.email }}</v-list-item-title>
            </v-list-item>
            <v-list-item>
              <v-list-item-title><b>Phone:</b> {{ technician?.phone }}</v-list-item-title>
            </v-list-item>
            <v-list-item>
              <v-list-item-title><b>Designation:</b> {{ technician?.designation }}</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-col>
      </v-row>
    </v-card>

    <!-- Map -->
    <v-card class="pa-4 mb-6">
      <h3 class="mb-3">Assigned Site Locations</h3>
      <div id="map" class="map-container"></div>
    </v-card>

    <!-- Summary Cards -->
    <v-card class="pa-4 mb-6">
      <v-row>
        <v-col cols="12" sm="6" md="3" v-for="stat in stats" :key="stat.label">
          <v-card :color="stat.color" dark class="pa-4 text-center stat-card">
            <div class="text-h5 font-weight-bold">{{ stat.value }}</div>
            <div class="text-subtitle-1">{{ stat.label }}</div>
          </v-card>
        </v-col>
      </v-row>
    </v-card>

    <!-- Tabs for assigned sites -->
    <v-card class="pa-4 mb-6">
      <v-tabs v-model="activeTab" color="primary">
        <v-tab
          v-for="(site, i) in technician?.sites"
          :key="i"
        >
          {{ site.name }}
        </v-tab>
      </v-tabs>

      <v-window v-model="activeTab" class="mt-4">
        <v-window-item
          v-for="(site, i) in technician?.sites"
          :key="i"
        >
          <h4>{{ site.name }}</h4>
          <p><b>Status:</b> {{ site.status }}</p>
          <p><b>Last Updated:</b> {{ site.updated }}</p>
          <v-btn
            color="primary"
            @click="goToInstallation(site.installationId)"
            small
          >
            <v-icon start>mdi-wrench</v-icon>
            View Installation Details
          </v-btn>
        </v-window-item>
      </v-window>
    </v-card>

    <!-- Activity Logs -->
    <v-card class="pa-4">
      <h3 class="mb-3">Activity Logs</h3>
      <v-timeline side="end" align="start">
        <v-timeline-item
          v-for="(log, i) in activityLogs"
          :key="i"
          :dot-color="log.type === 'success' ? 'success' : log.type === 'warning' ? 'warning' : 'grey'"
        >
          <template #opposite>
            <strong>{{ log.time }}</strong>
          </template>
          <v-card class="pa-3">
            <div class="font-weight-medium">{{ log.title }}</div>
            <div class="text-body-2 text-grey">{{ log.details }}</div>
          </v-card>
        </v-timeline-item>
      </v-timeline>
    </v-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const route = useRoute();
const router = useRouter();

const id = route.params.id;

// Mock technician data (replace with API)
const technician = ref({
  id,
  name: "John Doe",
  email: "john.doe@example.com",
  phone: "+234 801 123 4567",
  designation: "Team Lead",
  avatar: "https://randomuser.me/api/portraits/men/32.jpg",
  status: "online",
  sites: [
    { name: "Lagos General Hospital", lat: 6.5244, lng: 3.3792, installationId: 1, status: "Completed", updated: "2025-09-12" },
    { name: "Ibadan Health Center", lat: 7.3775, lng: 3.9470, installationId: 2, status: "In Progress", updated: "2025-09-15" },
    { name: "Abuja Central Clinic", lat: 9.0765, lng: 7.3986, installationId: 3, status: "Pending", updated: "2025-09-16" },
  ],
});

const stats = ref([
  { label: "Total Assigned", value: technician.value.sites.length, color: "primary" },
  { label: "Completed Installations", value: 1, color: "success" },
  { label: "Ongoing", value: 1, color: "info" },
  { label: "Pending", value: 1, color: "warning" },
]);

const activeTab = ref(0);

// Activity Logs (sample)
const activityLogs = ref([
  { time: "2025-09-15 09:00", title: "Arrived at Ibadan Health Center", details: "Checked site readiness and power connections.", type: "info" },
  { time: "2025-09-15 13:30", title: "Installed panels", details: "Solar array mounted, wiring complete.", type: "success" },
  { time: "2025-09-15 15:00", title: "Conducted functionality test", details: "System stabilized after 2 hours.", type: "success" },
  { time: "2025-09-16 08:45", title: "Departed for Abuja", details: "ETA 12:30 PM", type: "warning" },
]);

onMounted(() => {
  const map = L.map("map").setView([7.5, 4.0], 6);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 18,
  }).addTo(map);

  technician.value.sites.forEach((s) => {
    const marker = L.marker([s.lat, s.lng])
      .addTo(map)
      .bindPopup(`<b>${s.name}</b><br>Status: ${s.status}`);
  });
});

function goToInstallation(id) {
  router.push(`/installation/${id}`);
}
</script>

<style scoped>
.map-container {
  height: 400px;
  border-radius: 12px;
  overflow: hidden;
}
.stat-card {
  border-radius: 12px;
  transition: transform 0.2s;
}
.stat-card:hover {
  transform: scale(1.02);
}
</style>
