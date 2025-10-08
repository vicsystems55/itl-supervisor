<template>
  <div class="installation-map" ref="container">
    <!-- Nigeria SVG -->
    <div class="map-wrapper" ref="mapWrapper" v-html="svgContent"></div>

    <!-- Tooltip -->
    <transition name="fade">
      <div
        v-if="tooltip.visible"
        class="tooltip"
        :style="{ top: tooltip.y + 'px', left: tooltip.x + 'px' }"
      >
        <div class="tooltip-header">{{ tooltip.name }}</div>
        <div class="tooltip-body">
          <div>
            <span class="label">Installation:</span>
            <span
              class="value"
              :class="tooltip.status === 'installed' ? 'installed' : 'arrived'"
            >
              {{ tooltip.status }}
            </span>
          </div>
          <div v-if="tooltip.equipment">
            <span class="label">Equipment:</span>
            <span
              class="value"
              :class="tooltip.equipment === 'available' ? 'installed' : 'arrived'"
            >
              {{ tooltip.equipment }}
            </span>
          </div>
        </div>
      </div>
    </transition>

    <!-- Legend -->
    <div class="map-legend">
      <div><span class="legend-dot installed"></span> Installed</div>
      <div><span class="legend-dot arrived"></span> Arrived</div>
    </div>

    <!-- Zoom Controls -->
    <div class="zoom-controls">
      <button @click="zoomIn">+</button>
      <button @click="zoomOut">−</button>
      <button @click="resetZoom">⟳</button>
    </div>
  </div>
</template>

<script setup>
import nigeriaSvg from "@/assets/images/nigeria.svg?raw";
import { onMounted, onUnmounted, ref } from "vue";

const svgContent = nigeriaSvg;
const mapWrapper = ref(null);
const container = ref(null);

const installations = [
  { id: "NG-LA", name: "Lagos", status: "installed", equipment: "available" },
  { id: "NG-FC", name: "Abuja", status: "arrived", equipment: "unavailable" },
];

const tooltip = ref({
  visible: false,
  name: "",
  status: "",
  equipment: "",
  x: 0,
  y: 0,
});

let svg;
let currentViewBox = [0, 0, 1000, 800];
let initialViewBox = [];
const MIN_ZOOM = 0.4;
const MAX_ZOOM = 8;
let isPanning = false;
let startPoint = null;
let startViewBox = null;

function showTooltip(evt, data) {
  const rect = container.value.getBoundingClientRect();
  tooltip.value = {
    visible: true,
    name: data.name,
    status: data.status,
    equipment: data.equipment,
    x: evt.clientX - rect.left + 10,
    y: evt.clientY - rect.top + 10,
  };
}
function hideTooltip() {
  tooltip.value.visible = false;
}

function parseViewBox(vb) {
  return vb.split(/\s+|,\s*/).map(Number);
}
function setViewBox(arr) {
  svg.setAttribute("viewBox", arr.join(" "));
  currentViewBox = arr;
}

function svgPoint(clientX, clientY) {
  const pt = svg.createSVGPoint();
  pt.x = clientX;
  pt.y = clientY;
  return pt.matrixTransform(svg.getScreenCTM().inverse());
}

function zoom(factor, center) {
  const [x, y, w, h] = currentViewBox;
  const newW = Math.max(Math.min(w * factor, initialViewBox[2] * MAX_ZOOM), initialViewBox[2] * MIN_ZOOM);
  const newH = Math.max(Math.min(h * factor, initialViewBox[3] * MAX_ZOOM), initialViewBox[3] * MIN_ZOOM);
  const nx = center.x - (center.x - x) * (newW / w);
  const ny = center.y - (center.y - y) * (newH / h);
  setViewBox([nx, ny, newW, newH]);
}

function zoomIn() {
  zoom(0.85, { x: currentViewBox[0] + currentViewBox[2] / 2, y: currentViewBox[1] + currentViewBox[3] / 2 });
}
function zoomOut() {
  zoom(1 / 0.85, { x: currentViewBox[0] + currentViewBox[2] / 2, y: currentViewBox[1] + currentViewBox[3] / 2 });
}
function resetZoom() {
  setViewBox(initialViewBox);
}

