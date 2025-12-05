# 📊 Codeless Analytics Platform

一个完整的无代码埋点分析平台，包含前端 SDK、后端服务器和可视化仪表板。自动追踪用户行为，无需手动编写埋点代码。

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen.svg)](https://nodejs.org)
[![Vue](https://img.shields.io/badge/vue-2%20%7C%203-brightgreen.svg)](https://vuejs.org)

## ✨ 核心特性

### 🎯 前端 SDK
- **无代码埋点** - 自动追踪点击、页面浏览、错误
- **用户识别** - `identify()` 方法关联用户身份
- **数据加密** - AES 加密传输，保护数据安全
- **框架支持** - Vue 2/3、React、原生 JS
- **轻量级** - 压缩后仅 ~10KB

### 💾 后端服务器
- **数据持久化** - SQLite 数据库存储
- **错误报警** - 自动发送错误到飞书机器人
- **多应用支持** - 管理多个应用的数据
- **实时统计** - 事件、用户、会话统计
- **灵活配置** - 环境变量和配置文件

### 📊 可视化仪表板
- **数据概览** - 总事件、总用户、会话统计
- **事件列表** - 实时事件流，支持筛选和分页
- **用户旅程** - 完整的用户行为轨迹
- **图表展示** - 事件类型分布、热门页面

## 🚀 快速开始

### 1. 克隆项目

```bash
git clone https://github.com/niuqiang1/web-analytics.git
cd web-analytics
```

### 2. 安装依赖

```bash
# 安装 SDK 依赖
cd analytics-sdk
npm install

# 安装服务器依赖
cd ../analytics-server
npm install
```

### 3. 配置服务器

```bash
cd analytics-server
cp .env.example .env
# 编辑 .env 文件，配置必要的参数
```

### 4. 启动服务器

```bash
npm start
```

服务器将在 `http://localhost:3000` 启动。

### 5. 构建 SDK

```bash
cd ../analytics-sdk
npm run build
```

### 6. 集成到您的应用

```javascript
import analytics from 'codeless-analytics-sdk';

analytics.init({
  appId: 'your-app-id',
  serverUrl: 'http://localhost:3000/collect',
  encrypt: true,
  autoTrack: true
});

// 用户登录后识别身份
analytics.identify('user-123', {
  name: '张三',
  email: 'zhangsan@example.com'
});
```

## 📚 完整文档

### SDK 文档
- **[SDK README](./analytics-sdk/README.md)** - SDK 完整使用文档
- **[用户识别指南](./analytics-sdk/IDENTIFY_GUIDE.md)** - identify() 方法详细说明
- **[Vue 3 集成](./analytics-sdk/VUE3_GUIDE.md)** - Vue 3 详细使用指南
- **[Vue 3 ESM 使用](./analytics-sdk/VUE3_ESM_USAGE.md)** - ESM 模块使用方式
- **[NPM 发布指南](./analytics-sdk/NPM_PUBLISH.md)** - 发布到 npm 的步骤

### 服务器文档
- **[服务器 README](./analytics-server/README.md)** - 服务器完整文档
- **[配置指南](./analytics-server/CONFIG.md)** - 详细的配置说明

## 🎯 核心功能

### 1. 自动追踪

SDK 自动追踪以下事件：

```javascript
// 页面浏览 - 自动追踪
{
  event: 'pageview',
  properties: {
    title: '页面标题',
    path: '/home',
    url: '完整URL'
  }
}

// 点击事件 - 自动追踪
{
  event: 'click',
  properties: {
    tag: 'button',
    text: '提交',
    selector: 'button#submit'
  }
}

// 错误事件 - 自动追踪
{
  event: 'error',
  properties: {
    type: 'runtime',
    message: '错误信息',
    stack: '错误堆栈'
  }
}
```

### 2. 用户识别

```javascript
// 用户登录后
analytics.identify('user-123', {
  name: '张三',
  email: 'zhangsan@example.com',
  plan: 'premium'
});

// 用户登出时
analytics.reset();
```

### 3. 自定义事件

```javascript
// 追踪购买事件
analytics.track('purchase', {
  product_id: '12345',
  amount: 99.99,
  currency: 'CNY'
});

// 追踪按钮点击
analytics.track('button_click', {
  button_name: 'subscribe',
  page: 'pricing'
});
```

### 4. Vue 集成

```javascript
// Vue 3
import { createApp } from 'vue';
import AnalyticsPlugin from 'codeless-analytics-sdk/integrations/vue3';

const app = createApp(App);
app.use(AnalyticsPlugin, {
  appId: 'your-app-id',
  serverUrl: 'http://localhost:3000/collect'
});

// 在组件中使用
this.$analytics.track('custom_event', { key: 'value' });
this.$analytics.identify('user-123', { name: '张三' });
```

## ⚙️ 配置

### SDK 配置

```javascript
analytics.init({
  // 必需配置
  appId: 'your-app-id',                    // 应用 ID
  serverUrl: 'http://localhost:3000/collect', // 服务器地址
  
  // 可选配置
  autoTrack: true,                         // 自动追踪（默认：true）
  debug: false,                            // 调试模式（默认：false）
  encrypt: true,                           // 数据加密（默认：true）
  bufferSize: 10,                          // 缓冲区大小（默认：10）
  flushInterval: 5000                      // 发送间隔（默认：5000ms）
});
```

### 服务器配置

创建 `.env` 文件：

```bash
# 服务器端口
PORT=3000

# 加密密钥（生产环境务必修改！）
SECRET_KEY=your-super-secret-key

# 功能开关
ENABLE_ENCRYPTION=true          # 启用/禁用数据加密
ENABLE_FEISHU_ALERTS=true       # 启用/禁用飞书报警

# 飞书 Webhook（可选）
FEISHU_WEBHOOK=https://open.feishu.cn/open-apis/bot/v2/hook/your-webhook

# 数据库路径
DB_PATH=./db/analytics.db
```

**重要**：SDK 的 `encrypt` 配置必须与服务器的 `ENABLE_ENCRYPTION` 保持一致！

## 📊 仪表板

访问 `http://localhost:3000/` 查看仪表板：

- **应用列表** - 查看所有应用及其统计信息
- **事件列表** - 实时事件流，支持筛选和分页
- **用户旅程** - 查看用户的完整行为轨迹
- **统计图表** - 事件类型分布、热门页面

## 🚨 飞书错误报警

当应用发生错误时，系统会自动发送报警到飞书：

**配置步骤**：
1. 在飞书群中添加机器人
2. 获取 Webhook URL
3. 在 `.env` 中设置 `FEISHU_WEBHOOK`
4. 重启服务器

**报警内容**：
- 🚨 错误类型
- 📝 错误信息
- 👤 用户 ID
- 🔗 页面 URL

## 🛠️ 开发

### SDK 开发

```bash
cd analytics-sdk

# 开发模式（监听文件变化）
npm run dev

# 构建生产版本
npm run build
```

### 服务器开发

```bash
cd analytics-server

# 启动服务器
npm start

# 关闭加密（开发环境）
ENABLE_ENCRYPTION=false npm start

# 关闭飞书报警
ENABLE_FEISHU_ALERTS=false npm start
```

### 测试

访问 `test-analytics.html` 测试 SDK 功能：

```bash
# 启动简单的 HTTP 服务器
npx http-server -p 8080

# 访问测试页面
open http://localhost:8080/test-analytics.html
```

## 📁 项目结构

```
web-analytics/
├── analytics-sdk/              # 前端 SDK
│   ├── core/                   # 核心追踪逻辑
│   │   └── tracker.js          # Tracker 类
│   ├── events/                 # 自动追踪模块
│   │   ├── click.js            # 点击追踪
│   │   ├── pageView.js         # 页面浏览追踪
│   │   └── error.js            # 错误追踪
│   ├── integrations/           # 框架集成
│   │   ├── vue.js              # Vue 2 插件
│   │   └── vue3.js             # Vue 3 插件
│   ├── dist/                   # 构建输出
│   ├── index.js                # 入口文件
│   ├── index.d.ts              # TypeScript 类型定义
│   └── README.md               # SDK 文档
│
├── analytics-server/           # 后端服务器
│   ├── db/                     # 数据库模块
│   │   ├── database.js         # 数据库操作
│   │   └── schema.sql          # 数据库架构
│   ├── public/                 # 静态文件
│   │   ├── index.html          # 应用选择页
│   │   ├── dashboard.html      # 仪表板页面
│   │   └── js/dashboard.js     # 仪表板逻辑
│   ├── config.js               # 配置文件
│   ├── server.js               # 主服务器
│   ├── .env.example            # 环境变量示例
│   └── README.md               # 服务器文档
│
├── test-analytics.html         # SDK 测试页面
└── README.md                   # 项目主文档（本文件）
```

## 🔐 安全建议

1. **生产环境**
   - 修改 `SECRET_KEY` 为强密码
   - 启用数据加密（`encrypt: true`）
   - 使用 HTTPS 协议
   - 配置正确的 CORS 策略

2. **密钥管理**
   - 使用环境变量存储敏感信息
   - 不要将 `.env` 提交到版本控制
   - 定期更换密钥

3. **数据保护**
   - 定期备份数据库
   - 限制仪表板访问权限
   - 遵守数据隐私法规

## 📈 性能

- **SDK 大小**: ~10KB (gzipped)
- **内存占用**: < 1MB
- **CPU 占用**: 可忽略
- **网络开销**: 批量发送，最小化请求

## 🛠️ 技术栈

### 前端 SDK
- Vanilla JavaScript (ES6+)
- Rollup (打包)
- CryptoJS (加密)

### 后端服务器
- Node.js
- Express
- SQLite (better-sqlite3)
- CryptoJS (解密)
- dotenv (环境变量)

### 仪表板
- HTML5 + CSS3
- Vanilla JavaScript
- Chart.js (图表)

## 📖 API 参考

### SDK API

```javascript
// 初始化
analytics.init(options)

// 追踪事件
analytics.track(eventName, properties)

// 识别用户
analytics.identify(userId, traits)

// 重置用户身份
analytics.reset()

// 手动发送
analytics.flush()
```

### 服务器 API

```
POST   /collect                 # 收集事件数据
GET    /api/apps                # 获取应用列表
GET    /api/events              # 获取事件列表
GET    /api/stats               # 获取统计数据
GET    /api/users/:id/journey   # 获取用户旅程
GET    /api/users/search        # 搜索用户
```

## ❓ 常见问题

### Q: SDK 和服务器的加密配置不一致怎么办？

A: 确保 SDK 的 `encrypt` 配置与服务器的 `ENABLE_ENCRYPTION` 一致：
- 生产环境：都设置为 `true`
- 开发环境：可以都设置为 `false`

### Q: 如何查看收集到的数据？

A: 访问 http://localhost:3000/ 选择应用，进入仪表板查看。

### Q: 如何关闭飞书报警？

A: 设置环境变量 `ENABLE_FEISHU_ALERTS=false` 或不配置 `FEISHU_WEBHOOK`。

### Q: 支持哪些前端框架？

A: 支持 Vue 2/3、React、Angular 以及任何原生 JavaScript 应用。

### Q: 数据存储在哪里？

A: 默认存储在 `analytics-server/db/analytics.db` SQLite 数据库文件中。

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 License

MIT

## 🔗 相关链接

- [在线演示](http://localhost:3000) (需先启动服务器)
- [GitHub 仓库](https://github.com/niuqiang1/web-analytics)
- [npm 包](https://www.npmjs.com/package/codeless-analytics-sdk)

---
