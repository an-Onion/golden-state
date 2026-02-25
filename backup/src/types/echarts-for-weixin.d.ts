declare module 'echarts-for-weixin' {
  import { Component } from 'react';
  
  interface EcCanvasProps {
    canvasId: string;
    echarts: any;
    ec: {
      onInit: (canvas: any, width: number, height: number, dpr: number) => any;
    };
    style?: React.CSSProperties;
  }
  
  const EcCanvas: React.FC<EcCanvasProps>;
  export default EcCanvas;
}
