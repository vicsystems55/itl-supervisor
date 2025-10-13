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
        <VForm ref="form" v-model="valid">
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

          <!-- CHECK 1 - System Description -->
          <VCard variant="outlined" class="mb-6">
            <VCardTitle class="bg-light-primary d-flex justify-space-between align-center">
              <span>CHECK 1 – System Description</span>
              <VChip :color="getSectionStatus('check1')" variant="flat" size="small">
                {{ getSectionStatus('check1') === 'success' ? 'Completed' : 'Pending' }}
              </VChip>
            </VCardTitle>
            <VCardText>
              <VRow>
                <VCol cols="12" md="6">
                  <AppTextField
                    v-model="formData.qualifiedSupplier"
                    label="Qualified Supplier"
                    value="Haier Biomedical"
                    readonly
                    :disabled="isLoading"
                  />
                </VCol>
              </VRow>
              
              <div class="text-subtitle-1 font-weight-medium mt-4 mb-2">Refrigerator/Freezer</div>
              <VRow>
                <VCol cols="12" md="4">
                  <AppTextField
                    v-model="formData.refrigeratorModel"
                    label="Model Reference"
                    value="HTD-40"
                    readonly
                    :disabled="isLoading"
                  />
                </VCol>
                <VCol cols="12" md="4">
                  <AppTextField
                    v-model="formData.refrigeratorSerialNumber"
                    label="Serial Number"
                    placeholder="Enter serial number"
                    :rules="[required]"
                    :disabled="isLoading"
                  />
                </VCol>
                <VCol cols="12" md="4">
                  <AppTextField
                    v-model="formData.productNumber"
                    label="Product Number"
                    placeholder="Enter product number"
                    :rules="[required]"
                    :disabled="isLoading"
                  />
                </VCol>
              </VRow>
              
              <div class="text-subtitle-1 font-weight-medium mt-4 mb-2">Solar Panels</div>
              <VRow>
                <VCol cols="12" md="4">
                  <AppTextField
                    v-model="formData.solarPanelModel"
                    label="Model Reference"
                    placeholder="Enter solar panel model"
                    :rules="[required]"
                    :disabled="isLoading"
                  />
                </VCol>
                <VCol cols="12" md="4">
                  <AppTextField
                    v-model="formData.solarPanelQuantity"
                    label="Quantity of Panels"
                    type="number"
                    placeholder="Enter quantity"
                    :rules="[required, positiveNumber]"
                    min="1"
                    :disabled="isLoading"
                    @update:model-value="handleSolarPanelQuantityChange"
                  />
                </VCol>
              </VRow>
              
              <VRow v-for="n in solarPanelCount" :key="n" class="mt-2">
                <VCol cols="12" md="6">
                  <AppTextField
                    v-model="formData.solarPanelSerialNumbers[n-1]"
                    :label="`Solar Panel Serial Number ${n}`"
                    placeholder="Enter serial number"
                    :rules="[required]"
                    :disabled="isLoading"
                  />
                </VCol>
              </VRow>

              <VCardActions class="px-0 pt-4">
                <VSpacer />
                <VBtn 
                  color="primary" 
                  variant="tonal" 
                  @click="saveSection('check1')"
                  :loading="savingSection === 'check1'"
                  :disabled="isLoading"
                >
                  <VIcon icon="tabler-check" class="me-2" />
                  Save Section
                </VBtn>
              </VCardActions>
            </VCardText>
          </VCard>

          <!-- CHECK 2 - Shipment Details -->
          <VCard variant="outlined" class="mb-6">
            <VCardTitle class="bg-light-primary d-flex justify-space-between align-center">
              <span>CHECK 2 – Shipment Details</span>
              <VChip :color="getSectionStatus('check2')" variant="flat" size="small">
                {{ getSectionStatus('check2') === 'success' ? 'Completed' : 'Pending' }}
              </VChip>
            </VCardTitle>
            <VCardText>
              <VRow>
                <VCol cols="12">
                  <VRadioGroup 
                    v-model="formData.shipmentDamaged" 
                    label="Was the shipment damaged?" 
                    inline
                    :disabled="isLoading"
                  >
                    <VRadio label="Yes" value="yes" />
                    <VRadio label="No" value="no" />
                  </VRadioGroup>
                </VCol>
                <VCol cols="12">
                  <VRadioGroup 
                    v-model="formData.componentsMissing" 
                    label="Were any components missing or under-supplied?" 
                    inline
                    :disabled="isLoading"
                  >
                    <VRadio label="Yes" value="yes" />
                    <VRadio label="No" value="no" />
                  </VRadioGroup>
                </VCol>
                <VCol cols="12">
                  <VRadioGroup 
                    v-model="formData.partsReplaced" 
                    label="Have damaged/missing/under-supplied parts been replaced?" 
                    inline
                    :disabled="isLoading"
                  >
                    <VRadio label="Yes" value="yes" />
                    <VRadio label="No" value="no" />
                    <VRadio label="Not Applicable" value="na" />
                  </VRadioGroup>
                </VCol>
              </VRow>

              <VCardActions class="px-0 pt-4">
                <VSpacer />
                <VBtn 
                  color="primary" 
                  variant="tonal" 
                  @click="saveSection('check2')"
                  :loading="savingSection === 'check2'"
                  :disabled="isLoading"
                >
                  <VIcon icon="tabler-check" class="me-2" />
                  Save Section
                </VBtn>
              </VCardActions>
            </VCardText>
          </VCard>

          <!-- CHECK 3 - Solar Panel Installation -->
          <VCard variant="outlined" class="mb-6">
            <VCardTitle class="bg-light-primary d-flex justify-space-between align-center">
              <span>CHECK 3 – Solar Panel Installation</span>
              <VChip :color="getSectionStatus('check3')" variant="flat" size="small">
                {{ getSectionStatus('check3') === 'success' ? 'Completed' : 'Pending' }}
              </VChip>
            </VCardTitle>
            <VCardText>
              <div class="text-caption text-medium-emphasis mb-4">
                Note: The technician must get a good orientation where the panel has good sunlight and avoid shadow
              </div>
              
              <VRow>
                <VCol cols="12">
                  <VRadioGroup 
                    v-model="formData.panelOrientationCorrect" 
                    label="Has the panel been installed at the correct angle towards the equator?" 
                    inline
                    :disabled="isLoading"
                  >
                    <VRadio label="Yes" value="yes" />
                    <VRadio label="No" value="no" />
                  </VRadioGroup>
                </VCol>
                <VCol cols="12">
                  <VRadioGroup 
                    v-model="formData.shadowsOnPanel" 
                    label="Do shadows fall on the panel between 9:00am and 3:00pm?" 
                    inline
                    :disabled="isLoading"
                  >
                    <VRadio label="Yes" value="yes" />
                    <VRadio label="No" value="no" />
                  </VRadioGroup>
                  <div v-if="formData.shadowsOnPanel === 'yes'" class="text-error text-caption mt-1">
                    If YES, the system FAILS - if possible, remove the shade or the panel must be moved.
                  </div>
                </VCol>
              </VRow>
              
              <VDivider class="my-4" />
              
              <div class="text-subtitle-1 font-weight-medium mb-2">Panel Support Structure</div>
              <VRow>
                <VCol cols="12">
                  <VRadioGroup 
                    v-model="formData.roofFixingsAdequate" 
                    label="Are roof fixings in place and are they adequate?" 
                    inline
                    :disabled="isLoading"
                  >
                    <VRadio label="Yes" value="yes" />
                    <VRadio label="No" value="no" />
                  </VRadioGroup>
                </VCol>
                <VCol cols="12">
                  <VRadioGroup 
                    v-model="formData.theftDeterrentFasteners" 
                    label="Have theft-deterrent fasteners been used?" 
                    inline
                    :disabled="isLoading"
                  >
                    <VRadio label="Yes" value="yes" />
                    <VRadio label="No" value="no" />
                  </VRadioGroup>
                </VCol>
              </VRow>
              
              <VDivider class="my-4" />
              
              <div class="text-subtitle-1 font-weight-medium mb-2">Lightning Protection</div>
              <VRow>
                <VCol cols="12">
                  <VRadioGroup 
                    v-model="formData.lightningProtectionFitted" 
                    label="Has the lightning protection circuit been correctly fitted?" 
                    inline
                    :disabled="isLoading"
                  >
                    <VRadio label="Yes" value="yes" />
                    <VRadio label="No" value="no" />
                  </VRadioGroup>
                </VCol>
                <VCol cols="12">
                  <VRadioGroup 
                    v-model="formData.earthElectrodeFitted" 
                    label="Has the earth electrode been correctly fitted?" 
                    inline
                    :disabled="isLoading"
                  >
                    <VRadio label="Yes" value="yes" />
                    <VRadio label="No" value="no" />
                  </VRadioGroup>
                </VCol>
                <VCol cols="12">
                  <VRadioGroup 
                    v-model="formData.lightningProtectionTested" 
                    label="Has lightning protection system been tested for electrical continuity?" 
                    inline
                    :disabled="isLoading"
                  >
                    <VRadio label="Yes" value="yes" />
                    <VRadio label="No" value="no" />
                  </VRadioGroup>
                </VCol>
                <VCol cols="12">
                  <AppTextarea
                    v-model="formData.lightningProtectionComments"
                    label="Comments"
                    placeholder="Enter any comments about lightning protection"
                    rows="2"
                    :disabled="isLoading"
                  />
                </VCol>
              </VRow>

              <VCardActions class="px-0 pt-4">
                <VSpacer />
                <VBtn 
                  color="primary" 
                  variant="tonal" 
                  @click="saveSection('check3')"
                  :loading="savingSection === 'check3'"
                  :disabled="isLoading"
                >
                  <VIcon icon="tabler-check" class="me-2" />
                  Save Section
                </VBtn>
              </VCardActions>
            </VCardText>
          </VCard>

          <!-- Header Information -->
          <VCard variant="outlined" class="mb-6">
            <VCardText>
              <div class="text-caption text-medium-emphasis mb-4">
                Note: The installation technician must fill in this checklist for each completed installation.
              </div>
              
              <VRow>
                <VCol cols="12" md="3">
                  <AppTextField
                    v-model="formData.date"
                    label="Date"
                    type="date"
                    :rules="[required]"
                    :disabled="isLoading"
                  />
                </VCol>
                <VCol cols="12" md="3">
                  <AppTextField
                    v-model="formData.country"
                    label="Country"
                    placeholder="Enter country"
                    :rules="[required]"
                    :disabled="isLoading"
                  />
                </VCol>
                <VCol cols="12" md="3">
                  <AppTextField
                    v-model="formData.state"
                    label="State"
                    placeholder="Enter state"
                    :rules="[required]"
                    :disabled="isLoading"
                  />
                </VCol>
                <VCol cols="12" md="3">
                  <AppTextField
                    v-model="formData.lga"
                    label="LGA"
                    placeholder="Enter LGA"
                    :rules="[required]"
                    :disabled="isLoading"
                  />
                </VCol>
                <VCol cols="12">
                  <AppTextField
                    v-model="formData.facilityName"
                    label="Facility Name"
                    placeholder="Enter facility name"
                    :rules="[required]"
                    :disabled="isLoading"
                  />
                </VCol>
                <VCol cols="12" md="6">
                  <AppTextField
                    v-model="formData.installationTechnician"
                    label="Installation Technician"
                    placeholder="Enter technician name"
                    :rules="[required]"
                    :disabled="isLoading"
                  />
                </VCol>
                <VCol cols="12" md="6">
                  <AppTextField
                    v-model="formData.installationCompany"
                    label="Installation Company"
                    placeholder="Enter company name"
                    :rules="[required]"
                    :disabled="isLoading"
                  />
                </VCol>
              </VRow>
            </VCardText>
          </VCard>

          <!-- CHECK 4 - Array Cabling and Installation -->
          <VCard variant="outlined" class="mb-6">
            <VCardTitle class="bg-light-primary d-flex justify-space-between align-center">
              <span>CHECK 4 – Array Cabling and Installation</span>
              <VChip :color="getSectionStatus('check4')" variant="flat" size="small">
                {{ getSectionStatus('check4') === 'success' ? 'Completed' : 'Pending' }}
              </VChip>
            </VCardTitle>
            <VCardText>
              <VRow>
                <VCol cols="12">
                  <VRadioGroup 
                    v-model="formData.properCablingUsed" 
                    label="Only the solar array cable provided by supplier was used for installation?" 
                    inline
                    :disabled="isLoading"
                  >
                    <VRadio label="Yes" value="yes" />
                    <VRadio label="No" value="no" />
                  </VRadioGroup>
                </VCol>
                <VCol cols="12">
                  <VRadioGroup 
                    v-model="formData.connectionsProtected" 
                    label="Are all electrical connections and array cables concealed and properly protected?" 
                    inline
                    :disabled="isLoading"
                  >
                    <VRadio label="Yes" value="yes" />
                    <VRadio label="No" value="no" />
                  </VRadioGroup>
                </VCol>
                <VCol cols="12">
                  <AppTextarea
                    v-model="formData.cablingComments"
                    label="Comments"
                    placeholder="Enter any comments about cabling"
                    rows="2"
                    :disabled="isLoading"
                  />
                </VCol>
              </VRow>

              <VCardActions class="px-0 pt-4">
                <VSpacer />
                <VBtn 
                  color="primary" 
                  variant="tonal" 
                  @click="saveSection('check4')"
                  :loading="savingSection === 'check4'"
                  :disabled="isLoading"
                >
                  <VIcon icon="tabler-check" class="me-2" />
                  Save Section
                </VBtn>
              </VCardActions>
            </VCardText>
          </VCard>

          <!-- CHECK 5 - Functionality Test -->
          <VCard variant="outlined" class="mb-6">
            <VCardTitle class="bg-light-primary d-flex justify-space-between align-center">
              <span>CHECK 5 – Functionality Test</span>
              <VChip :color="getSectionStatus('check5')" variant="flat" size="small">
                {{ getSectionStatus('check5') === 'success' ? 'Completed' : 'Pending' }}
              </VChip>
            </VCardTitle>
            <VCardText>
              <VRow>
                <VCol cols="12">
                  <VRadioGroup 
                    v-model="formData.functionalityTestCarried" 
                    label="Functionality test has been carried out in accordance with the qualified supplier's instructions?" 
                    inline
                    :disabled="isLoading"
                  >
                    <VRadio label="Yes" value="yes" />
                    <VRadio label="No" value="no" />
                  </VRadioGroup>
                </VCol>
                <VCol cols="12">
                  <VRadioGroup 
                    v-model="formData.functionalityReportCompleted" 
                    label="A detailed functionality test report been completed and signed by the technician; a copy of the report is attached?" 
                    inline
                    :disabled="isLoading"
                  >
                    <VRadio label="Yes" value="yes" />
                    <VRadio label="No" value="no" />
                  </VRadioGroup>
                </VCol>
                <VCol cols="12">
                  <VRadioGroup 
                    v-model="formData.gsmCoverage" 
                    label="There is sufficient GSM coverage at the health facility?" 
                    inline
                    :disabled="isLoading"
                  >
                    <VRadio label="Yes" value="yes" />
                    <VRadio label="No" value="no" />
                    <VRadio label="Not Relevant" value="na" />
                  </VRadioGroup>
                </VCol>
              </VRow>

              <VCardActions class="px-0 pt-4">
                <VSpacer />
                <VBtn 
                  color="primary" 
                  variant="tonal" 
                  @click="saveSection('check5')"
                  :loading="savingSection === 'check5'"
                  :disabled="isLoading"
                >
                  <VIcon icon="tabler-check" class="me-2" />
                  Save Section
                </VBtn>
              </VCardActions>
            </VCardText>
          </VCard>

          <!-- CHECK 6 - Training -->
          <VCard variant="outlined" class="mb-6">
            <VCardTitle class="bg-light-primary d-flex justify-space-between align-center">
              <span>CHECK 6 – Training</span>
              <VChip :color="getSectionStatus('check6')" variant="flat" size="small">
                {{ getSectionStatus('check6') === 'success' ? 'Completed' : 'Pending' }}
              </VChip>
            </VCardTitle>
            <VCardText>
              <VRow>
                <VCol cols="12" md="6">
                  <AppTextField
                    v-model="formData.staffTrainedUsage"
                    label="Number of health facility staff trained in usage of refrigerator"
                    type="number"
                    placeholder="Enter number of staff"
                    :rules="[required, positiveNumber]"
                    min="0"
                    :disabled="isLoading"
                  />
                </VCol>
                <VCol cols="12" md="6">
                  <AppTextField
                    v-model="formData.staffTrainedMaintenance"
                    label="Number of staff trained in preventive maintenance of refrigerator"
                    type="number"
                    placeholder="Enter number of staff"
                    :rules="[required, positiveNumber]"
                    min="0"
                    :disabled="isLoading"
                  />
                </VCol>
                <VCol cols="12" md="6">
                  <AppTextField
                    v-model="formData.staffTrainedTemperature"
                    label="Number of staff trained in usage of 30 DTR / recording of temperature"
                    type="number"
                    placeholder="Enter number of staff"
                    :rules="[required, positiveNumber]"
                    min="0"
                    :disabled="isLoading"
                  />
                </VCol>
                <VCol cols="12">
                  <VRadioGroup 
                    v-model="formData.warrantyExplained" 
                    label="Warranty / claims procedure has been explained, including whom to contact in case of under-performance or downtime of equipment?" 
                    inline
                    :disabled="isLoading"
                  >
                    <VRadio label="Yes" value="yes" />
                    <VRadio label="No" value="no" />
                  </VRadioGroup>
                </VCol>
                <VCol cols="12">
                  <VRadioGroup 
                    v-model="formData.warrantyContactsAttached" 
                    label="Warranty / claims procedure and relevant contacts are attached to the fridge?" 
                    inline
                    :disabled="isLoading"
                  >
                    <VRadio label="Yes" value="yes" />
                    <VRadio label="No" value="no" />
                  </VRadioGroup>
                </VCol>
              </VRow>

              <VCardActions class="px-0 pt-4">
                <VSpacer />
                <VBtn 
                  color="primary" 
                  variant="tonal" 
                  @click="saveSection('check6')"
                  :loading="savingSection === 'check6'"
                  :disabled="isLoading"
                >
                  <VIcon icon="tabler-check" class="me-2" />
                  Save Section
                </VBtn>
              </VCardActions>
            </VCardText>
          </VCard>

          <!-- CHECK 7 - Documentation -->
          <VCard variant="outlined" class="mb-6">
            <VCardTitle class="bg-light-primary d-flex justify-space-between align-center">
              <span>CHECK 7 – Documentation</span>
              <VChip :color="getSectionStatus('check7')" variant="flat" size="small">
                {{ getSectionStatus('check7') === 'success' ? 'Completed' : 'Pending' }}
              </VChip>
            </VCardTitle>
            <VCardText>
              <VRow>
                <VCol cols="12">
                  <AppSelect
                    v-model="formData.documentationLanguage"
                    label="Language"
                    :items="['English', 'French', 'Spanish', 'Portuguese', 'Local Language']"
                    placeholder="Select language"
                    :rules="[required]"
                    :disabled="isLoading"
                  />
                </VCol>
                <VCol cols="12">
                  <VCheckbox
                    v-model="formData.userManualSupplied"
                    label="User manual for all system components"
                    :disabled="isLoading"
                  />
                </VCol>
                <VCol cols="12">
                  <VCheckbox
                    v-model="formData.technicianManualSupplied"
                    label="Technician's manual"
                    :disabled="isLoading"
                  />
                </VCol>
                <VCol cols="12">
                  <VCheckbox
                    v-model="formData.installationManualSupplied"
                    label="Installation manual"
                    :disabled="isLoading"
                  />
                </VCol>
                <VCol cols="12">
                  <AppTextarea
                    v-model="formData.documentationComments"
                    label="Comments"
                    placeholder="Enter any comments about documentation"
                    rows="2"
                    :disabled="isLoading"
                  />
                </VCol>
              </VRow>

              <VCardActions class="px-0 pt-4">
                <VSpacer />
                <VBtn 
                  color="primary" 
                  variant="tonal" 
                  @click="saveSection('check7')"
                  :loading="savingSection === 'check7'"
                  :disabled="isLoading"
                >
                  <VIcon icon="tabler-check" class="me-2" />
                  Save Section
                </VBtn>
              </VCardActions>
            </VCardText>
          </VCard>

          <!-- CHECK 8 - Overall Conclusions -->
          <VCard variant="outlined" class="mb-6">
            <VCardTitle class="bg-light-primary d-flex justify-space-between align-center">
              <span>CHECK 8 – Overall Conclusions and Recommendations</span>
              <VChip :color="getSectionStatus('check8')" variant="flat" size="small">
                {{ getSectionStatus('check8') === 'success' ? 'Completed' : 'Pending' }}
              </VChip>
            </VCardTitle>
            <VCardText>
              <VRow>
                <VCol cols="12">
                  <VRadioGroup 
                    v-model="formData.recommendation" 
                    label="Recommendation:" 
                    inline 
                    :rules="[required]"
                    :disabled="isLoading"
                  >
                    <VRadio label="PASS" value="pass" />
                    <VRadio label="FAIL" value="fail" />
                  </VRadioGroup>
                </VCol>
                <VCol cols="12" v-if="formData.recommendation === 'fail'">
                  <AppTextarea
                    v-model="formData.outstandingWork"
                    label="If FAIL, list outstanding work still required:"
                    placeholder="Describe outstanding work..."
                    rows="3"
                    :rules="formData.recommendation === 'fail' ? [required] : []"
                    :disabled="isLoading"
                  />
                </VCol>
                <VCol cols="12" v-else>
                  <div class="text-success text-body-2">
                    If PASS, the installation can be handed over to the user.
                  </div>
                </VCol>
              </VRow>

              <VCardActions class="px-0 pt-4">
                <VSpacer />
                <VBtn 
                  color="primary" 
                  variant="tonal" 
                  @click="saveSection('check8')"
                  :loading="savingSection === 'check8'"
                  :disabled="isLoading"
                >
                  <VIcon icon="tabler-check" class="me-2" />
                  Save Section
                </VBtn>
              </VCardActions>
            </VCardText>
          </VCard>

          <!-- Signatures -->
          <VCard variant="outlined">
            <VCardTitle class="bg-light-primary d-flex justify-space-between align-center">
              <span>Signatures</span>
              <VChip :color="getSectionStatus('signatures')" variant="flat" size="small">
                {{ getSectionStatus('signatures') === 'success' ? 'Completed' : 'Pending' }}
              </VChip>
            </VCardTitle>
            <VCardText>
              <VRow>
                <VCol cols="12" md="6">
                  <AppTextField
                    v-model="formData.technicianSignature"
                    label="Installation Technician Signature"
                    placeholder="Enter signature"
                    :rules="[required]"
                    :disabled="isLoading"
                  />
                </VCol>
                <VCol cols="12" md="6">
                  <AppTextField
                    v-model="formData.healthCenterSignature"
                    label="Health Center Responsible Signature"
                    placeholder="Enter signature"
                    :rules="[required]"
                    :disabled="isLoading"
                  />
                </VCol>
                <VCol cols="12" md="6">
                  <AppTextField
                    v-model="formData.healthCenterName"
                    label="Name and Designation"
                    placeholder="Enter name and designation"
                    :rules="[required]"
                    :disabled="isLoading"
                  />
                </VCol>
                <VCol cols="12" md="6">
                  <AppTextField
                    v-model="formData.completionDate"
                    label="Date"
                    type="date"
                    :rules="[required]"
                    :disabled="isLoading"
                  />
                </VCol>
              </VRow>

              <VCardActions class="px-0 pt-4">
                <VSpacer />
                <VBtn 
                  color="primary" 
                  variant="tonal" 
                  @click="saveSection('signatures')"
                  :loading="savingSection === 'signatures'"
                  :disabled="isLoading"
                >
                  <VIcon icon="tabler-check" class="me-2" />
                  Save Section
                </VBtn>
              </VCardActions>
            </VCardText>
          </VCard>
        </VForm>
      </VCardText>
      
      <VCardActions class="pa-6 pt-0">
        <VBtn variant="text" @click="resetForm" :disabled="isLoading">
          <VIcon icon="tabler-refresh" class="me-2" />
          Reset Form
        </VBtn>
        <VSpacer />
        <VBtn variant="tonal" @click="closeDialog" class="me-3" :disabled="isLoading">
          Cancel
        </VBtn>
        <VBtn color="primary" @click="submitForm" :disabled="!valid || isLoading" :loading="isLoading">
          <VIcon icon="tabler-send" class="me-2" />
          Submit Complete Checklist
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'

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
const emit = defineEmits(['update:modelValue', 'submit'])

