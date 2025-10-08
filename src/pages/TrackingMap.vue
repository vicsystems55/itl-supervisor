<template>
  <div class="tracking-map page-container">
    <!-- Header -->
    <v-card class="pa-4 mb-4">
      <div class="title-row">
        <h2>Shipment Tracking Map</h2>
        <div class="controls">
          <v-select
            v-model="statusFilter"
            :items="statusOptions"
            label="Filter by Status"
            dense
            hide-details
            class="status-select"
          />
          <v-btn color="primary" @click="refreshMap" small>Refresh Map</v-btn>
        </div>
      </div>
    </v-card>

    <!-- Map -->
    <v-card class="map-card elevation-2">
      <div id="map" class="map-container"></div>
    </v-card>
  </div>
</template>

<script setup>
import L from "leaflet";
import "leaflet-routing-machine";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import "leaflet/dist/leaflet.css";
import { computed, onMounted, ref, watch } from "vue";

const statusFilter = ref("All");
const statusOptions = ["All", "Delivered", "On Route", "Delayed"];

// Mock shipment data (replace with API data)
const shipments = ref([
  {
    id: 1,
    trackingId: "ST-1001",
    recipient: "Acme Corp",
    origin: [6.5244, 3.3792], // Lagos
    destination: [9.0579, 7.4951], // Abuja
    current: [7.2, 5.1],
    status: "Delivered",
  },
  {
    id: 2,
    trackingId: "ST-1002",
    recipient: "Beta Ltd",
    origin: [4.8156, 7.0498], // Port Harcourt
    destination: [6.5244, 3.3792], // Lagos
    current: [5.5, 5.3],
    status: "On Route",
  },
  {
    id: 3,
    trackingId: "ST-1003",
    recipient: "Gamma Inc",
    origin: [12.0022, 8.5919], // Kano
    destination: [10.52, 7.44], // Kaduna
    current: [11.1, 8.0],
    status: "Delayed",
  },
]);

const map = ref(null);
const markers = ref([]);
const routes = ref([]);

// Filtered shipments
const filteredShipments = computed(() => {
  if (statusFilter.value === "All") return shipments.value;
  return shipments.value.filter((s) => s.status === statusFilter.value);
});

function initMap() {
  if (map.value) {
    map.value.remove(); // reset map if already exists
  }

  map.value = L.map("map").setView([9.082, 8.6753], 6); // Center Nigeria

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "&copy; OpenStreetMap contributors",
  }).addTo(map.value);

  renderShipments();
}

function renderShipments() {
  // Remove old markers and routes
  markers.value.forEach((m) => map.value.removeLayer(m));
  routes.value.forEach((r) => map.value.removeControl(r));
  markers.value = [];
  routes.value = [];

  filteredShipments.value.forEach((shipment) => {
    // Add marker for current location
    const marker = L.marker(shipment.current, {
      title: shipment.trackingId,
    }).addTo(map.value);

    marker.bindPopup(`
      <div>
        <strong>${shipment.trackingId}</strong><br/>
        Recipient: ${shipment.recipient}<br/>
        Status: <b>${shipment.status}</b><br/>
      </div>
    `);

    markers.value.push(marker);

    // Add real route line using Leaflet Routing Machine
    const routeControl = L.Routing.control({
      waypoints: [
        L.latLng(shipment.origin[0], shipment.origin[1]),
        L.latLng(shipment.destination[0], shipment.destination[1]),
      ],
      lineOptions: {
        styles: [
          { color: getRouteColor(shipment.status), weight: 5, opacity: 0.8 },
        ],
      },
      routeWhileDragging: false,
      addWaypoints: false,
      draggableWaypoints: false,
      fitSelectedRoutes: false, // keep the view stable
      show: false, // hide route summary panel
    }).addTo(map.value);

    routes.value.push(routeControl);
  });
}

function getRouteColor(status) {
  switch (status) {
    case "Delivered":
      return "green";
    case "On Route":
      return "blue";
    case "Delayed":
      return "red";
    default:
      return "gray";
  }
}

function refreshMap() {
  renderShipments();
}

// Reactively rerender when filter changes
watch(filteredShipments, () => {
  renderShipments();
});

onMounted(() => {
  initMap();
});
</script>

<style scoped>
.tracking-map {
  inline-size: 100%;
}

.map-card {
  overflow: hidden;
  block-size: 75vh;
}

.map-container {
  block-size: 100%;
  inline-size: 100%;
}

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

.status-select {
  min-inline-size: 160px;
}
</style>
