<template>
  <div class="user-details-page page-container">
    <!-- Header -->
    <v-card class="pa-6 mb-6">
      <v-btn variant="text" @click="router.back()" color="primary" class="mb-4">
        <v-icon start icon="tabler-arrow-left" /> Back
      </v-btn>

      <div class="d-flex align-center">
        <v-avatar size="96" class="me-4">
          <v-img :src="user.avatar" alt="User Avatar" />
        </v-avatar>
        <div>
          <h2 class="mb-1">{{ user.name }}</h2>
          <p class="text-grey mb-0">{{ user.email }}</p>
          <v-chip :color="getRoleColor(user.role)" class="mt-2 text-capitalize">{{ user.role }}</v-chip>
        </div>
      </div>
    </v-card>

    <!-- Actions and Information -->
    <v-row>
      <!-- Account Settings -->
      <v-col cols="12" md="4">
        <v-card class="pa-4">
          <h3 class="mb-3">Account Settings</h3>

          <!-- Change Avatar -->
          <v-file-input
            label="Change Avatar"
            prepend-inner-icon="tabler-upload"
            accept="image/*"
            dense
            hide-details
            @change="changeAvatar"
          />

          <!-- Update Password -->
          <v-text-field
            v-model="newPassword"
            type="password"
            label="New Password"
            dense
            class="mt-3"
          />
          <v-btn color="primary" small class="mt-2" @click="updatePassword">
            <v-icon start icon="tabler-lock" /> Update Password
          </v-btn>

          <!-- Lock/Unlock Access -->
          <div class="mt-5">
            <v-switch
              v-model="userLocked"
              color="error"
              label="Lock Account Access"
              @change="toggleAccess"
            />
          </div>
        </v-card>
      </v-col>

      <!-- Role & Location -->
      <v-col cols="12" md="8">
        <v-card class="pa-4">
          <h3 class="mb-3">Role & Location</h3>

          <v-select
            v-model="user.role"
            :items="roles"
            label="User Role"
            dense
            class="mb-3"
          />
          <v-select
            v-model="user.locations"
            :items="availableLocations"
            label="Assigned Locations"
            multiple
            chips
            dense
            class="mb-3"
          />

          <v-btn color="primary" @click="saveRoleAndLocation">
            <v-icon start icon="tabler-check" /> Save Changes
          </v-btn>
        </v-card>
      </v-col>
    </v-row>

    <!-- Tabs Section -->
    <v-card class="mt-6">
      <v-tabs v-model="tab" color="primary">
        <v-tab value="sites">Installation Sites</v-tab>
        <v-tab value="logs">Activity Logs</v-tab>
      </v-tabs>

      <v-window v-model="tab">
        <!-- Installation Sites -->
        <v-window-item value="sites">
          <v-card-text>
            <v-data-table
              :headers="siteHeaders"
              :items="installationSites"
              class="elevation-1"
              density="comfortable"
            >
              <template #no-data>
                <v-card-text>No installation sites assigned.</v-card-text>
              </template>
            </v-data-table>
          </v-card-text>
        </v-window-item>

        <!-- Activity Logs -->
        <v-window-item value="logs">
          <v-card-text>
            <v-list>
              <v-list-item
                v-for="(log, index) in activityLogs"
                :key="index"
                :title="log.action"
                :subtitle="log.time"
              >
                <template #prepend>
                  <v-icon :color="log.color">{{ log.icon }}</v-icon>
                </template>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-window-item>
      </v-window>
    </v-card>
  </div>
</template>

<script setup>
import { ref } from "vue"
import { useRouter, useRoute } from "vue-router"

const router = useRouter()
const route = useRoute()

// Simulate user loaded by ID
const user = ref({
  id: route.params.id,
  name: "Victor Asuquo",
  email: "victor@intertrade.com",
  role: "IT Manager",
  avatar: "https://i.pravatar.cc/100?img=5",
  status: "Active",
  locations: ["Abuja Office", "Lagos Site"],
})

const userLocked = ref(false)
const newPassword = ref("")
const tab = ref("sites")

// Role & Location options
const roles = ["Admin", "IT Manager", "Technical Manager", "Technician"]
const availableLocations = [
  "Abuja Office",
  "Lagos Site",
  "Port Harcourt Branch",
  "Kano Office",
]

// Installation sites
const siteHeaders = [
  { title: "Site Name", key: "name" },
  { title: "Location", key: "location" },
  { title: "Status", key: "status" },
]
const installationSites = ref([
  { name: "Cold Room A", location: "Abuja", status: "Active" },
  { name: "Solar Install - Lagos", location: "Lagos", status: "Completed" },
])

// Activity logs
const activityLogs = ref([
  { action: "Logged in", time: "Today, 10:23 AM", icon: "tabler-login", color: "primary" },
  { action: "Updated site record", time: "Yesterday, 5:12 PM", icon: "tabler-edit", color: "success" },
  { action: "Changed password", time: "3 days ago", icon: "tabler-lock", color: "warning" },
])

// Utils
const getRoleColor = role => {
  switch (role.toLowerCase()) {
    case "admin":
      return "info"
    case "technical manager":
      return "primary"
    case "it manager":
      return "indigo"
    case "technician":
      return "teal"
    default:
      return "grey"
  }
}

// Handlers
const changeAvatar = file => {
  if (file && file.length > 0) {
    const reader = new FileReader()
    reader.onload = e => (user.value.avatar = e.target.result)
    reader.readAsDataURL(file[0])
  }
}

const updatePassword = () => {
  if (!newPassword.value) return alert("Please enter a new password.")
  alert(`Password updated for ${user.value.name}`)
  newPassword.value = ""
}

const toggleAccess = () => {
  const state = userLocked.value ? "locked" : "unlocked"
  alert(`User account has been ${state}.`)
}

const saveRoleAndLocation = () => {
  alert("Role and locations updated successfully.")
}
</script>

<style scoped>
.user-details-page {
  max-width: 1200px;
  margin: 0 auto;
}
</style>
