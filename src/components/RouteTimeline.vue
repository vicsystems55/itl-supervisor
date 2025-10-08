<!-- src/components/RouteTimeline.vue -->
<script setup>
import { VTimeline, VTimelineItem, VIcon, VChip } from 'vuetify/components'

// Example data (replace later with API/store data)
const routes = [
  {
    id: 1,
    location: 'Lagos → Abuja',
    status: 'En Route',
    color: 'info',
    icon: 'tabler-truck-delivery',
    time: '08:30 AM',
  },
  {
    id: 2,
    location: 'Abuja → Nasarawa',
    status: 'Delivered',
    color: 'success',
    icon: 'tabler-check',
    time: '10:45 AM',
  },
  {
    id: 3,
    location: 'Kano → Katsina',
    status: 'Delayed',
    color: 'error',
    icon: 'tabler-alert-triangle',
    time: 'Pending',
  },
]
</script>

<template>
  <VTimeline side="end" density="comfortable">
    <VTimelineItem
      v-for="route in routes"
      :key="route.id"
      :dot-color="route.color"
      :icon="route.icon"
      size="small"
    >
      <template #opposite>
        <span class="text-caption text-grey">{{ route.time }}</span>
      </template>

      <div class="d-flex flex-column">
        <div class="text-subtitle-1 font-weight-medium">
          {{ route.location }}
        </div>
        <VChip :color="route.color" size="x-small" label>
          {{ route.status }}
        </VChip>
      </div>
    </VTimelineItem>
  </VTimeline>
</template>

<style scoped>
.v-timeline {
  padding-top: 0.5rem;
}
</style>
