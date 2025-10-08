<template>
  <div class="installation-map">
    <!-- Inline the Nigeria SVG so we can position SVG markers accurately -->
    <div class="map-wrapper" ref="mapWrapper" v-html="svgContent"></div>

    <!-- Legend -->
    <div class="map-legend">
      <div><span class="legend-dot installed"></span> Installed</div>
      <div><span class="legend-dot arrived"></span> Arrived</div>
    </div>
  </div>
</template>

<script setup>
import nigeriaSvg from "@/assets/images/nigeria.svg?raw";
import { onMounted, onUnmounted, ref } from "vue";

const svgContent = nigeriaSvg;
const mapWrapper = ref(null);

// Example installation points with approximate coordinates that match the SVG viewBox
// We'll place the markers by finding the paths for the states and using their centroid
const installations = [
  { id: "NG-LA", name: "Lagos", status: "installed" },
  { id: "NG-FC", name: "Abuja", status: "arrived" },
];

function createMarker(x, y, status, label) {
  const svgns = "http://www.w3.org/2000/svg";
  const circle = document.createElementNS(svgns, "circle");
  circle.setAttribute("cx", x);
  circle.setAttribute("cy", y);
  circle.setAttribute("r", "6");
  circle.setAttribute("fill", status === "installed" ? "#22C55E" : "#9CA3AF");
  circle.setAttribute("stroke", "#fff");
  circle.setAttribute("stroke-width", "1.5");
  circle.classList.add("installation-marker");

  // add tooltip (title)
  const title = document.createElementNS(svgns, "title");
  title.textContent = label + " — " + status;
  circle.appendChild(title);

  return circle;
}

