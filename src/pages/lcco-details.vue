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

// Table filters & pagination (client-side)
const tableFilters = ref({
  search: "",
  state: null,
  per_page: 10,
  page: 1,
});

const filteredInstallations = computed(() => {
  let list = allInstallations.value || [];
  const q = (tableFilters.value.search || "").toString().toLowerCase().trim();
  if (tableFilters.value.state) {
    const target = (tableFilters.value.state || "").toString().toLowerCase().trim();
    list = list.filter(inst => ((inst.facility?.state?.name || inst.state || "").toString().toLowerCase().trim()) === target);
  }
  if (q) {
    list = list.filter(inst => {
      const site = (inst.facility?.name || inst.site_name || inst.name || "").toString().toLowerCase();
      const lcco = (lccoMap.value[inst.id]?.lcco_name || "").toString().toLowerCase();
      return site.includes(q) || lcco.includes(q);
    });
  }
  return list;
});

const paginatedInstallations = computed(() => {
  const per = Number(tableFilters.value.per_page) || 10;
  const page = Number(tableFilters.value.page) || 1;
  const items = filteredInstallations.value;
  const start = (page - 1) * per;
  return items.slice(start, start + per);
});

const tableLastPage = computed(() => {
  const per = Number(tableFilters.value.per_page) || 10;
  return Math.max(1, Math.ceil((filteredInstallations.value || []).length / per));
});

// debounce search
let searchTimeout;
watch(() => tableFilters.value.search, (newVal) => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    tableFilters.value.page = 1;
  }, 300);
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
  // Ensure form.installation_id is synced with selected installation
  if (!form.value.installation_id && selectedInstallationId.value) {
    form.value.installation_id = selectedInstallationId.value
  }

  // Basic client validation
  if (!form.value.installation_id) {
    errors.value.installation_id = ["Installation is required"];
    message.value = "Please select a site before updating.";
    console.warn('submitLcco validation failed: missing installation_id')
    return;
  }
  if (!form.value.lcco_name || form.value.lcco_name.trim() === "") {
    errors.value.lcco_name = ["LCCO name is required"];
    return;
  }

  isLoading.value = true;
  console.log('submitLcco: submitting', { installation_id: form.value.installation_id, lcco_name: form.value.lcco_name })
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
      console.warn('submitLcco validation errors', err.errors)
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
          <!-- Filters for table -->
          <VRow class="mb-4">
            <VCol cols="12" sm="6" md="4">
              <AppTextField
                v-model="tableFilters.search"
                label="Search"
                placeholder="Search installations or LCCO..."
                prepend-inner-icon="tabler-search"
                clearable
                @click:clear="() => { tableFilters.value.search = '' }"
              />
            </VCol>

            <VCol cols="12" sm="6" md="4">
              <AppSelect
                v-model="tableFilters.state"
                :items="statesData"
                item-title="name"
                item-value="name"
                label="State"
                clearable
              />
            </VCol>

            <VCol cols="12" sm="6" md="2">
              <AppSelect
                v-model="tableFilters.per_page"
                :items="[10,25,50,100]"
                label="Items per page"
              />
            </VCol>

            <VCol cols="12" sm="6" md="2" class="d-flex align-center">
              <VBtn variant="tonal" @click="() => { tableFilters.value = { search: '', state: null, per_page: 10, page: 1 } }">
                Clear
              </VBtn>
            </VCol>
          </VRow>
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
                  :error-messages="errors.installation_id"
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
                <VBtn
                  type="submit"
                  @click="submitLcco"
                  :loading="isLoading"
                  :disabled="isLoading"
                >
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
                <td colspan="8" class="text-center py-8">
                  <VProgressCircular indeterminate color="primary" />
                  <div class="text-body-2 mt-2">Loading installations...</div>
                </td>
              </tr>

              <tr v-else-if="filteredInstallations.length === 0">
                <td colspan="8" class="text-center py-8">
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
                v-for="inst in paginatedInstallations"
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
          <!-- Pagination -->
          <VRow v-if="filteredInstallations.length > 0" class="mt-4">
            <VCol cols="12" class="d-flex justify-center">
              <VPagination
                v-model="tableFilters.page"
                :length="tableLastPage"
                :total-visible="7"
              />
            </VCol>
          </VRow>
        </VCardText>
      </VCard>
    </VCol>
  </VRow>
</template>