// Reactive state
const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const valid = ref(false)
const form = ref()
const isLoading = ref(false)
const savingSection = ref(null)

// Cache key
const cacheKey = computed(() => `installation_checklist_${props.installationId}`)

// Form validation rules
const required = value => !!value || 'This field is required'
const positiveNumber = value => value > 0 || 'Must be a positive number'

// Form data with default values
const defaultFormData = () => ({
  // Header
  date: new Date().toISOString().split('T')[0],
  country: '',
  state: '',
  lga: '',
  facilityName: props.facilityName,
  installationTechnician: '',
  installationCompany: 'Inter-Trade Ltd.',
  
  // CHECK 1
  qualifiedSupplier: 'Haier Biomedical',
  refrigeratorModel: 'HTD-40',
  refrigeratorSerialNumber: '',
  productNumber: '',
  solarPanelModel: '',
  solarPanelQuantity: '',
  solarPanelSerialNumbers: [],
  
  // CHECK 2
  shipmentDamaged: '',
  componentsMissing: '',
  partsReplaced: '',
  
  // CHECK 3
  panelOrientationCorrect: '',
  shadowsOnPanel: '',
  roofFixingsAdequate: '',
  theftDeterrentFasteners: '',
  lightningProtectionFitted: '',
  earthElectrodeFitted: '',
  lightningProtectionTested: '',
  lightningProtectionComments: '',
  
  // CHECK 4
  properCablingUsed: '',
  connectionsProtected: '',
  cablingComments: '',
  
  // CHECK 5
  functionalityTestCarried: '',
  functionalityReportCompleted: '',
  gsmCoverage: '',
  
  // CHECK 6
  staffTrainedUsage: '',
  staffTrainedMaintenance: '',
  staffTrainedTemperature: '',
  warrantyExplained: '',
  warrantyContactsAttached: '',
  
  // CHECK 7
  documentationLanguage: '',
  userManualSupplied: false,
  technicianManualSupplied: false,
  installationManualSupplied: false,
  documentationComments: '',
  
  // CHECK 8
  recommendation: '',
  outstandingWork: '',
  
  // Signatures
  technicianSignature: '',
  healthCenterSignature: '',
  healthCenterName: '',
  completionDate: new Date().toISOString().split('T')[0]
})

