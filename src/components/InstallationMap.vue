<script setup>
import { ref, computed, onMounted, watch, nextTick, onUnmounted } from 'vue'
import InstallationService from '@/services/installationService'

const props = defineProps({
  installations: {
    type: Array,
    default: () => []
  }
})

const svgContent = ref('')
const loading = ref(true)
const hoveredState = ref(null)
const tooltipStyle = ref({})

// Zoom and pan
const scale = ref(1)
const translateX = ref(0)
const translateY = ref(0)
const isDragging = ref(false)
const lastMouseX = ref(0)
const lastMouseY = ref(0)

// Mobile detection and responsive adjustments
const isMobile = ref(false)
const containerWidth = ref(0)
const containerHeight = ref(0)

// Drawer/modal data
const selectedState = ref(null)
const selectedStateInstallations = ref([])
const loadingStateData = ref(false)

// --- Responsive adjustments ---
const checkMobile = () => {
  isMobile.value = window.innerWidth < 768
  // Adjust initial scale for mobile
  if (isMobile.value) {
    scale.value = 0.8
    translateX.value = 50 // Center offset for mobile
  } else {
    scale.value = 1
    translateX.value = 0
    translateY.value = 0
  }
}

const updateContainerSize = () => {
  const container = document.querySelector('.map-container')
  if (container) {
    containerWidth.value = container.clientWidth
    containerHeight.value = container.clientHeight
    centerMap()
  }
}

const centerMap = () => {
  if (isMobile.value) {
    // For mobile, center the map with appropriate offset
    translateX.value = containerWidth.value * 0.1
    translateY.value = containerHeight.value * 0.1
  } else {
    translateX.value = 0
    translateY.value = 0
  }
}

// --- Compute installation summaries per state ---
const stateSummaries = computed(() => {
  const summaries = {}
  
  props.installations.forEach(state => {
    const stateName = state.name
    if (!stateName) return
    
    const installationDetails = state.installation_details || {}
    
    const totalInstallations = installationDetails.total_supposed_installations || 0
    const delivered = installationDetails.total_delivered || 0
    const installed = installationDetails.total_installed || 0
    
    // Calculate individual rates
    const deliveryRate = totalInstallations > 0 ? (delivered / totalInstallations) * 100 : 0
    const installationRate = totalInstallations > 0 ? (installed / totalInstallations) * 100 : 0
    
    // Determine status category
    let status = 'no-data'
    if (totalInstallations > 0) {
      if (delivered === totalInstallations && installed === totalInstallations) {
        status = 'fully-completed'
      } else if (delivered > 0 && installed > 0) {
        status = 'partial-progress'
      } else if (delivered === totalInstallations && installed === 0) {
        status = 'delivered-not-installed'
      } else if (delivered === 0 && installed === 0) {
        status = 'no-progress'
      }
    }
    
    summaries[stateName] = {
      name: stateName,
      totalInstallations,
      delivered,
      installed,
      delivery_rate: Math.round(deliveryRate),
      installation_rate: Math.round(installationRate),
      status
    }
  })
  
  return summaries
})

// --- Color logic ---
const getStateColor = (stateName) => {
  const summary = stateSummaries.value[stateName]
  if (!summary) return '#e0e0e0'
  
  switch (summary.status) {
    case 'fully-completed':
      return '#4caf50' // Green - 100% delivered & installed
    case 'delivered-not-installed':
      return '#2196f3' // Blue - 100% delivered, partially installed
    case 'partial-progress':
      return '#ff9800' // Orange - partially delivered & installed
    case 'no-progress':
      return '#f44336' // Red - no progress
    default:
      return '#e0e0e0' // Gray - no data
  }
}

// --- Hover handling ---
const handleStateHover = (event) => {
  if (event.target.classList.contains('state-path')) {
    const stateName = event.target.getAttribute('data-state')
    updateTooltip(stateName, event)
  }
}

const handleMouseMove = (event) => {
  if (hoveredState.value) {
    tooltipStyle.value = {
      left: `${event.clientX + 10}px`,
      top: `${event.clientY + 10}px`
    }
  }
}

const handleMouseLeave = () => (hoveredState.value = null)

