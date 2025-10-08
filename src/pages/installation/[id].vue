<template>
  <div class="installation-details page-container">
    <v-card class="pa-5 mb-6">
      <v-btn icon @click="$router.back()"><v-icon>mdi-arrow-left</v-icon></v-btn>
      <h2 class="mt-3">Installation Details – {{ installation?.poNumber }}</h2>
      <p class="text-body-2 text-grey-darken-1 mb-3">
        Supplier: <strong>{{ installation?.supplier }}</strong> •
        Product: <strong>{{ installation?.product }}</strong> •
        Country: <strong>{{ installation?.country }}</strong>
      </p>
    </v-card>

    <!-- Map -->
    <v-card class="pa-4 mb-6">
      <h3 class="mb-3">Installation Location</h3>
      <div id="map" class="map-container"></div>
    </v-card>

    <!-- Installation Checklist -->
    <v-card class="pa-4 mb-10">
      <h3 class="mb-4">Annex E – Solar Refrigerator Installation Checklist</h3>

      <v-form v-model="isValid">
        <!-- Basic Info -->
        <v-row>
          <v-col cols="12" sm="6">
            <v-text-field label="Date" v-model="form.date" type="date" />
          </v-col>
          <v-col cols="12" sm="6">
            <v-text-field label="Installation Technician" v-model="form.technician" />
          </v-col>
          <v-col cols="12" sm="6">
            <v-text-field label="Installation Company" v-model="form.company" />
          </v-col>
          <v-col cols="12" sm="6">
            <v-text-field label="Health Facility" v-model="form.facility" />
          </v-col>
        </v-row>

        <!-- CHECK 1: System Description -->
        <v-divider class="my-5" />
        <h4>Check 1 – System Description</h4>
        <v-row>
          <v-col cols="12" sm="6">
            <v-text-field label="Qualified Supplier" v-model="form.check1.supplier" />
          </v-col>
          <v-col cols="12" sm="6">
            <v-text-field label="Model / Serial No." v-model="form.check1.model" />
          </v-col>
        </v-row>

        <!-- CHECK 2: Shipment Details -->
        <v-divider class="my-5" />
        <h4>Check 2 – Shipment Details</h4>
        <v-radio-group v-model="form.check2.damaged" label="Was the shipment damaged?">
          <v-radio label="Yes" value="yes" />
          <v-radio label="No" value="no" />
        </v-radio-group>
        <v-textarea v-model="form.check2.comments" label="Comments" rows="2" />

        <!-- CHECK 3: Solar Panel Installation -->
        <v-divider class="my-5" />
        <h4>Check 3 – Solar Panel Installation</h4>
        <v-radio-group v-model="form.check3.angle" label="Installed at correct angle toward equator?">
          <v-radio label="Yes" value="yes" />
          <v-radio label="No" value="no" />
        </v-radio-group>
        <v-radio-group v-model="form.check3.shadow" label="Do shadows fall between 9 am – 3 pm?">
          <v-radio label="Yes" value="yes" />
          <v-radio label="No" value="no" />
        </v-radio-group>
        <v-textarea v-model="form.check3.comments" label="Comments" rows="2" />

        <!-- CHECK 5: Functionality Test -->
        <v-divider class="my-5" />
        <h4>Check 5 – Functionality Test</h4>
        <v-radio-group v-model="form.check5.tested" label="Has functionality test been carried out?">
          <v-radio label="Yes" value="yes" />
          <v-radio label="No" value="no" />
        </v-radio-group>
        <v-file-input
          v-model="form.check5.report"
          label="Upload Functionality Test Report"
          accept=".pdf,.jpg,.png"
          prepend-icon="mdi-upload"
        />

        <!-- CHECK 6: Training -->
        <v-divider class="my-5" />
        <h4>Check 6 – Training</h4>
        <v-text-field
          label="Number of staff trained in usage"
          v-model="form.check6.trainedUse"
          type="number"
        />
        <v-text-field
          label="Number trained in preventive maintenance"
          v-model="form.check6.trainedMaintenance"
          type="number"
        />

        <!-- CHECK 7: Documentation -->
        <v-divider class="my-5" />
        <h4>Check 7 – Documentation</h4>
        <v-checkbox
          label="User manuals supplied"
          v-model="form.check7.userManual"
        />
        <v-checkbox
          label="Technician manuals supplied"
          v-model="form.check7.techManual"
        />
        <v-checkbox
          label="Installation manuals supplied"
          v-model="form.check7.installManual"
        />

        <!-- CHECK 8: Conclusion -->
        <v-divider class="my-5" />
        <h4>Check 8 – Overall Conclusion</h4>
        <v-radio-group v-model="form.check8.recommendation" label="Recommendation">
          <v-radio label="Pass" value="pass" />
          <v-radio label="Fail" value="fail" />
        </v-radio-group>
        <v-textarea
          label="Outstanding work (if any)"
          v-model="form.check8.comments"
          rows="3"
        />

        <!-- Save -->
        <v-card-actions>
          <v-spacer />
          <v-btn color="primary" @click="saveForm" :disabled="!isValid">Save Report</v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const route = useRoute();
const id = route.params.id;

// Example: you’d fetch the full installation record from API
const installation = ref({
  id,
  supplier: "Techlogix Ltd",
  poNumber: "PO-1001",
  product: "Solar Inverter 10 kW",
  country: "Nigeria",
  province: "Lagos",
  lat: 6.5244,
  lng: 3.3792,
});

const form = ref({
  date: new Date().toISOString().slice(0, 10),
  technician: "",
  company: "",
  facility: "",
  check1: { supplier: "", model: "" },
  check2: { damaged: "no", comments: "" },
  check3: { angle: "yes", shadow: "no", comments: "" },
  check5: { tested: "yes", report: null },
  check6: { trainedUse: 0, trainedMaintenance: 0 },
  check7: { userManual: false, techManual: false, installManual: false },
  check8: { recommendation: "pass", comments: "" },
});

const isValid = ref(false);

function saveForm() {
  console.log("Form saved", form.value);
  alert("Installation Checklist Saved ✔️");
}

// Map
onMounted(() => {
  const map = L.map("map").setView([installation.value.lat, installation.value.lng], 7);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 18,
  }).addTo(map);
  L.marker([installation.value.lat, installation.value.lng])
    .addTo(map)
    .bindPopup(`<b>${installation.value.product}</b><br>${installation.value.country}`);
});
</script>

<style scoped>
.map-container {
  height: 400px;
  border-radius: 10px;
  overflow: hidden;
}
</style>
