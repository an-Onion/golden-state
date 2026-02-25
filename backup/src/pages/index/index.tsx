import React, { useState, useEffect } from 'react'
import { View, Text, Button } from '@tarojs/components'
import goldPriceService from '../../utils/gold-price-service'
import GoldPriceChart from '../../components/GoldPriceChart'
import './index.css'

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

  const fetchGoldPrices = () => {
    setLoading(true)
    setTimeout(() => {
      const prices = goldPriceService.getCurrentPrices()
      const trend = goldPriceService.getPriceTrend()
      
      setGoldPrices(prices)
      setPriceTrend(trend)
      setLastUpdated(new Date().toLocaleString())
      setLoading(false)
      
      const currentTime = new Date().toLocaleTimeString()
      const currentPrice = parseFloat(prices.au9999.price)
      setPriceHistory(prev => {
        const newHistory = [...prev, { time: currentTime, price: currentPrice }]
        return newHistory.slice(-10)
      })
    }, 500)
  }

  useEffect(() => {
    fetchGoldPrices()
    const interval = setInterval(fetchGoldPrices, 5000)
    return () => clearInterval(interval)
  }, [])

  const handleRefresh = () => {
    fetchGoldPrices()
  }

  return (
    <View className="container">
      <Text className="title">实时金价查询</Text>
      
      <View className="price-card">
        {loading ? (
          <Text className="price-label">正在获取金价...</Text>
        ) : (
          <>
            <Text className="price-label">当前金价:</Text>
            
            {goldPrices && (
              <View className="price-list">
                <View className="price-row">
                  <Text className="price-name">{goldPrices.au9999.name}</Text>
                  <Text className="price-value">¥{goldPrices.au9999.price}/克</Text>
                </View>
                
                <View className="price-row">
                  <Text className="price-name">{goldPrices.au999.name}</Text>
                  <Text className="price-value">¥{goldPrices.au999.price}/克</Text>
                </View>
                
                <View className="price-row">
                  <Text className="price-name">{goldPrices.au100.name}</Text>
                  <Text className="price-value">¥{goldPrices.au100.price}/克</Text>
                </View>
                
                <View className="price-row">
                  <Text className="price-name">{goldPrices.international.name}</Text>
                  <Text className="price-value">{goldPrices.international.price}{goldPrices.international.unit}</Text>
                </View>
              </View>
            )}
            
            {priceTrend && (
              <View className={priceTrend.trend === 'up' ? 'trend-up' : 'trend-down'}>
                <Text className={priceTrend.trend === 'up' ? 'trend-value-up' : 'trend-value-down'}>
                  {priceTrend.direction}{priceTrend.change}%
                </Text>
                <Text className="trend-text">
                  {priceTrend.trend === 'up' ? '价格上涨' : '价格下跌'}
                </Text>
              </View>
            )}
            
            <Text className="last-updated">最后更新: {lastUpdated}</Text>
          </>
        )}
      </View>
      
      <View className="chart-section">
        <Text className="chart-title">金价趋势图</Text>
        {priceHistory.length > 1 ? (
          <View className="chart-container">
            <GoldPriceChart 
              data={priceHistory} 
              width={280} 
              height={180} 
              canvasId="goldPriceChart"
            />
          </View>
        ) : (
          <View className="chart-placeholder">
            <Text className="chart-placeholder-text">数据收集中的图表</Text>
          </View>
        )}
      </View>
      
      <Button className="refresh-button" onClick={handleRefresh}>
        刷新价格
      </Button>
      
      <View className="notice">
        <Text className="notice-text">注意：此为实时金价参考，实际购买价格请以银行柜台为准</Text>
      </View>
    </View>
  )
}

export default Index