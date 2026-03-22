const { chromium } = require('@playwright/test');

(async () => {
  console.log('=== 启动浏览器调试 ===\n');
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  // 捕获所有控制台消息
  const consoleLogs = [];
  page.on('console', msg => {
    const text = msg.text();
    consoleLogs.push({ type: msg.type(), text });
    // 显示所有日志
    console.log('CONSOLE:', msg.type(), text);
  });
  
  page.on('pageerror', error => {
    console.log('PAGE ERROR:', error.message);
  });
  
  // 捕获网络请求
  page.on('request', request => {
    const url = request.url();
    if (url.includes('api/gold') || url.includes('jisuapi')) {
      console.log('\n>>> API 请求:', url);
    }
  });
  
  page.on('response', response => {
    const url = response.url();
    if (url.includes('api/gold') || url.includes('jisuapi')) {
      console.log('<<< API 响应状态:', response.status());
    }
  });
  
  console.log('正在导航到页面...\n');
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle', timeout: 30000 });
  
  console.log('\n等待 10 秒让页面加载和 API 调用...\n');
  await page.waitForTimeout(10000);
  
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
  
  // 检查是否有 0 元的价格
  const hasZeroPrices = pageData.prices.some(p => p.text && p.text.includes('¥0'));
  if (hasZeroPrices) {
    console.log('\n⚠️  警告：发现价格为 0 元！');
  } else {
    console.log('\n✅ 价格显示正常');
  }
  
  // 截图
  await page.screenshot({ path: 'final-check.png', fullPage: true });
  console.log('\n截图已保存：final-check.png');
  
  // 保存日志
  const fs = require('fs');
  fs.writeFileSync('console-logs.json', JSON.stringify(consoleLogs, null, 2));
  console.log('日志已保存：console-logs.json');
  
  await browser.close();
  console.log('\n=== 调试完成 ===');
})();
