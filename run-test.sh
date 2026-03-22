#!/bin/bash

# 测试运行脚本
# 用法：./run-test.sh [test-name]

if [ -z "$1" ]; then
    echo "可用的测试脚本:"
    echo "  1. test-api-direct      - 直接测试 API（不需要浏览器）"
    echo "  2. test-api             - 使用 Playwright 测试 API 调用"
    echo "  3. test-debug-prices    - 调试价格显示"
    echo "  4. test-check-console   - 检查控制台输出"
    echo "  5. test-final-check     - 完整检查（包含日志保存）"
    echo ""
    echo "用法：./run-test.sh <test-name>"
    echo "例如：./run-test.sh test-api-direct"
    exit 1
fi

cd "$(dirname "$0")"

echo "运行测试：$1"
echo "================================"

case "$1" in
    test-api-direct)
        node test/test-api-direct.js
        ;;
    test-api)
        node test/test-api.js
        ;;
    test-debug-prices)
        node test/test-debug-prices.js
        ;;
    test-check-console)
        node test/test-check-console.js
        ;;
    test-final-check)
        node test/test-final-check.js
        ;;
    *)
        echo "错误：未知的测试脚本 '$1'"
        echo "运行 './run-test.sh' 查看可用选项"
        exit 1
        ;;
esac

echo ""
echo "================================"
echo "测试完成"
