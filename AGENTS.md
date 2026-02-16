# AGENTS.md - 代理编程指南

本文档为智能代理提供项目开发指南。

## 1. 项目概述

- **项目名称**: 支出记账本 (Expense Tracker)
- **项目类型**: 纯静态网站 (HTML/CSS/JS)
- **核心功能**: 记录支出、分类管理、统计分析与可视化
- **技术栈**: 原生 JavaScript (ES6+), CSS3, HTML5
- **依赖**: ApexCharts (图表), Grid.js (表格)

## 2. 构建与运行

### 运行项目

本项目为纯静态网站，无需构建步骤：

```bash
# 直接用浏览器打开 index.html
# 或使用任意静态服务器
npx serve .
# 或
python -m http.server 8080
```

### 代码质量工具

由于是纯静态项目，无自动化构建工具。建议：

- **HTML**: 使用 HTML 验证器检查语法
- **CSS**: 使用 CSS 验证器检查
- **JavaScript**: 使用 ESLint 检查代码质量

```bash
# 安装 ESLint
npm init -y
npm install eslint --save-dev
npx eslint js/**/*.js
```

### 测试

本项目暂无自动化测试框架。如需测试：

- 手动在浏览器中测试功能
- 使用 Chrome DevTools 进行调试
- 可引入 Jest 进行单元测试

## 3. 代码风格指南

### 3.1 文件结构

```
simple-bill/
├── index.html          # 主页面
├── SPEC.md             # 规格文档
├── css/
│   └── style.css      # 样式文件
├── js/
│   ├── app.js         # 主逻辑模块
│   ├── data.js        # 数据处理模块
│   ├── chart.js       # 图表渲染模块
│   └── ui.js          # UI 组件模块
└── data/              # 数据目录
    ├── categories.json # 分类配置
    └── expenses.json  # 支出数据
```

### 3.2 模块模式

项目使用 **IIFE (立即调用函数表达式)** 模块模式：

```javascript
const AppModule = (function() {
    // 私有变量
    let privateVar = null;

    // 私有函数
    function privateFunction() {
        // ...
    }

    // 公共 API
    return {
        init,
        publicMethod
    };
})();
```

### 3.3 命名规范

| 类型 | 命名规则 | 示例 |
|------|----------|------|
| 变量 | camelCase | `currentData`, `expenseList` |
| 常量 | UPPER_SNAKE_CASE | `DEFAULT_CATEGORIES` |
| 函数 | camelCase | `initApp()`, `formatAmount()` |
| 模块 | PascalCase | `AppModule`, `DataModule` |
| DOM 元素 | 驼峰 + 前缀 | `elements.expenseList` |
| CSS 类 | 小写连字符 | `.expense-card`, `.btn-primary` |

### 3.4 代码格式

- **缩进**: 4 空格
- **分号**: 语句末尾使用分号
- **引号**: 字符串使用单引号 `'`
- **花括号**: 使用 1TBS 风格

```javascript
// 正确示例
function formatAmount(amount) {
    const absAmount = Math.abs(amount);
    return '¥' + absAmount.toLocaleString('zh-CN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}
```

### 3.5 注释规范

使用 JSDoc 风格的注释：

```javascript
/**
 * 格式化金额显示
 * @param {number} amount - 金额
 * @returns {string} 格式化后的金额字符串
 */
function formatAmount(amount) {
    // ...
}
```

关键位置添加中文注释说明功能。

### 3.6 导入顺序

```javascript
// 1. 外部库 (ApexCharts, Grid.js 等)
// 2. 项目内部模块
// 3. 配置/常量
```

HTML 中的脚本加载顺序（必须按顺序）：

```html
<script src="js/data.js"></script>      <!-- 数据模块 -->
<script src="js/ui.js"></script>        <!-- UI 模块 -->
<script src="js/chart.js"></script>      <!-- 图表模块 -->
<script src="js/app.js"></script>        <!-- 主逻辑 -->
```

### 3.7 类型规范

JavaScript 为动态类型语言，建议：

- 使用有意义的变量名表达意图
- 对复杂对象添加 JSDoc 类型注释
- 使用 `parseInt()`, `parseFloat()` 进行类型转换
- 使用 `typeof` 进行类型检查

### 3.8 错误处理

```javascript
// 使用 try-catch 处理异步操作
async function loadDataFromServer() {
    try {
        const response = await fetch(`data/${fileName}`);
        if (response.ok) {
            const data = await response.json();
            // 处理数据
        }
    } catch (error) {
        console.error('加载数据失败:', error);
        UIModule.showToast('数据加载失败');
    }
}
```

- 使用 `try-catch` 捕获异步错误
- 使用 `console.error` 记录错误信息
- 通过 Toast 组件向用户展示错误

### 3.9 CSS 规范

- 使用 **CSS 变量** 统一管理颜色、间距等
- 使用 **BEM 命名** (如 `.block__element--modifier`)
- 使用 **4 空格** 缩进
- 属性按功能分组：位置 → 尺寸 → 样式 → 动画

```css
/* 正确示例 */
.expense-card {
    /* 布局 */
    display: flex;
    align-items: center;
    
    /* 尺寸 */
    padding: var(--space-md);
    
    /* 样式 */
    background: var(--color-card);
    border-radius: var(--radius-lg);
    
    /* 动画 */
    transition: all var(--transition-normal);
}
```

### 3.10 数据格式

支出记录 JSON 格式：

```json
{
    "expenses": [
        {
            "id": "uuid-string",
            "date": "2024-01-15",
            "amount": -150.00,
            "type": "expense",
            "category1": "餐饮",
            "category2": "午餐",
            "remark": "公司楼下的面馆"
        }
    ]
}
```

- `type` 字段: `expense`(支出) | `refund`(退款) | `income`(收入)
- 金额: 负数表示支出/退款，正数表示收入

## 4. 开发流程

### 4.1 修改步骤

1. 阅读 SPEC.md 了解功能需求
2. 找到对应的模块文件进行修改
3. 在浏览器中测试功能
4. 检查是否影响其他模块

### 4.2 调试技巧

- 使用 Chrome DevTools Console 查看日志
- 使用 Network 面板检查数据加载
- 使用 Elements 面板检查 DOM 结构

## 5. 注意事项

- 本项目为纯前端静态项目，无后端依赖
- 数据存储在浏览器内存中，刷新页面会重置
- 导出/导入功能用于数据持久化
- 分类颜色定义在 `data.js` 的 `defaultCategoryColors` 对象中

## 6. 参考资源

- [ApexCharts 文档](https://apexcharts.com/docs/)
- [Grid.js 文档](https://gridjs.io/docs/)
- [MDN Web Docs](https://developer.mozilla.org/)
