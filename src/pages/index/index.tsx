import React, { useState, useEffect } from 'react'
import { View, Text, Button } from '@tarojs/components'
import F2 from '@antv/f2'
import goldPriceService from '../../utils/gold-price-service'
import './index.css'

// Define TypeScript interfaces
interface GoldPrice {
  name: string;
  price: string;
  unit: string;
}

interface CurrentPrices {
  au9999: GoldPrice;
  au999: GoldPrice;
  au100: GoldPrice;
  international: GoldPrice;
}

interface PriceTrend {
  trend: 'up' | 'down';
  change: string;
  direction: string;
}

interface PricePoint {
  time: string;
  price: number;
}

const Index: React.FC = () => {
  const [goldPrices, setGoldPrices] = useState<CurrentPrices | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)
  const [priceTrend, setPriceTrend] = useState<PriceTrend | null>(null)
  const [priceHistory, setPriceHistory] = useState<PricePoint[]>([])

  // Function to fetch gold prices
  const fetchGoldPrices = async () => {
    setLoading(true)
    try {
      // Simulate API call with mock data
      setTimeout(() => {
        const prices = goldPriceService.getCurrentPrices()
        const trend = goldPriceService.getPriceTrend()
        
        setGoldPrices(prices)
        setPriceTrend(trend)
        setLastUpdated(new Date().toLocaleString())
        setLoading(false)
        
        // Add to price history
        const currentTime = new Date().toLocaleTimeString()
        const currentPrice = parseFloat(prices.au9999.price)
        setPriceHistory(prev => {
          const newHistory = [...prev, { time: currentTime, price: currentPrice }]
          // Keep only last 10 data points
          return newHistory.slice(-10)
        })
      }, 500)
    } catch (error) {
      console.error('Error fetching gold prices:', error)
      setLoading(false)
    }
  }

  useEffect(() => {
    // Initial load
    fetchGoldPrices()
    
    // Set up interval to simulate real-time updates
    const interval = setInterval(fetchGoldPrices, 5000)
    
    return () => clearInterval(interval)
  }, [])

  const handleRefresh = () => {
    fetchGoldPrices()
  }

  return (
    <View className='p-5 flex flex-col items-center min-h-screen bg-white'>
      <Text className='text-2xl font-bold mb-8 text-gray-800'>实时金价查询</Text>
      
      <View className='w-full max-w-xs p-5 border border-gray-300 rounded-lg bg-gray-50 text-center mb-5'>
        {loading ? (
          <Text className='text-lg text-gray-500'>正在获取金价...</Text>
        ) : (
          <>
            <Text className='text-base text-gray-600 block mb-3'>当前金价:</Text>
            
            {/* Display different gold types */}
            {goldPrices && (
              <View className='mb-3'>
                <View className='flex justify-between py-2 border-b border-dashed border-gray-300'>
                  <Text className='text-sm text-gray-700'>{goldPrices.au9999.name}</Text>
                  <Text className='text-base font-bold text-yellow-600'>¥{goldPrices.au9999.price}/克</Text>
                </View>
                
                <View className='flex justify-between py-2 border-b border-dashed border-gray-300'>
                  <Text className='text-sm text-gray-700'>{goldPrices.au999.name}</Text>
                  <Text className='text-base font-bold text-yellow-600'>¥{goldPrices.au999.price}/克</Text>
                </View>
                
                <View className='flex justify-between py-2 border-b border-dashed border-gray-300'>
                  <Text className='text-sm text-gray-700'>{goldPrices.au100.name}</Text>
                  <Text className='text-base font-bold text-yellow-600'>¥{goldPrices.au100.price}/克</Text>
                </View>
                
                <View className='flex justify-between py-2'>
                  <Text className='text-sm text-gray-700'>{goldPrices.international.name}</Text>
                  <Text className='text-base font-bold text-yellow-600'>{goldPrices.international.price}{goldPrices.international.unit}</Text>
                </View>
              </View>
            )}
            
            {/* Display trend */}
            {priceTrend && (
              <View className={`flex justify-center items-center my-4 p-3 rounded ${priceTrend.trend === 'up' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                <Text className={`font-bold mr-2 ${priceTrend.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                  {priceTrend.direction}{priceTrend.change}%
                </Text>
                <Text className='text-sm text-gray-600'>
                  {priceTrend.trend === 'up' ? '价格上涨' : '价格下跌'}
                </Text>
              </View>
            )}
            
            <Text className='text-xs text-gray-500 block mt-3'>最后更新: {lastUpdated}</Text>
          </>
        )}
      </View>
      
      {/* Chart Section */}
      <View className='w-full max-w-xs mb-5'>
        <Text className='block text-center text-sm font-medium text-gray-700 mb-2'>金价趋势图</Text>
        {priceHistory.length > 1 ? (
          <View 
            className='h-48 border border-gray-200 rounded bg-white p-2'
            id="gold-price-chart"
          >
            <Text className='text-gray-500 text-center block'>图表将在小程序中渲染</Text>
          </View>
        ) : (
          <View className='h-48 flex items-center justify-center border border-gray-200 rounded bg-gray-50'>
            <Text className='text-gray-500'>数据收集中的图表</Text>
          </View>
        )}
      </View>
      
      <Button className='bg-blue-500 text-white rounded p-3 mb-5 text-base' onClick={handleRefresh}>
        刷新价格
      </Button>
      
      <View className='p-4 bg-gray-100 rounded w-full max-w-xs text-center'>
        <Text className='text-sm text-gray-600'>注意：此为实时金价参考，实际购买价格请以银行柜台为准</Text>
      </View>
    </View>
  )
}

export default Index