const formData = reactive(defaultFormData())

// Computed properties
const solarPanelCount = computed(() => {
  return parseInt(formData.solarPanelQuantity) || 0
})

const totalSections = computed(() => 9) // 8 checks + signatures
const completedSections = computed(() => {
  const sections = [
    'check1', 'check2', 'check3', 'check4', 
    'check5', 'check6', 'check7', 'check8', 'signatures'
  ]
  return sections.filter(section => getSectionStatus(section) === 'success').length
})

const progressPercentage = computed(() => {
  return (completedSections.value / totalSections.value) * 100
})

// Methods
const loadCachedData = () => {
  try {
    const cached = localStorage.getItem(cacheKey.value)
    if (cached) {
      const parsed = JSON.parse(cached)
      Object.assign(formData, parsed)
      console.log('Loaded cached form data')
    }
  } catch (error) {
    console.error('Error loading cached data:', error)
  }
}

const saveToCache = () => {
  try {
    localStorage.setItem(cacheKey.value, JSON.stringify(formData))
    console.log('Form data cached successfully')
  } catch (error) {
    console.error('Error caching form data:', error)
  }
}

const clearCache = () => {
  try {
    localStorage.removeItem(cacheKey.value)
    console.log('Cache cleared')
  } catch (error) {
    console.error('Error clearing cache:', error)
  }
}

