<template>
  <VContainer fluid class="pa-1">
    <div>
      <!-- Your existing installation details -->
      <VRow class="mb-6">
        <VCol cols="12">
          <div class="d-flex justify-space-between align-start">
            <!-- ... your existing header ... -->

            <div class="d-flex gap-2"></div>
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
    <!-- Loading State -->
    <div v-if="loading" class="text-center py-8">
      <VProgressCircular indeterminate color="primary" size="64" />
      <div class="text-body-1 mt-4">Loading installation details.*.</div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="text-center py-8">
      <VIcon icon="tabler-alert-circle" size="64" color="error" class="mb-4" />
      <div class="text-h6 text-error mb-2">Failed to load installation</div>
      <div class="text-body-1 text-medium-emphasis mb-4">{{ error }}</div>
      <VBtn color="primary" @click="fetchInstallation">
        <VIcon icon="tabler-refresh" class="me-2" />
        Try Again
      </VBtn>
      <VBtn variant="tonal" class="ml-2" @click="$router.push('/installation')">
        <VIcon icon="tabler-arrow-left" class="me-2" />
        Back to Installations
      </VBtn>
    </div>

    <!-- Installation Details -->
    <div v-else-if="installation">
      <!-- Header -->
      <VRow class="mb-6">
        <VCol cols="12">
          <div
            class="d-flex flex-column flex-sm-row justify-space-between align-start gap-4"
          >
            <div class="flex-grow-1">
              <VBtn
                variant="text"
                @click="$router.push('/installation')"
                class="mb-2 mb-sm-4"
                size="small"
              >
                <VIcon icon="tabler-arrow-left" class="me-1 me-sm-2" />
                <span class="d-none d-sm-inline">Back to Installations</span>
                <span class="d-sm-none">Back</span>
              </VBtn>

              <h1
                class="text-h5 text-sm-h4 font-weight-bold text-primary break-word"
              >
                {{ installation.facility?.name }}
              </h1>

              <div
                class="d-flex flex-column flex-sm-row align-start align-sm-center gap-1 gap-sm-2 mt-2"
              >
                <p class="text-body-2 text-sm-body-1 text-medium-emphasis mb-0">
                  Installation ID: {{ installation.id }}
                </p>
                <VChip
                  :color="
                    installation.verified_by_health_officer
                      ? 'success'
                      : 'warning'
                  "
                  variant="flat"
                  size="small"
                  class="align-self-start align-self-sm-center"
                >
                  <VIcon
                    :icon="
                      installation.verified_by_health_officer
                        ? 'tabler-check'
                        : 'tabler-clock'
                    "
                    class="me-1"
                    size="14"
                  />
                  <span class="d-none d-sm-inline">
                    {{
                      installation.verified_by_health_officer
                        ? "Verified"
                        : "Pending Verification"
                    }}
                  </span>
                  <span class="d-sm-none">
                    {{
                      installation.verified_by_health_officer
                        ? "Verified"
                        : "Pending"
                    }}
                  </span>
                </VChip>
              </div>
            </div>

            <div class="d-flex flex-column flex-sm-row gap-2 w-100 w-sm-auto">
              <VBtn
                variant="tonal"
                @click="toggleVerification"
                size="small"
                class="flex-grow-1 flex-sm-grow-0"
              >
                <VIcon
                  :icon="
                    installation.verified_by_health_officer
                      ? 'tabler-x'
                      : 'tabler-check'
                  "
                  class="me-1 me-sm-2"
                  size="16"
                />
                <span class="d-none d-sm-inline">
                  {{
                    installation.verified_by_health_officer
                      ? "Unverify"
                      : "Verify"
                  }}
                </span>
                <span class="d-sm-none">
                  {{
                    installation.verified_by_health_officer
                      ? "Unverify"
                      : "Verify"
                  }}
                </span>
              </VBtn>
              <VBtn
                color="primary"
                @click="showChecklistDisplay = true"
                size="small"
                class="flex-grow-1 flex-sm-grow-0"
              >
                <VIcon icon="tabler-checklist" class="me-1 me-sm-2" size="16" />
                <span class="d-none d-sm-inline">Installation Checklist</span>
                <span class="d-sm-none">Checklist</span>
              </VBtn>
            </div>
          </div>
        </VCol>
      </VRow>

      <!-- Status Update Buttons -->
      <VRow class="mb-6 d-none">
        <VCol cols="12" sm="6">
          <VCard>
            <VCardTitle class="d-flex align-center">
              <VIcon icon="tabler-truck-delivery" class="me-2 text-primary" />
              Delivery Status
            </VCardTitle>
            <VDivider />
            <VCardText>
              <div class="text-center">
                <VChip
                  :color="getStatusColor(installation.delivery_status)"
                  variant="flat"
                  size="large"
                  class="mb-4"
                >
                  {{ installation.delivery_status || "Not set" }}
                </VChip>
                <div class="d-flex gap-2 justify-center">
                  <VBtn
                    v-for="status in deliveryStatuses"
                    :key="status"
                    :color="
                      installation.delivery_status === status
                        ? 'primary'
                        : 'secondary'
                    "
                    variant="tonal"
                    size="small"
                    @click="updateDeliveryStatus(status)"
                  >
                    {{ status }}
                  </VBtn>
                </div>
              </div>
            </VCardText>
          </VCard>
        </VCol>
        <VCol cols="12" sm="6">
          <VCard>
            <VCardTitle class="d-flex align-center">
              <VIcon icon="tabler-tools" class="me-2 text-primary" />
              Installation Status
            </VCardTitle>
            <VDivider />
            <VCardText>
              <div class="text-center">
                <VChip
                  :color="getStatusColor(installation.installation_status)"
                  variant="flat"
                  size="large"
                  class="mb-4"
                >
                  {{ installation.installation_status || "Not set" }}
                </VChip>
                <div class="d-flex gap-2 justify-center">
                  <VBtn
                    v-for="status in installationStatuses"
                    :key="status"
                    :color="
                      installation.installation_status === status
                        ? 'primary'
                        : 'secondary'
                    "
                    variant="tonal"
                    size="small"
                    @click="updateInstallationStatus(status)"
                  >
                    {{ status }}
                  </VBtn>
                </div>
              </div>
            </VCardText>
          </VCard>
        </VCol>
      </VRow>

      <!-- Main Content -->

      <VRow>
        <!-- Facility Information -->
        <VCol cols="12">
          <VCard class="mb-6">
            <VTabs v-model="activeTab" color="primary">
              <VTab value="facility">
                <VIcon icon="tabler-building" class="me-2" />
                Details
              </VTab>
              <VTab value="media">
                <VIcon icon="tabler-photo" class="me-2" />
                Media
              </VTab>
              <VTab value="issues">
                <VIcon icon="tabler-alert-triangle" class="me-2" />
                Issues
              </VTab>
            </VTabs>

            <VCardText>
              <VWindow v-model="activeTab">
                <!-- Facility Information Tab -->
                <VWindowItem value="facility">
                  <VRow>
                    <VCol cols="12" sm="6">
                      <div class="detail-field">
                        <div class="text-caption text-medium-emphasis">
                          Facility Name
                        </div>
                        <div class="text-body-1">
                          {{ installation.facility?.name || "Not specified" }}
                        </div>
                      </div>
                    </VCol>
                    <VCol cols="12" sm="6">
                      <div class="detail-field">
                        <div class="text-caption text-medium-emphasis">
                          Facility Type
                        </div>
                        <div class="text-body-1">
                          {{
                            installation.facility?.facility_type ||
                            "Not specified"
                          }}
                        </div>
                      </div>
                    </VCol>
                    <VCol cols="12" sm="6">
                      <div class="detail-field">
                        <div class="text-caption text-medium-emphasis">
                          Facility Code
                        </div>
                        <div class="text-body-1">
                          {{ installation.facility?.code || "Not specified" }}
                        </div>
                      </div>
                    </VCol>
                    <VCol cols="12" sm="6">
                      <div class="detail-field">
                        <div class="text-caption text-medium-emphasis">
                          Facility Level
                        </div>
                        <div class="text-body-1">
                          {{ installation.facility?.level || "Not specified" }}
                        </div>
                      </div>
                    </VCol>
                    <VCol cols="12">
                      <div class="detail-field">
                        <div class="text-caption text-medium-emphasis">
                          Address
                        </div>
                        <div class="text-body-1">
                          {{
                            installation.facility?.address || "Not specified"
                          }}
                        </div>
                      </div>
                    </VCol>
                    <VCol cols="12" sm="6">
                      <div class="detail-field">
                        <div class="text-caption text-medium-emphasis">
                          Supply Chain Level
                        </div>
                        <div class="text-body-1">
                          {{
                            installation.facility?.supply_chain_level ||
                            "Not specified"
                          }}
                        </div>
                      </div>
                    </VCol>
                    <VCol cols="12" sm="6">
                      <div class="detail-field">
                        <div class="text-caption text-medium-emphasis">
                          Road Access
                        </div>
                        <div class="text-body-1">
                          {{
                            installation.facility?.road_accessible
                              ? "Yes"
                              : "No"
                          }}
                        </div>
                      </div>
                    </VCol>
                    <VCol cols="12" sm="6">
                      <div class="detail-field">
                        <div class="text-caption text-medium-emphasis">
                          Distance from Hub
                        </div>
                        <div class="text-body-1">
                          {{
                            installation.facility?.distance_from_hub_km
                              ? installation.facility.distance_from_hub_km +
                                " km"
                              : "Not specified"
                          }}
                        </div>
                      </div>
                    </VCol>
                    <VCol cols="12" sm="6">
                      <div class="detail-field">
                        <div class="text-caption text-medium-emphasis">
                          Road Quality
                        </div>
                        <div class="text-body-1">
                          {{
                            installation.facility?.road_quality ||
                            "Not specified"
                          }}
                        </div>
                      </div>
                    </VCol>
                    <VCol cols="12" sm="6">
                      <div class="detail-field">
                        <div class="text-caption text-medium-emphasis">
                          Phone Number
                        </div>
                        <div class="text-body-1">
                          {{
                            installation.facility?.phone_number ||
                            "Not specified"
                          }}
                        </div>
                      </div>
                    </VCol>
                    <VCol cols="12" sm="6">
                      <div class="detail-field">
                        <div class="text-caption text-medium-emphasis">
                          Email
                        </div>
                        <div class="text-body-1">
                          {{ installation.facility?.email || "Not specified" }}
                        </div>
                      </div>
                    </VCol>
                  </VRow>
                </VWindowItem>

                <!-- Media Tab -->
                <VWindowItem value="media">
                  <MediaGallery
                    :installation-id="installation?.id"
                    :facility-name="installation?.facility?.name"
                    @media-added="handleMediaAdded"
                    @media-deleted="handleMediaDeleted"
                    @media-downloaded="handleMediaDownloaded"
                  />
                </VWindowItem>

                <!-- Issues Tab -->
                <!-- Issues Tab -->
                <VWindowItem value="issues">
                  <InstallationIssues
                    :installation-id="installation?.id"
                    @issue-reported="handleIssueReported"
                    @issue-resolved="handleIssueResolved"
                  />
                </VWindowItem>
              </VWindow>
            </VCardText>
          </VCard>
        </VCol>
        <VCol cols="12">
          <!-- Location Information -->
          <VCard class="mb-6">
            <VCardTitle class="d-flex align-center">
              <VIcon icon="tabler-map-pin" class="me-2 text-primary" />
              Location Details
            </VCardTitle>
            <VDivider />
            <VCardText>
              <VRow>
                <VCol cols="12" sm="4">
                  <div class="mb-4">
                    <div class="text-caption text-medium-emphasis mb-1">
                      State
                    </div>
                    <div class="text-body-1 font-weight-medium">
                      {{
                        installation.facility?.state?.name || "Not specified"
                      }}
                    </div>
                  </div>
                </VCol>

                <VCol cols="12" sm="4">
                  <div class="mb-4">
                    <div class="text-caption text-medium-emphasis mb-1">
                      LGA
                    </div>
                    <div class="text-body-1 font-weight-medium">
                      {{ installation.facility?.lga?.name || "Not specified" }}
                    </div>
                  </div>
                </VCol>

                <VCol cols="12" sm="4">
                  <div class="mb-4">
                    <div class="text-caption text-medium-emphasis mb-1">
                      Coordinates
                    </div>
                    <div class="text-body-1 font-weight-medium">
                      {{
                        installation.lat && installation.lng
                          ? `${installation.lat.toFixed(
                              4
                            )}, ${installation.lng.toFixed(4)}`
                          : "Not available"
                      }}
                    </div>
                  </div>
                </VCol>
              </VRow>

              <div
                v-if="!hasLocation"
                class="text-center text-medium-emphasis mt-4"
              >
                <VIcon icon="tabler-map-off" size="48" class="mb-2" />
                <div>Location coordinates not available</div>
              </div>
            </VCardText>
          </VCard>
        </VCol>
      </VRow>
      <VRow>
        <!-- Left Column - Installation Details -->
        <VCol cols="12" md="8">
          <!-- Equipment Details -->
          <VCol cols="12" class="pa-0">
            <VCard class="mb-6">
              <VCardTitle class="d-flex align-center">
                <VIcon icon="tabler-package" class="me-2 text-primary" />
                Equipment Details
              </VCardTitle>
              <VDivider />
              <VCardText>
                <VRow>
                  <!-- Equipment Images -->
                  <VCol cols="12" class="mb-1">
                    <div class="d-flex justify-center gap-2 flex-wrap">
                      <div class="text-center">
                        <VCard variant="outlined" class="equipment-card">
                          <VCardText>
                            <VImg
                              :src="`${backendPath}/images/360wpanel.png`"
                              :alt="'360W Panel'"
                              height="150"
                              width="200"
                              contain
                              class="mb-2"
                            />
                            <div class="text-body-1 font-weight-medium">
                              360W Panel
                            </div>
                            <VChip
                              :color="getEquipmentStatusColor('panel')"
                              size="small"
                              class="mt-1"
                            >
                              {{ getEquipmentStatus("panel") }}
                            </VChip>
                          </VCardText>
                        </VCard>
                      </div>
                      <div class="text-center">
                        <VCard variant="outlined" class="equipment-card">
                          <VCardText>
                            <VImg
                              :src="`${backendPath}/images/htd40.png`"
                              :alt="'HTD40'"
                              height="150"
                              width="200"
                              contain
                              class="mb-2"
                            />
                            <div class="text-body-1 font-weight-medium">
                              HTD40
                            </div>
                            <VChip
                              :color="getEquipmentStatusColor('htd40')"
                              size="small"
                              class="mt-1"
                            >
                              {{ getEquipmentStatus("htd40") }}
                            </VChip>
                          </VCardText>
                        </VCard>
                      </div>
                    </div>
                  </VCol>

                  <!-- Supplier & Product -->
                  <VCol cols="12" sm="6">
                    <div class="detail-field">
                      <div class="text-caption text-medium-emphasis">
                        Supplier
                      </div>
                      <div class="text-body-1">
                        {{ installation.supplier || "Not specified" }}
                      </div>
                    </div>
                  </VCol>

                  <VCol cols="12" sm="6">
                    <div class="detail-field">
                      <div class="text-caption text-medium-emphasis">
                        Product Model
                      </div>
                      <div class="text-body-1">
                        {{ installation.product_model || "Not specified" }}
                      </div>
                    </div>
                  </VCol>

                  <!-- Quantity Metrics -->
                  <VCol cols="12" sm="6">
                    <div class="detail-field">
                      <div class="text-caption text-medium-emphasis">
                        Quantity Received
                      </div>
                      <div class="text-body-1">
                        {{ installation.total_quantity_received || 0 }}
                      </div>
                    </div>
                  </VCol>

                  <VCol cols="12" sm="6">
                    <div class="detail-field">
                      <div class="text-caption text-medium-emphasis">
                        Quantity Delivered
                      </div>
                      <div class="text-body-1">
                        {{ installation.total_quantity_delivered || 0 }}
                      </div>
                    </div>
                  </VCol>

                  <VCol cols="12" sm="6">
                    <div class="detail-field">
                      <div class="text-caption text-medium-emphasis">
                        Quantity Installed
                      </div>
                      <div class="text-body-1">
                        {{ installation.total_quantity_installed || 0 }}
                      </div>
                    </div>
                  </VCol>

                  <!-- Location -->
                  <VCol cols="12" sm="6">
                    <div class="detail-field">
                      <div class="text-caption text-medium-emphasis">
                        Country
                      </div>
                      <div class="text-body-1">
                        {{ installation.country || "Not specified" }}
                      </div>
                    </div>
                  </VCol>

                  <VCol cols="12" sm="6">
                    <div class="detail-field">
                      <div class="text-caption text-medium-emphasis">
                        Province/State
                      </div>
                      <div class="text-body-1">
                        {{ installation.province || "Not specified" }}
                      </div>
                    </div>
                  </VCol>

                  <!-- Purchase Order -->
                  <VCol cols="12" sm="6">
                    <div class="detail-field">
                      <div class="text-caption text-medium-emphasis">
                        PO Number
                      </div>
                      <div class="text-body-1">
                        {{ installation.po_number || "Not specified" }}
                      </div>
                    </div>
                  </VCol>

                  <VCol cols="12" sm="6">
                    <div class="detail-field">
                      <div class="text-caption text-medium-emphasis">
                        PO Item Number
                      </div>
                      <div class="text-body-1">
                        {{ installation.po_item_number || "Not specified" }}
                      </div>
                    </div>
                  </VCol>

                  <!-- Service Contract -->
                  <VCol cols="12" sm="6">
                    <div class="detail-field">
                      <div class="text-caption text-medium-emphasis">
                        Service Contract Number
                      </div>
                      <div class="text-body-1">
                        {{
                          installation.service_contract_number ||
                          "Not specified"
                        }}
                      </div>
                    </div>
                  </VCol>
                </VRow>
              </VCardText>
            </VCard>
          </VCol>

          <!-- Location Map -->
          <VCol cols="12" v-if="hasLocation" class="pa-0">
            <VCard>
              <VCardTitle class="d-flex align-center">
                <VIcon icon="tabler-map-pin" class="me-2 text-primary" />
                Location
              </VCardTitle>
              <VDivider />
              <VCardText class="pa-0">
                <div id="map" class="installation-map"></div>
              </VCardText>
            </VCard>
          </VCol>

          <!-- Additional Information -->
          <VCol
            cols="12"
            v-if="installation.remarks || installation.supplier_comments"
          >
            <VCard>
              <VCardTitle class="d-flex align-center">
                <VIcon icon="tabler-note" class="me-2 text-primary" />
                Additional Information
              </VCardTitle>
              <VDivider />
              <VCardText>
                <VRow>
                  <VCol cols="12" v-if="installation.remarks">
                    <DetailItem label="Remarks" :value="installation.remarks" />
                  </VCol>
                  <VCol cols="12" v-if="installation.supplier_comments">
                    <DetailItem
                      label="Supplier Comments"
                      :value="installation.supplier_comments"
                    />
                  </VCol>
                  <VCol cols="12" v-if="installation.number_of_deviations > 0">
                    <DetailItem
                      label="Number of Deviations"
                      :value="installation.number_of_deviations"
                    />
                  </VCol>
                </VRow>
              </VCardText>
            </VCard>
          </VCol>
        </VCol>

        <!-- Right Column - Sidebar -->
        <VCol cols="12" md="4">
          <!-- LGA Officer Details -->
          <VCard class="mb-6">
            <VCardTitle class="d-flex align-center">
              <VIcon icon="tabler-user-check" class="me-2 text-primary" />
              LGA Officer Details
            </VCardTitle>
            <VDivider />
            <VCardText>
              <div class="text-center text-medium-emphasis">
                <VIcon icon="tabler-user-question" size="48" class="mb-2" />
                <div>LGA Officer information</div>
                <div class="text-caption mt-2">
                  Not available in current system
                </div>
                <VBtn
                  variant="tonal"
                  size="small"
                  class="mt-3"
                  @click="addLgaOfficer"
                >
                  <VIcon icon="tabler-plus" class="me-1" size="16" />
                  Add LGA Officer
                </VBtn>
              </div>
            </VCardText>
          </VCard>

          <!-- Health Officer -->
          <VCard class="mb-6">
            <VCardTitle class="d-flex align-center">
              <VIcon icon="tabler-user" class="me-2 text-primary" />
              State CCO
            </VCardTitle>
            <VDivider />
            <VCardText>
              <div v-if="installation.health_officer" class="text-center">
                <VAvatar size="64" color="primary" variant="tonal" class="mb-3">
                  <VIcon icon="tabler-user" size="32" />
                </VAvatar>
                <div class="text-h6 font-weight-medium">
                  {{ installation.health_officer.name }}
                </div>
                <div class="text-body-2 text-medium-emphasis mb-2">
                  {{ installation.health_officer.designation }}
                </div>
                <div
                  class="text-caption"
                  v-if="installation.health_officer.phone_number"
                >
                  <VIcon icon="tabler-phone" size="16" class="me-1" />
                  {{ installation.health_officer.phone_number }}
                </div>
                <div
                  class="text-caption"
                  v-if="installation.health_officer.email"
                >
                  <VIcon icon="tabler-mail" size="16" class="me-1" />
                  {{ installation.health_officer.email }}
                </div>
              </div>
              <div v-else class="text-center text-medium-emphasis">
                <VIcon icon="tabler-user-off" size="48" class="mb-2" />
                <div>No health officer assigned</div>
              </div>
            </VCardText>
          </VCard>

          <!-- Installation Timeline -->
          <VCard>
            <VCardTitle class="d-flex align-center">
              <VIcon icon="tabler-timeline" class="me-2 text-primary" />
              Timeline
            </VCardTitle>
            <VDivider />
            <VCardText>
              <div class="timeline">
                <div class="timeline-item">
                  <div class="timeline-dot success"></div>
                  <div class="timeline-content">
                    <div class="timeline-title">Created</div>
                    <div class="timeline-date">
                      {{ formatDate(installation.created_at) }}
                    </div>
                  </div>
                </div>
                <div class="timeline-item">
                  <div
                    class="timeline-dot"
                    :class="getStatusDotColor(installation.delivery_status)"
                  ></div>
                  <div class="timeline-content">
                    <div class="timeline-title">Delivery</div>
                    <div class="timeline-date">
                      {{ installation.delivery_status || "Not set" }}
                    </div>
                  </div>
                </div>
                <div class="timeline-item">
                  <div
                    class="timeline-dot"
                    :class="getStatusDotColor(installation.installation_status)"
                  ></div>
                  <div class="timeline-content">
                    <div class="timeline-title">Installation</div>
                    <div class="timeline-date">
                      {{ installation.installation_status || "Not set" }}
                    </div>
                  </div>
                </div>
                <div class="timeline-item">
                  <div
                    class="timeline-dot"
                    :class="
                      installation.verified_by_health_officer
                        ? 'success'
                        : 'warning'
                    "
                  ></div>
                  <div class="timeline-content">
                    <div class="timeline-title">Verification</div>
                    <div class="timeline-date">
                      {{
                        installation.verified_by_health_officer
                          ? "Verified"
                          : "Pending"
                      }}
                    </div>
                  </div>
                </div>
                <div
                  v-if="installation.updated_at !== installation.created_at"
                  class="timeline-item"
                >
                  <div class="timeline-dot info"></div>
                  <div class="timeline-content">
                    <div class="timeline-title">Last Updated</div>
                    <div class="timeline-date">
                      {{ formatDate(installation.updated_at) }}
                    </div>
                  </div>
                </div>
              </div>
            </VCardText>
          </VCard>
        </VCol>
      </VRow>
    </div>
  </VContainer>

  <!-- Checklist Display Dialog -->
  <InstallationChecklistDisplay
    v-model="showChecklistDisplay"
    :installation-id="installation?.id"
    :facility-name="installation?.facility?.name"
    @start-editing="handleStartEditing"
  />
