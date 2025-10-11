<template>
  <VCard 
    class="summary-card"
    :class="{ 'clickable': clickable }"
    @click="$emit('click')"
  >
    <VCardText class="d-flex align-center">
      <VAvatar
        :color="color"
        variant="tonal"
        size="54"
        class="me-4"
      >
        <VIcon :icon="icon" size="28" />
      </VAvatar>
      <div>
        <p class="text-sm text-disabled mb-1">{{ title }}</p>
        <h4 class="text-h4">{{ value }}</h4>
      </div>
    </VCardText>
  </VCard>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    required: true
  },
  value: {
    type: [String, Number],
    required: true
  },
  icon: {
    type: String,
    required: true
  },
  color: {
    type: String,
    default: 'primary'
  },
  clickable: {
    type: Boolean,
    default: true
  }
})

defineEmits(['click'])
</script>

<style scoped>
.summary-card {
  transition: all 0.2s ease;
}

.summary-card.clickable:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  cursor: pointer;
}
</style>
