<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
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

// Drawer/modal data
const selectedState = ref(null)
const selectedStateInstallations = ref([])
const loadingStateData = ref(false)

// --- Compute installation summaries per state ---
const stateSummaries = computed(() => {
  const summaries = {}
  props.installations.forEach(installation => {
    const stateName =
      installation.facility?.state?.name ||
      installation.hasFacilityState ||
      installation.province ||
      null
    if (!stateName) return
    if (!summaries[stateName]) {
      summaries[stateName] = { totalInstallations: 0, delivered: 0 }
    }
    const summary = summaries[stateName]
    summary.totalInstallations++
    if (installation.delivery_status?.toLowerCase() === 'delivered') summary.delivered++
  })
  const result = {}
  Object.keys(summaries).forEach(name => {
    const s = summaries[name]
    result[name] = {
      name,
      totalInstallations: s.totalInstallations,
      delivered: s.delivered,
      pendingDelivery: s.totalInstallations - s.delivered
    }
  })
  return result
})

// --- Color logic ---
const getStateColor = (stateName) => {
  const summary = stateSummaries.value[stateName]
  if (!summary) return '#e0e0e0'
  if (summary.delivered === summary.totalInstallations) return '#4caf50'
  if (summary.delivered > 0) return '#2196f3'
  if (summary.totalInstallations > 0) return '#f44336'
  return '#e0e0e0'
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
  hoveredState.value = summary || { name: stateName, totalInstallations: 0, delivered: 0, pendingDelivery: 0 }
  tooltipStyle.value = { left: `${event.clientX + 10}px`, top: `${event.clientY + 10}px` }
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
    const state = props.installations.find(
      i => i.facility?.state?.name === stateName
    )?.facility?.state
    if (state?.id) {
      const response = await InstallationService.getByState(state.id)
      selectedStateInstallations.value = response.data || response
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
    // ✅ use title instead of id/name
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
  } catch (err) {
    console.error('Error loading SVG:', err)
    svgContent.value = '<div>Error loading map</div>'
  } finally {
    loading.value = false
  }
}

// --- Zoom and Pan (unchanged) ---
const startDrag = (e) => { isDragging.value = true; lastMouseX.value = e.clientX; lastMouseY.value = e.clientY }
const doDrag = (e) => { if (isDragging.value) { translateX.value += e.clientX - lastMouseX.value; translateY.value += e.clientY - lastMouseY.value; lastMouseX.value = e.clientX; lastMouseY.value = e.clientY } }
const stopDrag = () => (isDragging.value = false)
const zoomIn = () => (scale.value = Math.min(scale.value * 1.2, 5))
const zoomOut = () => (scale.value = Math.max(scale.value / 1.2, 0.5))
const resetZoom = () => { scale.value = 1; translateX.value = 0; translateY.value = 0 }
const handleWheel = (e) => {
  e.preventDefault()
  const delta = -Math.sign(e.deltaY) * 0.1
  const newScale = Math.max(0.5, Math.min(5, scale.value + delta))
  const rect = e.currentTarget.getBoundingClientRect()
  const mouseX = e.clientX - rect.left
  const mouseY = e.clientY - rect.top
  const worldMouseX = (mouseX - translateX.value) / scale.value
  const worldMouseY = (mouseY - translateY.value) / scale.value
  scale.value = newScale
  translateX.value = mouseX - worldMouseX * scale.value
  translateY.value = mouseY - worldMouseY * scale.value
}

watch(() => props.installations, () => nextTick(() => updateStateColors()), { deep: true })
onMounted(loadSVG)
</script>