</template>

<script setup>
import { ref, onMounted, computed, onUnmounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import installationService from "@/services/installationService";
import InstallationChecklistDialog from "@/components/dialogs/InstallationChecklistDialog.vue";

import InstallationChecklistDisplay from "@/components/InstallationChecklistDisplay.vue";
import InstallationChecklistEditor from "@/components/InstallationChecklistEditor.vue";

import VueEasyLightbox from "vue-easy-lightbox";

// Leaflet CSS (import in your main CSS file or here)
import "leaflet/dist/leaflet.css";

// Import Leaflet
let L = null;

const showChecklistDisplay = ref(false);
const showChecklistEditor = ref(false);
const checklistData = ref(null);
const draftData = ref(null);

const route = useRoute();
const router = useRouter();

const loading = ref(true);
const error = ref(null);
const installation = ref(null);
const map = ref(null);
const backendUrl = import.meta.env.VITE_BACKEND_URL;
const backendPath = import.meta.env.VITE_BACKEND_PATH;

// Props
const props = defineProps({
  installation: {
    type: Object,
    required: true,
  },
});

// Lightbox state
const visible = ref(false);
const lightboxIndex = ref(0);

// Dialog state
const showChecklist = ref(false);

// Your existing methods for media and issues
const handleMediaAdded = () => {
  console.log("Media added for installation:", installation.value?.id);
  // Refresh media or show success message
};

const handleMediaDeleted = (mediaId) => {
  console.log("Media deleted:", mediaId);
  // Show confirmation or refresh data
};

const handleMediaDownloaded = (mediaItem) => {
  console.log("Media downloaded:", mediaItem);
  // Track download or show confirmation
};

const handleIssueReported = () => {
  console.log("Issue reported for installation:", installation.value?.id);
  // Refresh issues or show success message
};

const handleIssueResolved = () => {
  console.log("Issue resolved");
  // Refresh issues data
};

// Handle checklist submission
const handleChecklistSubmit = (checklistData) => {
  console.log("Checklist submitted for installation:", props.installation.id);
  console.log("Checklist data:", checklistData);

  // Here you would typically make an API call to save the checklist data
  // Example:
  // await api.saveInstallationChecklist(props.installation.id, checklistData)

  // Show success message
  // showSnackbar('Installation checklist submitted successfully!', 'success')
};

// Active tab state
const activeTab = ref("facility");

// Methods
const showGallery = (index) => {
  lightboxIndex.value = index;
  visible.value = true;
};

const handleHide = () => {
  visible.value = false;
};

const downloadMedia = (item) => {
  console.log("Downloading:", item.title);
};

const deleteMedia = (id) => {
  const index = mediaItems.value.findIndex((item) => item.id === id);
  if (index !== -1) {
    mediaItems.value.splice(index, 1);
  }
};

// const formatDate = (dateString) => {
//   if (!dateString) return ''
//   return new Date(dateString).toLocaleDateString('en-US', {
//     year: 'numeric',
//     month: 'long',
//     day: 'numeric'
//   })
// }

const handleStartEditing = (data) => {
  checklistData.value = data.checklist;
  draftData.value = data.draftData;
  showChecklistDisplay.value = false;
  showChecklistEditor.value = true;
};

const handleChecklistSubmitted = (submissionData) => {
  console.log("Checklist submitted:", submissionData);
  // Refresh installation data or show success message
};

// Status options
const deliveryStatuses = ref([
  "not delivered",
  "in transit",
  "delivered",
  "partially delivered",
]);
const installationStatuses = ref([
  "not installed",
  "in progress",
  "installed",
  "partially installed",
]);

// Compute if installation has location data
const hasLocation = computed(() => {
  return installation.value?.lat && installation.value?.lng;
});

// Status color mapping
const getStatusColor = (status) => {
  const statusMap = {
    "not delivered": "error",
    "in transit": "warning",
    delivered: "success",
    "partially delivered": "info",
    "not installed": "error",
    "in progress": "warning",
    installed: "success",
    "partially installed": "info",
  };
  return statusMap[status] || "secondary";
};

const getStatusDotColor = (status) => {
  const statusMap = {
    "not delivered": "error",
    "in transit": "warning",
    delivered: "success",
    "partially delivered": "info",
    "not installed": "error",
    "in progress": "warning",
    installed: "success",
    "partially installed": "info",
  };
  return statusMap[status] || "";
};

// Equipment status based on delivery and installation status
const getEquipmentStatus = (equipmentType) => {
  if (installation.value.installation_status === "installed") {
    return "Installed";
  } else if (installation.value.delivery_status === "delivered") {
    return "Delivered";
  } else {
    return "Pending";
  }
};

const getEquipmentStatusColor = (equipmentType) => {
  const status = getEquipmentStatus(equipmentType);
  const statusMap = {
    Installed: "success",
    Delivered: "info",
    Pending: "warning",
  };
  return statusMap[status] || "secondary";
};

// Mock location data for demonstration
const getLocationData = (installationData) => {
const stateCoordinates = {
    Abia: { lat: 5.532, lng: 7.486 },
    Adamawa: { lat: 9.3265, lng: 12.3984 },
    AkwaIbom: { lat: 4.9057, lng: 7.8537 },
    Anambra: { lat: 6.2209, lng: 7.0728 },
    Bauchi: { lat: 10.3103, lng: 9.8439 },
    Bayelsa: { lat: 4.7719, lng: 6.0699 },
    Benue: { lat: 7.7327, lng: 8.5214 },
    Borno: { lat: 11.8333, lng: 13.1500 },
    CrossRiver: { lat: 5.8702, lng: 8.5988 },
    Delta: { lat: 5.532, lng: 5.8987 },
    Ebonyi: { lat: 6.2649, lng: 8.0137 },
    Edo: { lat: 6.6342, lng: 5.9304 },
    Ekiti: { lat: 7.6667, lng: 5.2500 },
    Enugu: { lat: 6.4584, lng: 7.5464 },
    Gombe: { lat: 10.2897, lng: 11.1673 },
    Imo: { lat: 5.5720, lng: 7.0588 },
    Jigawa: { lat: 12.2280, lng: 9.5616 },
    Kaduna: { lat: 10.5105, lng: 7.4165 },
    Kano: { lat: 12.0022, lng: 8.5919 },
    Katsina: { lat: 12.9855, lng: 7.6172 },
    Kebbi: { lat: 12.4500, lng: 4.1995 },
    Kogi: { lat: 7.8000, lng: 6.7333 },
    Kwara: { lat: 8.5000, lng: 4.5500 },
    Lagos: { lat: 6.5244, lng: 3.3792 },
    Nasarawa: { lat: 8.4991, lng: 8.1997 },
    Niger: { lat: 9.6000, lng: 6.5500 },
    Ogun: { lat: 6.9980, lng: 3.4737 },
    Ondo: { lat: 7.2500, lng: 5.1950 },
    Osun: { lat: 7.5629, lng: 4.5200 },
    Oyo: { lat: 7.3775, lng: 3.9470 },
    Plateau: { lat: 9.9285, lng: 8.8921 },
    Rivers: { lat: 4.8156, lng: 7.0498 },
    Sokoto: { lat: 13.0667, lng: 5.2333 },
    Taraba: { lat: 8.9167, lng: 11.3667 },
    Yobe: { lat: 12.0000, lng: 11.5000 },
    Zamfara: { lat: 12.1700, lng: 6.6600 },
    FCT: { lat: 9.0579, lng: 7.4951 } // Federal Capital Territory
};

  const stateName = installationData.facility?.state?.name;
  if (stateName && stateCoordinates[stateName]) {
    return {
      ...installationData,
      lat: stateCoordinates[stateName].lat,
      lng: stateCoordinates[stateName].lng,
    };
  }

  return installationData;
};

const fetchInstallation = async () => {
  loading.value = true;
  error.value = null;
  try {
    const response = await installationService.getInstallation(route.params.id);
    if (response.success) {
      installation.value = getLocationData(response.data);

      if (hasLocation.value) {
        await initializeMap();
      }
    } else {
      error.value = "Installation not found";
    }
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
};

const initializeMap = async () => {
  if (typeof window !== "undefined") {
    L = await import("leaflet");

    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
      iconUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
      shadowUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
    });

    if (hasLocation.value) {
      setTimeout(() => {
        map.value = L.map("map").setView(
          [installation.value.lat, installation.value.lng],
          13
        );

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "© OpenStreetMap contributors",
          maxZoom: 18,
        }).addTo(map.value);

        L.marker([installation.value.lat, installation.value.lng])
          .addTo(map.value)
          .bindPopup(
            `
            <div class="map-popup">
              <h4><strong>${installation.value.facility?.name}</strong></h4>
              <p><strong>Product:</strong> ${
                installation.value.product_model
              }</p>
              <p><strong>Supplier:</strong> ${installation.value.supplier}</p>
              <p><strong>Address:</strong> ${
                installation.value.facility?.address
              }</p>
              <p><strong>Status:</strong> ${
                installation.value.verified_by_health_officer
                  ? "Verified"
                  : "Pending"
              }</p>
            </div>
          `
          )
          .openPopup();

        map.value.fitBounds(
          [[installation.value.lat, installation.value.lng]],
          { padding: [20, 20] }
        );
      }, 100);
    }
  }
};

