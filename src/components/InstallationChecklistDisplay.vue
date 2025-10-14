<template>
  <VDialog v-model="dialogVisible" max-width="1200" scrollable persistent>
    <VCard>
      <VCardTitle class="d-flex justify-space-between align-center pa-6 pb-4 bg-primary">
        <div>
          <span class="text-h5 text-white">Solar Direct Drive Refrigerator Installation Checklist</span>
          <div class="text-caption text-white text-opacity-80 mt-1">
            Installation ID: {{ installationId }} • {{ facilityName }}
          </div>
        </div>
        <VBtn icon variant="text" color="white" @click="closeDialog">
          <VIcon icon="tabler-x" />
        </VBtn>
      </VCardTitle>
      
      <VCardText class="pa-6">
        <!-- Loading State -->
        <div v-if="loading" class="text-center py-8">
          <VProgressCircular indeterminate color="primary" size="64" />
          <div class="text-body-1 mt-4">Loading checklist...</div>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="text-center py-8">
          <VIcon icon="tabler-alert-circle" size="64" color="error" />
          <div class="text-h6 text-error mt-4">Failed to load checklist</div>
          <div class="text-body-2 text-medium-emphasis mt-2">{{ error }}</div>
          <VBtn color="primary" class="mt-4" @click="loadChecklistStructure">
            <VIcon icon="tabler-refresh" class="me-2" />
            Retry
          </VBtn>
        </div>

        <!-- Checklist Content -->
        <div v-else-if="checklist">
          <!-- Progress Indicator -->
          <VCard variant="outlined" class="mb-6">
            <VCardText>
              <div class="d-flex justify-space-between align-center">
                <div class="text-subtitle-1 font-weight-medium">Progress</div>
                <div class="text-caption text-medium-emphasis">
                  {{ completedSections }}/{{ totalSections }} sections completed
                </div>
              </div>
              <VProgressLinear
                :model-value="progressPercentage"
                color="primary"
                height="8"
                class="mt-2"
              />
            </VCardText>
          </VCard>

          <!-- Checklist Sections -->
          <div v-for="section in checklist.sections" :key="section.id" class="mb-6">
            <VCard variant="outlined">
              <VCardTitle class="bg-light-primary d-flex justify-space-between align-center">
                <span>{{ section.title }}</span>
                <VChip :color="getSectionStatus(section)" variant="flat" size="small">
                  {{ getSectionStatus(section) === 'success' ? 'Completed' : 'Pending' }}
                </VChip>
              </VCardTitle>
              
              <VCardText>
                <!-- Section Description -->
                <div v-if="section.description" class="text-caption text-medium-emphasis mb-4">
                  {{ section.description }}
                </div>

                <!-- Questions -->
                <VRow v-for="question in section.questions" :key="question.id" class="mb-4">
                  <VCol cols="12">
                    <div class="d-flex align-start gap-4">
                      <!-- Question Number -->
                      <div class="flex-shrink-0 mt-1">
                        <VChip variant="outlined" size="small" color="primary">
                          {{ question.order }}
                        </VChip>
                      </div>
                      
                      <!-- Question Content -->
                      <div class="flex-grow-1">
                        <div class="d-flex align-center gap-2 mb-2">
                          <span class="text-body-1 font-weight-medium">{{ question.question_text }}</span>
                          <VChip v-if="question.required" color="error" variant="flat" size="x-small">
                            Required
                          </VChip>
                        </div>
                        
                        <!-- Answer Display -->
                        <div class="mt-2">
                          <VChip v-if="getAnswer(question.question_code)" color="success" variant="flat" size="small">
                            <VIcon icon="tabler-check" class="me-1" size="16" />
                            Answered: {{ formatAnswer(question, getAnswer(question.question_code)) }}
                          </VChip>
                          <VChip v-else color="warning" variant="flat" size="small">
                            <VIcon icon="tabler-clock" class="me-1" size="16" />
                            Not Answered
                          </VChip>
                        </div>

                        <!-- Question Type Info -->
                        <div class="text-caption text-medium-emphasis mt-1">
                          Type: {{ getQuestionTypeLabel(question.type) }}
                          <span v-if="question.options"> • Options: {{ question.options.join(', ') }}</span>
                        </div>
                      </div>
                    </div>
                  </VCol>
                </VRow>
              </VCardText>
            </VCard>
          </div>

          <!-- No Sections Message -->
          <div v-if="checklist.sections.length === 0" class="text-center py-8">
            <VIcon icon="tabler-clipboard-list" size="64" class="text-medium-emphasis mb-4" />
            <div class="text-h6 text-medium-emphasis">No sections found</div>
            <div class="text-body-2 text-medium-emphasis">This checklist doesn't have any sections yet.</div>
          </div>
        </div>

        <!-- No Checklist Data -->
        <div v-else class="text-center py-8">
          <VIcon icon="tabler-clipboard-x" size="64" class="text-medium-emphasis mb-4" />
          <div class="text-h6 text-medium-emphasis">No checklist data</div>
          <div class="text-body-2 text-medium-emphasis">Unable to load checklist structure.</div>
        </div>
      </VCardText>
      
      <VCardActions class="pa-6 pt-0">
        <VSpacer />
        <VBtn variant="tonal" @click="closeDialog" class="me-3">
          <VIcon icon="tabler-arrow-left" class="me-2" />
          Close
        </VBtn>
        <VBtn color="primary" @click="startEditing" v-if="!isEditing">
          <VIcon icon="tabler-edit" class="me-2" />
          Start Editing
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import checklistService from '@/services/checklistService'

