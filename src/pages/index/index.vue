<template>
  <view class="container">
    <view class="title">实时金价查询</view>
    
    <view class="price-card">
      <view v-if="loading" class="loading">正在获取金价...</view>
      
      <view v-else class="price-content">
        <view class="price-list">
          <view class="price-row">
            <text class="price-name">{{ goldPrices?.au9999?.name }}</text>
            <text class="price-value">¥{{ goldPrices?.au9999?.price }}/克</text>
          </view>
          
          <view class="price-row">
            <text class="price-name">{{ goldPrices?.au999?.name }}</text>
            <text class="price-value">¥{{ goldPrices?.au999?.price }}/克</text>
          </view>
          
          <view class="price-row">
            <text class="price-name">{{ goldPrices?.au100?.name }}</text>
            <text class="price-value">¥{{ goldPrices?.au100?.price }}/克</text>
          </view>
          
          <view class="price-row">
            <text class="price-name">{{ goldPrices?.international?.name }}</text>
            <text class="price-value">{{ goldPrices?.international?.price }}{{ goldPrices?.international?.unit }}</text>
          </view>
        </view>
        
        <view v-if="priceTrend" :class="['trend', priceTrend.trend === 'up' ? 'trend-up' : 'trend-down']">
          <text :class="['trend-value', priceTrend.trend === 'up' ? 'trend-value-up' : 'trend-value-down']">
            {{ priceTrend.direction }}{{ priceTrend.change }}%
          </text>
          <text class="trend-text">
            {{ priceTrend.trend === 'up' ? '价格上涨' : '价格下跌' }}
          </text>
        </view>
        
        <text class="last-updated">最后更新: {{ lastUpdated }}</text>
      </view>
    </view>
    
    <view class="chart-section">
      <text class="chart-title">金价趋势图</text>
      <view v-if="priceHistory.length > 1" class="chart-container">
        <canvas 
          canvas-id="goldPriceChart" 
          id="goldPriceChart" 
          class="chart-canvas"
          @touchstart="touchHandler"
        />
      </view>
      <view v-else class="chart-placeholder">
        <text>数据收集中...</text>
      </view>
    </view>
    
    <button class="refresh-button" @click="handleRefresh">刷新价格</button>
    
    <view class="notice">
      <text class="notice-text">注意：此为实时金价参考，实际购买价格请以银行柜台为准</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import * as echarts from 'echarts'

interface PricePoint {
  time: string
  price: number
}

interface CurrentPrices {
  au9999: { name: string; price: string }
  au999: { name: string; price: string }
  au100: { name: string; price: string }
  international: { name: string; price: string; unit: string }
}

interface PriceTrend {
  trend: 'up' | 'down'
  direction: string
  change: string
}

const goldPriceService = {
  getCurrentPrices: (): CurrentPrices => {
    const basePrice = 785 + Math.random() * 10
    return {
      au9999: { name: '足金999', price: basePrice.toFixed(2) },
      au999: { name: '足金990', price: (basePrice - 5).toFixed(2) },
      au100: { name: '足金999.9', price: (basePrice + 3).toFixed(2) },
      international: { name: '国际金价', price: (basePrice * 7.2 + 50).toFixed(0), unit: ' 美元/盎司' }
    }
  },
  getPriceTrend: (): PriceTrend => {
    const isUp = Math.random() > 0.5
    const change = (Math.random() * 2).toFixed(2)
    return {
      trend: isUp ? 'up' : 'down',
      direction: isUp ? '↑' : '↓',
      change
    }
  }
}

const goldPrices = ref<CurrentPrices | null>(null)
const loading = ref(true)
const lastUpdated = ref('')
const priceTrend = ref<PriceTrend | null>(null)
const priceHistory = ref<PricePoint[]>([])
let chartInstance: any = null
let timer: ReturnType<typeof setInterval> | null = null

const initChart = () => {
  const query = uni.createSelectorQuery()
  query.select('#goldPriceChart')
    .fields({ node: true, size: true })
    .exec((res: any) => {
      if (res[0]) {
        const canvas = res[0]
        const ctx = canvas.getContext('2d')
        const dpr = uni.getSystemInfoSync().pixelRatio
        
        const width = res[0].width
        const height = res[0].height
        
        canvas.width = width * dpr
        canvas.height = height * dpr
        ctx.scale(dpr, dpr)
        
        chartInstance = echarts.init(canvas as any, null, {
          width,
          height,
          devicePixelRatio: dpr
        })
        
        updateChart()
      }
    })
}

