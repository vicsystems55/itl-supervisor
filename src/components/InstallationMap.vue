<script setup>
import { ref, computed, onMounted } from 'vue'

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

// Zoom and pan variables
const scale = ref(1)
const translateX = ref(0)
const translateY = ref(0)
const isDragging = ref(false)
const lastMouseX = ref(0)
const lastMouseY = ref(0)
const lastTouchDistance = ref(0)

// Process installations data to get state summaries
const stateSummaries = computed(() => {
  const summaries = {}
  
  props.installations.forEach(installation => {
    const stateName = installation.facility?.state?.name
    if (!stateName) return
    
    if (!summaries[stateName]) {
      summaries[stateName] = {
        totalInstallations: 0,
        delivered: 0,
        installed: 0,
        lgas: new Set(),
        pendingDelivery: 0,
        pendingInstallation: 0,
        facilities: new Set()
      }
    }
    
    const summary = summaries[stateName]
    summary.totalInstallations++
    
    // Count LGAs
    if (installation.facility?.lga?.name) {
      summary.lgas.add(installation.facility.lga.name)
    }
    
    // Count facilities
    if (installation.facility?.name) {
      summary.facilities.add(installation.facility.name)
    }
    
    // Track delivery status
    if (installation.delivery_status === 'delivered') {
      summary.delivered++
    } else {
      summary.pendingDelivery++
    }
    
    // Track installation status
    if (installation.installation_status === 'installed') {
      summary.installed++
    } else {
      summary.pendingInstallation++
    }
  })
  
  // Convert Sets to counts and add state names
  const result = {}
  Object.keys(summaries).forEach(stateName => {
    const summary = summaries[stateName]
    result[stateName] = {
      name: stateName,
      totalInstallations: summary.totalInstallations,
      delivered: summary.delivered,
      installed: summary.installed,
      lgaCount: summary.lgas.size,
      facilityCount: summary.facilities.size,
      pendingDelivery: summary.pendingDelivery,
      pendingInstallation: summary.pendingInstallation,
      completionRate: summary.totalInstallations > 0 
        ? Math.round((summary.delivered / summary.totalInstallations) * 100) 
        : 0
    }
  })
  
  return result
})

// Get state color based on overall status
const getStateColor = (stateName) => {
  const summary = stateSummaries.value[stateName]
  if (!summary || summary.totalInstallations === 0) return '#e0e0e0' // No data - gray
  
  const { delivered, installed, totalInstallations } = summary
  
  if (delivered === totalInstallations && installed === totalInstallations) {
    return '#4caf50' // All delivered and installed - green
  } else if (delivered === totalInstallations) {
    return '#2196f3' // All delivered but not all installed - blue
  } else if (delivered > 0) {
    return '#ff9800' // Some delivered - orange
  } else {
    return '#f44336' // None delivered - red
  }
}

// Get state status text for tooltip
const getStateStatus = (stateName) => {
  const summary = stateSummaries.value[stateName]
  if (!summary || summary.totalInstallations === 0) return 'No installations'
  
  const { delivered, installed, totalInstallations } = summary
  
  if (delivered === totalInstallations && installed === totalInstallations) {
    return 'All Complete'
  } else if (delivered === totalInstallations) {
    return 'All Delivered'
  } else if (delivered > 0) {
    return 'Partial Delivery'
  } else {
    return 'Not Started'
  }
}

