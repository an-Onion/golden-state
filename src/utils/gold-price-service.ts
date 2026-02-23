// Define TypeScript interfaces
interface GoldType {
  name: string;
  price: string;
  unit: string;
}

interface CurrentPrices {
  au9999: GoldType;
  au999: GoldType;
  au100: GoldType;
  international: GoldType;
}

interface HistoricalPrices {
  dates: string[];
  prices: string[];
}

interface PriceTrend {
  trend: 'up' | 'down';
  change: string;
  direction: string;
}

// Mock API service for gold prices
const goldPriceService = {
  // Fetch current gold prices from various sources
  getCurrentPrices: (): CurrentPrices => {
    const basePrice = 480 + Math.random() * 20; // Base price between 480-500
    return {
      au9999: {
        name: "黄金9999",
        price: (basePrice + 5).toFixed(2),
        unit: "元/克"
      },
      au999: {
        name: "黄金999",
        price: (basePrice + 2).toFixed(2),
        unit: "元/克"
      },
      au100: {
        name: "足金",
        price: (basePrice).toFixed(2),
        unit: "元/克"
      },
      international: {
        name: "国际金价",
        price: (62.5 + Math.random() * 2).toFixed(2),
        unit: "美元/盎司"
      }
    };
  },

  // Get historical prices (mock data)
  getHistoricalPrices: (): HistoricalPrices => {
    const basePrice = 480 + Math.random() * 10;
    const dates: string[] = [];
    const prices: string[] = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      dates.push(`${date.getMonth() + 1}-${date.getDate()}`);
      prices.push((basePrice + (Math.random() - 0.5) * 5).toFixed(2));
    }
    
    return {
      dates,
      prices
    };
  },

  // Get price trend
  getPriceTrend: (): PriceTrend => {
    const trend: 'up' | 'down' = Math.random() > 0.5 ? 'up' : 'down';
    const change = (Math.random() * 2).toFixed(2);
    return {
      trend,
      change,
      direction: trend === 'up' ? '+' : '-'
    };
  }
};

export default goldPriceService;