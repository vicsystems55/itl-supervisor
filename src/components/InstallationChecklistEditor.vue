<template>
  <VDialog v-model="dialogVisible" max-width="1200" scrollable persistent>
    <VCard>
      <VCardTitle class="d-flex justify-space-between align-center pa-6 pb-4 bg-primary">
        <div>
          <span class="text-h5 text-white">Complete Installation Checklist</span>
          <div class="text-caption text-white text-opacity-80 mt-1">
            Installation ID: {{ installationId }} • {{ facilityName }}
          </div>
        </div>
        <VBtn icon variant="text" color="white" @click="closeDialog">
          <VIcon icon="tabler-x" />
        </VBtn>
      </VCardTitle>
      
      <VCardText class="pa-6">
        <VForm ref="form" v-model="formValid">
          <!-- Progress Indicator -->
          <VCard variant="outlined" class="mb-6">
            <VCardText>
              <div class="d-flex justify-space-between align-center">
                <div class="text-subtitle-1 font-weight-medium">Progress</div>
                <div class="text-caption text-medium-emphasis">
                  {{ completedSections }}/{{ totalSections }} sections completed
                  <span v-if="lastSaved" class="ms-2">• Last saved: {{ lastSaved }}</span>
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

          <!-- Header Information -->
          <VCard variant="outlined" class="mb-6">
            <VCardTitle class="bg-light-primary">Installation Details</VCardTitle>
            <VCardText>
              <VRow>
                <VCol cols="12" md="4">
                  <AppTextField
                    v-model="formData.date"
                    label="Checklist Date"
                    type="date"
                    :rules="[required]"
                    :disabled="isSubmitting"
                  />
                </VCol>
                <VCol cols="12" md="4">
                  <AppTextField
                    v-model="formData.installationTechnician"
                    label="Installation Technician"
                    placeholder="Enter technician name"
                    :rules="[required]"
                    :disabled="isSubmitting"
                  />
                </VCol>
                <VCol cols="12" md="4">
                  <AppTextField
                    v-model="formData.installationCompany"
                    label="Installation Company"
                    placeholder="Enter company name"
                    :rules="[required]"
                    :disabled="isSubmitting"
                  />
                </VCol>
              </VRow>
            </VCardText>
          </VCard>

          <!-- Checklist Sections -->
          <div v-for="section in checklistData?.sections" :key="section.id" class="mb-6">
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
                        <div class="d-flex align-center gap-2 mb-3">
                          <span class="text-body-1 font-weight-medium">{{ question.question_text }}</span>
                          <VChip v-if="question.required" color="error" variant="flat" size="x-small">
                            Required
                          </VChip>
                        </div>
                        
                        <!-- Answer Input Fields -->
                        <div class="mt-2">
                          <!-- Yes/No Type -->
                          <VRadioGroup 
                            v-if="question.type === 'yes_no'"
                            v-model="formData[question.question_code]"
                            :inline="true"
                            :disabled="isSubmitting"
                          >
                            <VRadio label="Yes" value="yes" />
                            <VRadio label="No" value="no" />
                          </VRadioGroup>

                          <!-- Select Type -->
                          <VSelect
                            v-else-if="question.type === 'select'"
                            v-model="formData[question.question_code]"
                            :items="question.options || []"
                            :placeholder="question.placeholder || 'Select an option'"
                            :rules="question.required ? [required] : []"
                            :disabled="isSubmitting"
                            density="compact"
                          />

                          <!-- Number Type -->
                          <AppTextField
                            v-else-if="question.type === 'number'"
                            v-model="formData[question.question_code]"
                            type="number"
                            :placeholder="question.placeholder"
                            :rules="getValidationRules(question)"
                            :disabled="isSubmitting"
                            density="compact"
                          />

                          <!-- Text Type -->
                          <AppTextField
                            v-else-if="question.type === 'text'"
                            v-model="formData[question.question_code]"
                            :placeholder="question.placeholder"
                            :rules="question.required ? [required] : []"
                            :disabled="isSubmitting"
                            density="compact"
                          />

                          <!-- Textarea Type -->
                          <AppTextarea
                            v-else-if="question.type === 'textarea'"
                            v-model="formData[question.question_code]"
                            :placeholder="question.placeholder"
                            :rules="question.required ? [required] : []"
                            :disabled="isSubmitting"
                            rows="3"
                            density="compact"
                          />

                          <!-- Date Type -->
                          <AppTextField
                            v-else-if="question.type === 'date'"
                            v-model="formData[question.question_code]"
                            type="date"
                            :placeholder="question.placeholder"
                            :rules="question.required ? [required] : []"
                            :disabled="isSubmitting"
                            density="compact"
                          />

                          <!-- Unsupported Type -->
                          <div v-else class="text-caption text-warning">
                            Unsupported question type: {{ question.type }}
                          </div>
                        </div>

                        <!-- Question Metadata -->
                        <div class="text-caption text-medium-emphasis mt-2">
                          Type: {{ getQuestionTypeLabel(question.type) }}
                        </div>
                      </div>
                    </div>
                  </VCol>
                </VRow>
              </VCardText>

              <!-- Section Save Button -->
              <VCardActions class="px-4 pb-4">
                <VSpacer />
                <VBtn 
                  color="primary" 
                  variant="tonal" 
                  @click="saveSection(section.title)"
                  :loading="savingSection === section.title"
                  :disabled="isSubmitting"
                >
                  <VIcon icon="tabler-check" class="me-2" />
                  Save Section
                </VBtn>
              </VCardActions>
            </VCard>
          </div>

          <!-- Signatures Section -->
          <VCard variant="outlined" class="mb-6">
            <VCardTitle class="bg-light-primary">Signatures</VCardTitle>
            <VCardText>
              <VRow>
                <VCol cols="12" md="6">
                  <AppTextField
                    v-model="formData.technicianSignature"
                    label="Installation Technician Signature"
                    placeholder="Enter signature"
                    :rules="[required]"
                    :disabled="isSubmitting"
                  />
                </VCol>
                <VCol cols="12" md="6">
                  <AppTextField
                    v-model="formData.healthCenterSignature"
                    label="Health Center Responsible Signature"
                    placeholder="Enter signature"
                    :rules="[required]"
                    :disabled="isSubmitting"
                  />
                </VCol>
                <VCol cols="12" md="6">
                  <AppTextField
                    v-model="formData.healthCenterName"
                    label="Name and Designation"
                    placeholder="Enter name and designation"
                    :rules="[required]"
                    :disabled="isSubmitting"
                  />
                </VCol>
                <VCol cols="12" md="6">
                  <AppTextField
                    v-model="formData.completionDate"
                    label="Completion Date"
                    type="date"
                    :rules="[required]"
                    :disabled="isSubmitting"
                  />
                </VCol>
              </VRow>
            </VCardText>
          </VCard>
        </VForm>
      </VCardText>
      
      <VCardActions class="pa-6 pt-0">
        <VBtn variant="text" @click="resetForm" :disabled="isSubmitting">
          <VIcon icon="tabler-refresh" class="me-2" />
          Reset Form
        </VBtn>
        <VSpacer />
        <VBtn variant="tonal" @click="closeDialog" class="me-3" :disabled="isSubmitting">
          <VIcon icon="tabler-arrow-left" class="me-2" />
          Cancel
        </VBtn>
        <VBtn color="primary" @click="submitForm" :disabled="!formValid || isSubmitting" :loading="isSubmitting">
          <VIcon icon="tabler-send" class="me-2" />
          Submit Complete Checklist
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
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
  },
  checklistData: {
    type: Object,
    default: null
  },
  draftData: {
    type: Object,
    default: null
  }
})