const updateDeliveryStatus = async (status) => {
  if (!installation.value) return;

  try {
    // You'll need to add this method to your installationService
    await installationService.updateDeliveryStatus(
      installation.value.id,
      status
    );
    installation.value.delivery_status = status;
  } catch (err) {
    console.error("Error updating delivery status:", err);
  }
};

const updateInstallationStatus = async (status) => {
  if (!installation.value) return;

  try {
    // You'll need to add this method to your installationService
    await installationService.updateInstallationStatus(
      installation.value.id,
      status
    );
    installation.value.installation_status = status;
  } catch (err) {
    console.error("Error updating installation status:", err);
  }
};

const toggleVerification = async () => {
  if (!installation.value) return;

  try {
    const newStatus = !installation.value.verified_by_health_officer;
    await installationService.updateVerification(
      installation.value.id,
      newStatus
    );
    installation.value.verified_by_health_officer = newStatus;
  } catch (err) {
    console.error("Error updating verification:", err);
  }
};

const addLgaOfficer = () => {
  console.log("Add LGA Officer for installation:", installation.value.id);
};

const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

onUnmounted(() => {
  if (map.value) {
    map.value.remove();
  }
});

onMounted(() => {
  fetchInstallation();
});
</script>

<style scoped>
.installation-map {
  height: 400px;
  width: 100%;
  border-radius: 0 0 4px 4px;
}

