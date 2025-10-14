<template>
  <div>
    <!-- Your existing installation details -->
    <VRow class="mb-6">
      <VCol cols="12">
        <div class="d-flex justify-space-between align-start">
          <!-- ... your existing header ... -->
          
          <div class="d-flex gap-2">
            <VBtn
              color="primary"
              @click="showChecklistDisplay = true"
            >
              <VIcon icon="tabler-checklist" class="me-2" />
              View Checklist
            </VBtn>
          </div>
        </div>
      </VCol>
    </VRow>

    <!-- Checklist Display Dialog -->
    <InstallationChecklistDisplay
      v-model="showChecklistDisplay"
      :installation-id="installation?.id"
      :facility-name="installation?.facility?.name"
      @start-editing="handleStartEditing"
    />
    
    <!-- Checklist Editor Dialog -->
    <InstallationChecklistEditor
      v-model="showChecklistEditor"
      :installation-id="installation?.id"
      :facility-name="installation?.facility?.name"
      :checklist-data="checklistData"
      :draft-data="draftData"
      @submitted="handleChecklistSubmitted"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import InstallationChecklistDisplay from '@/components/InstallationChecklistDisplay.vue'
import InstallationChecklistEditor from '@/components/InstallationChecklistEditor.vue'

const showChecklistDisplay = ref(false)
const showChecklistEditor = ref(false)
const checklistData = ref(null)
const draftData = ref(null)

const handleStartEditing = (data) => {
  checklistData.value = data.checklist
  draftData.value = data.draftData
  showChecklistDisplay.value = false
  showChecklistEditor.value = true
}

const handleChecklistSubmitted = (submissionData) => {
  console.log('Checklist submitted:', submissionData)
  // Refresh installation data or show success message
}
</script>