// Emits
const emit = defineEmits(['update:modelValue', 'submitted'])

// Reactive state
const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const form = ref(null)
const formValid = ref(false)
const isSubmitting = ref(false)
const savingSection = ref(null)
const lastSaved = ref(null)
const autoSaveTimeout = ref(null)

// Form data
const formData = ref({
  // Header
  date: new Date().toISOString().split('T')[0],
  installationTechnician: '',
  installationCompany: 'Inter-Trade Ltd.',
  
  // Signatures
  technicianSignature: '',
  healthCenterSignature: '',
  healthCenterName: '',
  completionDate: new Date().toISOString().split('T')[0]
})

// Computed properties
const totalSections = computed(() => {
  return props.checklistData?.sections?.length || 0
})

const completedSections = computed(() => {
  if (!props.checklistData?.sections) return 0
  
  return props.checklistData.sections.filter(section => {
    return getSectionStatus(section) === 'success'
  }).length
})

const progressPercentage = computed(() => {
  if (totalSections.value === 0) return 0
  return Math.round((completedSections.value / totalSections.value) * 100) // Ensure integer
})

// Validation rules
const required = (value) => !!value || 'This field is required'

// Methods
const getValidationRules = (question) => {
  if (!question.required) return []
  
  const rules = [required]
  
  if (question.type === 'number') {
    rules.push((value) => !isNaN(value) || 'Must be a valid number')
  }
  
  return rules
}

