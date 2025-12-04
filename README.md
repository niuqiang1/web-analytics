# 📊 Codeless Analytics Platform

一个完整的无代码埋点分析平台，包含前端 SDK、后端服务器和可视化仪表板。自动追踪用户行为，无需手动编写埋点代码。

## ✨ 功能特性

### 前端 SDK
- 🎯 **无代码埋点** - 自动追踪点击、页面浏览、错误
- 🔐 **数据加密** - AES 加密传输，保护数据安全
- 🚀 **可靠传输** - 使用 `sendBeacon` 确保数据不丢失
- 👤 **用户识别** - 自动生成和管理用户 ID 和会话
- 🎨 **框架支持** - Vue 2/3、React、原生 JS
- 📦 **轻量级** - 压缩后仅 ~10KB

### 后端服务器
- 💾 **数据持久化** - SQLite 数据库存储
- 🚨 **错误报警** - 自动发送错误到飞书机器人
- 📱 **多应用支持** - 管理多个应用的数据
- 📊 **实时统计** - 事件、用户、会话统计
- ⚙️ **灵活配置** - 支持环境变量和配置文件
- 🌍 **中文界面** - 完整的中文本地化

### 可视化仪表板
- 📈 **数据概览** - 总事件、总用户、会话统计
- 📋 **事件列表** - 实时事件流，支持筛选和分页
- 🔍 **用户旅程** - 完整的用户行为轨迹
- 📊 **图表展示** - 事件类型分布、热门页面
- 🎨 **现代 UI** - 美观的界面设计

## 🚀 快速开始

### 1. 安装依赖

```bash
# 安装 SDK 依赖
cd analytics-sdk
npm install

# 安装服务器依赖
cd ../analytics-server
npm install
```

### 2. 构建 SDK

```bash
cd analytics-sdk
npm run build
```

这将在 `dist/` 目录生成 `analytics.umd.js` 和 `analytics.esm.js`。

### 3. 启动服务器

```bash
cd analytics-server
npm start
```

服务器将在 `http://localhost:3000` 启动。

### 4. 访问仪表板

打开浏览器访问：
- **应用列表**: http://localhost:3000/
- **仪表板**: http://localhost:3000/dashboard.html

### 5. 集成 SDK

在您的前端应用中：

```javascript
import analytics from 'codeless-analytics-sdk';

analytics.init({
  appId: 'your-app-id',
  serverUrl: 'http://localhost:3000/collect',
  encrypt: true,
  autoTrack: true
});
```

## 📁 项目结构

```
.
├── analytics-sdk/              # 前端 SDK
│   ├── core/                   # 核心追踪逻辑
│   ├── events/                 # 自动追踪模块
│   ├── integrations/           # 框架集成（Vue/React）
│   ├── dist/                   # 构建输出
│   └── README.md               # SDK 文档
│
├── analytics-server/           # 后端服务器
│   ├── db/                     # 数据库模块
│   ├── public/                 # 静态文件（仪表板）
│   ├── config.js               # 配置文件
│   ├── server.js               # 主服务器
│   └── README.md               # 服务器文档
│
└── test-analytics.html         # SDK 测试页面
```

## ⚙️ 配置

### SDK 配置

```javascript
analytics.init({
  appId: 'your-app-id',           // 必需：应用 ID
  serverUrl: 'http://localhost:3000/collect', // 必需：服务器地址
  encrypt: true,                  // 可选：数据加密（默认：true）
  autoTrack: true,                // 可选：自动追踪（默认：true）
  debug: false,                   // 可选：调试模式（默认：false）
  bufferSize: 10,                 // 可选：缓冲区大小（默认：10）
  flushInterval: 5000             // 可选：发送间隔（默认：5000ms）
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

# 飞书 Webhook
FEISHU_WEBHOOK=https://open.feishu.cn/open-apis/bot/v2/hook/your-webhook

# 数据库路径
DB_PATH=./db/analytics.db
```

**重要**：SDK 的 `encrypt` 配置必须与服务器的 `ENABLE_ENCRYPTION` 保持一致！

## 🔧 开发

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

## 📚 文档

- [SDK 使用文档](./analytics-sdk/README.md)
- [Vue 3 集成指南](./analytics-sdk/VUE3_GUIDE.md)
- [Vue 3 ESM 使用](./analytics-sdk/VUE3_ESM_USAGE.md)
- [服务器配置文档](./analytics-server/README.md)
- [服务器配置指南](./analytics-server/CONFIG.md)

## 🎯 使用场景

### 1. 用户行为分析
- 追踪用户点击、浏览路径
- 分析用户旅程
- 识别热门页面和功能

### 2. 错误监控
- 自动捕获 JavaScript 错误
- Promise rejection 监控
- 实时飞书报警通知

### 3. 性能分析
- 页面浏览统计
- 用户会话分析
- 事件频率分析

### 4. A/B 测试
- 追踪不同版本的用户行为
- 对比分析效果

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

## 🚨 飞书错误报警

当应用发生错误时，系统会自动发送富文本报警到飞书：

**配置步骤**：
1. 在飞书群中添加机器人
2. 获取 Webhook URL
3. 设置环境变量 `FEISHU_WEBHOOK`
4. 重启服务器

**报警内容**：
- 🚨 错误类型
- 📝 错误信息
- 👤 用户 ID
- 🔗 页面 URL（可点击）

## 📊 数据流

```
前端应用
    ↓ (自动追踪)
Analytics SDK
    ↓ (AES 加密)
HTTP/HTTPS
    ↓
Analytics Server
    ↓ (解密 & 存储)
SQLite 数据库
    ↓
可视化仪表板
    ↓ (错误事件)
飞书报警 (可选)
```

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

### 仪表板
- HTML5 + CSS3
- Vanilla JavaScript
- Chart.js (图表)

## 📈 性能

- **SDK 大小**: ~10KB (gzipped)
- **内存占用**: < 1MB
- **CPU 占用**: 可忽略
- **网络开销**: 批量发送，最小化请求

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 License

MIT

## 🔗 相关链接

- [在线演示](http://localhost:3000) (需先启动服务器)
- [SDK 文档](./analytics-sdk/README.md)
- [服务器文档](./analytics-server/README.md)

## ❓ 常见问题

### Q: SDK 和服务器的加密配置不一致怎么办？

A: 确保 SDK 的 `encrypt` 配置与服务器的 `ENABLE_ENCRYPTION` 一致：
- 生产环境：都设置为 `true`
- 开发环境：可以都设置为 `false`

### Q: 如何查看收集到的数据？

A: 访问 http://localhost:3000/ 选择应用，进入仪表板查看。

### Q: 如何关闭飞书报警？

A: 设置环境变量 `ENABLE_FEISHU_ALERTS=false` 或在 `config.js` 中修改。

### Q: 支持哪些前端框架？

A: 支持 Vue 2/3、React、Angular 以及任何原生 JavaScript 应用。

### Q: 数据存储在哪里？

A: 默认存储在 `analytics-server/db/analytics.db` SQLite 数据库文件中。

---

**Made with ❤️ by Analytics Team**