const updateTooltip = (stateName, event) => {
  const summary = stateSummaries.value[stateName]
  hoveredState.value = summary || { 
    name: stateName, 
    totalInstallations: 0, 
    delivered: 0, 
    installed: 0,
    delivery_rate: 0,
    installation_rate: 0,
    status: 'no-data'
  }
  tooltipStyle.value = { 
    left: `${event.clientX + 10}px`, 
    top: `${event.clientY + 10}px` 
  }
}

// --- Click handling ---
const handleStateClick = async (event) => {
  const target = event.target
  if (!target.classList.contains('state-path')) return
  
  const stateName = target.getAttribute('data-state')
  selectedState.value = stateName
  selectedStateInstallations.value = []
  loadingStateData.value = true
  
  try {
    // Find the state from installations to get the ID
    const state = props.installations.find(s => s.name === stateName)
    if (state?.id) {
      const response = await InstallationService.getByState(state.id)
      selectedStateInstallations.value = response.data || response

      console.log('Loaded installations for', stateName, selectedStateInstallations.value)

    } else {
      console.warn('No state ID found for', stateName)
    }
  } catch (error) {
    console.error('Error loading state installations:', error.message)
  } finally {
    loadingStateData.value = false
  }
}

// --- SVG modification ---
const normalizeStateName = (name) => {
  if (!name) return ''
  return name
    .replace(/\b\w/g, c => c.toUpperCase())
    .trim()
}

const modifySVG = (svgText) => {
  const parser = new DOMParser()
  const doc = parser.parseFromString(svgText, 'image/svg+xml')
  const svgElement = doc.documentElement

  const style = doc.createElement('style')
  style.textContent = `
    .state-path { transition: all 0.3s ease; cursor: pointer; stroke: #fff; stroke-width: 1; }
    .state-path:hover { stroke-width: 2; filter: brightness(1.2); }
  `
  svgElement.appendChild(style)

  const paths = svgElement.querySelectorAll('path')
  paths.forEach(path => {
    // Use title instead of id/name
    let title = path.getAttribute('title')
    if (!title && path.querySelector('title')) {
      title = path.querySelector('title').textContent
    }
    const stateName = normalizeStateName(title)
    if (stateName) {
      path.classList.add('state-path')
      path.setAttribute('data-state', stateName)
      path.setAttribute('fill', getStateColor(stateName))
    }
  })
  return new XMLSerializer().serializeToString(svgElement)
}

const updateStateColors = () => {
  if (!svgContent.value) return
  const parser = new DOMParser()
  const doc = parser.parseFromString(svgContent.value, 'image/svg+xml')
  doc.querySelectorAll('.state-path').forEach(path => {
    const stateName = path.getAttribute('data-state')
    if (stateName) path.setAttribute('fill', getStateColor(stateName))
  })
  svgContent.value = new XMLSerializer().serializeToString(doc)
}

const loadSVG = async () => {
  try {
    const svgModule = await import('@/assets/images/nigeria.svg?raw')
    let svgText = svgModule.default
    svgText = modifySVG(svgText)
    svgContent.value = svgText
    // After SVG loads, update container size and center
    nextTick(() => {
      updateContainerSize()
      centerMap()
    })
  } catch (err) {
    console.error('Error loading SVG:', err)
    svgContent.value = '<div>Error loading map</div>'
  } finally {
    loading.value = false
  }
}

// --- Zoom and Pan ---
const startDrag = (e) => { 
  isDragging.value = true; 
  lastMouseX.value = e.clientX; 
  lastMouseY.value = e.clientY 
}

const doDrag = (e) => { 
  if (isDragging.value) { 
    translateX.value += e.clientX - lastMouseX.value; 
    translateY.value += e.clientY - lastMouseY.value; 
    lastMouseX.value = e.clientX; 
    lastMouseY.value = e.clientY 
  } 
}

const stopDrag = () => (isDragging.value = false)

const zoomIn = () => {
  scale.value = Math.min(scale.value * 1.2, isMobile.value ? 3 : 5)
}

const zoomOut = () => {
  scale.value = Math.max(scale.value / 1.2, isMobile.value ? 0.5 : 0.5)
}

const resetZoom = () => { 
  scale.value = isMobile.value ? 0.8 : 1
  centerMap()
}

