<template>
  <VBtn
    color="success"
    :variant="variant"
    :loading="exporting"
    @click="handleExportAll"
    class="export-all-btn"
  >
    <VIcon :icon="icon" class="me-2" />
    {{ exporting ? 'Exporting All Data...' : buttonText }}
    <VTooltip activator="parent" location="top">
      {{ tooltip }}
    </VTooltip>
  </VBtn>
</template>

<script setup>
import { ref } from 'vue'
import installationService from '@/services/installationService'
import frontendExport from '@/utils/fontendExport'

// Props
const props = defineProps({
  filters: {
    type: Object,
    default: () => ({})
  },
  buttonText: {
    type: String,
    default: 'Export All Data'
  },
  variant: {
    type: String,
    default: 'elevated'
  },
  icon: {
    type: String,
    default: 'tabler-file-download'
  },
  tooltip: {
    type: String,
    default: 'Export ALL installations (not just current page) with current filters applied'
  }
})

// Emits
const emit = defineEmits(['export-start', 'export-success', 'export-error'])

// State
const exporting = ref(false)

// Methods
const handleExportAll = async () => {
  try {
    exporting.value = true
    emit('export-start')

    // Fetch ALL data from backend
    const response = await installationService.exportAllInstallations(props.filters)
    
    if (response.success && response.data) {
      // Export using frontend utility
      frontendExport.exportInstallations(response.data, `all_installations_${new Date().toISOString().split('T')[0]}.xlsx`)
      
      emit('export-success', {
        count: response.count,
        total_count: response.total_count,
        data: response.data
      })
    } else {
      throw new Error(response.message || 'Export failed')
    }
    
  } catch (error) {
    console.error('Export all error:', error)
    emit('export-error', error)
    
    // Show error message
    alert(`Export failed: ${error.message}`)
  } finally {
    exporting.value = false
  }
}
</script>

<style scoped>
.export-all-btn {
  min-width: 180px;
}
</style>
