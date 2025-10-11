<template>
  <div>
    <!-- Summary Cards -->
    <VRow class="mb-6">
      <VCol cols="12" sm="6" md="3">
        <SummaryCard
          title="Total Technicians"
          :value="summaryStats.total"
          icon="tabler-users"
          color="primary"
          @click="filterByRole('all')"
        />
      </VCol>
      <VCol cols="12" sm="6" md="3">
        <SummaryCard
          title="Technical Leads"
          :value="summaryStats.technical_lead"
          icon="tabler-user-star"
          color="info"
          @click="filterByRole('Technical Lead')"
        />
      </VCol>
      <VCol cols="12" sm="6" md="3">
        <SummaryCard
          title="Technical Assistants"
          :value="summaryStats.technical_assistant"
          icon="tabler-user-check"
          color="success"
          @click="filterByRole('Technical Assistant')"
        />
      </VCol>
      <VCol cols="12" sm="6" md="3">
        <SummaryCard
          title="Drivers"
          :value="summaryStats.driver"
          icon="tabler-steering-wheel"
          color="warning"
          @click="filterByRole('Driver')"
        />
      </VCol>
    </VRow>

    <!-- Filters and Search -->
    <VCard class="mb-6">
      <VCardText>
        <VRow>
          <VCol cols="12" md="6">
            <AppTextField
              v-model="searchQuery"
              placeholder="Search technicians by name or email..."
              prepend-inner-icon="tabler-search"
              density="compact"
              @input="debouncedSearch"
            />
          </VCol>
          <VCol cols="12" md="3">
            <AppSelect
              v-model="statusFilter"
              :items="statusOptions"
              placeholder="Filter by status"
              clearable
              density="compact"
            />
          </VCol>
          <VCol cols="12" md="3">
            <AppSelect
              v-model="roleFilter"
              :items="technicianRoleOptions"
              placeholder="Filter by role"
              clearable
              density="compact"
            />
          </VCol>
        </VRow>
      </VCardText>
    </VCard>

    <!-- Technicians Table -->
    <VCard>
      <VCardText>
        <VTable class="text-no-wrap">
          <thead>
            <tr>
              <th>TECHNICIAN</th>
              <th>ROLE</th>
              <th>CONTACT</th>
              <th>STATUS</th>
              <th>LAST ACTIVE</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="user in technicians"
              :key="user.id"
              class="clickable-row"
              @click="goToTechnicianDetails(user.id)"
            >
              <!-- User Info -->
              <td>
                <div class="d-flex align-center">
                  <VAvatar
                    size="38"
                    color="primary"
                    variant="tonal"
                    class="me-3"
                  >
                    <VIcon icon="tabler-user" />
                  </VAvatar>
                  <div>
                    <p class="text-base font-weight-medium mb-0">
                      {{ user.name }}
                    </p>
                    <p class="text-sm text-disabled mb-0">
                      {{ user.employee_id || 'N/A' }}
                    </p>
                  </div>
                </div>
              </td>

              <!-- Role -->
              <td>
                <VChip
                  :color="getRoleColor(user.roles[0]?.name)"
                  size="small"
                >
                  {{ user.roles[0]?.name || 'No role' }}
                </VChip>
              </td>

              <!-- Contact -->
              <td>
                <div>
                  <p class="text-sm mb-1">
                    <VIcon icon="tabler-phone" size="16" class="me-1" />
                    {{ user.phone || 'N/A' }}
                  </p>
                  <p class="text-sm mb-0">
                    <VIcon icon="tabler-mail" size="16" class="me-1" />
                    {{ user.email }}
                  </p>
                </div>
              </td>

              <!-- Status -->
              <td>
                <VChip
                  :color="user.deleted_at ? 'error' : 'success'"
                  size="small"
                >
                  {{ user.deleted_at ? 'Inactive' : 'Active' }}
                </VChip>
              </td>

              <!-- Last Active -->
              <td>
                <span class="text-sm">
                  {{ formatDate(user.last_login_at) || 'Never' }}
                </span>
              </td>

              <!-- Actions -->
              <td>
                <div class="d-flex gap-1">
                  <VTooltip>
                    <template #activator="{ props }">
                      <VBtn
                        v-bind="props"
                        icon
                        size="small"
                        variant="text"
                        color="primary"
                        @click.stop="goToTechnicianDetails(user.id)"
                      >
                        <VIcon icon="tabler-eye" size="20" />
                      </VBtn>
                    </template>
                    <span>View Details</span>
                  </VTooltip>

                  <VTooltip>
                    <template #activator="{ props }">
                      <VBtn
                        v-bind="props"
                        icon
                        size="small"
                        variant="text"
                        color="warning"
                        @click.stop="openResetPassword(user)"
                      >
                        <VIcon icon="tabler-key" size="20" />
                      </VBtn>
                    </template>
                    <span>Reset Password</span>
                  </VTooltip>

                  <VTooltip>
                    <template #activator="{ props }">
                      <VBtn
                        v-bind="props"
                        icon
                        size="small"
                        variant="text"
                        :color="user.deleted_at ? 'success' : 'error'"
                        @click.stop="toggleUserStatus(user)"
                      >
                        <VIcon
                          :icon="user.deleted_at ? 'tabler-user-plus' : 'tabler-user-minus'"
                          size="20"
                        />
                      </VBtn>
                    </template>
                    <span>{{ user.deleted_at ? 'Activate' : 'Deactivate' }}</span>
                  </VTooltip>
                </div>
              </td>
            </tr>
          </tbody>
        </VTable>

        <!-- Loading State -->
        <div
          v-if="loading"
          class="text-center py-8"
        >
          <VProgressCircular
            indeterminate
            color="primary"
          />
          <p class="text-sm mt-2">Loading technicians...</p>
        </div>

        <!-- Empty State -->
        <div
          v-else-if="!technicians.length"
          class="text-center py-8"
        >
          <VIcon
            icon="tabler-users"
            size="48"
            color="disabled"
            class="mb-2"
          />
          <p class="text-lg font-weight-medium">No technicians found</p>
          <p class="text-disabled">Try adjusting your search or filters</p>
        </div>

        <!-- Pagination -->
        <VCardText
          v-if="technicians.length"
          class="d-flex align-center flex-wrap justify-space-between gap-4"
        >
          <span class="text-sm text-disabled">
            Showing {{ pagination.from }} to {{ pagination.to }} of {{ pagination.total }} technicians
          </span>
          <VPagination
            v-model="pagination.currentPage"
            :length="pagination.lastPage"
            :total-visible="5"
            @update:model-value="fetchTechnicians"
          />
        </VCardText>
      </VCardText>
    </VCard>

    <!-- Reset Password Dialog (Reuse from previous) -->
    <VDialog
      v-model="isResetPasswordDialogVisible"
      max-width="500"
    >
      <VCard>
        <VCardTitle class="d-flex align-center">
          <VIcon icon="tabler-key" class="me-2" />
          Reset Password
        </VCardTitle>
        
        <VCardText>
          <p>Reset password for <strong>{{ selectedUser?.name }}</strong> to default password?</p>
          <p class="text-warning">Default password: <code>ITL@2025</code></p>
        </VCardText>

        <VCardActions>
          <VSpacer />
          <VBtn
            variant="tonal"
            color="secondary"
            @click="isResetPasswordDialogVisible = false"
          >
            Cancel
          </VBtn>
          <VBtn
            color="warning"
            :loading="resettingPassword"
            @click="resetPassword"
          >
            Reset Password
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { toast } from "vue3-toastify";
import { useAuthStore } from "@/stores/auth";

