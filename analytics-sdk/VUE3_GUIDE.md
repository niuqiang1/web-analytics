# Vue 3 使用指南

## 安装方式

### 方式一: Options API (推荐用于从 Vue 2 迁移的项目)

```javascript
// main.js
import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import AnalyticsPlugin from './analytics-sdk/integrations/vue3.js';

const app = createApp(App);

app.use(AnalyticsPlugin, {
  appId: 'your-app-id',
  serverUrl: 'http://localhost:3000/collect',
  router: router, // 可选: 传入 router 自动追踪路由变化
  debug: true,
  encrypt: true
});

app.use(router);
app.mount('#app');
```

### 在组件中使用 (Options API)

```vue
<template>
  <div>
    <button @click="trackClick">Track Click</button>
  </div>
</template>

<script>
export default {
  methods: {
    trackClick() {
      // 使用 this.$analytics 访问追踪器
      this.$analytics.track('button_click', {
        button_name: 'submit',
        page: this.$route.path
      });
    }
  }
}
</script>
```

### 方式二: Composition API (推荐用于新项目)

```vue
<template>
  <div>
    <button @click="trackClick">Track Click</button>
  </div>
</template>

<script setup>
import { inject } from 'vue';
import { useRoute } from 'vue-router';

// 注入 analytics 实例
const analytics = inject('analytics');
const route = useRoute();

const trackClick = () => {
  analytics.track('button_click', {
    button_name: 'submit',
    page: route.path
  });
};
</script>
```

### 方式三: 创建 Composable (最佳实践)

创建 `composables/useAnalytics.js`:

```javascript
import { inject } from 'vue';

export function useAnalytics() {
  const analytics = inject('analytics');
  
  if (!analytics) {
    throw new Error('Analytics plugin not installed');
  }
  
  return {
    track: (eventName, properties) => {
      analytics.track(eventName, properties);
    },
    identify: (userId, traits) => {
      analytics.identify(userId, traits);
    }
  };
}
```

在组件中使用:

```vue
<script setup>
import { useAnalytics } from '@/composables/useAnalytics';

const { track } = useAnalytics();

const handleSubmit = () => {
  track('form_submit', {
    form_name: 'contact',
    fields: ['name', 'email']
  });
};
</script>
```

## 自动追踪功能

SDK 会自动追踪以下事件:
- ✅ **点击事件** - 所有用户点击
- ✅ **页面浏览** - 路由变化 (如果传入了 router)
- ✅ **错误事件** - 全局错误和未处理的 Promise 拒绝

## 手动追踪事件

```javascript
// 追踪自定义事件
analytics.track('purchase', {
  product_id: '123',
  amount: 99.99,
  currency: 'USD'
});

// 识别用户
analytics.identify('user-123', {
  name: 'John Doe',
  email: 'john@example.com'
});
```

## 禁用自动追踪

如果你只想手动追踪事件:

```javascript
app.use(AnalyticsPlugin, {
  appId: 'your-app-id',
  serverUrl: 'http://localhost:3000/collect',
  autoTrack: false // 禁用自动追踪
});
```

## TypeScript 支持

创建 `types/analytics.d.ts`:

```typescript
import { Tracker } from './analytics-sdk/core/tracker';

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $analytics: Tracker;
  }
}

declare module 'vue' {
  interface InjectionKey<T> {
    analytics: Tracker;
  }
}
```

## 完整示例

```vue
<template>
  <div class="product-page">
    <h1>{{ product.name }}</h1>
    <button @click="addToCart">Add to Cart</button>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useAnalytics } from '@/composables/useAnalytics';

const { track } = useAnalytics();
const product = ref({ id: '123', name: 'Product Name' });

// 页面加载时追踪
onMounted(() => {
  track('product_viewed', {
    product_id: product.value.id,
    product_name: product.value.name
  });
});

// 用户操作追踪
const addToCart = () => {
  track('add_to_cart', {
    product_id: product.value.id,
    quantity: 1
  });
};
</script>
```

## 注意事项

1. **加密**: 默认启用数据加密,确保后端服务器使用相同的密钥
2. **性能**: SDK 使用事件队列和批量发送,不会影响应用性能
3. **隐私**: 可以在元素上添加 `data-no-track` 属性来排除追踪