// Props
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  installationId: {
    type: [String, Number],
    required: true
  },
  facilityName: {
    type: String,
    default: ''
  }
})

// Emits
const emit = defineEmits(['update:modelValue', 'start-editing'])

// Reactive state
const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const loading = ref(false)
const error = ref(null)
const checklist = ref(null)
const draftData = ref(null)
const isEditing = ref(false)

// Computed properties
const totalSections = computed(() => {
  return checklist.value?.sections?.length || 0
})

const completedSections = computed(() => {
  if (!checklist.value?.sections) return 0
  
  return checklist.value.sections.filter(section => {
    return getSectionStatus(section) === 'success'
  }).length
})

const progressPercentage = computed(() => {
  if (totalSections.value === 0) return 0
  return Math.round((completedSections.value / totalSections.value) * 100) // Ensure integer
})

// Methods
const loadChecklistStructure = async () => {
  try {
    loading.value = true
    error.value = null
    
    const response = await checklistService.getInstallationChecklistStructure(props.installationId)
    checklist.value = response.data.checklist
    
    // Load draft data if available
    await loadDraftData()
    
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to load checklist structure'
    console.error('Error loading checklist:', err)
  } finally {
    loading.value = false
  }
}

const loadDraftData = async () => {
  try {
    const response = await checklistService.getDraft(props.installationId)
    draftData.value = response.data
  } catch (err) {
    // Draft might not exist, which is fine
    draftData.value = null
  }
}

const getSectionStatus = (section) => {
  if (!section.questions || section.questions.length === 0) return 'warning'
  
  const requiredQuestions = section.questions.filter(q => q.required)
  if (requiredQuestions.length === 0) return 'success'
  
  const completedRequired = requiredQuestions.every(question => {
    return getAnswer(question.question_code)
  })
  
  return completedRequired ? 'success' : 'warning'
}

const getAnswer = (questionCode) => {
  return draftData.value?.form_data?.[questionCode] || null
}

const formatAnswer = (question, answer) => {
  if (!answer) return 'Not answered'
  
  if (question.type === 'yes_no') {
    return answer === 'yes' ? 'Yes' : 'No'
  }
  
  if (question.type === 'select' && question.options) {
    return answer
  }
  
  if (Array.isArray(answer)) {
    return answer.join(', ')
  }
  
  return String(answer)
}

const getQuestionTypeLabel = (type) => {
  const typeLabels = {
    yes_no: 'Yes/No',
    text: 'Text',
    number: 'Number',
    select: 'Select',
    textarea: 'Text Area',
    date: 'Date',
    signature: 'Signature'
  }
  
  return typeLabels[type] || type
}

const closeDialog = () => {
  dialogVisible.value = false
  resetState()
}

const startEditing = () => {
  emit('start-editing', {
    checklist: checklist.value,
    draftData: draftData.value
  })
}

const resetState = () => {
  loading.value = false
  error.value = null
  checklist.value = null
  draftData.value = null
  isEditing.value = false
}

// Watch for dialog opening
watch(dialogVisible, (newValue) => {
  if (newValue) {
    loadChecklistStructure()
  }
})

// Lifecycle
onMounted(() => {
  if (dialogVisible.value) {
    loadChecklistStructure()
  }
})
</script>

<style scoped>
.bg-light-primary {
  background-color: rgba(var(--v-theme-primary), 0.1);
}
</style>