onMounted(() => {
  const wrapper = mapWrapper.value;
  if (!wrapper) return;

  // Wait a tick for the innerHTML SVG to be parsed into DOM
  requestAnimationFrame(() => {
    const svg = wrapper.querySelector("svg");
    if (!svg) return;

    // ensure viewBox is numeric and present
    if (!svg.getAttribute("viewBox")) {
      const w = parseFloat(svg.getAttribute("width")) || svg.clientWidth;
      const h = parseFloat(svg.getAttribute("height")) || svg.clientHeight;
      if (w && h) svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
    }

    // Create a markers group
    const svgns = "http://www.w3.org/2000/svg";
    let markersGroup = svg.querySelector("#installation-markers");
    if (!markersGroup) {
      markersGroup = document.createElementNS(svgns, "g");
      markersGroup.setAttribute("id", "installation-markers");
      svg.appendChild(markersGroup);
    }

    // Force the base map shapes to grey tones so the map appears muted
    // We only target common shape elements and avoid touching any elements
    // inside the markers group (so markers keep their colors).
    const mapShapes = svg.querySelectorAll(
      "path, polygon, rect, polyline, line, ellipse"
    );
    mapShapes.forEach((el) => {
      // skip shapes that will be inside the markers group
      if (el.closest && el.closest("#installation-markers")) return;
      // allow opt-out via data-preserve-color attribute
      if (el.hasAttribute && el.hasAttribute("data-preserve-color")) return;
      try {
        el.setAttribute("fill", "#9ca3af");
        el.setAttribute("stroke", "#6b7280");
        if (!el.getAttribute("stroke-width"))
          el.setAttribute("stroke-width", "0.6");
      } catch (err) {
        /* ignore elements that don't accept these attrs */
      }
    });

    // For each installation, find the state path by ID and compute its centroid
    installations.forEach((inst) => {
      const path = svg.querySelector("#" + inst.id);
      if (!path) {
        console.warn("State path not found in SVG:", inst.id);
        return;
      }

      // compute bbox center
      const bbox = path.getBBox();
      const cx = bbox.x + bbox.width / 2;
      const cy = bbox.y + bbox.height / 2;

      const marker = createMarker(cx, cy, inst.status, inst.name);
      markersGroup.appendChild(marker);
    });

    // --- Responsive & interactive (zoom + pan) support ---
    // We'll manipulate the SVG viewBox to zoom and pan.
    let isPanning = false;
    let startPoint = null;
    let startViewBox = null;
    const MIN_ZOOM = 0.2;
    const MAX_ZOOM = 8;

    const parseViewBox = (vb) => vb.split(/\s+|,\s*/).map(Number);
    const setViewBox = (arr) => svg.setAttribute("viewBox", arr.join(" "));

    // ensure viewBox numbers
    let vb = parseViewBox(svg.getAttribute("viewBox"));
    const initialViewBox = [...vb];

    const svgPoint = (clientX, clientY) => {
      try {
        const pt = svg.createSVGPoint();
        pt.x = clientX;
        pt.y = clientY;
        return pt.matrixTransform(svg.getScreenCTM().inverse());
      } catch (err) {
        // fallback: map to viewBox space proportionally
        const rect = svg.getBoundingClientRect();
        const scaleX = vb[2] / rect.width;
        const scaleY = vb[3] / rect.height;
        return {
          x: vb[0] + (clientX - rect.left) * scaleX,
          y: vb[1] + (clientY - rect.top) * scaleY,
        };
      }
    };

    const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

    const onWheel = (e) => {
      e.preventDefault();
      vb = parseViewBox(svg.getAttribute("viewBox"));
      const [x, y, width, height] = vb;
      const mouse = svgPoint(e.clientX, e.clientY);

      // zoom factor: wheel up (deltaY < 0) zooms in
      const factor = e.deltaY < 0 ? 0.85 : 1 / 0.85;
      const newWidth = clamp(
        width * factor,
        initialViewBox[2] * MIN_ZOOM,
        initialViewBox[2] * MAX_ZOOM
      );
      const newHeight = clamp(
        height * factor,
        initialViewBox[3] * MIN_ZOOM,
        initialViewBox[3] * MAX_ZOOM
      );

      // keep zoom centered on mouse position
      const nx = mouse.x - (mouse.x - x) * (newWidth / width);
      const ny = mouse.y - (mouse.y - y) * (newHeight / height);

      setViewBox([nx, ny, newWidth, newHeight]);
    };

    const onPointerDown = (e) => {
      isPanning = true;
      svg.setPointerCapture && svg.setPointerCapture(e.pointerId);
      startPoint = svgPoint(e.clientX, e.clientY);
      vb = parseViewBox(svg.getAttribute("viewBox"));
      startViewBox = { x: vb[0], y: vb[1], w: vb[2], h: vb[3] };
    };

    const onPointerMove = (e) => {
      if (!isPanning) return;
      const pt = svgPoint(e.clientX, e.clientY);
      const dx = pt.x - startPoint.x;
      const dy = pt.y - startPoint.y;
      const nx = startViewBox.x - dx;
      const ny = startViewBox.y - dy;
      setViewBox([nx, ny, startViewBox.w, startViewBox.h]);
    };

    const onPointerUp = (e) => {
      isPanning = false;
      try {
        svg.releasePointerCapture && svg.releasePointerCapture(e.pointerId);
      } catch (err) {
        /* ignore */
      }
    };

    const onDblClick = () => {
      setViewBox(initialViewBox);
    };

    // disable default touch actions so pointer events work as expected
    svg.style.touchAction = "none";

    svg.addEventListener("wheel", onWheel, { passive: false });
    svg.addEventListener("pointerdown", onPointerDown);
    svg.addEventListener("pointermove", onPointerMove);
    svg.addEventListener("pointerup", onPointerUp);
    svg.addEventListener("pointerleave", onPointerUp);
    svg.addEventListener("dblclick", onDblClick);

    // cleanup on unmount
    onUnmounted(() => {
      svg.removeEventListener("wheel", onWheel);
      svg.removeEventListener("pointerdown", onPointerDown);
      svg.removeEventListener("pointermove", onPointerMove);
      svg.removeEventListener("pointerup", onPointerUp);
      svg.removeEventListener("pointerleave", onPointerUp);
      svg.removeEventListener("dblclick", onDblClick);
    });
  });
});
</script>

<style scoped>
.installation-map {
  position: relative;
  overflow: hidden;
  border-radius: 8px;
}

.map-wrapper {
  display: block;

  /* responsive height: up to 420px but use viewport height on small screens */
  block-size: min(60vh, 420px);
  inline-size: 100%;
}

.map-wrapper svg {
  display: block;
  block-size: 100%;
  inline-size: 100%;
}

.installation-marker {
  cursor: pointer;
  transition: transform 120ms ease;
}

.installation-marker:hover {
  transform: scale(1.3);
}

.map-legend {
  position: absolute;
  display: flex;
  align-items: center;
  border-radius: 6px;
  background: rgba(255, 255, 255, 90%);
  box-shadow: 0 6px 14px rgba(16, 24, 40, 8%);
  color: #111827;
  font-size: 12px;
  gap: 8px;
  inset-block-start: 12px;
  inset-inline-end: 12px;
  padding-block: 8px;
  padding-inline: 10px;
}

.map-legend div {
  display: flex;
  align-items: center;
  gap: 8px;
}

.legend-dot {
  display: inline-block;
  border-radius: 50%;
  block-size: 10px;
  inline-size: 10px;
}

.legend-dot.installed {
  background: #22c55e;
}

.legend-dot.arrived {
  background: #9ca3af;
}
</style>
