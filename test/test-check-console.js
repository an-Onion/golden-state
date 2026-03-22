const { chromium } = require('@playwright/test');

(async () => {
  console.log('启动浏览器调试...\n');
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  // 捕获所有控制台消息
  page.on('console', msg => {
    const text = msg.text();
    // 只显示我们关心的日志
    if (text.includes('环境变量') || 
        text.includes('请求 URL') || 
        text.includes('响应状态') ||
        text.includes('API 返回') ||
        text.includes('金价数据') ||
        text.includes('AU99.99') ||
        text.includes('最终价格') ||
        text.includes('失败') ||
        text.includes('error')) {
      console.log('CONSOLE:', msg.type(), text);
    }
  });
  
  page.on('pageerror', error => {
    console.log('PAGE ERROR:', error.message);
  });
  
  // 捕获网络请求
  page.on('request', request => {
    const url = request.url();
    if (url.includes('jisuapi')) {
      console.log('\n>>> 检测到 API 请求:', url);
    }
  });
  
  page.on('response', response => {
    const url = response.url();
    if (url.includes('jisuapi')) {
      console.log('<<< API 响应状态:', response.status());
    }
  });
  
  console.log('正在导航到页面...');
  await page.goto('http://localhost:5174', { waitUntil: 'networkidle', timeout: 30000 });
  
  console.log('\n等待 8 秒让页面加载和 API 调用...');
  await page.waitForTimeout(8000);
  
  // 检查页面显示的价格
  const pageData = await page.evaluate(() => {
    const priceElements = document.querySelectorAll('.price-value');
    const prices = Array.from(priceElements).map(el => ({
      text: el.textContent?.trim(),
      class: el.className
    }));
    
    const loadingElement = document.querySelector('.loading');
    
    return {
      prices,
      isLoading: !!loadingElement,
      url: window.location.href
    };
  });
  
  console.log('\n=== 页面显示的价格 ===');
  console.log(JSON.stringify(pageData, null, 2));
  
  // 截图
  await page.screenshot({ path: 'check-prices.png', fullPage: true });
  console.log('\n截图已保存：check-prices.png');
  
  await browser.close();
  console.log('\n调试完成');
})();