const handleSolarPanelQuantityChange = (newQuantity) => {
  const currentCount = formData.solarPanelSerialNumbers.length
  const newCount = parseInt(newQuantity) || 0
  
  if (newCount > currentCount) {
    // Add new empty serial numbers
    for (let i = currentCount; i < newCount; i++) {
      formData.solarPanelSerialNumbers.push('')
    }
  } else if (newCount < currentCount) {
    // Remove extra serial numbers
    formData.solarPanelSerialNumbers = formData.solarPanelSerialNumbers.slice(0, newCount)
  }
}

const getSectionStatus = (section) => {
  // Define required fields for each section
  const sectionRequirements = {
    check1: ['refrigeratorSerialNumber', 'productNumber', 'solarPanelModel', 'solarPanelQuantity'],
    check2: ['shipmentDamaged', 'componentsMissing', 'partsReplaced'],
    check3: ['panelOrientationCorrect', 'shadowsOnPanel', 'roofFixingsAdequate', 'theftDeterrentFasteners', 'lightningProtectionFitted', 'earthElectrodeFitted', 'lightningProtectionTested'],
    check4: ['properCablingUsed', 'connectionsProtected'],
    check5: ['functionalityTestCarried', 'functionalityReportCompleted', 'gsmCoverage'],
    check6: ['staffTrainedUsage', 'staffTrainedMaintenance', 'staffTrainedTemperature', 'warrantyExplained', 'warrantyContactsAttached'],
    check7: ['documentationLanguage'],
    check8: ['recommendation'],
    signatures: ['technicianSignature', 'healthCenterSignature', 'healthCenterName', 'completionDate']
  }

  const requirements = sectionRequirements[section] || []
  const isComplete = requirements.every(field => {
    const value = formData[field]
    if (Array.isArray(value)) {
      return value.every(item => item && item.trim() !== '')
    }
    return value !== '' && value !== null && value !== undefined
  })

  return isComplete ? 'success' : 'warning'
}