const router = useRouter();
const authStore = useAuthStore();

// Data
const technicians = ref([]);
const loading = ref(false);
const searchQuery = ref("");
const roleFilter = ref("");
const statusFilter = ref("");
const isResetPasswordDialogVisible = ref(false);
const resettingPassword = ref(false);
const selectedUser = ref(null);

const pagination = ref({
  currentPage: 1,
  lastPage: 1,
  from: 0,
  to: 0,
  total: 0,
});

const summaryStats = ref({
  total: 0,
  technical_lead: 0,
  technical_assistant: 0,
  driver: 0,
});

// Get backend URL from environment
const backendUrl = import.meta.env.VITE_BACKEND_URL;

// Get auth token
const getAuthToken = () => {
  return authStore.token || localStorage.getItem("auth_token") || sessionStorage.getItem("auth_token");
};

// Computed
const technicianRoleOptions = computed(() => [
  { title: 'Technical Lead', value: 'Technical Lead' },
  { title: 'Technical Assistant', value: 'Technical Assistant' },
  { title: 'Driver', value: 'Driver' },
]);

const statusOptions = computed(() => [
  { title: 'Active', value: 'active' },
  { title: 'Inactive', value: 'inactive' },
]);

// Methods
const fetchTechnicians = async () => {
  loading.value = true;
  try {
    const token = getAuthToken();
    if (!token) {
      toast.error("Authentication required");
      router.push("/login");
      return;
    }

    const params = new URLSearchParams({
      page: pagination.value.currentPage,
      search: searchQuery.value,
      role: roleFilter.value,
      status: statusFilter.value,
    });

    // Use the technicians endpoint instead
    const response = await fetch(`${backendUrl}/user-technicians?${params}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });

    if (response.status === 401) {
      toast.error("Session expired. Please login again.");
      authStore.logout();
      router.push("/login");
      return;
    }

    if (!response.ok) throw new Error("Failed to fetch technicians");

    const data = await response.json();

    if (data.success) {
      technicians.value = data.users.data;
      pagination.value = {
        currentPage: data.users.current_page,
        lastPage: data.users.last_page,
        from: data.users.from,
        to: data.users.to,
        total: data.users.total,
      };
      
      calculateSummaryStats(data.users.data);
    }
  } catch (error) {
    toast.error("Failed to load technicians");
    console.error("Error fetching technicians:", error);
  } finally {
    loading.value = false;
  }
};

const calculateSummaryStats = (users) => {
  const stats = {
    total: users.length,
    technical_lead: 0,
    technical_assistant: 0,
    driver: 0,
  };

  users.forEach(user => {
    const roleName = user.roles[0]?.name;
    if (roleName === 'Technical Lead') stats.technical_lead++;
    else if (roleName === 'Technical Assistant') stats.technical_assistant++;
    else if (roleName === 'Driver') stats.driver++;
  });

  summaryStats.value = stats;
};

const getRoleColor = (roleName) => {
  const colors = {
    'Technical Lead': 'info',
    'Technical Assistant': 'success',
    'Driver': 'warning',
  };
  return colors[roleName] || 'secondary';
};

const filterByRole = (role) => {
  if (role === 'all') {
    roleFilter.value = '';
  } else {
    roleFilter.value = role;
  }
  pagination.value.currentPage = 1;
  fetchTechnicians();
};

const openResetPassword = (user) => {
  selectedUser.value = user;
  isResetPasswordDialogVisible.value = true;
};

const resetPassword = async () => {
  resettingPassword.value = true;
  try {
    const token = getAuthToken();
    if (!token) {
      toast.error("Authentication required");
      return;
    }

    const response = await fetch(
      `${backendUrl}/user-accounts/${selectedUser.value.id}/reset-password`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      }
    );

    if (response.status === 401) {
      toast.error("Session expired. Please login again.");
      authStore.logout();
      router.push("/login");
      return;
    }

    const data = await response.json();

    if (!response.ok) throw new Error(data.message || "Failed to reset password");

    if (data.success) {
      toast.success("Password reset successfully");
      isResetPasswordDialogVisible.value = false;
      selectedUser.value = null;
    }
  } catch (error) {
    toast.error(error.message);
  } finally {
    resettingPassword.value = false;
  }
};

const toggleUserStatus = async (user) => {
  try {
    const token = getAuthToken();
    if (!token) {
      toast.error("Authentication required");
      return;
    }

    const endpoint = user.deleted_at ? "reactivate" : "deactivate";
    const response = await fetch(
      `${backendUrl}/user-accounts/${user.id}/${endpoint}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      }
    );

    if (response.status === 401) {
      toast.error("Session expired. Please login again.");
      authStore.logout();
      router.push("/login");
      return;
    }

    const data = await response.json();

    if (!response.ok) throw new Error(data.message || "Failed to update user status");

    if (data.success) {
      toast.success(`User ${user.deleted_at ? "activated" : "deactivated"} successfully`);
      fetchTechnicians();
    }
  } catch (error) {
    toast.error(error.message);
  }
};

const goToTechnicianDetails = (userId) => {
  router.push(`/technicians/${userId}`);
};

const formatDate = (dateString) => {
  if (!dateString) return null;
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const debouncedSearch = debounce(() => {
  pagination.value.currentPage = 1;
  fetchTechnicians();
}, 500);

// Lifecycle
onMounted(() => {
  const token = getAuthToken();
  if (!token) {
    toast.error("Please login to access this page");
    router.push("/login");
    return;
  }

  fetchTechnicians();
});

// Debounce utility
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}
</script>

<style scoped>
.clickable-row {
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.clickable-row:hover {
  background-color: rgba(var(--v-theme-primary), 0.04);
}
</style>
