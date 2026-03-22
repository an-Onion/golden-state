# 测试脚本说明

本文件夹包含所有用于调试和测试的脚本。

## 测试脚本列表

### 1. test-api-direct.js
**用途**: 直接使用 Node.js HTTP 模块测试 API 接口  
**运行方式**: `node test/test-api-direct.js`  
**功能**: 
- 测试金价 API 是否可访问
- 验证 API 返回的数据格式
- 检查数据解析是否正确

### 2. test-api.js
**用途**: 使用 Playwright 测试浏览器中的 API 调用  
**运行方式**: `node test/test-api.js`  
**功能**:
- 打开浏览器访问页面
- 捕获控制台日志
- 检查页面是否显示价格
- 保存截图

### 3. test-debug-prices.js
**用途**: 详细调试页面价格显示  
**运行方式**: `node test/test-debug-prices.js`  
**功能**:
- 捕获所有控制台消息
- 检查网络请求
- 验证页面数据
- 保存调试截图

### 4. test-check-console.js
**用途**: 检查浏览器控制台输出  
**运行方式**: `node test/test-check-console.js`  
**功能**:
- 捕获所有控制台日志
- 检测 API 请求和响应
- 检查页面显示的价格
- 识别是否为 0 元价格

### 5. test-final-check.js
**用途**: 最终完整检查  
**运行方式**: `node test/test-final-check.js`  
**功能**:
- 完整的浏览器调试
- 保存所有控制台日志到 JSON 文件
- 检查价格显示
- 保存最终截图

## 前置条件

运行 Playwright 测试脚本需要安装 Playwright：

```bash
# 全局安装
npm install -g @playwright/test
playwright install chromium
```

## 使用建议

1. **快速测试 API**: 使用 `test-api-direct.js`（不需要浏览器）
2. **调试浏览器问题**: 使用 `test-check-console.js` 或 `test-final-check.js`
3. **查看完整日志**: 运行测试后查看生成的 `console-logs.json` 文件

## 输出文件

测试运行后可能会生成以下文件：
- `*.png` - 页面截图
- `console-logs.json` - 控制台日志
- 其他调试信息文件