// Handle state hover for tooltip
const handleStateHover = (event) => {
  if (event.target.classList.contains('state-path')) {
    const stateName = event.target.getAttribute('data-state')
    const summary = stateSummaries.value[stateName]
    
    if (summary) {
      hoveredState.value = summary
      
      // Position tooltip near cursor
      tooltipStyle.value = {
        left: `${event.clientX + 10}px`,
        top: `${event.clientY + 10}px`
      }
    }
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

const handleMouseLeave = () => {
  hoveredState.value = null
}

// Zoom and Pan Functions
const startDrag = (event) => {
  isDragging.value = true
  lastMouseX.value = event.clientX
  lastMouseY.value = event.clientY
  event.preventDefault()
}

const doDrag = (event) => {
  if (!isDragging.value) return
  
  const deltaX = event.clientX - lastMouseX.value
  const deltaY = event.clientY - lastMouseY.value
  
  translateX.value += deltaX
  translateY.value += deltaY
  
  lastMouseX.value = event.clientX
  lastMouseY.value = event.clientY
}

const stopDrag = () => {
  isDragging.value = false
}

const zoomIn = () => {
  scale.value = Math.min(scale.value * 1.2, 5) // Max zoom 5x
}

const zoomOut = () => {
  scale.value = Math.max(scale.value / 1.2, 0.5) // Min zoom 0.5x
}

const resetZoom = () => {
  scale.value = 1
  translateX.value = 0
  translateY.value = 0
}

// Mouse wheel zoom
const handleWheel = (event) => {
  event.preventDefault()
  const delta = -Math.sign(event.deltaY) * 0.1
  const newScale = Math.max(0.5, Math.min(5, scale.value + delta))
  
  // Zoom towards mouse position
  const rect = event.currentTarget.getBoundingClientRect()
  const mouseX = event.clientX - rect.left
  const mouseY = event.clientY - rect.top
  
  // Calculate the mouse position in the scaled coordinate system
  const worldMouseX = (mouseX - translateX.value) / scale.value
  const worldMouseY = (mouseY - translateY.value) / scale.value
  
  scale.value = newScale
  
  // Adjust translation to zoom towards mouse position
  translateX.value = mouseX - worldMouseX * scale.value
  translateY.value = mouseY - worldMouseY * scale.value
}

// Touch events for pinch zoom
const handleTouchStart = (event) => {
  if (event.touches.length === 2) {
    // Store the initial distance between two touches
    lastTouchDistance.value = getTouchDistance(event.touches)
    event.preventDefault()
  } else if (event.touches.length === 1) {
    // Start panning
    isDragging.value = true
    lastMouseX.value = event.touches[0].clientX
    lastMouseY.value = event.touches[0].clientY
  }
}

const handleTouchMove = (event) => {
  if (event.touches.length === 2) {
    // Pinch zoom
    const touchDistance = getTouchDistance(event.touches)
    const scaleChange = touchDistance / lastTouchDistance.value
    
    scale.value = Math.max(0.5, Math.min(5, scale.value * scaleChange))
    lastTouchDistance.value = touchDistance
    event.preventDefault()
  } else if (event.touches.length === 1 && isDragging.value) {
    // Panning
    const deltaX = event.touches[0].clientX - lastMouseX.value
    const deltaY = event.touches[0].clientY - lastMouseY.value
    
    translateX.value += deltaX
    translateY.value += deltaY
    
    lastMouseX.value = event.touches[0].clientX
    lastMouseY.value = event.touches[0].clientY
  }
}

const handleTouchEnd = () => {
  isDragging.value = false
  lastTouchDistance.value = 0
}

const getTouchDistance = (touches) => {
  const dx = touches[0].clientX - touches[1].clientX
  const dy = touches[0].clientY - touches[1].clientY
  return Math.sqrt(dx * dx + dy * dy)
}

// Load and modify SVG
onMounted(async () => {
  try {
    // Try to load SVG directly with Vite's asset handling
    const svgModule = await import('@/assets/images/nigeria.svg?raw')
    let svgText = svgModule.default
    
    // Modify SVG with state colors and interactivity
    svgText = modifySVG(svgText)
    svgContent.value = svgText
  } catch (error) {
    console.error('Error loading SVG:', error)
    // Fallback: create a simple message
    svgContent.value = '<div style="padding: 20px; text-align: center; color: #666;">Nigeria Map Visualization</div>'
  } finally {
    loading.value = false
  }
})

// Function to modify SVG with state colors
const modifySVG = (svgText) => {
  const parser = new DOMParser()
  const doc = parser.parseFromString(svgText, 'image/svg+xml')
  const svgElement = doc.documentElement
  
  // Add CSS styles
  const style = doc.createElement('style')
  style.textContent = `
    .state-path {
      transition: all 0.3s ease;
      cursor: pointer;
      stroke: #ffffff;
      stroke-width: 1;
    }
    .state-path:hover {
      stroke-width: 2;
      filter: brightness(1.2);
    }
  `
  svgElement.appendChild(style)
  
  // Color states based on their status
  const paths = svgElement.querySelectorAll('path')
  paths.forEach(path => {
    const stateName = path.id || path.getAttribute('name') || path.getAttribute('class') || ''
    
    if (stateName) {
      path.classList.add('state-path')
      path.setAttribute('fill', getStateColor(stateName))
      path.setAttribute('data-state', stateName)
    }
  })
  
  return new XMLSerializer().serializeToString(svgElement)
}

// Debug: log state summaries when installations change
// watch(() => props.installations, (newInstallations) => {
//   console.log('State summaries:', stateSummaries.value)
// }, { immediate: true })
</script>

<template>
  <div class="installation-map">
    <div class="map-header">
      <div>
        <h3 class="map-title">Installation Progress by State</h3>
        <p class="map-subtitle">Delivery and installation status across Nigeria</p>
      </div>
      
      <!-- Zoom Controls -->
      <div class="zoom-controls">
        <VBtn
          icon
          size="small"
          variant="tonal"
          @click="zoomOut"
          title="Zoom Out"
        >
          <VIcon icon="tabler-zoom-out" />
        </VBtn>
        
        <VBtn
          size="small"
          variant="tonal"
          @click="resetZoom"
          title="Reset Zoom"
        >
          {{ Math.round(scale * 100) }}%
        </VBtn>
        
        <VBtn
          icon
          size="small"
          variant="tonal"
          @click="zoomIn"
          title="Zoom In"
        >
          <VIcon icon="tabler-zoom-in" />
        </VBtn>
      </div>
    </div>
    
    <div 
      class="map-container"
      @mousedown="startDrag"
      @mousemove="doDrag"
      @mouseup="stopDrag"
      @mouseleave="stopDrag"
      @wheel="handleWheel"
      @touchstart="handleTouchStart"
      @touchmove="handleTouchMove"
      @touchend="handleTouchEnd"
      @touchcancel="handleTouchEnd"
    >
      <!-- Loading State -->
      <div v-if="loading" class="loading-state">
        <VIcon icon="tabler-map" size="48" class="mb-2" />
        <div>Loading installation map...</div>
      </div>
      
      <!-- Map Content -->
      <div 
        v-else
        class="svg-container"
        :style="{
          transform: `translate(${translateX}px, ${translateY}px) scale(${scale})`,
          transformOrigin: '0 0'
        }"
        v-html="svgContent"
        @mouseover="handleStateHover"
        @mousemove="handleMouseMove"
        @mouseleave="handleMouseLeave"
      />
      
      <!-- Zoom Instructions -->
      <div class="zoom-instructions">
        <div class="instruction-item">
          <VIcon icon="tabler-zoom" size="16" />
          <span>Scroll to zoom</span>
        </div>
        <div class="instruction-item">
          <VIcon icon="tabler-hand-move" size="16" />
          <span>Drag to pan</span>
        </div>
        <div class="instruction-item">
          <VIcon icon="tabler-hand-two-fingers" size="16" />
          <span>Pinch on mobile</span>
        </div>
      </div>
    </div>
    
    <!-- Status Legend -->
    <div class="status-legend">
      <div class="legend-title">Status Legend</div>
      <div class="legend-items">
        <div class="legend-item">
          <div class="legend-color" style="background-color: #4caf50;"></div>
          <div class="legend-text">
            <strong>All Complete</strong>
            <span>All delivered & installed</span>
          </div>
        </div>
        <div class="legend-item">
          <div class="legend-color" style="background-color: #2196f3;"></div>
          <div class="legend-text">
            <strong>All Delivered</strong>
            <span>All delivered, pending installation</span>
          </div>
        </div>
        <div class="legend-item">
          <div class="legend-color" style="background-color: #ff9800;"></div>
          <div class="legend-text">
            <strong>Partial Delivery</strong>
            <span>Some delivered, some pending</span>
          </div>
        </div>
        <div class="legend-item">
          <div class="legend-color" style="background-color: #f44336;"></div>
          <div class="legend-text">
            <strong>Not Started</strong>
            <span>No deliveries yet</span>
          </div>
        </div>
        <div class="legend-item">
          <div class="legend-color" style="background-color: #e0e0e0;"></div>
          <div class="legend-text">
            <strong>No Data</strong>
            <span>No installations recorded</span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Hover Tooltip -->
    <div 
      v-if="hoveredState" 
      class="state-tooltip"
      :style="tooltipStyle"
    >
      <div class="tooltip-header">
        <strong>{{ hoveredState.name }}</strong>
        <VChip :color="getStateColor(hoveredState.name)" size="small" class="ml-2">
          {{ getStateStatus(hoveredState.name) }}
        </VChip>
      </div>
      
      <div class="tooltip-stats">
        <div class="stat-item">
          <VIcon icon="tabler-building" size="16" />
          <span>{{ hoveredState.lgaCount }} LGAs</span>
        </div>
        <div class="stat-item">
          <VIcon icon="tabler-home" size="16" />
          <span>{{ hoveredState.facilityCount }} Facilities</span>
        </div>
        <div class="stat-item">
          <VIcon icon="tabler-package" size="16" />
          <span>{{ hoveredState.totalInstallations }} Total Installations</span>
        </div>
        <div class="stat-item">
          <VIcon icon="tabler-check" size="16" color="success" />
          <span>{{ hoveredState.delivered }} Delivered</span>
        </div>
        <div class="stat-item">
          <VIcon icon="tabler-check" size="16" color="success" />
          <span>{{ hoveredState.installed }} Installed</span>
        </div>
        <div class="stat-item" v-if="hoveredState.pendingDelivery > 0">
          <VIcon icon="tabler-clock" size="16" color="warning" />
          <span>{{ hoveredState.pendingDelivery }} Pending Delivery</span>
        </div>
        <div class="stat-item" v-if="hoveredState.pendingInstallation > 0">
          <VIcon icon="tabler-clock" size="16" color="warning" />
          <span>{{ hoveredState.pendingInstallation }} Pending Installation</span>
        </div>
        <div class="stat-item">
          <VIcon icon="tabler-chart-bar" size="16" />
          <span>{{ hoveredState.completionRate }}% Delivery Rate</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.installation-map {
  position: relative;
  background: white;
  border-radius: 8px;
  padding: 16px;
}

.map-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 12px;
}