const handleWheel = (e) => {
  e.preventDefault()
  const delta = -Math.sign(e.deltaY) * 0.1
  const newScale = Math.max(
    isMobile.value ? 0.5 : 0.5, 
    Math.min(isMobile.value ? 3 : 5, scale.value + delta)
  )
  const rect = e.currentTarget.getBoundingClientRect()
  const mouseX = e.clientX - rect.left
  const mouseY = e.clientY - rect.top
  const worldMouseX = (mouseX - translateX.value) / scale.value
  const worldMouseY = (mouseY - translateY.value) / scale.value
  scale.value = newScale
  translateX.value = mouseX - worldMouseX * scale.value
  translateY.value = mouseY - worldMouseY * scale.value
}

// --- Total counts for each category ---
const categoryCounts = computed(() => {
  const counts = {
    'fully-completed': 0,
    'delivered-not-installed': 0,
    'partial-progress': 0,
    'no-progress': 0,
    'no-data': 0
  }
  
  Object.values(stateSummaries.value).forEach(summary => {
    counts[summary.status]++
  })
  
  return counts
})

// --- Responsive event listeners ---
const handleResize = () => {
  checkMobile()
  updateContainerSize()
  centerMap()
}

watch(() => props.installations, () => nextTick(() => updateStateColors()), { deep: true })