<template>
  <div class="installation-map">
    <div class="map-header">
      <div>
        <h3 class="map-title">Installations by State</h3>
        <p class="map-subtitle">Hover or click a state for details</p>
      </div>

      <div class="zoom-controls">
        <button @click="zoomOut" class="zoom-btn"><VIcon icon="tabler-zoom-out" size="16" /></button>
        <button @click="resetZoom" class="zoom-btn">{{ Math.round(scale * 100) }}%</button>
        <button @click="zoomIn" class="zoom-btn"><VIcon icon="tabler-zoom-in" size="16" /></button>
      </div>
    </div>

    <div class="map-container"
      @mousedown="startDrag" @mousemove="doDrag" @mouseup="stopDrag" @mouseleave="stopDrag"
      @wheel="handleWheel">
      <div v-if="loading" class="loading-state">
        <VIcon icon="tabler-map" size="48" class="mb-2" />
        <div>Loading map...</div>
      </div>

      <div v-else class="svg-container"
        :style="{ transform: `translate(${translateX}px, ${translateY}px) scale(${scale})`, transformOrigin: '0 0' }"
        v-html="svgContent"
        @mouseover="handleStateHover"
        @mousemove="handleMouseMove"
        @mouseleave="handleMouseLeave"
        @click="handleStateClick" />
    </div>

    <!-- Legend -->
    <div class="status-legend">
      <div class="legend-title">Status Legend</div>
      <div class="legend-items">
        <div class="legend-item"><div class="legend-color" style="background:#4caf50"></div><span>All Delivered</span></div>
        <div class="legend-item"><div class="legend-color" style="background:#2196f3"></div><span>Some Delivered</span></div>
        <div class="legend-item"><div class="legend-color" style="background:#f44336"></div><span>None Delivered</span></div>
        <div class="legend-item"><div class="legend-color" style="background:#ff9800"></div><span>Has Installations (No Delivery Data)</span></div>
        <div class="legend-item"><div class="legend-color" style="background:#e0e0e0"></div><span>No Data</span></div>
      </div>
    </div>

    <!-- Tooltip -->
    <div v-if="hoveredState" class="state-tooltip" :style="tooltipStyle">
      <strong>{{ hoveredState.name }}</strong>
      <div v-if="hoveredState.totalInstallations > 0">
        <div>Total: {{ hoveredState.totalInstallations }}</div>
        <div>Delivered: {{ hoveredState.delivered }}</div>
        <div>Pending: {{ hoveredState.pendingDelivery }}</div>
      </div>
      <div v-else>No installation data</div>
    </div>

    <!-- Modal -->
    <VDialog v-model="selectedState" max-width="700px">
      <VCard>
        <VCardTitle>Installations in {{ selectedState }}</VCardTitle>
        <VCardText>
          <div v-if="loadingStateData" class="text-center py-4">
            <VProgressCircular indeterminate color="primary" />
          </div>
          <div v-else-if="selectedStateInstallations.length === 0" class="text-center text-gray-500">
            No installations found for this state.
          </div>
          <div v-else>
            <ul>
              <li v-for="install in selectedStateInstallations" :key="install.id" class="mb-2">
                <strong>{{ install.facility?.name }}</strong> — {{ install.delivery_status || 'No delivery status' }}
              </li>
            </ul>
          </div>
        </VCardText>
        <VCardActions>
          <VBtn text color="primary" @click="selectedState = null">Close</VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
  </div>
</template>

<style scoped>
/* same styles */
.installation-map { position: relative; background: white; border-radius: 8px; padding: 16px; }
.map-header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:16px; flex-wrap:wrap; gap:12px; }
.map-title { font-size:1.25rem; font-weight:600; color:#333; }
.map-subtitle { color:#666; font-size:0.875rem; }
.zoom-controls { display:flex; gap:4px; }
.zoom-btn { border:1px solid #e0e0e0; border-radius:4px; padding:6px 8px; background:#fff; cursor:pointer; }
.map-container { position:relative; width:100%; height:400px; overflow:hidden; border:1px solid #e0e0e0; background:#fafafa; display:flex; align-items:center; justify-content:center; }
.svg-container { width:100%; height:100%; transition:transform 0.1s ease; }
.status-legend { margin-top:16px; background:#f8f9fa; padding:12px; border-radius:6px; border:1px solid #e9ecef; }
.legend-items { display:flex; flex-wrap:wrap; gap:12px; }
.legend-item { display:flex; align-items:center; gap:8px; }
.legend-color { width:16px; height:16px; border-radius:3px; }
.state-tooltip { position:fixed; background:white; border:1px solid #e0e0e0; border-radius:6px; padding:8px 12px; box-shadow:0 2px 8px rgba(0,0,0,0.15); z-index:1000; font-size:0.875rem; }
</style>