onMounted(() => {
  const wrapper = mapWrapper.value;
  if (!wrapper) return;

  requestAnimationFrame(() => {
    svg = wrapper.querySelector("svg");
    if (!svg) return;

    if (!svg.getAttribute("viewBox")) {
      const w = svg.clientWidth;
      const h = svg.clientHeight;
      svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
    }

    currentViewBox = parseViewBox(svg.getAttribute("viewBox"));
    initialViewBox = [...currentViewBox];

    // Grey base
    svg.querySelectorAll("path, polygon").forEach((el) => {
      el.setAttribute("fill", "#9ca3af");
      el.setAttribute("stroke", "#6b7280");
      el.setAttribute("stroke-width", "0.6");
    });

    // Hover + tooltip
    svg.querySelectorAll("path, polygon").forEach((el) => {
      const id = el.getAttribute("id");
      const data = installations.find((i) => i.id === id) || { name: id || "Unknown", status: "N/A" };

      el.addEventListener("mouseenter", (e) => {
        el.setAttribute("fill", "#4CC0E8");
        showTooltip(e, data);
      });
      el.addEventListener("mousemove", (e) => showTooltip(e, data));
      el.addEventListener("mouseleave", () => {
        el.setAttribute("fill", "#9ca3af");
        hideTooltip();
      });
    });

    // Pan and pinch zoom
    svg.addEventListener("pointerdown", (e) => {
      isPanning = true;
      svg.setPointerCapture(e.pointerId);
      startPoint = svgPoint(e.clientX, e.clientY);
      const vb = parseViewBox(svg.getAttribute("viewBox"));
      startViewBox = { x: vb[0], y: vb[1], w: vb[2], h: vb[3] };
    });
    svg.addEventListener("pointermove", (e) => {
      if (!isPanning) return;
      const pt = svgPoint(e.clientX, e.clientY);
      const dx = pt.x - startPoint.x;
      const dy = pt.y - startPoint.y;
      setViewBox([startViewBox.x - dx, startViewBox.y - dy, startViewBox.w, startViewBox.h]);
    });
    svg.addEventListener("pointerup", () => (isPanning = false));
    svg.addEventListener("pointerleave", () => (isPanning = false));

    svg.addEventListener("wheel", (e) => {
      e.preventDefault();
      const mouse = svgPoint(e.clientX, e.clientY);
      const factor = e.deltaY < 0 ? 0.85 : 1 / 0.85;
      zoom(factor, mouse);
    }, { passive: false });

    // Reset on double click
    svg.addEventListener("dblclick", resetZoom);
  });
});

onUnmounted(() => {
  svg?.replaceWith(svg.cloneNode(true)); // cleanup events
});
</script>

<style scoped>
.installation-map {
  position: relative;
  overflow: hidden;
  border-radius: 10px;
}

.map-wrapper {
  inline-size: 100%;
  block-size: min(60vh, 480px);
}

.map-wrapper svg {
  inline-size: 100%;
  block-size: 100%;
  touch-action: none;
  user-select: none;
}

.map-legend {
  position: absolute;
  top: 12px;
  right: 12px;
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 6px;
  padding: 8px 10px;
  font-size: 12px;
  gap: 8px;
  box-shadow: 0 6px 14px rgba(16, 24, 40, 0.08);
}

.legend-dot {
  display: inline-block;
  border-radius: 50%;
  width: 10px;
  height: 10px;
}
.legend-dot.installed { background: #22c55e; }
.legend-dot.arrived { background: #9ca3af; }

.tooltip {
  position: absolute;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 8px 12px;
  box-shadow: 0 6px 14px rgba(16, 24, 40, 0.1);
  pointer-events: none;
  font-size: 13px;
  color: #111827;
}
.tooltip-header {
  font-weight: 600;
  margin-bottom: 4px;
}
.tooltip-body .label {
  font-weight: 500;
  color: #6b7280;
}
.tooltip-body .value {
  margin-left: 6px;
  font-weight: 600;
}
.tooltip-body .installed { color: #22c55e; }
.tooltip-body .arrived { color: #9ca3af; }

.zoom-controls {
  position: absolute;
  bottom: 12px;
  right: 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.zoom-controls button {
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  width: 32px;
  height: 32px;
  font-size: 18px;
  line-height: 1;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
}
.zoom-controls button:hover {
  background: #f3f4f6;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.15s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