onMounted(() => {
  checkMobile()
  loadSVG()
  window.addEventListener('resize', handleResize)
  // Update container size after a short delay to ensure DOM is ready
  setTimeout(updateContainerSize, 100)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<template>
  <div class="installation-map">
    <div class="map-header">
      <div class="header-content">
        <h3 class="map-title">Installations by State</h3>
        <p class="map-subtitle">Hover or click a state for details</p>
      </div>

      <div class="zoom-controls">
        <button @click="zoomOut" class="zoom-btn" title="Zoom Out">
          <VIcon icon="tabler-zoom-out" size="16" />
        </button>
        <button @click="resetZoom" class="zoom-btn reset-btn" title="Reset Zoom">
          {{ Math.round(scale * 100) }}%
        </button>
        <button @click="zoomIn" class="zoom-btn" title="Zoom In">
          <VIcon icon="tabler-zoom-in" size="16" />
        </button>
      </div>
    </div>

    <div class="map-container"
      @mousedown="startDrag" 
      @mousemove="doDrag" 
      @mouseup="stopDrag" 
      @mouseleave="stopDrag"
      @wheel="handleWheel">
      
      <div v-if="loading" class="loading-state">
        <VIcon icon="tabler-map" size="48" class="mb-2" />
        <div>Loading map...</div>
      </div>

      <div v-else class="svg-container"
        :style="{ 
          transform: `translate(${translateX}px, ${translateY}px) scale(${scale})`, 
          transformOrigin: '0 0' 
        }"
        v-html="svgContent"
        @mouseover="handleStateHover"
        @mousemove="handleMouseMove"
        @mouseleave="handleMouseLeave"
        @click="handleStateClick" />
    </div>

    <!-- Simplified Legend with Counts -->
    <div class="status-legend">
      <div class="legend-header">
        <div class="legend-title">Installation Status</div>
        <div class="total-counts">Total States: {{ Object.keys(stateSummaries).length }}</div>
      </div>
      <div class="legend-items">
        <div class="legend-item">
          <div class="legend-color completed"></div>
          <div class="legend-text">
            <span class="legend-label">Fully Completed</span>
            <span class="legend-count">({{ categoryCounts['fully-completed'] }})</span>
          </div>
        </div>
        <div class="legend-item">
          <div class="legend-color delivered"></div>
          <div class="legend-text">
            <span class="legend-label">Delivered, Not Installed</span>
            <span class="legend-count">({{ categoryCounts['delivered-not-installed'] }})</span>
          </div>
        </div>
        <div class="legend-item">
          <div class="legend-color partial"></div>
          <div class="legend-text">
            <span class="legend-label">Partial Progress</span>
            <span class="legend-count">({{ categoryCounts['partial-progress'] }})</span>
          </div>
        </div>
        <div class="legend-item">
          <div class="legend-color no-progress"></div>
          <div class="legend-text">
            <span class="legend-label">No Progress</span>
            <span class="legend-count">({{ categoryCounts['no-progress'] }})</span>
          </div>
        </div>
        <div class="legend-item">
          <div class="legend-color no-data"></div>
          <div class="legend-text">
            <span class="legend-label">No Data</span>
            <span class="legend-count">({{ categoryCounts['no-data'] }})</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Tooltip -->
    <div v-if="hoveredState" class="state-tooltip" :style="tooltipStyle">
      <strong>{{ hoveredState.name }}</strong>
      <div v-if="hoveredState.totalInstallations > 0">
        <div class="tooltip-stats">
          <div class="stat-row">
            <span class="stat-label">Planned:</span>
            <span class="stat-value">{{ hoveredState.totalInstallations }}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">Delivered:</span>
            <span class="stat-value">{{ hoveredState.delivered }} ({{ hoveredState.delivery_rate }}%)</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">Installed:</span>
            <span class="stat-value">{{ hoveredState.installed }} ({{ hoveredState.installation_rate }}%)</span>
          </div>
        </div>
      </div>
      <div v-else class="no-data">No installation data</div>
    </div>

    <!-- Modal -->
    <VDialog v-model="selectedState" :max-width="isMobile ? '95%' : '700px'">
      <VCard>
        <VCardTitle class="dialog-header">
          <VIcon icon="tabler-map-pin" class="mr-2" />
          <span class="dialog-title">Installations in {{ selectedState }}</span>
        </VCardTitle>
        <VCardText class="dialog-content">
          <div v-if="loadingStateData" class="text-center py-4">
            <VProgressCircular indeterminate color="primary" />
            <div class="mt-2">Loading installations...</div>
          </div>
          <div v-else-if="selectedStateInstallations.length === 0" class="text-center text-gray-500 py-4">
            <VIcon icon="tabler-info-circle" size="48" class="mb-2" />
            <div>No installations found for this state.</div>
          </div>
          <div v-else>
            <VList lines="two" class="installation-list">
              <VListItem
                v-for="install in selectedStateInstallations.installations.data"
                :key="install.id"
                class="installation-item"
              >
            
                <VListItemTitle class="facility-name">
                  <strong>{{ install.facility?.name || 'Unknown Facility' }}</strong>
                </VListItemTitle>
                <VListItemSubtitle class="status-chips">
                  <VChip 
                    :color="install.delivery_status === 'delivered' ? 'success' : 'warning'"
                    size="small"
                    class="status-chip"
                  >
                    {{ install.delivery_status || 'Not Delivered' }}
                  </VChip>
                  <VChip 
                    :color="install.installation_status === 'installed' ? 'success' : 'warning'"
                    size="small"
                    class="status-chip"
                  >
                    {{ install.installation_status || 'Not Installed' }}
                  </VChip>
                </VListItemSubtitle>
              </VListItem>
            </VList>
          </div>
        </VCardText>
        <VCardActions class="dialog-actions">
          <VSpacer />
          <VBtn color="primary" @click="selectedState = null" class="close-btn">Close</VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
  </div>
</template>

<style scoped>
.installation-map { 
  position: relative; 
  background: white; 
  border-radius: 8px; 
  padding: 16px; 
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  width: 100%;
}

.map-header { 
  display: flex; 
  justify-content: space-between; 
  align-items: flex-start; 
  margin-bottom: 16px; 
  flex-wrap: wrap; 
  gap: 12px; 
}

.header-content {
  flex: 1;
  min-width: 200px;
}

.map-title { 
  font-size: 1.25rem; 
  font-weight: 600; 
  color: #333; 
  margin: 0;
  line-height: 1.2;
}

.map-subtitle { 
  color: #666; 
  font-size: 0.875rem; 
  margin: 4px 0 0 0;
}

.zoom-controls { 
  display: flex; 
  gap: 4px; 
  flex-shrink: 0;
}

.zoom-btn { 
  border: 1px solid #e0e0e0; 
  border-radius: 4px; 
  padding: 8px 12px; 
  background: #fff; 
  cursor: pointer; 
  transition: all 0.2s ease;
  min-width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.zoom-btn:hover {
  background: #f5f5f5;
  border-color: #ccc;
}

.reset-btn {
  min-width: 60px;
}

.map-container { 
  position: relative; 
  width: 100%; 
  height: 100vh; 
  min-height: 400px;
  max-height: 600px;
  overflow: hidden; 
  border: 1px solid #e0e0e0; 
  background: #fafafa; 
  display: flex; 
  align-items: center; 
  justify-content: center; 
  border-radius: 6px;
  touch-action: none;
}

.svg-container { 
  width: 100%; 
  height: 100%; 
  transition: transform 0.1s ease; 
  user-select: none;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #666;
  text-align: center;
}

.status-legend { 
  margin-top: 16px; 
  background: #f8f9fa; 
  padding: 16px; 
  border-radius: 6px; 
  border: 1px solid #e9ecef; 
}

.legend-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  flex-wrap: wrap;
  gap: 8px;
}

.legend-title { 
  font-weight: 600; 
  color: #333;
  font-size: 1rem;
}

.total-counts {
  font-size: 0.875rem;
  color: #666;
  font-weight: 500;
}

.legend-items { 
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
}

.legend-item { 
  display: flex; 
  align-items: center; 
  gap: 12px; 
}

.legend-color { 
  width: 20px; 
  height: 20px; 
  border-radius: 4px; 
  border: 1px solid #ddd;
  flex-shrink: 0;
}

.legend-color.completed { background: #4caf50; }
.legend-color.delivered { background: #2196f3; }
.legend-color.partial { background: #ff9800; }
.legend-color.no-progress { background: #f44336; }
.legend-color.no-data { background: #e0e0e0; }

.legend-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.legend-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #333;
  line-height: 1.2;
  word-wrap: break-word;
}

.legend-count {
  font-size: 0.75rem;
  color: #666;
  font-weight: 600;
}

.state-tooltip { 
  position: fixed; 
  background: white; 
  border: 1px solid #e0e0e0; 
  border-radius: 6px; 
  padding: 12px; 
  box-shadow: 0 2px 8px rgba(0,0,0,0.15); 
  z-index: 1000; 
  font-size: 0.875rem; 
  max-width: 220px;
  pointer-events: none;
}

.tooltip-stats {
  margin-top: 8px;
}

.stat-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.stat-label {
  color: #666;
  font-weight: 500;
}

.stat-value {
  font-weight: 600;
  color: #333;
}

.no-data {
  color: #666;
  font-style: italic;
  margin-top: 8px;
}

/* Mobile-specific styles */
@media (max-width: 767px) {
  .installation-map {
    padding: 12px;
  }
  
  .map-header {
    flex-direction: column;
    gap: 16px;
  }
  
  .header-content {
    text-align: center;
  }
  
  .zoom-controls {
    align-self: center;
  }
  
  .zoom-btn {
    padding: 10px 14px;
    min-width: 50px;
    height: 50px;
  }
  
  .reset-btn {
    min-width: 70px;
  }
  
  .map-container {
    height: 100vh;
    min-height: 400px;
  }
  
  .legend-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
  
  .legend-items {
    grid-template-columns: 1fr;
    gap: 10px;
  }
  
  .legend-item {
    gap: 10px;
  }
  
  .legend-label {
    font-size: 0.8rem;
  }
  
  .state-tooltip {
    max-width: 180px;
    font-size: 0.8rem;
    padding: 10px;
  }
}

/* Dialog mobile styles */
.dialog-header {
  padding: 16px;
}

.dialog-title {
  font-size: 1.1rem;
}

.dialog-content {
  padding: 16px;
  max-height: 60vh;
  overflow-y: auto;
}

.installation-list {
  width: 100%;
}

.installation-item {
  padding: 12px 0;
}

.facility-name {
  font-size: 0.9rem;
  margin-bottom: 8px;
}

.status-chips {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.status-chip {
  margin: 2px 0;
}

.dialog-actions {
  padding: 16px;
}

.close-btn {
  min-width: 80px;
}

@media (max-width: 767px) {
  .dialog-header {
    padding: 12px;
  }
  
  .dialog-content {
    padding: 12px;
  }
  
  .installation-item {
    padding: 8px 0;
  }
  
  .facility-name {
    font-size: 0.85rem;
  }
  
  .status-chips {
    gap: 6px;
  }
  
  .dialog-actions {
    padding: 12px;
  }
}

/* Touch device improvements */
@media (hover: none) and (pointer: coarse) {
  .state-path:hover {
    stroke-width: 1;
    filter: none;
  }
  
  .zoom-btn:hover {
    background: #fff;
    border-color: #e0e0e0;
  }
}
</style>
