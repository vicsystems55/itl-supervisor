<template>
  <VCard>
    <!-- Header with Title and Actions -->
    <VCardText class="d-flex align-center flex-wrap justify-space-between gap-4">
      <div>
        <VCardTitle class="px-0">User Accounts Management</VCardTitle>
        <VCardSubtitle class="px-0">Manage user accounts, roles, and permissions</VCardSubtitle>
      </div>

      <VBtn
        color="primary"
        prepend-icon="tabler-plus"
        @click="isCreateDialogVisible = true"
      >
        Add New User
      </VBtn>
    </VCardText>

    <VDivider />

    <!-- Search and Filters -->
    <VCardText>
      <VRow>
        <VCol cols="12" md="6">
          <AppTextField
            v-model="searchQuery"
            placeholder="Search users by name or email..."
            prepend-inner-icon="tabler-search"
            density="compact"
            @input="debouncedSearch"
          />
        </VCol>
        <VCol cols="12" md="3">
          <AppSelect
            v-model="roleFilter"
            :items="roleOptions"
            placeholder="Filter by role"
            clearable
            density="compact"
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
      </VRow>
    </VCardText>

    <!-- Users Table -->
    <VCardText>
      <VTable class="text-no-wrap">
        <thead>
          <tr>
            <th>USER</th>
            <th>ROLES</th>
            <th>STATUS</th>
            <th>LAST ACTIVE</th>
            <th>ACTIONS</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="user in users"
            :key="user.id"
            class="clickable-row"
          >
            <!-- User Info -->
            <td>
              <div class="d-flex align-center">
                <VAvatar size="38" color="primary" variant="tonal" class="me-3">
                  <VIcon icon="tabler-user" />
                </VAvatar>
                <div>
                  <p class="text-base font-weight-medium mb-0">
                    {{ user.name }}
                  </p>
                  <p class="text-sm text-disabled mb-0">
                    {{ user.email }}
                  </p>
                </div>
              </div>
            </td>

            <!-- Roles -->
            <td>
              <div class="d-flex flex-wrap gap-1">
                <VChip
                  v-for="role in user.roles"
                  :key="role.id"
                  size="small"
                  color="secondary"
                  variant="tonal"
                >
                  {{ role.name }}
                </VChip>
                <span v-if="!user.roles.length" class="text-sm text-disabled">
                  No roles
                </span>
              </div>
            </td>

            <!-- Status -->
            <td>
              <VChip
                :color="user.deleted_at ? 'error' : 'success'"
                size="small"
              >
                {{ user.deleted_at ? "Inactive" : "Active" }}
              </VChip>
            </td>

            <!-- Last Active -->
            <td>
              <span class="text-sm">
                {{ formatDate(user.last_login_at) || "Never" }}
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
                      color="info"
                      @click.stop="openChangeRoleDialog(user)"
                    >
                      <VIcon icon="tabler-shield" size="20" />
                    </VBtn>
                  </template>
                  <span>Change Role</span>
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
                  <span>{{ user.deleted_at ? "Activate" : "Deactivate" }}</span>
                </VTooltip>
              </div>
            </td>
          </tr>
        </tbody>
      </VTable>

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-8">
        <VProgressCircular indeterminate color="primary" />
        <p class="text-sm mt-2">Loading users...</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="!users.length" class="text-center py-8">
        <VIcon icon="tabler-users" size="48" color="disabled" class="mb-2" />
        <p class="text-lg font-weight-medium">No users found</p>
        <p class="text-disabled">Try adjusting your search or add a new user</p>
      </div>

      <!-- Pagination -->
      <VCardText
        v-if="users.length"
        class="d-flex align-center flex-wrap justify-space-between gap-4"
      >
        <span class="text-sm text-disabled">
          Showing {{ pagination.from }} to {{ pagination.to }} of
          {{ pagination.total }} users
        </span>
        <VPagination
          v-model="pagination.currentPage"
          :length="pagination.lastPage"
          :total-visible="5"
          @update:model-value="fetchUsers"
        />
      </VCardText>
    </VCardText>
    <VDivider />
  </VCard>

  <!-- Create User Dialog -->
  <VDialog v-model="isCreateDialogVisible" max-width="600">
    <VCard>
      <VCardTitle class="d-flex align-center">
        <VIcon icon="tabler-user-plus" class="me-2" />
        Create New User
      </VCardTitle>

      <VCardText>
        <VForm @submit.prevent="createUser">
          <VRow>
            <VCol cols="12">
              <AppTextField
                v-model="newUser.name"
                label="Full Name"
                placeholder="John Doe"
                prepend-inner-icon="tabler-user"
                :rules="[requiredRule]"
              />
            </VCol>

            <VCol cols="12">
              <AppTextField
                v-model="newUser.email"
                label="Email"
                type="email"
                placeholder="johndoe@email.com"
                prepend-inner-icon="tabler-mail"
                :rules="[requiredRule, emailRule]"
              />
            </VCol>

            <VCol cols="12">
              <AppTextField
                v-model="newUser.password"
                label="Password"
                :type="isPasswordVisible ? 'text' : 'password'"
                placeholder="············"
                :append-inner-icon="isPasswordVisible ? 'tabler-eye-off' : 'tabler-eye'"
                @click:append-inner="isPasswordVisible = !isPasswordVisible"
                :rules="[requiredRule, passwordRule]"
              />
            </VCol>

            <VCol cols="12">
              <AppTextField
                v-model="newUser.password_confirmation"
                label="Confirm Password"
                :type="isPasswordVisible ? 'text' : 'password'"
                placeholder="············"
                :rules="[requiredRule, confirmPasswordRule]"
              />
            </VCol>

            <VCol cols="12">
              <AppSelect
                v-model="newUser.role"
                :items="availableRoles"
                item-title="name"
                item-value="id"
                label="Role"
                prepend-inner-icon="tabler-shield"
                placeholder="Select a role"
              />
            </VCol>

            <VCol cols="12">
              <div class="d-flex gap-2 justify-end">
                <VBtn
                  variant="tonal"
                  color="secondary"
                  @click="isCreateDialogVisible = false"
                >
                  Cancel
                </VBtn>
                <VBtn type="submit" color="primary" :loading="creatingUser">
                  Create User
                </VBtn>
              </div>
            </VCol>
          </VRow>
        </VForm>
      </VCardText>
    </VCard>
  </VDialog>

  <!-- Change Role Dialog -->
  <VDialog v-model="isChangeRoleDialogVisible" max-width="500">
    <VCard>
      <VCardTitle class="d-flex align-center">
        <VIcon icon="tabler-shield" class="me-2" />
        Change User Role
      </VCardTitle>

      <VCardText>
        <p class="mb-4">
          Change role for <strong>{{ selectedUser?.name }}</strong>
        </p>
        
        <AppSelect
          v-model="selectedRole"
          :items="availableRoles"
          item-title="name"
          item-value="id"
          label="Select New Role"
          prepend-inner-icon="tabler-shield"
          placeholder="Choose a role"
          :rules="[requiredRule]"
        />

        <div class="mt-2">
          <p class="text-sm text-disabled mb-1">Current Role:</p>
          <VChip
            v-if="selectedUser?.roles?.length"
            color="primary"
            size="small"
          >
            {{ selectedUser.roles[0].name }}
          </VChip>
          <span v-else class="text-sm text-disabled">No role assigned</span>
        </div>
      </VCardText>

      <VCardActions>
        <VSpacer />
        <VBtn
          variant="tonal"
          color="secondary"
          @click="isChangeRoleDialogVisible = false"
        >
          Cancel
        </VBtn>
        <VBtn
          color="primary"
          :loading="changingRole"
          @click="changeUserRole"
        >
          Update Role
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>

  <!-- Reset Password Dialog -->
  <VDialog v-model="isResetPasswordDialogVisible" max-width="500">
    <VCard>
      <VCardTitle class="d-flex align-center">
        <VIcon icon="tabler-key" class="me-2" />
        Reset Password
      </VCardTitle>

      <VCardText>
        <p>
          Reset password for <strong>{{ selectedUser?.name }}</strong> to
          default password?
        </p>
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
</template>

