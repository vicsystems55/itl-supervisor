<template>
  <div class="notifications-page page-container">
    <!-- Header -->
    <v-card class="pa-6 mb-6">
      <h2 class="mb-1">Notifications</h2>
      <p class="text-grey">Stay updated with recent activities and system alerts.</p>
    </v-card>

    <!-- Category Tabs -->
    <v-card class="pa-4 mb-4">
      <v-tabs v-model="activeCategory" color="primary" grow>
        <v-tab
          v-for="category in categories"
          :key="category"
          :value="category"
          class="text-capitalize"
        >
          {{ category }}
        </v-tab>
      </v-tabs>
    </v-card>

    <!-- Notifications List -->
    <v-card>
      <v-list>
        <v-list-item
          v-for="(notif, index) in filteredNotifications"
          :key="index"
          class="border-b py-3"
        >
          <template #prepend>
            <v-avatar :color="notif.color" size="36">
              <v-icon color="white" :icon="notif.icon" />
            </v-avatar>
          </template>

          <v-list-item-title class="font-weight-medium">
            {{ notif.title }}
          </v-list-item-title>

          <v-list-item-subtitle class="text-grey">
            {{ notif.message }}
          </v-list-item-subtitle>

          <template #append>
            <span class="text-grey text-caption">{{ notif.time }}</span>
          </template>
        </v-list-item>

        <v-list-item v-if="filteredNotifications.length === 0">
          <v-list-item-title>No notifications in this category.</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-card>
  </div>
</template>

<script setup>
import { ref, computed } from "vue"

// Active category
const activeCategory = ref("all")

// Available categories
const categories = ["all", "system", "account", "tasks", "alerts"]

// Mock notifications (replace later with API)
const notifications = ref([
  {
    title: "New User Added",
    message: "Victor Asuquo added to IT team.",
    category: "account",
    icon: "tabler-user-plus",
    color: "primary",
    time: "5 mins ago",
  },
  {
    title: "Password Updated",
    message: "Your account password was changed successfully.",
    category: "account",
    icon: "tabler-lock",
    color: "indigo",
    time: "1 hour ago",
  },
  {
    title: "System Update",
    message: "Version 2.1.0 has been deployed.",
    category: "system",
    icon: "tabler-server",
    color: "info",
    time: "3 hours ago",
  },
  {
    title: "Installation Completed",
    message: "Lagos Solar Project marked as completed.",
    category: "tasks",
    icon: "tabler-check",
    color: "success",
    time: "Yesterday",
  },
  {
    title: "Account Locked",
    message: "Samuel Akpan’s account has been locked.",
    category: "alerts",
    icon: "tabler-alert-triangle",
    color: "error",
    time: "2 days ago",
  },
])

// Computed notifications based on active category
const filteredNotifications = computed(() => {
  if (activeCategory.value === "all") return notifications.value
  return notifications.value.filter(
    n => n.category === activeCategory.value
  )
})
</script>

<style scoped>
.notifications-page {
  max-width: 900px;
  margin: 0 auto;
}
.border-b {
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
}
</style>
