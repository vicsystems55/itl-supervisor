<!-- src/components/TotalShipmentsCard.vue -->
<script setup>
import { VCard, VCardItem, VCardTitle, VCardText, VIcon } from 'vuetify/components'

defineProps({
  title: { type: String, default: 'Total Shipments' },
  count: { type: [String, Number], default: 0 },
  subtitle: { type: String, default: '' },
  color: { type: String, default: 'primary' },
  icon: { type: String, default: 'tabler-package' },
})
</script>

<template>
  <VCard class="pa-4 text-center" outlined>
    <VCardItem class="d-flex flex-column align-center">
      <VIcon :icon="icon" :color="color" size="40" class="mb-2" />
      <VCardTitle class="text-h5 font-weight-bold">{{ title }}</VCardTitle>
      <VCardText class="py-1">
        <div class="text-h4 font-weight-bold text-primary">
          {{ count }}
        </div>
        <div class="text-subtitle-2 text-grey mt-1">
          {{ subtitle }}
        </div>
      </VCardText>
    </VCardItem>
  </VCard>
</template>

<style scoped>
.v-card {
  transition: all 0.3s ease;
}
.v-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}
</style>
