/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useRef, useState } from 'react';
import * as echarts from 'echarts';
import EcCanvas from 'echarts-for-weixin';

interface ChartProps {
  data: Array<{ time: string; price: number }>;
  width?: number;
  height?: number;
  canvasId: string;
}

const GoldPriceChart: React.FC<ChartProps> = ({ data, width = 280, height = 180, canvasId }) => {
  const chartRef = useRef<any>(null);
  const [ec, setEc] = useState<any>(null);

  useEffect(() => {
    const initChart = (canvas: any, chartWidth: number, chartHeight: number, chartDpr: number) => {
      const chart = echarts.init(canvas, null, {
        width: chartWidth,
        height: chartHeight,
        devicePixelRatio: chartDpr
      });
      canvas.setChart(chart);
      chartRef.current = chart;

      if (data && data.length > 1) {
        const option = {
          tooltip: {
            trigger: 'axis',
            confine: true,
            formatter: (params: any) => {
              if (params && params[0]) {
                return `${params[0].name}<br/>¥${params[0].value}`;
              }
              return '';
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
            data: data.map(d => {
              const parts = d.time.split(':');
              return parts.length >= 2 ? `${parts[0]}:${parts[1]}` : d.time;
            }),
            axisLine: {
              lineStyle: {
                color: '#e8e8e8'
              }
            },
            axisLabel: {
              color: '#888888',
              fontSize: 10
            }
          },
          yAxis: {
            type: 'value',
            axisLine: {
              show: false
            },
            axisLabel: {
              color: '#888888',
              fontSize: 10,
              formatter: (val: number) => `¥${val.toFixed(0)}`
            },
            splitLine: {
              lineStyle: {
                color: '#e8e8e8'
              }
            }
          },
          series: [{
            data: data.map(d => d.price),
            type: 'line',
            smooth: true,
            symbol: 'circle',
            symbolSize: 6,
            lineStyle: {
              color: '#5AD8A6',
              width: 2
            },
            itemStyle: {
              color: '#5AD8A6',
              borderColor: '#ffffff',
              borderWidth: 2
            },
            areaStyle: {
              color: {
                type: 'linear',
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [
                  { offset: 0, color: 'rgba(90, 216, 166, 0.3)' },
                  { offset: 1, color: 'rgba(90, 216, 166, 0.02)' }
                ]
              }
            }
          }]
        };

        chart.setOption(option);
      }

      return chart;
    };

    setEc({ onInit: initChart });
  }, [data]);

  if (!data || data.length <= 1 || !ec) {
    return null;
  }

  return (
    <EcCanvas
      canvasId={canvasId}
      echarts={echarts}
      ec={ec}
      style={{ width: `${width}rpx`, height: `${height}rpx` }}
    />
  );
};

export default GoldPriceChart;