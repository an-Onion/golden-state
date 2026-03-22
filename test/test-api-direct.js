const https = require('https');

// 测试 API 调用
const apiKey = '400fa5c1770666fc';
const apiUrl = 'https://api.jisuapi.com/gold/shgold';

console.log('测试 API 调用...');
console.log('API URL:', `${apiUrl}?appkey=${apiKey}`);

https.get(`${apiUrl}?appkey=${apiKey}`, (res) => {
  console.log('响应状态码:', res.statusCode);
  
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const jsonData = JSON.parse(data);
      console.log('\n=== API 返回数据 ===');
      console.log('status:', jsonData.status);
      console.log('msg:', jsonData.msg);
      console.log('\n=== 金价数据 ===');
      
      if (jsonData.status === 0 && jsonData.result) {
        jsonData.result.forEach(item => {
          console.log(`${item.typename} (${item.type}): ¥${item.price}`);
        });
        
        console.log('\n=== 需要提取的数据 ===');
        const au9999 = jsonData.result.find(item => item.type === 'AU99.99');
        const au9995 = jsonData.result.find(item => item.type === 'Au99.95');
        const au100g = jsonData.result.find(item => item.type === 'Au100g');
        
        console.log('AU99.99:', au9999 ? `¥${au9999.price}` : '未找到');
        console.log('Au99.95:', au9995 ? `¥${au9995.price}` : '未找到');
        console.log('Au100g:', au100g ? `¥${au100g.price}` : '未找到');
      } else {
        console.log('API 返回错误');
        console.log('原始数据:', data.substring(0, 500));
      }
    } catch (error) {
      console.error('解析 JSON 失败:', error);
      console.log('原始数据:', data.substring(0, 500));
    }
  });
}).on('error', (err) => {
  console.error('请求失败:', err.message);
});