<script setup>
import { ref, onMounted, computed, watch } from "vue";
import { useRouter } from "vue-router";
import { toast } from "vue3-toastify";
import { useAuthStore } from "@/stores/auth";

const router = useRouter();
const authStore = useAuthStore();

// Data
const users = ref([]);
const loading = ref(false);
const searchQuery = ref("");
const roleFilter = ref("");
const statusFilter = ref("");
const isCreateDialogVisible = ref(false);
const isChangeRoleDialogVisible = ref(false);
const isResetPasswordDialogVisible = ref(false);
const isPasswordVisible = ref(false);
const creatingUser = ref(false);
const changingRole = ref(false);
const resettingPassword = ref(false);
const selectedUser = ref(null);
const selectedRole = ref(null);
const availableRoles = ref([]);

const newUser = ref({
  name: "",
  email: "",
  password: "",
  password_confirmation: "",
  role: null,
});

const pagination = ref({
  currentPage: 1,
  lastPage: 1,
  from: 0,
  to: 0,
  total: 0,
});

// Get backend URL from environment
const backendUrl = import.meta.env.VITE_BACKEND_URL;

// Get auth token from store (or fallback to localStorage)
const getAuthToken = () => {
  return (
    authStore.token ||
    localStorage.getItem("auth_token") ||
    sessionStorage.getItem("auth_token")
  );
};

// Computed
const roleOptions = computed(() => [
  { title: "Admin", value: "admin" },
  { title: "Manager", value: "manager" },
  { title: "User", value: "user" },
]);

const statusOptions = computed(() => [
  { title: "Active", value: "active" },
  { title: "Inactive", value: "inactive" },
]);

// Validation Rules
const requiredRule = (value) => !!value || "Required field";
const emailRule = (value) => /.+@.+\..+/.test(value) || "Valid email required";
const passwordRule = (value) =>
  value.length >= 8 || "Min 8 characters required";
