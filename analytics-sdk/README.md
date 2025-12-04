# Codeless Analytics SDK

一个轻量级、无代码埋点的前端分析 SDK。自动追踪用户交互和页面浏览，无需手动为每个事件编写代码。

## 功能特性

- **自动追踪**: 自动捕获点击、页面浏览（包括 SPA 路由变化）和错误
- **数据加密**: 使用 AES 加密数据传输，防止明文暴露
- **可靠传输**: 使用 `navigator.sendBeacon` 确保页面关闭时数据也能发送
- **用户识别**: 自动生成并持久化唯一用户 ID (distinct_id)
- **会话管理**: 自动管理用户会话 (session_id)
- **框架无关**: 支持任何前端框架（Vanilla JS、Vue、React 等）
- **Vue 插件**: 提供专用的 Vue 2/3 插件，开箱即用
- **TypeScript 支持**: 完整的类型定义

## 安装

### 使用 NPM

```bash
npm install codeless-analytics-sdk
```

### 使用 Script 标签

直接在 HTML 中引入 UMD 包：

```html
<script src="path/to/dist/analytics.umd.js"></script>
```

## 快速开始

### 基础初始化

在应用入口处初始化 SDK：

```javascript
import analytics from 'codeless-analytics-sdk';

analytics.init({
  appId: 'your-app-id',
  serverUrl: 'http://localhost:3000/collect',
  debug: true,      // 开启调试日志
  autoTrack: true,  // 开启自动追踪（默认：true）
  encrypt: true     // 开启数据加密（默认：true）
});
```

## 配置选项

### 完整配置

```javascript
analytics.init({
  // 必需配置
  appId: 'your-app-id',           // 应用 ID，用于区分不同应用
  serverUrl: 'http://localhost:3000/collect', // 数据收集服务器地址
  
  // 可选配置
  autoTrack: true,                // 是否自动追踪（默认：true）
  debug: false,                   // 是否开启调试日志（默认：false）
  encrypt: true,                  // 是否加密数据（默认：true）
  bufferSize: 10,                 // 缓冲区大小，达到后自动发送（默认：10）
  flushInterval: 5000             // 自动发送间隔，毫秒（默认：5000）
});
```

### 配置说明

| 选项 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `appId` | string | **必需** | 应用标识符 |
| `serverUrl` | string | **必需** | 数据收集服务器 URL |
| `autoTrack` | boolean | `true` | 自动追踪点击、页面浏览、错误 |
| `debug` | boolean | `false` | 控制台输出调试信息 |
| `encrypt` | boolean | `true` | AES 加密数据传输 |
| `bufferSize` | number | `10` | 事件缓冲区大小 |
| `flushInterval` | number | `5000` | 自动发送间隔（毫秒） |

### 加密配置

**重要**：SDK 的 `encrypt` 配置必须与服务器端的 `ENABLE_ENCRYPTION` 配置保持一致！

| SDK 配置 | 服务器配置 | 说明 |
|----------|-----------|------|
| `encrypt: true` | `ENABLE_ENCRYPTION=true` | ✅ 数据加密传输 |
| `encrypt: false` | `ENABLE_ENCRYPTION=false` | ✅ 明文传输（仅开发环境） |
| `encrypt: true` | `ENABLE_ENCRYPTION=false` | ❌ 服务器无法解密 |
| `encrypt: false` | `ENABLE_ENCRYPTION=true` | ❌ 服务器解密失败 |

**生产环境建议**：
- SDK: `encrypt: true`
- 服务器: `ENABLE_ENCRYPTION=true`

**开发环境**（可选）：
- SDK: `encrypt: false`
- 服务器: `ENABLE_ENCRYPTION=false`

## Vue 集成

### Vue 2

```javascript
import Vue from 'vue';
import AnalyticsPlugin from 'codeless-analytics-sdk/integrations/vue';

Vue.use(AnalyticsPlugin, {
  appId: 'your-app-id',
  serverUrl: 'http://localhost:3000/collect',
  router: router, // 可选：传入 Vue Router 实例自动追踪路由
  encrypt: true
});
```

**在组件中使用**：

```vue
<script>
export default {
  methods: {
    trackPurchase() {
      this.$analytics.track('purchase', {
        amount: 99.99,
        currency: 'USD'
      });
    }
  }
}
</script>
```

### Vue 3

