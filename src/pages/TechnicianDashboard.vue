<!-- src/components/technician/SiteMap.vue -->
<template>
  <div class="site-map">
    <div v-if="!hasLocations" class="no-locations">
      <i class="fas fa-map-marker-alt"></i>
      <p>No location data available for installations</p>
      <small>{{ installations.length }} installation(s) assigned</small>
    </div>
    
    <div v-else class="map-container">
      <!-- Simple map representation using CSS -->
      <div class="map-background">
        <div 
          v-for="(installation, index) in installationsWithLocation" 
          :key="installation.id"
          class="map-marker"
          :style="{
            left: `${getMapPosition(index, 'x')}%`,
            top: `${getMapPosition(index, 'y')}%`
          }"
          :class="`status-${getInstallationStatus(installation)}`"
          :title="getMarkerTitle(installation)"
        >
          <i class="fas fa-map-pin"></i>
          <div class="marker-tooltip">
            {{ installation.facility?.name || 'Facility' }}
          </div>
        </div>
      </div>
      
      <div class="map-legend">
        <div class="legend-item">
          <span class="legend-color pending"></span>
          <span>Pending</span>
        </div>
        <div class="legend-item">
          <span class="legend-color in-progress"></span>
          <span>In Progress</span>
        </div>
        <div class="legend-item">
          <span class="legend-color completed"></span>
          <span>Completed</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  installations: {
    type: Array,
    default: () => []
  }
})

const hasLocations = computed(() => {
  return props.installations.some(installation => 
    installation.facility?.latitude && installation.facility?.longitude
  )
})

const installationsWithLocation = computed(() => {
  return props.installations.filter(installation => 
    installation.facility?.latitude && installation.facility?.longitude
  )
})

const getInstallationStatus = (installation) => {
  return installation.status || installation.installation_status || 'pending'
}

const getMapPosition = (index, axis) => {
  // Simple algorithm to spread markers evenly
  const positions = {
    x: [20, 80, 40, 60, 30, 70, 25, 75, 35, 65],
    y: [25, 30, 60, 40, 70, 35, 65, 45, 55, 50]
  }
  
  const defaultPositions = positions[axis] || []
  return defaultPositions[index] || (Math.random() * 60 + 20)
}

const getMarkerTitle = (installation) => {
  const status = getInstallationStatus(installation)
  const facilityName = installation.facility?.name || 'Facility'
  return `${facilityName} - ${formatStatus(status)}`
}

const formatStatus = (status) => {
  const statusMap = {
    'pending': 'Pending',
    'assigned': 'Assigned',
    'in_progress': 'In Progress',
    'completed': 'Completed',
    'cancelled': 'Cancelled'
  }
  return statusMap[status] || status
}
</script>

<style scoped>
.site-map {
  height: 300px;
  padding: 20px;
}

.no-locations {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #95a5a6;
  text-align: center;
}

.no-locations i {
  font-size: 48px;
  margin-bottom: 10px;
}

.no-locations small {
  margin-top: 5px;
  font-size: 12px;
}

.map-container {
  height: 100%;
  position: relative;
}

.map-background {
  height: 80%;
  background: linear-gradient(135deg, #a8e6cf 0%, #dcedc1 100%);
  border-radius: 8px;
  position: relative;
  border: 1px solid #bdc3c7;
}

.map-marker {
  position: absolute;
  transform: translate(-50%, -100%);
  cursor: pointer;
  transition: all 0.3s ease;
}

.map-marker i {
  font-size: 24px;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
}

.map-marker.status-pending i,
.map-marker.status-assigned i { 
  color: #3498db; 
}

.map-marker.status-in_progress i { 
  color: #f39c12; 
}

.map-marker.status-completed i { 
  color: #27ae60; 
}

.map-marker.status-cancelled i { 
  color: #e74c3c; 
}

.map-marker:hover {
  transform: translate(-50%, -100%) scale(1.2);
}

.map-marker:hover .marker-tooltip {
  opacity: 1;
  transform: translateX(-50%) translateY(-10px);
}

.marker-tooltip {
  position: absolute;
  top: -40px;
  left: 50%;
  transform: translateX(-50%);
  background: #2c3e50;
  color: white;
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 12px;
  white-space: nowrap;
  opacity: 0;
  transition: all 0.3s ease;
  pointer-events: none;
}

.marker-tooltip::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 5px solid transparent;
  border-top-color: #2c3e50;
}

.map-legend {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 15px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #7f8c8d;
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.legend-color.pending { background: #3498db; }
.legend-color.in-progress { background: #f39c12; }
.legend-color.completed { background: #27ae60; }
</style>
