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
          type="2d"
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

interface GoldAPIResponse {
  status: number
  msg: string
  result: Array<{
    type: string
    typename: string
    price: string
    openingprice: string
    maxprice: string
    minprice: string
    changepercent: string
    lastclosingprice: string
    tradeamount: string
    updatetime: string
  }>
}

const goldPriceService = {
  getCurrentPrices: async (): Promise<CurrentPrices> => {
    try {
      const apiKey = import.meta.env.VITE_GOLD_API_KEY
      
      console.log('环境变量:', { 
        apiKey: apiKey ? apiKey.substring(0, 8) + '...' : 'undefined'
      })
      
      if (!apiKey) {
        console.error('API key 未配置')
        throw new Error('API key not configured')
      }
      
      // 使用原始 API URL（需要在小程序后台配置合法域名）
      const url = `https://api.jisuapi.com/gold/shgold?appkey=${apiKey}`
      console.log('请求 URL:', url)
      
      // 使用 uni.request 替代 fetch（支持小程序和 H5）
      const response = await new Promise<{ statusCode: number; data: GoldAPIResponse }>((resolve, reject) => {
        uni.request({
          url,
          method: 'GET',
          success: (res) => {
            resolve({ statusCode: res.statusCode, data: res.data as GoldAPIResponse })
          },
          fail: (err) => {
            reject(err)
          }
        })
      })
      
      console.log('响应状态:', response.statusCode)
      console.log('API 返回数据:', JSON.stringify(response.data, null, 2))
      
      if (response.data.status !== 0) {
        console.error('API 返回错误:', response.data.msg)
        throw new Error(response.data.msg || '获取金价失败')
      }
      
      // 从 API 结果中提取需要的金价数据
      const result = response.data.result
      console.log('金价数据数量:', result.length)
      
      // 查找 AU99.99（足金 999）
      const au9999Item = result.find(item => item.type === 'AU99.99')
      console.log('AU99.99 数据:', au9999Item)
      
      // 查找 Au99.95（近似足金 990）
      const au999Item = result.find(item => item.type === 'Au99.95')
      console.log('Au99.95 数据:', au999Item)
      
      // 查找 Au100g（足金 100G）
      const au100Item = result.find(item => item.type === 'Au100g')
      console.log('Au100g 数据:', au100Item)
      
      // 计算国际金价（使用 Au(T+D) 作为参考，转换为美元/盎司）
      const auTDItem = result.find(item => item.type === 'Au(T+D)')
      const internationalPrice = auTDItem ? (parseFloat(auTDItem.price) * 7.2).toFixed(0) : '0'
      console.log('国际金价:', internationalPrice)
      
      const prices = {
        au9999: { 
          name: au9999Item?.typename || '足金 999', 
          price: au9999Item?.price || '0'
        },
        au999: { 
          name: au999Item?.typename || '足金 990', 
          price: au999Item?.price || '0'
        },
        au100: { 
          name: au100Item?.typename || '足金 999.9', 
          price: au100Item?.price || '0'
        },
        international: { 
          name: '国际金价', 
          price: internationalPrice,
          unit: ' 美元/盎司'
        }
      }
      
      console.log('最终价格:', prices)
      return prices
    } catch (error) {
      console.error('获取金价失败:', error)
      // 出错时返回默认值
      return {
        au9999: { name: '足金 999', price: '0' },
        au999: { name: '足金 990', price: '0' },
        au100: { name: '足金 999.9', price: '0' },
        international: { name: '国际金价', price: '0', unit: ' 美元/盎司' }
      }
    }
  },
  getPriceTrend: (currentPrice: number, previousPrice?: number): PriceTrend => {
    if (!previousPrice) {
      // 如果没有之前的价格，随机生成趋势
      const isUp = Math.random() > 0.5
      const change = (Math.random() * 2).toFixed(2)
      return {
        trend: isUp ? 'up' : 'down',
        direction: isUp ? '↑' : '↓',
        change
      }
    }
    
    // 计算涨跌幅
    const changePercent = ((currentPrice - previousPrice) / previousPrice * 100).toFixed(2)
    const isUp = parseFloat(changePercent) > 0
    
    return {
      trend: isUp ? 'up' : 'down',
      direction: isUp ? '↑' : '↓',
      change: Math.abs(parseFloat(changePercent)).toFixed(2)
    }
  }
}

const goldPrices = ref<CurrentPrices | null>(null)
const loading = ref(true)
const lastUpdated = ref('')
const priceTrend = ref<PriceTrend | null>(null)
const priceHistory = ref<PricePoint[]>([])
let chartInstance: any = null
let chartInitializing = false
let timer: ReturnType<typeof setInterval> | null = null

const initChart = () => {
  if (chartInstance) return;

  // #ifdef H5
  const chartElement = document.getElementById('goldPriceChart')

  if (!chartElement) {
    chartInitializing = false
    return
  }

  chartInstance = echarts.init(chartElement as HTMLElement)
  chartInitializing = false
  updateChart()
  // #endif

  // #ifndef H5
  // 小程序平台使用 uni.createSelectorQuery
  const query = uni.createSelectorQuery()
  query.select('#goldPriceChart')
    .fields({ node: true, size: true })
    .exec((res: any) => {
      if (!res[0]) {
        chartInitializing = false
        return
      }

      const canvas = res[0]
      const ctx = canvas.getContext('2d')
      const dpr = uni.getSystemInfoSync().pixelRatio
      
      canvas.width = res[0].width * dpr
      canvas.height = res[0].height * dpr
      ctx.scale(dpr, dpr)
      
      chartInstance = echarts.init(canvas as any, null, {
        width: res[0].width,
        height: res[0].height,
        devicePixelRatio: dpr
      })
      
      chartInitializing = false
      updateChart()
    })
  // #endif
}

const ensureChartInitialized = () => {
  if( chartInstance || chartInitializing || priceHistory.value.length <= 1) return;
  chartInitializing = true
  nextTick(() => {
    initChart()
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

let previousPrice: number | undefined

const fetchGoldPrices = async () => {
  console.log('=== 开始获取金价 ===')
  loading.value = true
  
  try {
    const prices = await goldPriceService.getCurrentPrices()
    console.log('获取到价格:', prices)
    const currentPrice = parseFloat(prices.au9999.price)
    const trend = goldPriceService.getPriceTrend(currentPrice, previousPrice)
    
    // 更新之前的价格
    previousPrice = currentPrice
    
    goldPrices.value = prices
    priceTrend.value = trend
    lastUpdated.value = new Date().toLocaleString()
    loading.value = false
    
    const currentTime = new Date().toLocaleTimeString()
    
    priceHistory.value = [...priceHistory.value, { time: currentTime, price: currentPrice }].slice(-10)
    
    ensureChartInitialized()
    if (chartInstance) {
      updateChart()
    }
  } catch (error) {
    console.error('获取金价失败:', error)
    loading.value = false
  }
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
  
  timer = setInterval(() => {
    fetchGoldPrices()
  }, 5 * 60 * 1000) // 5 分钟刷新一次
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