const saveSection = async (section) => {
  savingSection.value = section
  isLoading.value = true
  
  try {
    // Validate the section
    const sectionValid = getSectionStatus(section) === 'success'
    
    if (sectionValid) {
      // Save to cache
      saveToCache()
      
      // Simulate API call - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      console.log(`Section ${section} saved successfully`)
      // You could show a success message here
    } else {
      console.warn(`Section ${section} is not complete`)
      // You could show a warning message here
    }
  } catch (error) {
    console.error(`Error saving section ${section}:`, error)
  } finally {
    savingSection.value = null
    isLoading.value = false
  }
}

const closeDialog = () => {
  dialogVisible.value = false
}

const resetForm = () => {
  if (confirm('Are you sure you want to reset the form? All unsaved data will be lost.')) {
    Object.assign(formData, defaultFormData())
    clearCache()
    if (form.value) {
      form.value.reset()
    }
  }
}

const submitForm = async () => {
  const { valid: formValid } = await form.value.validate()
  
  if (formValid) {
    isLoading.value = true
    
    try {
      // Prepare the data to emit
      const submissionData = {
        installationId: props.installationId,
        ...formData,
        solarPanelSerialNumbers: formData.solarPanelSerialNumbers.slice(0, solarPanelCount.value)
      }
      
      // Emit the submit event with form data
      emit('submit', submissionData)
      
      // Clear cache on successful submission
      clearCache()
      
      // Close dialog and reset form
      closeDialog()
      resetForm()
    } catch (error) {
      console.error('Error submitting form:', error)
    } finally {
      isLoading.value = false
    }
  }
}

// Watch for form changes and auto-save to cache
watch(formData, () => {
  saveToCache()
}, { deep: true, immediate: true })

// Load cached data when dialog opens
watch(dialogVisible, (newValue) => {
  if (newValue) {
    loadCachedData()
  }
})

// Watch for facility name changes
watch(() => props.facilityName, (newValue) => {
  formData.facilityName = newValue
})
</script>

<style scoped>
.bg-light-primary {
  background-color: rgba(var(--v-theme-primary), 0.1);
}
</style>
