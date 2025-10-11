<template>
  <VForm @submit.prevent="handleSubmit">
    <VRow>
      <!-- Basic Information -->
      <VCol cols="12">
        <VCard class="mb-4">
          <VCardTitle class="text-h6">
            <VIcon icon="tabler-user" class="me-2" />
            Basic Information
          </VCardTitle>
          <VCardText>
            <VRow>
              <!-- User ID Display -->
              <VCol v-if="urlUserId" cols="12">
                <VAlert type="info" density="compact">
                  Updating technician profile for User ID: <strong>{{ urlUserId }}</strong>
                </VAlert>
              </VCol>

              <VCol cols="12" md="6">
                <AppTextField
                  v-model="formData.phone"
                  label="Phone Number"
                  placeholder="+2348012345678"
                  prepend-inner-icon="tabler-phone"
                  :error-messages="errors.phone"
                  @update:model-value="clearError('phone')"
                />
              </VCol>

              <VCol cols="12" md="6">
                <AppTextField
                  v-model="formData.specialization"
                  label="Specialization"
                  placeholder="e.g., Solar Installation, Electrical, etc."
                  prepend-inner-icon="tabler-tool"
                  :error-messages="errors.specialization"
                  @update:model-value="clearError('specialization')"
                />
              </VCol>

              <VCol cols="12" md="6">
                <AppTextField
                  v-model="formData.id_card_number"
                  label="ID Card Number"
                  placeholder="TECH001234"
                  prepend-inner-icon="tabler-id"
                  :error-messages="errors.id_card_number"
                  @update:model-value="clearError('id_card_number')"
                />
              </VCol>
            </VRow>
          </VCardText>
        </VCard>
      </VCol>

      <!-- Bank Details -->
      <VCol cols="12">
        <VCard class="mb-4">
          <VCardTitle class="text-h6">
            <VIcon icon="tabler-credit-card" class="me-2" />
            Bank Details
          </VCardTitle>
          <VCardText>
            <VRow>
              <VCol cols="12" md="4">
                <AppTextField
                  v-model="formData.bank_name"
                  label="Bank Name"
                  placeholder="First Bank, Zenith Bank, etc."
                  prepend-inner-icon="tabler-building-bank"
                  :error-messages="errors.bank_name"
                  @update:model-value="clearError('bank_name')"
                />
              </VCol>

              <VCol cols="12" md="4">
                <AppTextField
                  v-model="formData.account_number"
                  label="Account Number"
                  placeholder="1234567890"
                  prepend-inner-icon="tabler-number"
                  :error-messages="errors.account_number"
                  @update:model-value="clearError('account_number')"
                />
              </VCol>

              <VCol cols="12" md="4">
                <AppTextField
                  v-model="formData.account_name"
                  label="Account Name"
                  placeholder="John Doe"
                  prepend-inner-icon="tabler-user"
                  :error-messages="errors.account_name"
                  @update:model-value="clearError('account_name')"
                />
              </VCol>
            </VRow>
          </VCardText>
        </VCard>
      </VCol>

      <!-- Status -->
      <VCol cols="12">
        <VCard>
          <VCardTitle class="text-h6">
            <VIcon icon="tabler-settings" class="me-2" />
            Status & Settings
          </VCardTitle>
          <VCardText>
            <VRow>
              <VCol cols="12" md="6">
                <VSwitch
                  v-model="formData.active"
                  label="Active Technician"
                  color="primary"
                  :true-value="true"
                  :false-value="false"
                  :messages="formData.active ? 'Technician can be assigned to sites' : 'Technician cannot be assigned to new sites'"
                />
              </VCol>
            </VRow>
          </VCardText>
        </VCard>
      </VCol>

      <!-- Action Buttons -->
      <VCol cols="12">
        <div class="d-flex gap-2 justify-end">
          <VBtn
            variant="tonal"
            color="secondary"
            @click="$emit('cancel')"
            :disabled="loading"
          >
            Cancel
          </VBtn>
          <VBtn
            type="submit"
            color="primary"
            :loading="loading"
            :disabled="loading"
          >
            Update Technician
          </VBtn>
        </div>
      </VCol>
    </VRow>
  </VForm>
</template>
<script setup>
import { ref, watch, computed, onMounted } from 'vue'
import { toast } from 'vue3-toastify'

