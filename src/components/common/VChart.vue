<template>
  <div ref="chartRef" :style="{ width, height }" />
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import * as echarts from 'echarts'

interface Props {
  /** ECharts 配置项 */
  option: Record<string, unknown>
  width?: string
  height?: string
  loading?: boolean
  settings?: {
    autoresize?: boolean
  }
}

const props = withDefaults(defineProps<Props>(), {
  width: '100%',
  height: '300px',
  loading: false,
  settings: () => ({ autoresize: true }),
})

const chartRef = ref<HTMLDivElement>()
let chartInstance: echarts.ECharts | null = null

function initChart() {
  if (!chartRef.value) return
  chartInstance = echarts.init(chartRef.value)
  chartInstance.setOption(props.option as echarts.EChartsOption)
}

function updateChart() {
  if (!chartInstance) return
  chartInstance.setOption(props.option as echarts.EChartsOption, true)
}

function resizeChart() {
  chartInstance?.resize()
}

onMounted(() => {
  initChart()
  if (props.settings?.autoresize) {
    window.addEventListener('resize', resizeChart)
  }
})

onUnmounted(() => {
  window.removeEventListener('resize', resizeChart)
  chartInstance?.dispose()
  chartInstance = null
})

watch(() => props.option, updateChart, { deep: true })
</script>
