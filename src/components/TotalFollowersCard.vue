<script setup>
import { useTheme } from 'vuetify'
import { hexToRgb } from '@layouts/utils'
import VueApexCharts from 'vue3-apexcharts'

const vuetifyTheme = useTheme()

// Props for flexibility
const props = defineProps({
  totalFollowers: {
    type: String,
    default: '0',
  },
  growth: {
    type: String,
    default: '+0%',
  },
  series: {
    type: Array,
    default: () => [{
      data: [0, 0, 0, 0, 0, 0, 0],
    }],
  },
})

const chartOptions = computed(() => {
  const currentTheme = vuetifyTheme.current.value.colors
  const variableTheme = vuetifyTheme.current.value.variables
  const labelPrimaryColor = `rgba(${ hexToRgb(currentTheme.primary) },0.2)`
  const labelColor = `rgba(${ hexToRgb(currentTheme['on-surface']) },${ variableTheme['disabled-opacity'] })`

  return {
    chart: {
      height: 162,
      type: 'bar',
      parentHeightOffset: 0,
      toolbar: { show: false },
    },
    plotOptions: {
      bar: {
        barHeight: '80%',
        columnWidth: '30%',
        startingShape: 'rounded',
        endingShape: 'rounded',
        borderRadius: 6,
        distributed: true,
      },
    },
    tooltip: { enabled: false },
    grid: {
      show: false,
      padding: {
        top: -20,
        bottom: -12,
        left: -10,
        right: 0,
      },
    },
    colors: [
      labelPrimaryColor,
      labelPrimaryColor,
      labelPrimaryColor,
      labelPrimaryColor,
      currentTheme.primary,
      labelPrimaryColor,
      labelPrimaryColor,
    ],
    dataLabels: { enabled: false },
    legend: { show: false },
    xaxis: {
      categories: ['S','M','T','W','T','F','S'],
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: {
        style: {
          colors: labelColor,
          fontSize: '13px',
          fontFamily: 'Public sans',
        },
      },
    },
    yaxis: { labels: { show: false } },
    states: { hover: { filter: { type: 'none' } } },
  }
})
</script>

<template>
  <VCard>
    <VCardText class="d-flex justify-space-between">
      <!-- Left Section -->
      <div class="d-flex flex-column">
        <div class="mb-auto">
          <h5 class="text-h5 text-no-wrap mb-2">
            Total Followers
          </h5>
          <div class="text-body-1">
            Weekly Overview
          </div>
        </div>

        <div>
          <h5 class="text-h3 mb-2">
            {{ totalFollowers }}
          </h5>
          <VChip
            label
            color="success"
            size="small"
          >
            {{ growth }}
          </VChip>
        </div>
      </div>

      <!-- Right Section (Chart) -->
      <div>
        <VueApexCharts
          :options="chartOptions"
          :series="series"
          :height="162"
        />
      </div>
    </VCardText>
  </VCard>
</template>
