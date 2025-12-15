<script setup>
import lccoService from "@/services/lccoService";
import { computed, onMounted, ref, watch } from "vue";

definePage({
  meta: {
    layout: "blank",
    public: true,
  },
});

const statesData = ref([]); // [{ id, name }]
const selectedStateId = ref(""); // will store state name
const selectedInstallationId = ref(null);

const form = ref({
  installation_id: null,
  lcco_name: "",
  lcco_phone: "",
  lcco_bank_name: "",
  lcco_account_number: "",
  lcco_account_name: "",
  device_tag_code: "",
  device_serial_number: "",
  installation_status: "",
  payment_status: "",
});

const isLoading = ref(false);
const message = ref("");
const errors = ref({});

const installationsForSelectedState = ref([]);
const isLoadingSites = ref(false);
const groupedInstallations = ref({});
const allInstallations = ref([]);
const lccoRecords = ref([]);
const lccoMap = computed(() => {
  const map = {};
  lccoRecords.value.forEach((r) => {
    if (r && r.installation_id) map[r.installation_id] = r;
  });
  return map;
});

onMounted(async () => {
  await fetchAllInstallations();
  await fetchLccoRecords();
  // alert("Please select state and installation to proceed to LCCO details.");
});

const fetchLccoRecords = async () => {
  try {
    const res = await lccoService.index();
    if (res && res.success && Array.isArray(res.data))
      lccoRecords.value = res.data;
    else if (res && res.success && res.data && Array.isArray(res.data.data))
      lccoRecords.value = res.data.data;
  } catch (err) {
    console.warn("Failed to fetch LCCO records", err);
    lccoRecords.value = [];
  }
};

// watch state selection so changes trigger onStateChange reliably
watch(selectedStateId, (value, oldVal) => {
  if (value !== oldVal) {
    console.log("watch:selectedStateId ->", value);
    onStateChange();
  }
});

const fetchAllInstallations = async () => {
  try {
    isLoading.value = true;
    // Request installations with a large per_page to avoid pagination (using LccoService native fetch to avoid axios token)
    const res = await lccoService.getInstallationsNoAuth({ per_page: 9999 });
    console.log("All installations fetched:", res);

    let items = [];
    if (res && res.success) {
      if (Array.isArray(res.data)) items = res.data;
      else if (res.data && Array.isArray(res.data.data)) items = res.data.data;
    }

    if (items.length) {
      allInstallations.value = items;
      const map = {};
      items.forEach((inst) => {
        // Prefer facility.state.name when available (backend structure)
        const stateName =
          inst.facility?.state?.name ||
          inst.state ||
          inst.state_name ||
          inst.stateName ||
          "Unknown";
        if (!map[stateName]) map[stateName] = [];
        map[stateName].push(inst);
      });

      groupedInstallations.value = map;
      // console.log(groupedInstallations.value);
      statesData.value = Object.keys(map).map((name) => ({ name }));
      console.log(statesData);
    }
  } catch (err) {
    console.error("Failed to load all installations", err);
  } finally {
    isLoading.value = false;
  }
};

const onStateChange = async () => {
  selectedInstallationId.value = null;
  console.log("onStateChange: selected state ->", selectedStateId.value);
  // clear installation-specific fields
  form.value.installation_id = null;
  form.value.device_tag_code = "";
  form.value.device_serial_number = "";
  form.value.installation_status = "";

  if (!selectedStateId.value) {
    installationsForSelectedState.value = [];
    return;
  }

  // Ensure we have grouped installations
  if (!Object.keys(groupedInstallations.value).length) {
    await fetchAllInstallations();
  }

  isLoadingSites.value = true;
  // Filter from the full installations list using facility.state.name (case-insensitive)
  const target = (selectedStateId.value || "").toString().toLowerCase().trim();
  const list = allInstallations.value.filter((inst) => {
    const stateName = (
      inst.facility?.state?.name ||
      inst.state ||
      inst.state_name ||
      inst.stateName ||
      ""
    )
      .toString()
      .toLowerCase()
      .trim();
    return stateName === target;
  });
  installationsForSelectedState.value = list.map((inst) => ({
    ...inst,
    // Prefer facility.name for site label
    site_name:
      inst.facility?.name ||
      inst.facility?.address ||
      inst.site_name ||
      inst.site ||
      inst.name ||
      inst.address ||
      inst.location ||
      "Unknown Site",
  }));
  isLoadingSites.value = false;
};