```javascript
import { createApp } from 'vue';
import AnalyticsPlugin from 'codeless-analytics-sdk/integrations/vue3';

const app = createApp(App);

app.use(AnalyticsPlugin, {
  appId: 'your-app-id',
  serverUrl: 'http://localhost:3000/collect',
  router: router, // 可选
  encrypt: true
});
```

**Options API**：

```vue
<script>
export default {
  methods: {
    trackEvent() {
      this.$analytics.track('custom_event', { key: 'value' });
    }
  }
}
</script>
```

**Composition API**：

```vue
<script setup>
import { inject } from 'vue';

const analytics = inject('analytics');

const trackEvent = () => {
  analytics.track('custom_event', { key: 'value' });
};
</script>
```

详细的 Vue 3 使用指南请查看 [VUE3_GUIDE.md](./VUE3_GUIDE.md)。

## 手动追踪

### 追踪自定义事件

```javascript
// 使用全局实例
import analytics from 'codeless-analytics-sdk';

analytics.track('button_click', {
  button_name: 'submit',
  page: 'checkout'
});

// 在 Vue 组件中
this.$analytics.track('purchase', {
  product_id: '12345',
  amount: 99.99
});
```

### 禁用自动追踪

如果只想手动追踪事件：

```javascript
analytics.init({
  appId: 'your-app-id',
  serverUrl: 'http://localhost:3000/collect',
  autoTrack: false  // 禁用自动追踪
});
```

## 自动追踪的事件

### 1. 页面浏览 (pageview)

自动追踪：
- 页面加载
- SPA 路由变化（如果传入了 router）

**事件属性**：
```javascript
{
  title: "页面标题",
  path: "/home",
  search: "?id=123",
  hash: "#section",
  url: "完整 URL",
  referrer: "来源页面"
}
```

### 2. 点击 (click)

自动追踪所有点击事件。

**事件属性**：
```javascript
{
  tag: "button",
  id: "submit-btn",
  className: "btn btn-primary",
  text: "提交",
  selector: "div > button#submit-btn",
  x: 100,
  y: 200
}
```

### 3. 错误 (error)

自动追踪：
- JavaScript 运行时错误
- 未处理的 Promise rejection

**事件属性**：
```javascript
{
  type: "unhandledrejection",  // 或 "runtime"
  message: "错误信息",
  stack: "错误堆栈",
  filename: "文件名",
  lineno: 123,
  colno: 45
}
```

## 开发

### 构建

生成 UMD 和 ESM 包到 `dist/` 目录：

```bash
npm run build
```

### 项目结构

```
analytics-sdk/
├── core/           # 核心追踪逻辑
│   └── tracker.js  # 队列、发送、配置管理
├── events/         # 自动追踪模块
│   ├── click.js    # 点击追踪
│   ├── pageView.js # 页面浏览追踪
│   └── error.js    # 错误追踪
├── integrations/   # 框架集成
│   ├── vue.js      # Vue 2 插件
│   └── vue3.js     # Vue 3 插件
├── utils/          # 工具函数
│   └── index.js
├── index.js        # 入口文件
└── dist/           # 构建输出
    ├── analytics.umd.js
    └── analytics.esm.js
```

## 与服务器配合使用

### 服务器配置

确保服务器端配置正确：

```bash
# analytics-server/.env
ENABLE_ENCRYPTION=true  # 必须与 SDK encrypt 配置一致
ENABLE_FEISHU_ALERTS=true  # 可选：错误自动报警到飞书
```

### 数据流

```
前端 SDK (加密) → 服务器 (解密) → SQLite 数据库 → 仪表板可视化
                                    ↓
                              飞书错误报警（可选）
```

## 安全建议

1. **生产环境启用加密**：`encrypt: true`
2. **使用 HTTPS**：确保 `serverUrl` 使用 HTTPS 协议
3. **密钥管理**：服务器端的 `SECRET_KEY` 应该保密且定期更换
4. **CORS 配置**：服务器端配置正确的 CORS 策略

## 相关文档

- [VUE3_GUIDE.md](./VUE3_GUIDE.md) - Vue 3 详细使用指南
- [VUE3_ESM_USAGE.md](./VUE3_ESM_USAGE.md) - Vue 3 ESM 使用指南
- [Analytics Server README](../analytics-server/README.md) - 服务器端文档

## License

MIT
