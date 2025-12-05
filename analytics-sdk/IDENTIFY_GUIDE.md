# identify() 方法使用指南

`identify()` 方法用于识别用户身份，将匿名用户 ID 关联到已知用户 ID，并可选地添加用户属性。

## 基本用法

### 识别用户

```javascript
import analytics from 'codeless-analytics-sdk';

// 初始化
analytics.init({
  appId: 'your-app-id',
  serverUrl: 'http://localhost:3000/collect'
});

// 用户登录后，识别用户
analytics.identify('user-123');
```

### 识别用户并添加属性

```javascript
analytics.identify('user-123', {
  name: '张三',
  email: 'zhangsan@example.com',
  plan: 'premium',
  company: 'ABC公司'
});
```

## 完整示例

### 登录场景

```javascript
// 用户登录成功后
function onLoginSuccess(user) {
  analytics.identify(user.id, {
    name: user.name,
    email: user.email,
    phone: user.phone,
    vip_level: user.vipLevel,
    created_at: user.createdAt
  });
}
```

### 注册场景

```javascript
// 用户注册成功后
function onRegisterSuccess(user) {
  analytics.identify(user.id, {
    name: user.name,
    email: user.email,
    source: 'registration',
    plan: 'free'
  });
}
```

### 登出场景

```javascript
// 用户登出时，重置身份
function onLogout() {
  analytics.reset();
}
```

## Vue 集成

### Vue 2

```vue
<template>
  <div>
    <button @click="login">登录</button>
    <button @click="logout">登出</button>
  </div>
</template>

<script>
export default {
  methods: {
    async login() {
      // 登录逻辑
      const user = await this.loginAPI();
      
      // 识别用户
      this.$analytics.identify(user.id, {
        name: user.name,
        email: user.email
      });
    },
    
    logout() {
      // 登出逻辑
      this.logoutAPI();
      
      // 重置身份
      this.$analytics.reset();
    }
  }
}
</script>
```

### Vue 3 Composition API

```vue
<script setup>
import { inject } from 'vue';

const analytics = inject('analytics');

async function login() {
  const user = await loginAPI();
  
  analytics.identify(user.id, {
    name: user.name,
    email: user.email,
    role: user.role
  });
}

function logout() {
  logoutAPI();
  analytics.reset();
}
</script>
```

## API 参考

### identify(userId, traits)

识别用户身份。

**参数**：
- `userId` (string, 必需) - 用户唯一标识符
- `traits` (object, 可选) - 用户属性对象

**示例**：
```javascript
analytics.identify('user-123', {
  name: '张三',
  email: 'zhangsan@example.com',
  age: 25,
  city: '北京'
});
```

**效果**：
1. 更新当前用户的 `distinct_id` 为指定的 `userId`
2. 将用户属性存储到 localStorage
3. 发送一个 `identify` 事件到服务器

### reset()

重置用户身份（通常在用户登出时调用）。

**示例**：
```javascript
analytics.reset();
```

**效果**：
1. 生成新的匿名 `distinct_id`
2. 清除存储的用户属性
3. 生成新的会话 ID

## 数据存储

### localStorage 键

- `analytics_distinct_id` - 当前用户 ID
- `analytics_user_traits` - 用户属性（JSON 格式）

### 查看存储的数据

```javascript
// 查看当前用户 ID
console.log(localStorage.getItem('analytics_distinct_id'));

// 查看用户属性
console.log(JSON.parse(localStorage.getItem('analytics_user_traits')));
```

## 最佳实践

### 1. 在用户登录后立即调用

```javascript
async function handleLogin(credentials) {
  const user = await login(credentials);
  
  // 立即识别用户
  analytics.identify(user.id, {
    name: user.name,
    email: user.email
  });
}
```

### 2. 增量更新用户属性

```javascript
// 首次登录
analytics.identify('user-123', {
  name: '张三',
  email: 'zhangsan@example.com'
});

// 后续更新（会合并属性）
analytics.identify('user-123', {
  phone: '13800138000',
  vip_level: 'gold'
});

// 最终存储的属性：
// {
//   name: '张三',
//   email: 'zhangsan@example.com',
//   phone: '13800138000',
//   vip_level: 'gold'
// }
```

### 3. 登出时重置

```javascript
function handleLogout() {
  // 清除用户会话
  clearUserSession();
  
  // 重置 Analytics 身份
  analytics.reset();
  
  // 跳转到登录页
  router.push('/login');
}
```

### 4. 避免敏感信息

不要在用户属性中存储敏感信息：

```javascript
// ❌ 不要这样做
analytics.identify('user-123', {
  password: 'xxx',        // 密码
  credit_card: 'xxx',     // 信用卡
  ssn: 'xxx'              // 身份证号
});

// ✅ 应该这样做
analytics.identify('user-123', {
  name: '张三',
  email: 'zhangsan@example.com',
  plan: 'premium',
  signup_date: '2024-01-01'
});
```

## 调试

启用调试模式查看 identify 调用：

```javascript
analytics.init({
  appId: 'your-app-id',
  serverUrl: 'http://localhost:3000/collect',
  debug: true  // 启用调试
});

analytics.identify('user-123', { name: '张三' });
// 控制台输出: [Analytics] Identify: user-123 { name: '张三' }
```

## 常见问题

### Q: identify 和 track 有什么区别？

A: 
- `identify()` 用于识别用户身份，更新用户 ID 和属性
- `track()` 用于追踪用户行为事件

### Q: 可以多次调用 identify 吗？

A: 可以。每次调用会更新用户 ID 和合并用户属性。

### Q: 用户属性存储在哪里？

A: 存储在浏览器的 localStorage 中，键名为 `analytics_user_traits`。

### Q: reset() 会删除所有数据吗？

A: `reset()` 只会：
- 生成新的匿名用户 ID
- 清除用户属性
- 生成新的会话 ID

不会删除已发送到服务器的历史数据。
