<template>
  <VContainer>
    <VCard class="pa-6 mx-auto" max-width="700">
      <VCardTitle class="text-h6 font-weight-bold">
        Data Upload Portal
      </VCardTitle>

      <VCardSubtitle class="mb-6">
        Upload Excel files to populate your backend with health facilities and installations.
      </VCardSubtitle>

      <VCardText>
        <!-- Health Facilities Upload -->
        <section class="mb-10">
          <h3 class="text-h6 mb-4">Upload Health Facilities</h3>
          <VForm ref="facilityForm" v-model="facilityFormValid">
            <VRow>
              <VCol cols="12">
                <VFileInput
                  v-model="facilityFile"
                  label="Select Facility Excel File"
                  accept=".xlsx, .xls"
                  prepend-icon="mdi-file-excel"
                  :rules="[v => !!v || 'File is required']"
                  required
                />
              </VCol>
              <VCol cols="12" class="text-center">
                <VBtn
                  color="primary"
                  :loading="facilityLoading"
                  :disabled="!facilityFormValid || !facilityFile"
                  @click="uploadFacility"
                >
                  Upload Facilities
                </VBtn>
              </VCol>
            </VRow>
          </VForm>

          <VAlert
            v-if="facilitySuccess"
            type="success"
            class="mt-4"
            border="start"
            elevation="2"
          >
            {{ facilitySuccess }}
          </VAlert>

          <VAlert
            v-if="facilityError"
            type="error"
            class="mt-4"
            border="start"
            elevation="2"
          >
            {{ facilityError }}
          </VAlert>
        </section>

        <VDivider class="my-8" />

        <!-- Installations Upload -->
        <section>
          <h3 class="text-h6 mb-4">Upload Installations</h3>
          <VForm ref="installationForm" v-model="installationFormValid">
            <VRow>
              <VCol cols="12">
                <VFileInput
                  v-model="installationFile"
                  label="Select Installation Excel File"
                  accept=".xlsx, .xls"
                  prepend-icon="mdi-file-excel"
                  :rules="[v => !!v || 'File is required']"
                  required
                />
              </VCol>
              <VCol cols="12" class="text-center">
                <VBtn
                  color="secondary"
                  :loading="installationLoading"
                  :disabled="!installationFormValid || !installationFile"
                  @click="uploadInstallation"
                >
                  Upload Installations
                </VBtn>
              </VCol>
            </VRow>
          </VForm>

          <VAlert
            v-if="installationSuccess"
            type="success"
            class="mt-4"
            border="start"
            elevation="2"
          >
            {{ installationSuccess }}
          </VAlert>

          <VAlert
            v-if="installationError"
            type="error"
            class="mt-4"
            border="start"
            elevation="2"
          >
            {{ installationError }}
          </VAlert>
        </section>
      </VCardText>
    </VCard>
  </VContainer>
</template>

<script setup>
import { ref } from 'vue'
import api from '@/utils/axios'

// --- Facilities ---
const facilityFile = ref(null)
const facilityForm = ref(null)
const facilityFormValid = ref(false)
const facilityLoading = ref(false)
const facilitySuccess = ref('')
const facilityError = ref('')

const uploadFacility = async () => {
  const isValid = await facilityForm.value.validate()
  if (!isValid) return

  facilityLoading.value = true
  facilitySuccess.value = ''
  facilityError.value = ''

  try {
    const formData = new FormData()
    formData.append('excel_file', facilityFile.value)

  const { data } = await api.post('/import-facilities', formData, {
  headers: { 
    'Content-Type': 'multipart/form-data',
    'Accept': 'application/json'
  }
})

    facilitySuccess.value = data.message || 'Facilities uploaded successfully!'
    facilityFile.value = null
  } catch (err) {
    facilityError.value = err.response?.data?.message || 'Error uploading facilities.'
  } finally {
    facilityLoading.value = false
  }
}

// --- Installations ---
const installationFile = ref(null)
const installationForm = ref(null)
const installationFormValid = ref(false)
const installationLoading = ref(false)
const installationSuccess = ref('')
const installationError = ref('')

const uploadInstallation = async () => {
  const isValid = await installationForm.value.validate()
  if (!isValid) return

  installationLoading.value = true
  installationSuccess.value = ''
  installationError.value = ''

  try {
    const formData = new FormData()
    formData.append('excel_file', installationFile.value)

    const { data } = await api.post('/import/installations', formData, {
     headers: { 
    'Content-Type': 'multipart/form-data',
    'Accept': 'application/json'
  }
    })

    installationSuccess.value = data.message || 'Installations uploaded successfully!'
    installationFile.value = null
  } catch (err) {
    installationError.value =
      err.response?.data?.message || 'Error uploading installations.'
  } finally {
    installationLoading.value = false
  }
}
</script>
