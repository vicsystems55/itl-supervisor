<template>
  <div class="user-accounts-page page-container">
    <!-- Header -->
    <v-card class="pa-6 mb-6">
      <h2 class="mb-1">User Accounts</h2>
      <p class="text-grey">Manage system users, their roles, and account status.</p>
    </v-card>

    <!-- Summary Cards -->
    <v-row class="mb-6">
      <v-col cols="12" sm="6" md="3" v-for="card in summaryCards" :key="card.label">
        <v-card class="pa-4 stat-card" :color="card.color" dark>
          <div class="text-h5 font-weight-bold">{{ card.value }}</div>
          <div class="text-subtitle-1">{{ card.label }}</div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Search and Actions -->
    <v-card class="pa-4 mb-4">
      <div class="title-row">
        <v-text-field
          v-model="search"
          placeholder="Search users..."
          dense
          clearable
          hide-details
          prepend-inner-icon="tabler-search"
          class="me-4"
        />
        <v-btn color="primary" small @click="addUser">
          <VIcon icon="tabler-user-plus" start /> Add User
        </v-btn>
      </div>
    </v-card>

    <!-- Users Table -->
    <v-card>
      <v-data-table
        :headers="headers"
        :items="filteredUsers"
        class="elevation-1"
        density="comfortable"
        @click:row="goToUserDetails"
      >
        <template #item.avatar="{ item }">
          <v-avatar size="36">
            <v-img :src="item.avatar" alt="Avatar" />
          </v-avatar>
        </template>

        <template #item.role="{ item }">
          <v-chip
            :color="getRoleColor(item.role)"
            size="small"
            class="text-capitalize"
          >
            {{ item.role }}
          </v-chip>
        </template>

        <template #item.status="{ item }">
          <v-chip
            :color="item.status === 'Active' ? 'success' : 'grey'"
            size="small"
          >
            {{ item.status }}
          </v-chip>
        </template>

        <template #item.actions="{ item }">
          <v-btn icon size="small" color="primary" @click.stop="goToUserDetails(item)">
            <VIcon icon="tabler-eye" />
          </v-btn>
          <v-btn icon size="small" color="error" @click.stop="deleteUser(item)">
            <VIcon icon="tabler-trash" />
          </v-btn>
        </template>

        <template #no-data>
          <v-card-text>No user accounts found.</v-card-text>
        </template>
      </v-data-table>
    </v-card>
  </div>
</template>

<script setup>
import { ref, computed } from "vue"
import { useRouter } from "vue-router"

const router = useRouter()

// Search filter
const search = ref("")

// Mock data (replace with API later)
const users = ref([
  {
    id: 1,
    name: "Victor Asuquo",
    email: "victor@intertrade.com",
    role: "IT Manager",
    avatar: "https://i.pravatar.cc/100?img=5",
    status: "Active",
  },
  {
    id: 2,
    name: "Luka Daniels",
    email: "luka@intertrade.com",
    role: "Technical Manager",
    avatar: "https://i.pravatar.cc/100?img=3",
    status: "Active",
  },
  {
    id: 3,
    name: "Mary Johnson",
    email: "mary@haierbio.com",
    role: "Admin",
    avatar: "https://i.pravatar.cc/100?img=4",
    status: "Active",
  },
  {
    id: 4,
    name: "Samuel Akpan",
    email: "samuel@intertrade.com",
    role: "Technician",
    avatar: "https://i.pravatar.cc/100?img=6",
    status: "Inactive",
  },
])

// Table headers
const headers = [
  { title: "Avatar", key: "avatar", sortable: false },
  { title: "Name", key: "name" },
  { title: "Email", key: "email" },
  { title: "Role", key: "role" },
  { title: "Status", key: "status" },
  { title: "Actions", key: "actions", sortable: false },
]

// Computed filters
const filteredUsers = computed(() => {
  const q = search.value.toLowerCase()
  return users.value.filter(
    u =>
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.role.toLowerCase().includes(q)
  )
})

// Summary stats
const summaryCards = computed(() => [
  { label: "Total Users", value: users.value.length, color: "primary" },
  { label: "Active Users", value: users.value.filter(u => u.status === "Active").length, color: "success" },
  { label: "Inactive Users", value: users.value.filter(u => u.status === "Inactive").length, color: "grey" },
  { label: "Admins", value: users.value.filter(u => u.role.toLowerCase().includes("admin")).length, color: "info" },
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

// Navigation
const goToUserDetails = user => {
  router.push(`/accounts/${user.id}`)
}
// Mock actions
const addUser = () => alert("Add user modal coming soon!")
const deleteUser = user => alert(`Delete user: ${user.name}?`)
</script>

<style scoped>
.title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.stat-card {
  border-radius: 12px;
  text-align: center;
  transition: transform 0.2s;
}
.stat-card:hover {
  transform: scale(1.03);
}
</style>
