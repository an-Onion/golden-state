const { chromium } = require('@playwright/test');

(async () => {
  console.log('启动浏览器测试 API 调用...');
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  // 捕获控制台消息
  page.on('console', msg => {
    const text = msg.text();
    if (text.includes('获取金价') || text.includes('API') || text.includes('error') || text.includes('失败')) {
      console.log('CONSOLE:', msg.type(), text);
    }
  });
  
  page.on('pageerror', error => {
    console.log('PAGE ERROR:', error.message);
  });
  
  console.log('正在导航到页面...');
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle', timeout: 30000 });
  
  console.log('等待 10 秒观察 API 调用...');
  await page.waitForTimeout(10000);
  
  // 检查页面是否显示价格
  const priceInfo = await page.evaluate(() => {
    const priceElements = document.querySelectorAll('.price-value');
    const prices = Array.from(priceElements).map(el => el.textContent);
    
    const loadingElement = document.querySelector('.loading');
    const isStillLoading = !!loadingElement;
    
    return {
      prices,
      isStillLoading,
      hasPrices: prices.length > 0 && prices.some(p => p.includes('¥'))
    };
  });
  
  console.log('价格信息:', JSON.stringify(priceInfo, null, 2));
  
  // 截图
  await page.screenshot({ path: 'api-test-screenshot.png', fullPage: true });
  console.log('截图已保存：api-test-screenshot.png');
  
  await browser.close();
  console.log('测试完成');
})();