const onInstallationChange = () => {
  const installation = installationsForSelectedState.value.find(
    (i) => i.id === selectedInstallationId.value
  );
  if (installation) {
    form.value.installation_id = installation.id;
    // Prefill known values if available
    form.value.device_tag_code =
      installation.device_tag_code || installation.tag_code || "";
    form.value.device_serial_number =
      installation.device_serial_number || installation.serial_number || "";
    form.value.installation_status =
      installation.installation_status || installation.status || "";
  } else {
    form.value.installation_id = null;
  }
};

const submitLcco = async () => {
  message.value = "";
  errors.value = {};

  // Basic client validation
  if (!form.value.installation_id) {
    errors.value.installation_id = ["Installation is required"];
    return;
  }
  if (!form.value.lcco_name || form.value.lcco_name.trim() === "") {
    errors.value.lcco_name = ["LCCO name is required"];
    return;
  }

  isLoading.value = true;
  try {
    const payload = { ...form.value };
    const res = await lccoService.create(payload);
    if (res && res.success) {
      message.value = res.message || "LCCO saved successfully.";
      // Clear form (keep selected state for convenience)
      selectedInstallationId.value = null;
      form.value = {
        installation_id: null,
        lcco_name: "",
        lcco_phone: "",
        lcco_bank_name: "",
        lcco_account_number: "",
        lcco_account_name: "",
        device_tag_code: "",
        device_serial_number: "",
        installation_status: "",
        payment_status: "pending",
      };
    } else {
      message.value = res?.message || "Failed to save LCCO.";
    }
  } catch (err) {
    if (err && err.errors) {
      errors.value = err.errors;
      message.value = "Validation failed. Please correct the fields.";
    } else {
      console.error("Error saving LCCO:", err);
      message.value = err?.message || "Error saving LCCO.";
    }
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <VRow class="pa-6" justify="center">
    <VCol cols="12" md="6">
      <VCard flat class="pa-6">
        <VCardText>
          <h4 class="text-h6 mb-2">LCCO Details</h4>
          <p class="mb-4">Select a state and click Update.</p>
        </VCardText>

        <VAlert
          v-if="message"
          :color="message.includes('success') ? 'success' : 'error'"
          variant="tonal"
          class="mb-4"
        >
          {{ message }}
        </VAlert>

        <VCardText>
          <VForm @submit.prevent="submitLcco">
            <VRow>
              <!-- State select -->
              <VCol cols="12">
                <VSelect
                  v-model="selectedStateId"
                  :items="statesData"
                  item-title="name"
                  item-value="name"
                  label="State"
                  :disabled="isLoading"
                  dense
                  outlined
                  @change="onStateChange"
                />
              </VCol>

              <!-- Site select -->
              <VCol cols="12">
                <VSelect
                  v-model="selectedInstallationId"
                  :items="installationsForSelectedState"
                  item-title="site_name"
                  item-value="id"
                  label="Site"
                  :disabled="!selectedStateId || isLoadingSites || isLoading"
                  dense
                  outlined
                  :loading="isLoadingSites"
                  @change="onInstallationChange"
                />
              </VCol>

              <!-- LCCO and device fields -->
              <VCol cols="12">
                <AppTextField
                  v-model="form.lcco_name"
                  label="LCCO Name"
                  :disabled="isLoading"
                  :error-messages="errors.lcco_name"
                />
              </VCol>

              <VCol cols="12" md="6">
                <AppTextField
                  v-model="form.lcco_bank_name"
                  label="LCCO Bank Name"
                  :disabled="isLoading"
                  :error-messages="errors.lcco_bank_name"
                />
              </VCol>

              <VCol cols="12" md="6">
                <AppTextField
                  v-model="form.lcco_account_number"
                  label="LCCO Account Number"
                  :disabled="isLoading"
                  :error-messages="errors.lcco_account_number"
                />
              </VCol>

              <VCol cols="12">
                <AppTextField
                  v-model="form.lcco_account_name"
                  label="LCCO Account Name"
                  :disabled="isLoading"
                  :error-messages="errors.lcco_account_name"
                />
              </VCol>

              <VCol cols="12" md="6">
                <AppTextField
                  v-model="form.device_tag_code"
                  label="Device Tag Number"
                  placeholder="NPHCDA/GF/ADA/SDD/125/***"

                  :disabled="isLoading"
                />
              </VCol>

              <VCol cols="12" md="6">
                <AppTextField
                  v-model="form.device_serial_number"
                  label="Device Serial Number"
                  placeholder="BE0G31GAT00QER****"
                  :disabled="isLoading"
                  
                />
              </VCol>

              <VCol cols="12" class="text-right">
                <VBtn type="submit" :loading="isLoading" :disabled="isLoading">
                  <span v-if="!isLoading">Update</span>
                  <span v-else>Updating...</span>
                </VBtn>
              </VCol>
            </VRow>
          </VForm>
        </VCardText>
      </VCard>
    </VCol>

    <!-- Installations table -->
    <VCol cols="12">
      <VCard flat class="pa-4 mt-6">
        <VCardTitle>Installations</VCardTitle>
        <VCardText>
          <VTable class="installation-table">
            <thead>
              <tr>
                <th class="text-left">State</th>
                <th class="text-left">LGA</th>
               
                <th class="text-left">LCCO Name</th>
                <th class="text-left">LCCO Contact</th>
                <th class="text-left">Serial</th>
                <th class="text-left">Tag</th>
                <th class="text-left">Account Status</th>
                <th class="text-left">Submitted</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="isLoading">
                <td colspan="9" class="text-center py-8">
                  <VProgressCircular indeterminate color="primary" />
                  <div class="text-body-2 mt-2">Loading installations...</div>
                </td>
              </tr>

              <tr v-else-if="allInstallations.length === 0">
                <td colspan="9" class="text-center py-8">
                  <VIcon
                    icon="tabler-package-off"
                    size="48"
                    class="text-medium-emphasis mb-2"
                  />
                  <div class="text-body-1 text-medium-emphasis">
                    No installations found
                  </div>
                </td>
              </tr>

              <tr
                v-else
                v-for="inst in allInstallations"
                :key="inst.id"
                class="installation-row"
              >
                <td>
                  <VChip
                    v-if="inst.facility?.state"
                    variant="tonal"
                    color="primary"
                    size="small"
                  >
                    {{ inst.facility.state.name }}
                  </VChip>
                  <span v-else class="text-body-2">N/A</span>
                </td>

                <td class="text-body-2">
                  {{ inst.facility?.lga?.name || inst.lga?.name || "N/A" }}
                </td>

              

                <td>{{ lccoMap[inst.id]?.lcco_name || "-" }}</td>
                <td>{{ lccoMap[inst.id]?.lcco_phone || "-" }}</td>
                <td>
                  {{
                    lccoMap[inst.id]?.device_serial_number ||
                    inst.device_serial_number ||
                    "-"
                  }}
                </td>
                <td>
                  {{
                    lccoMap[inst.id]?.device_tag_code ||
                    inst.device_tag_code ||
                    "-"
                  }}
                </td>
                <td>{{ lccoMap[inst.id]?.payment_status ?? "-" }}</td>
                <td>
                  <VChip
                    v-if="lccoMap[inst.id]"
                    color="success"
                    density="compact"
                    variant="tonal"
                    >Submitted</VChip
                  >
                  <span v-else>—</span>
                </td>
              </tr>
            </tbody>
          </VTable>
        </VCardText>
      </VCard>
    </VCol>
  </VRow>
</template>
