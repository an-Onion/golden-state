<template>
  <view class="ec-canvas-container">
    <canvas 
      canvas-id="chart" 
      id="chart" 
      class="ec-canvas"
      :style="{ width: width + 'px', height: height + 'px' }"
      @touchstart="touchStart"
      @touchmove="touchMove"
      @touchend="touchEnd"
    />
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'

const props = defineProps<{
  canvasId?: string
  echarts: any
  ec: {
    onInit: (canvas: any, width: number, height: number, dpr: number) => any
  }
  width?: number
  height?: number
}>()

const canvasRef = ref<any>(null)
const chartInstance = ref<any>(null)

onMounted(() => {
  const query = uni.createSelectorQuery()
  query.select('#chart')
    .fields({ node: true, size: true })
    .exec((res: any) => {
      if (res[0]) {
        const canvas = res[0]
        const ctx = canvas.getContext('2d')
        const dpr = uni.getSystemInfoSync().pixelRatio
        
        canvas.width = res[0].width * dpr
        canvas.height = res[0].height * dpr
        ctx.scale(dpr, dpr)
        
        const canvasWithChart = {
          ...canvas,
          setChart: (chart: any) => {
            chartInstance.value = chart
          },
          setTouchAction: () => {}
        }
        
        if (props.ec?.onInit) {
          props.ec.onInit(canvasWithChart, res[0].width, res[0].height, dpr)
        }
      }
    })
})

const touchStart = (e: any) => {
  if (chartInstance.value) {
    chartInstance.value.dispatchAction({ type: 'showTip', seriesIndex: 0 })
  }
}

const touchMove = () => {}

const touchEnd = () => {}
</script>

<style scoped>
.ec-canvas-container {
  width: 100%;
  height: 100%;
}
.ec-canvas {
  width: 100%;
  height: 100%;
}
</style>
