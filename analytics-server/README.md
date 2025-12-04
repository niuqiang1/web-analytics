# Analytics Server

一个功能完整的分析数据收集和可视化服务器，支持数据加密、多应用管理、错误报警等功能。

## 功能特性

- 📊 **实时数据收集** - 收集页面浏览、点击、错误等事件
- 🔐 **数据加密** - 支持 AES 加密传输（可配置开关）
- 🚨 **错误报警** - 自动发送错误到飞书机器人（可配置开关）
- 📱 **多应用支持** - 支持多个应用的数据隔离和管理
- 📈 **可视化仪表板** - 实时查看统计数据、事件列表、用户旅程
- 🌍 **中文界面** - 完整的中文本地化支持
- 🗄️ **SQLite 数据库** - 轻量级数据持久化
- ⚙️ **灵活配置** - 支持配置文件和环境变量

## 快速开始

### 安装依赖

```bash
npm install
```

### 启动服务器

```bash
npm start
```

服务器将在 `http://localhost:3000` 启动。

访问仪表板：`http://localhost:3000/dashboard.html`

## 配置

### 使用默认配置

服务器开箱即用，默认配置在 `config.js` 中：
- 端口：3000
- 加密：启用
- 飞书报警：启用

### 使用环境变量

创建 `.env` 文件自定义配置：

```bash
# 复制示例文件
cp .env.example .env

# 编辑配置
nano .env
```

### 配置选项

| 变量 | 默认值 | 说明 |
|------|--------|------|
| `PORT` | `3000` | 服务器端口 |
| `SECRET_KEY` | `analytics-secret-key` | 加密密钥（生产环境务必修改！） |
| `ENABLE_ENCRYPTION` | `true` | 启用/禁用数据加密 |
| `ENABLE_FEISHU_ALERTS` | `true` | 启用/禁用飞书错误报警 |
| `FEISHU_WEBHOOK` | (已配置) | 飞书机器人 Webhook URL |
| `DB_PATH` | `./db/analytics.db` | 数据库文件路径 |

### 配置示例

#### 关闭加密（开发环境）

```bash
ENABLE_ENCRYPTION=false npm start
```

#### 关闭飞书报警

```bash
ENABLE_FEISHU_ALERTS=false npm start
```

#### 生产环境配置

```bash
# .env
PORT=8080
SECRET_KEY=your-super-secret-production-key
ENABLE_ENCRYPTION=true
ENABLE_FEISHU_ALERTS=true
FEISHU_WEBHOOK=https://open.feishu.cn/open-apis/bot/v2/hook/your-webhook
```

详细配置说明请查看 [CONFIG.md](./CONFIG.md)。

## API 端点

### 数据收集

**POST** `/collect`

接收分析事件数据（支持加密）。

### 应用列表

**GET** `/api/apps`

获取所有应用列表及统计信息。

### 事件查询

**GET** `/api/events?appId=xxx&limit=100&offset=0&userId=xxx`

查询事件列表，支持分页和过滤。

### 统计数据

**GET** `/api/stats?appId=xxx`

获取应用的统计数据（总事件数、总用户数、事件类型分布等）。

### 用户旅程

**GET** `/api/users/:distinctId/journey`

获取指定用户的完整行为旅程。

### 用户搜索

**GET** `/api/users/search?q=xxx`

模糊搜索用户 ID。

## 仪表板功能

### 应用选择

访问 `http://localhost:3000/` 可以看到所有应用列表，点击进入对应应用的仪表板。

### 概览

- 总事件数
- 总用户数
- 总会话数
- 事件类型分布图表
- 热门页面排行

### 事件列表

- 实时事件流
- 按用户 ID 筛选
- 分页浏览
- 查看事件详情

### 用户旅程

- 搜索用户
- 查看用户信息（首次访问、最后访问）
- 完整的事件时间线
- 按事件类型筛选（全部/点击/页面浏览/错误）

## 飞书错误报警

当应用发生错误时，系统会自动发送富文本报警到飞书机器人：

**报警内容包括**：
- 🚨 错误类型
- 📝 错误信息
- 👤 用户 ID
- 🔗 页面 URL（可点击）

**配置方法**：
1. 在飞书群中添加机器人
2. 获取 Webhook URL
3. 设置环境变量 `FEISHU_WEBHOOK`
4. 重启服务器

**关闭报警**：
```bash
ENABLE_FEISHU_ALERTS=false npm start
```

## 数据库

使用 SQLite 存储数据，数据库文件位于 `db/analytics.db`。

### 数据表

- `events` - 事件记录
- `users` - 用户统计
- `sessions` - 会话统计

### 数据库架构

查看 `db/schema.sql` 了解完整的数据库结构。

## 安全建议

1. **修改密钥** - 生产环境务必修改 `SECRET_KEY`
2. **使用环境变量** - 不要在代码中硬编码敏感信息
3. **启用加密** - 生产环境建议启用数据加密
4. **定期备份** - 定期备份 SQLite 数据库文件
5. **访问控制** - 在生产环境配置适当的 CORS 策略

## 开发

### 项目结构

```
analytics-server/
├── config.js           # 配置文件
├── server.js           # 主服务器文件
├── db/
│   ├── database.js     # 数据库操作
│   └── schema.sql      # 数据库架构
├── public/
│   ├── index.html      # 应用选择页面
│   ├── dashboard.html  # 仪表板页面
│   ├── css/
│   └── js/
│       └── dashboard.js # 仪表板逻辑
└── .env.example        # 环境变量示例
```

### 启动日志

服务器启动时会显示当前配置：

```
Analytics server listening on port 3000
Dashboard: http://localhost:3000/dashboard.html

Configuration:
  - Encryption: ENABLED
  - Feishu Alerts: ENABLED
```

## 相关项目

- [Analytics SDK](../analytics-sdk/README.md) - 前端数据收集 SDK

## License

MIT