.timeline {
  position: relative;
}

.timeline-item {
  display: flex;
  align-items: flex-start;
  margin-bottom: 16px;
}

.timeline-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: #e0e0e0;
  margin-right: 12px;
  margin-top: 4px;
  flex-shrink: 0;
}

.timeline-dot.success {
  background-color: #4caf50;
}

.timeline-dot.warning {
  background-color: #ff9800;
}

.timeline-dot.info {
  background-color: #2196f3;
}

.timeline-dot.error {
  background-color: #f44336;
}

.timeline-content {
  flex: 1;
}

.timeline-title {
  font-weight: 500;
  margin-bottom: 2px;
}

.timeline-date {
  font-size: 0.875rem;
  color: rgba(var(--v-theme-on-surface), var(--v-medium-emphasis-opacity));
}

.equipment-card {
  min-width: 140px;
  transition: all 0.3s ease;
}

.equipment-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

/* Map popup styling */
:deep(.map-popup) {
  font-family: inherit;
}

:deep(.map-popup h4) {
  margin: 0 0 8px 0;
  color: #1976d2;
}

:deep(.map-popup p) {
  margin: 4px 0;
  font-size: 0.875rem;
}

:deep(.map-popup strong) {
  color: #424242;
}

.media-card {
  transition: transform 0.2s ease-in-out;
}

.media-card:hover {
  transform: translateY(-4px);
}
</style>