const getSectionStatus = (section) => {
  if (!section.questions || section.questions.length === 0) return 'warning'
  
  const requiredQuestions = section.questions.filter(q => q.required)
  if (requiredQuestions.length === 0) return 'success'
  
  const completedRequired = requiredQuestions.every(question => {
    const answer = formData.value[question.question_code]
    return answer !== undefined && answer !== null && answer !== ''
  })
  
  return completedRequired ? 'success' : 'warning'
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

const saveSection = async (sectionTitle) => {
  savingSection.value = sectionTitle
  
  try {
    const draftData = {
      form_data: formData.value,
      progress_percentage: progressPercentage.value, // Now it's always integer
      section: sectionTitle
    }
    
    await checklistService.saveDraft(props.installationId, draftData)
    lastSaved.value = new Date().toLocaleTimeString()
    
    console.log(`Section "${sectionTitle}" saved successfully`)
    
  } catch (error) {
    console.error('Error saving section:', error)
  } finally {
    savingSection.value = null
  }
}

const autoSave = () => {
  if (autoSaveTimeout.value) {
    clearTimeout(autoSaveTimeout.value)
  }
  
  autoSaveTimeout.value = setTimeout(async () => {
    if (progressPercentage.value > 0) {
      try {
        const draftData = {
          form_data: formData.value,
          progress_percentage: progressPercentage.value, // Now it's always integer
          section: null
        }
        
        await checklistService.saveDraft(props.installationId, draftData)
        lastSaved.value = new Date().toLocaleTimeString()
      } catch (error) {
        console.error('Auto-save failed:', error)
      }
    }
  }, 2000)
}

const submitForm = async () => {
  const { valid } = await form.value.validate()
  
  if (!valid) {
    // Scroll to first error
    const firstError = document.querySelector('.v-messages--error')
    if (firstError) {
      firstError.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
    return
  }
  
  isSubmitting.value = true
  
  try {
    const submissionData = {
      form_data: formData.value,
      checklist_date: formData.value.date,
      installation_technician: formData.value.installationTechnician,
      technician_signature: formData.value.technicianSignature,
      health_center_signature: formData.value.healthCenterSignature,
      health_center_name: formData.value.healthCenterName,
      completion_date: formData.value.completionDate
    }
    
    await checklistService.submitChecklist(props.installationId, submissionData)
    
    // Emit success event
    emit('submitted', submissionData)
    closeDialog()
    
  } catch (error) {
    console.error('Error submitting checklist:', error)
  } finally {
    isSubmitting.value = false
  }
}

const resetForm = () => {
  if (confirm('Are you sure you want to reset the form? All unsaved data will be lost.')) {
    // Reset form data
    formData.value = {
      date: new Date().toISOString().split('T')[0],
      installationTechnician: '',
      installationCompany: 'Inter-Trade Ltd.',
      technicianSignature: '',
      healthCenterSignature: '',
      healthCenterName: '',
      completionDate: new Date().toISOString().split('T')[0]
    }
    
    // Clear draft from server
    checklistService.deleteDraft(props.installationId)
    lastSaved.value = null
    
    // Reset form validation
    nextTick(() => {
      form.value?.reset()
    })
  }
}

const closeDialog = () => {
  dialogVisible.value = false
  resetState()
}

const resetState = () => {
  isSubmitting.value = false
  savingSection.value = null
  lastSaved.value = null
  
  if (autoSaveTimeout.value) {
    clearTimeout(autoSaveTimeout.value)
  }
}

const initializeFormData = () => {
  if (props.draftData?.form_data) {
    // Load data from draft
    formData.value = { ...formData.value, ...props.draftData.form_data }
    lastSaved.value = new Date(props.draftData.last_saved_at).toLocaleTimeString()
  }
  
  // Initialize empty values for all questions
  if (props.checklistData?.sections) {
    props.checklistData.sections.forEach(section => {
      section.questions.forEach(question => {
        if (formData.value[question.question_code] === undefined) {
          formData.value[question.question_code] = ''
        }
      })
    })
  }
}

// Watchers
watch(dialogVisible, (newValue) => {
  if (newValue && props.checklistData) {
    initializeFormData()
  }
})

watch(formData, () => {
  if (dialogVisible.value) {
    autoSave()
  }
}, { deep: true })

// Initialize when component mounts with data
watch(() => props.checklistData, (newData) => {
  if (newData && dialogVisible.value) {
    initializeFormData()
  }
}, { immediate: true })

// Cleanup
import { onUnmounted } from 'vue'
onUnmounted(() => {
  if (autoSaveTimeout.value) {
    clearTimeout(autoSaveTimeout.value)
  }
})
</script>

<style scoped>
.bg-light-primary {
  background-color: rgba(var(--v-theme-primary), 0.1);
}
</style>
