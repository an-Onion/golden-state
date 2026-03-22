const { chromium } = require('@playwright/test');

(async () => {
  console.log('启动浏览器调试...');
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  // 捕获所有控制台消息
  page.on('console', msg => {
    console.log('CONSOLE:', msg.type(), msg.text());
  });
  
  page.on('pageerror', error => {
    console.log('PAGE ERROR:', error.message);
  });
  
  console.log('正在导航到页面...');
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle', timeout: 30000 });
  
  console.log('等待 8 秒...');
  await page.waitForTimeout(8000);
  
  // 检查网络请求
  const requests = [];
  page.on('request', request => {
    if (request.url().includes('jisuapi')) {
      requests.push({
        url: request.url(),
        method: request.method()
      });
      console.log('API 请求:', request.url());
    }
  });
  
  // 检查页面数据
  const pageData = await page.evaluate(() => {
    const priceElements = document.querySelectorAll('.price-value');
    const prices = Array.from(priceElements).map(el => ({
      text: el.textContent,
      class: el.className
    }));
    
    const loadingElement = document.querySelector('.loading');
    
    return {
      prices,
      isLoading: !!loadingElement,
      url: window.location.href
    };
  });
  
  console.log('页面数据:', JSON.stringify(pageData, null, 2));
  
  // 截图
  await page.screenshot({ path: 'debug-prices.png', fullPage: true });
  console.log('截图已保存：debug-prices.png');
  
  await browser.close();
  console.log('调试完成');
})();
