<template>
  <div class="installation-photos-page page-container">
    <v-row>
      <!-- Map Section -->
      <v-col cols="12" md="6">
        <v-card class="pa-3">
          <h2 class="mb-3">Installation Locations Map</h2>
          <div id="map" class="map-container"></div>
        </v-card>
      </v-col>

      <!-- Photo Gallery Section -->
      <v-col cols="12" md="6">
        <v-card class="pa-3">
          <div class="d-flex align-center justify-space-between mb-3">
            <h2>Installation Photos</h2>
            <div class="d-flex align-center gap-3">
              <v-select
                v-model="selectedLocation"
                :items="locations"
                item-title="name"
                item-value="id"
                label="Filter by Location"
                dense
                hide-details
                clearable
                style="max-width: 220px"
              />
              <v-btn color="primary" small @click="openAddDialog">
                <v-icon start>mdi-plus</v-icon>Add Photo
              </v-btn>
            </div>
          </div>

          <v-row v-if="filteredPhotos.length">
            <v-col
              v-for="photo in filteredPhotos"
              :key="photo.id"
              cols="6"
              sm="4"
              md="3"
            >
              <v-hover v-slot="{ isHovering, props }">
                <v-card
                  v-bind="props"
                  class="photo-card"
                  elevation="2"
                  @click="openPhoto(photo)"
                >
                  <v-img :src="photo.url" height="120" cover />
                  <v-expand-transition>
                    <div
                      v-if="isHovering"
                      class="photo-overlay d-flex align-center justify-center"
                    >
                      <v-icon color="white" size="30">mdi-eye</v-icon>
                    </div>
                  </v-expand-transition>
                </v-card>
              </v-hover>
            </v-col>
          </v-row>

          <div v-else class="text-center py-10 text-grey">
            <v-icon size="40">mdi-image-off-outline</v-icon>
            <p>No photos available for this location.</p>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Dialog for full-size photo -->
    <v-dialog v-model="dialog" max-width="800px">
      <v-card>
        <v-img :src="selectedPhoto?.url" height="500px" cover />
        <v-card-title>{{ selectedPhoto?.title }}</v-card-title>
        <v-card-subtitle>
          {{ selectedPhoto?.location }} — {{ selectedPhoto?.date }}
        </v-card-subtitle>
      </v-card>
    </v-dialog>

    <!-- Add Photo Dialog -->
    <v-dialog v-model="addDialog" max-width="500px" persistent>
      <v-card>
        <v-card-title>Add Installation Photo</v-card-title>
        <v-card-text>
          <v-text-field
            v-model="newPhoto.title"
            label="Photo Title"
            dense
            required
          />
          <v-select
            v-model="newPhoto.locationId"
            :items="locations"
            item-title="name"
            item-value="id"
            label="Select Location"
            dense
            required
          />
          <v-file-input
            v-model="newPhoto.file"
            label="Upload Photo"
            accept="image/*"
            dense
            show-size
            prepend-icon="mdi-camera"
            @change="previewImage"
          />
          <div v-if="previewUrl" class="mt-4">
            <v-img :src="previewUrl" height="150" contain class="rounded" />
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn text @click="addDialog = false">Cancel</v-btn>
          <v-btn color="primary" @click="addPhoto" :disabled="!canSave">
            Save
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const locations = [
  { id: "lagos", name: "Lagos, Nigeria", lat: 6.5244, lng: 3.3792 },
  { id: "abuja", name: "Abuja, Nigeria", lat: 9.0765, lng: 7.3986 },
  { id: "accra", name: "Accra, Ghana", lat: 5.6037, lng: -0.187 },
];

const photos = ref([
  {
    id: 1,
    location: "Lagos, Nigeria",
    locationId: "lagos",
    title: "Inverter Installation at Lekki Health Center",
    url: "https://images.unsplash.com/photo-1581091870622-1f94cf5b8b10?auto=format&fit=crop&w=600&q=60",
    date: "2025-08-12",
  },
  {
    id: 2,
    location: "Abuja, Nigeria",
    locationId: "abuja",
    title: "Battery Room Setup at Garki Clinic",
    url: "https://images.unsplash.com/photo-1603791440384-56cd371ee9a7?auto=format&fit=crop&w=600&q=60",
    date: "2025-07-25",
  },
]);

// Map setup
let map;
let markers = [];
const selectedLocation = ref(null);

onMounted(() => {
  map = L.map("map").setView([7.5, 3.5], 6);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 18,
    attribution: "© OpenStreetMap",
  }).addTo(map);

  locations.forEach((loc) => {
    const marker = L.marker([loc.lat, loc.lng])
      .addTo(map)
      .bindPopup(`<b>${loc.name}</b><br>Click to view photos.`);

    marker.on("click", () => {
      selectedLocation.value = loc.id;
    });

    markers.push(marker);
  });
});

const filteredPhotos = computed(() => {
  if (!selectedLocation.value) return photos.value;
  return photos.value.filter(
    (p) => p.locationId === selectedLocation.value
  );
});

// Photo view dialog
const dialog = ref(false);
const selectedPhoto = ref(null);
function openPhoto(photo) {
  selectedPhoto.value = photo;
  dialog.value = true;
}

// Add Photo Dialog
const addDialog = ref(false);
const newPhoto = ref({
  title: "",
  locationId: null,
  file: null,
});
const previewUrl = ref(null);

function openAddDialog() {
  newPhoto.value = { title: "", locationId: null, file: null };
  previewUrl.value = null;
  addDialog.value = true;
}

function previewImage(file) {
  if (!file || !file[0]) return;
  const reader = new FileReader();
  reader.onload = (e) => (previewUrl.value = e.target.result);
  reader.readAsDataURL(file[0]);
}

const canSave = computed(
  () => newPhoto.value.title && newPhoto.value.locationId && newPhoto.value.file
);

function addPhoto() {
  const location = locations.find((l) => l.id === newPhoto.value.locationId);
  const imageUrl = previewUrl.value;

  photos.value.push({
    id: Date.now(),
    title: newPhoto.value.title,
    location: location.name,
    locationId: location.id,
    url: imageUrl,
    date: new Date().toISOString().split("T")[0],
  });

  addDialog.value = false;
  selectedLocation.value = location.id;
}
</script>

<style scoped>
.map-container {
  height: 480px;
  border-radius: 12px;
  overflow: hidden;
}
.photo-card {
  cursor: pointer;
  border-radius: 12px;
  overflow: hidden;
  position: relative;
}
.photo-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
}
.text-grey {
  color: #888;
}
</style>