const confirmPasswordRule = (value) =>
  value === newUser.value.password || "Passwords must match";

// Methods
const fetchUsers = async () => {
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

    const response = await fetch(`${backendUrl}/user-accounts?${params}`, {
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

    if (!response.ok) throw new Error("Failed to fetch users");

    const data = await response.json();

    if (data.success) {
      users.value = data.users.data;
      pagination.value = {
        currentPage: data.users.current_page,
        lastPage: data.users.last_page,
        from: data.users.from,
        to: data.users.to,
        total: data.users.total,
      };
    }
  } catch (error) {
    toast.error("Failed to load users");
    console.error("Error fetching users:", error);
  } finally {
    loading.value = false;
  }
};

const fetchAvailableRoles = async () => {
  try {
    const token = getAuthToken();
    if (!token) {
      console.log('No token available for roles fetch');
      return;
    }

    console.log('Fetching roles from:', `${backendUrl}/roles`);
    
    const response = await fetch(`${backendUrl}/roles`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });

    console.log('Roles API response status:', response.status);

    if (!response.ok) {
      console.error('Roles API error:', response.status, response.statusText);
      availableRoles.value = [
        { id: 1, name: 'admin' },
        { id: 2, name: 'manager' },
        { id: 3, name: 'user' }
      ];
      return;
    }

    const data = await response.json();
    console.log('Roles API response data:', data);

    if (data.success && data.roles) {
      availableRoles.value = data.roles;
    } else if (data.success && data.data) {
      availableRoles.value = data.data;
    } else if (Array.isArray(data)) {
      availableRoles.value = data;
    } else {
      availableRoles.value = data.roles || data.data || [];
    }

    console.log('Available roles set to:', availableRoles.value);

  } catch (error) {
    console.error('Error fetching roles:', error);
    availableRoles.value = [
      { id: 1, name: 'admin' },
      { id: 2, name: 'manager' },
      { id: 3, name: 'user' }
    ];
  }
};

const createUser = async () => {
  creatingUser.value = true;
  try {
    const token = getAuthToken();
    if (!token) {
      toast.error("Authentication required");
      return;
    }

    const response = await fetch(`${backendUrl}/user-accounts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      body: JSON.stringify(newUser.value),
    });

    if (response.status === 401) {
      toast.error("Session expired. Please login again.");
      authStore.logout();
      router.push("/login");
      return;
    }

    const data = await response.json();

    if (!response.ok) throw new Error(data.message || "Failed to create user");

    if (data.success) {
      toast.success("User created successfully");
      isCreateDialogVisible.value = false;
      resetNewUserForm();
      fetchUsers();
    }
  } catch (error) {
    toast.error(error.message);
  } finally {
    creatingUser.value = false;
  }
};

const openChangeRoleDialog = (user) => {
  selectedUser.value = user;
  selectedRole.value = user.roles[0]?.id || null;
  isChangeRoleDialogVisible.value = true;
};

const changeUserRole = async () => {
  if (!selectedRole.value) {
    toast.error("Please select a role");
    return;
  }

  changingRole.value = true;
  try {
    const token = getAuthToken();
    if (!token) {
      toast.error("Authentication required");
      return;
    }

    const response = await fetch(
      `${backendUrl}/user-accounts/${selectedUser.value.id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        body: JSON.stringify({
          role: selectedRole.value
        }),
      }
    );

    if (response.status === 401) {
      toast.error("Session expired. Please login again.");
      authStore.logout();
      router.push("/login");
      return;
    }

    const data = await response.json();

    if (!response.ok) throw new Error(data.message || "Failed to update user role");

    if (data.success) {
      toast.success("User role updated successfully");
      isChangeRoleDialogVisible.value = false;
      selectedUser.value = null;
      selectedRole.value = null;
      fetchUsers();
    }
  } catch (error) {
    toast.error(error.message);
  } finally {
    changingRole.value = false;
  }
};

const resetNewUserForm = () => {
  newUser.value = {
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
    role: null,
  };
  isPasswordVisible.value = false;
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

    if (!response.ok)
      throw new Error(data.message || "Failed to reset password");

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

    if (!response.ok)
      throw new Error(data.message || "Failed to update user status");

    if (data.success) {
      toast.success(
        `User ${user.deleted_at ? "activated" : "deactivated"} successfully`
      );
      fetchUsers();
    }
  } catch (error) {
    toast.error(error.message);
  }
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
  fetchUsers();
}, 500);

// Lifecycle
onMounted(() => {
  const token = getAuthToken();
  if (!token) {
    toast.error("Please login to access this page");
    router.push("/login");
    return;
  }

  fetchUsers();
  fetchAvailableRoles();
});

// Debug: Watch availableRoles changes
watch(availableRoles, (newVal) => {
  console.log('availableRoles changed:', newVal);
}, { immediate: true });

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

:deep(.v-table) {
  border-radius: 8px;
}

:deep(.v-table thead th) {
  background-color: rgba(var(--v-theme-primary), 0.04);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-size: 0.75rem;
}
</style>