.map-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
  color: #333;
}

.map-subtitle {
  margin: 4px 0 0 0;
  color: #666;
  font-size: 0.875rem;
}

.zoom-controls {
  display: flex;
  gap: 4px;
  align-items: center;
}

.map-container {
  position: relative;
  width: 100%;
  height: 400px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #e0e0e0;
  background: #fafafa;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: grab;
  touch-action: none;
}

.map-container:active {
  cursor: grabbing;
}

.svg-container {
  width: 100%;
  height: 100%;
  transition: transform 0.1s ease;
}

.svg-container :deep(path.state-path) {
  transition: all 0.3s ease;
  cursor: pointer;
  stroke: #ffffff;
  stroke-width: 1;
}

.svg-container :deep(path.state-path:hover) {
  stroke-width: 2;
  filter: brightness(1.2);
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #666;
}

.zoom-instructions {
  position: absolute;
  bottom: 8px;
  left: 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  background: rgba(255, 255, 255, 0.9);
  padding: 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  color: #666;
  backdrop-filter: blur(4px);
}

.instruction-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.status-legend {
  margin-top: 20px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.legend-title {
  font-weight: 600;
  margin-bottom: 12px;
  color: #333;
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
  border: 2px solid #fff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  flex-shrink: 0;
}

.legend-text {
  display: flex;
  flex-direction: column;
}

.legend-text strong {
  font-size: 0.875rem;
  color: #333;
}

.legend-text span {
  font-size: 0.75rem;
  color: #666;
}

.state-tooltip {
  position: fixed;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  max-width: 300px;
  pointer-events: none;
}

.tooltip-header {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  padding-bottom: 8px;
  border-bottom: 1px solid #f0f0f0;
}

.tooltip-stats {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.875rem;
}

.stat-item span {
  color: #666;
}

/* Responsive design */
@media (max-width: 768px) {
  .legend-items {
    grid-template-columns: 1fr;
  }
  
  .map-container {
    height: 300px;
  }
  
  .map-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .zoom-controls {
    align-self: flex-end;
  }
  
  .zoom-instructions {
    font-size: 0.7rem;
  }
}
</style>