// Props
const props = defineProps({
  technicianData: {
    type: Object,
    default: null
  },
  userId: {
    type: [String, Number],
    default: null
  }
})

// Emits
const emit = defineEmits(['saved', 'cancel'])

// State
const loading = ref(false)
const errors = ref({})
const urlUserId = ref(props.userId)
const existingTechnicianId = ref(null)

const formData = ref({
  phone: '',
  bank_name: '',
  account_number: '',
  account_name: '',
  specialization: '',
  id_card_number: '',
  active: true
})

// Computed
const backendUrl = computed(() => import.meta.env.VITE_BACKEND_URL)
const canSubmit = computed(() => {
  return !!urlUserId.value
})

// Methods
const getAuthToken = () => {
  return localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token')
}

const fetchTechnicianByUserId = async (userId) => {
  try {
    const token = getAuthToken()
    if (!token) {
      toast.error('Authentication required')
      return null
    }

    // alert('userId')

    const response = await fetch(`${backendUrl.value}/technician-user-data/${userId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error('Failed to fetch technician data')
    }

    const data = await response.json()
    
    if (data.success && data.technicians && data.technicians.length > 0) {
      // Return the first technician found for this user_id
      return data.technicians
    }
    
    return null
  } catch (error) {
    console.error('Error fetching technician:', error)
    toast.error('Failed to load technician data')
    return null
  }
}

const handleSubmit = async () => {
  // Validation
  if (!urlUserId.value) {
    toast.error('User ID is required')
    return
  }

  loading.value = true
  errors.value = {}

  try {
    const token = getAuthToken()
    if (!token) {
      toast.error('Authentication required')
      return
    }

    // Prepare request data with user_id
    const requestData = {
      ...formData.value,
      user_id: parseInt(urlUserId.value)
    }

    // Always use POST method
    const url = `${backendUrl.value}/technicians`
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
      body: JSON.stringify(requestData),
    })

    const data = await response.json()

    if (!response.ok) {
      // Handle validation errors from backend
      if (response.status === 422 && data.errors) {
        errors.value = data.errors
        toast.error('Please fix the validation errors')
        return
      }
      
      // Handle duplicate user_id error
      if (response.status === 409) {
        toast.error('Technician profile already exists for this user')
        return
      }
      
      throw new Error(data.message || 'Failed to save technician')
    }

    if (data.success) {
      toast.success(data.message || 'Technician saved successfully')
      emit('saved', data.technician || formData.value)
    }
  } catch (error) {
    console.error('Error saving technician:', error)
    
    // Handle network errors or other issues
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      toast.error('Network error: Unable to connect to server')
    } else {
      toast.error(error.message || 'Failed to save technician')
    }
  } finally {
    loading.value = false
  }
}

const clearError = (field) => {
  if (errors.value[field]) {
    delete errors.value[field]
  }
}

const initializeForm = async () => {
  try {
    // Use the userId from props
    if (!props.userId) {
      toast.error('User ID is required')
      return
    }

    urlUserId.value = props.userId

    // Fetch existing technician data for this user_id
    loading.value = true
    // const technician = await fetchTechnicianByUserId(props.userId)
    
    if (technicianData) {
      // Populate form with existing data
      formData.value = {
        phone: technicianData.phone || '',
        bank_name: technicianData.bank_name || '',
        account_number: technicianData.account_number || '',
        account_name: technicianData.account_name || '',
        specialization: technicianData.specialization || '',
        id_card_number: technicianData.id_card_number || '',
        active: technicianData.active !== undefined ? technicianData.active : true
      }
      
    } else {
      // No existing technician found - this is fine for POST
      // Reset form to default values
      formData.value = {
        phone: '',
        bank_name: '',
        account_number: '',
        account_name: '',
        specialization: '',
        id_card_number: '',
        active: true
      }
      existingTechnicianId.value = null
    }
    
    errors.value = {}
  } catch (error) {
    console.error('Error initializing form:', error)
    toast.error('Failed to initialize form')
  } finally {
    loading.value = false
  }
}

// Lifecycle
onMounted(() => {
  if (props.userId) {
    initializeForm()
  }
})

// Watchers
watch(() => props.userId, (newUserId) => {
  if (newUserId) {
    urlUserId.value = newUserId
    initializeForm()
  }
})

watch(() => props.technician, (newTechnician) => {
  if (newTechnician) {
    initializeForm()
  }
})
</script>