const updateChart = () => {
  if (!chartInstance || priceHistory.value.length <= 1) return

  const prices = priceHistory.value.map(d => d.price)
  const minPrice = Math.min(...prices) * 0.995
  const maxPrice = Math.max(...prices) * 1.005

  const option = {
    tooltip: {
      trigger: 'axis',
      confine: true,
      formatter: (params: any) => {
        if (params && params[0]) {
          return `${params[0].name}<br/>¥${params[0].value}`
        }
        return ''
      }
    },
    grid: {
      left: 50,
      right: 20,
      top: 20,
      bottom: 40
    },
    xAxis: {
      type: 'category',
      data: priceHistory.value.map(d => {
        const parts = d.time.split(':')
        return parts.length >= 2 ? `${parts[0]}:${parts[1]}` : d.time
      }),
      axisLine: { lineStyle: { color: '#e8e8e8' } },
      axisLabel: { color: '#888888', fontSize: 10 }
    },
    yAxis: {
      type: 'value',
      min: minPrice,
      max: maxPrice,
      axisLine: { show: false },
      axisLabel: {
        color: '#888888',
        fontSize: 10,
        formatter: (val: number) => `¥${val.toFixed(0)}`
      },
      splitLine: { lineStyle: { color: '#e8e8e8' } }
    },
    series: [{
      data: priceHistory.value.map(d => d.price),
      type: 'line',
      smooth: true,
      symbol: 'circle',
      symbolSize: 6,
      lineStyle: { color: '#5AD8A6', width: 2 },
      itemStyle: { color: '#5AD8A6', borderColor: '#ffffff', borderWidth: 2 },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(90, 216, 166, 0.3)' },
            { offset: 1, color: 'rgba(90, 216, 166, 0.02)' }
          ]
        }
      }
    }]
  }

  chartInstance.setOption(option)
}

const fetchGoldPrices = () => {
  loading.value = true
  
  setTimeout(() => {
    const prices = goldPriceService.getCurrentPrices()
    const trend = goldPriceService.getPriceTrend()
    
    goldPrices.value = prices
    priceTrend.value = trend
    lastUpdated.value = new Date().toLocaleString()
    loading.value = false
    
    const currentTime = new Date().toLocaleTimeString()
    const currentPrice = parseFloat(prices.au9999.price)
    
    priceHistory.value = [...priceHistory.value, { time: currentTime, price: currentPrice }].slice(-10)
    
    if (priceHistory.value.length > 1) {
      updateChart()
    }
  }, 500)
}

const handleRefresh = () => {
  fetchGoldPrices()
}

const touchHandler = (e: any) => {
  if (chartInstance) {
    chartInstance.dispatchAction({ type: 'showTip', seriesIndex: 0 })
  }
}

onMounted(() => {
  fetchGoldPrices()
  
  setTimeout(() => {
    if (priceHistory.value.length > 1) {
      initChart()
    }
  }, 1000)
  
  timer = setInterval(() => {
    fetchGoldPrices()
  }, 5000)
})

onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
  }
  if (chartInstance) {
    chartInstance.dispose()
  }
})
</script>

<style lang="scss">
page {
  background-color: #ffffff;
}

.container {
  padding: 40rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 100vh;
  background-color: #ffffff;
}

.title {
  font-size: 48rpx;
  font-weight: bold;
  margin-bottom: 64rpx;
  color: #333333;
}

.price-card {
  width: 600rpx;
  padding: 40rpx;
  border: 1px solid #e0e0e0;
  border-radius: 16rpx;
  background-color: #f9f9f9;
  text-align: center;
  margin-bottom: 40rpx;
}

.loading {
  font-size: 28rpx;
  color: #666666;
}

.price-content {
  width: 100%;
}

.price-list {
  width: 100%;
}

.price-row {
  display: flex;
  justify-content: space-between;
  padding: 16rpx 0;
  border-bottom: 1px dashed #cccccc;
}

.price-name {
  font-size: 26rpx;
  color: #333333;
}

.price-value {
  font-size: 30rpx;
  font-weight: bold;
  color: #d4a017;
}

.trend {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 32rpx 0;
  padding: 24rpx;
  border-radius: 8rpx;
}

.trend-up {
  background-color: #e8f5e9;
  border: 1px solid #c8e6c9;
}

.trend-down {
  background-color: #ffebee;
  border: 1px solid #ffcdd2;
}

.trend-value {
  font-size: 32rpx;
  font-weight: bold;
  margin-right: 16rpx;
}

.trend-value-up {
  color: #4caf50;
}

.trend-value-down {
  color: #f44336;
}

.trend-text {
  font-size: 26rpx;
  color: #666666;
}

.last-updated {
  display: block;
  margin-top: 24rpx;
  font-size: 22rpx;
  color: #999999;
}

.chart-section {
  width: 600rpx;
  margin-bottom: 40rpx;
}

.chart-title {
  display: block;
  font-size: 32rpx;
  font-weight: bold;
  color: #333333;
  margin-bottom: 20rpx;
  text-align: center;
}

.chart-container {
  height: 400rpx;
  border: 1px solid #e0e0e0;
  border-radius: 8rpx;
  background-color: #ffffff;
  overflow: hidden;
}

.chart-canvas {
  width: 100%;
  height: 100%;
}

.chart-placeholder {
  height: 400rpx;
  display: flex;
  justify-content: center;
  align-items: center;
  border: 1px solid #e0e0e0;
  border-radius: 8rpx;
  background-color: #f9f9f9;
  color: #999999;
}

.refresh-button {
  width: 600rpx;
  height: 88rpx;
  line-height: 88rpx;
  background-color: #1890ff;
  color: #ffffff;
  border-radius: 8rpx;
  font-size: 28rpx;
  margin-bottom: 40rpx;
}

.notice {
  width: 600rpx;
  padding: 20rpx;
  background-color: #fffbe6;
  border: 1px solid #ffe58f;
  border-radius: 8rpx;
}

.notice-text {
  font-size: 22rpx;
  color: #666666;
  line-height: 1.6;
}
</style>
