<script setup>
import { ref } from 'vue'

// Example user subscription details
const maxAccounts = 5
const connectedAccounts = [
  { id: 1, platform: 'Facebook', icon: 'tabler-brand-facebook', color: '#1877F2' },
  { id: 2, platform: 'Instagram', icon: 'tabler-brand-instagram', color: '#E1306C' },
  { id: 3, platform: 'YouTube', icon: 'tabler-brand-youtube', color: '#FF0000' },
]

// Reactive state
const showModal = ref(false)
const selectedPlatform = ref(null)

const socialPlatforms = [
  { name: 'Facebook', icon: 'tabler-brand-facebook', color: '#1877F2' },
  { name: 'Instagram', icon: 'tabler-brand-instagram', color: '#E1306C' },
  { name: 'TikTok', icon: 'tabler-brand-tiktok', color: '#000000' },
  { name: 'LinkedIn', icon: 'tabler-brand-linkedin', color: '#0077B5' },
  { name: 'YouTube', icon: 'tabler-brand-youtube', color: '#FF0000' },
]

// Slots builder (connected + free)
const slots = computed(() => {
  const filled = connectedAccounts.map(acc => ({
    ...acc,
    free: false,
  }))
  const empty = Array.from({ length: maxAccounts - connectedAccounts.length }, (_, i) => ({
    id: `free-${i}`,
    free: true,
  }))
  return [...filled, ...empty]
})

const handleConnect = () => {
  if (selectedPlatform.value) {
    // Mock connection action
    alert(`Connecting to ${selectedPlatform.value}`)
    showModal.value = false
    selectedPlatform.value = null
  }
}
</script>

<template>
  <VContainer fluid>
    <VRow>
      <VCol cols="12">
        <h3 class="mb-4">Manage Your Account Slots</h3>
      </VCol>

      <VCol
        v-for="slot in slots"
        :key="slot.id"
        cols="6"
        md="2"
        class="d-flex justify-center"
      >
        <!-- Occupied Slot -->
        <VCard
          v-if="!slot.free"
          class="pa-4 d-flex align-center justify-center"
          style="width: 100px; height: 100px;"
          outlined
        >
          <VIcon
            :icon="slot.icon"
            size="40"
            :style="{ color: slot.color }"
          />
        </VCard>

        <!-- Free Slot -->
        <VCard
          v-else
          class="pa-4 d-flex align-center justify-center"
          style="width: 100px; height: 100px; cursor: pointer;"
          outlined
          @click="showModal = true"
        >
          <VIcon icon="tabler-plus" size="40" color="grey" />
        </VCard>
      </VCol>
    </VRow>

    <!-- Modal for Connecting -->
    <VDialog v-model="showModal" width="400">
      <VCard>
        <VCardTitle class="text-h6">Connect Social Account</VCardTitle>
        <VCardText>
          <VSelect
            v-model="selectedPlatform"
            :items="socialPlatforms.map(p => p.name)"
            label="Select a Platform"
            outlined
          />
        </VCardText>
        <VCardActions>
          <VSpacer />
          <VBtn color="primary" @click="handleConnect">
            Connect
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
  </VContainer>
</template>
