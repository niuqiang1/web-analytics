# 在 Vue 3 中使用打包后的 analytics.esm.js

## 方式一: 直接导入 ESM 文件

### 1. 复制文件到项目
将 `dist/analytics.esm.js` 复制到你的 Vue 3 项目中，例如 `src/plugins/analytics.esm.js`

### 2. 创建 Vue 3 插件包装器

创建 `src/plugins/analytics.js`:

```javascript
import * as Analytics from './analytics.esm.js';

export default {
  install(app, options = {}) {
    // 初始化 tracker
    const tracker = Analytics.init(options);

    // 全局属性 (Options API)
    app.config.globalProperties.$analytics = tracker;

    // Provide/Inject (Composition API)
    app.provide('analytics', tracker);

    // Vue Router 集成
    if (options.router) {
      options.router.afterEach((to, from) => {
        tracker.track('pageview', {
          path: to.path,
          name: to.name,
          params: to.params,
          query: to.query,
          referrer: from.path
        });
      });
    }

    return tracker;
  }
};
```

### 3. 在 main.js 中使用

```javascript
import { createApp } from 'vue';
import { createRouter, createWebHistory } from 'vue-router';
import App from './App.vue';
import AnalyticsPlugin from './plugins/analytics.js';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    // your routes
  ]
});

const app = createApp(App);

// 安装 Analytics 插件
app.use(AnalyticsPlugin, {
  appId: 'your-app-id',
  serverUrl: 'http://localhost:3000/collect',
  router: router,
  encrypt: true,
  debug: true
});

app.use(router);
app.mount('#app');
```

## 方式二: 使用 Composable (推荐)

### 1. 创建 composable

创建 `src/composables/useAnalytics.js`:

```javascript
import { inject } from 'vue';

export function useAnalytics() {
  const analytics = inject('analytics');
  
  if (!analytics) {
    console.warn('Analytics not available');
    return {
      track: () => {},
      identify: () => {}
    };
  }
  
  return {
    track: (eventName, properties = {}) => {
      analytics.track(eventName, properties);
    },
    identify: (userId, traits = {}) => {
      analytics.identify(userId, traits);
    }
  };
}
```

### 2. 在组件中使用

```vue
<template>
  <div class="product-page">
    <h1>{{ product.name }}</h1>
    <button @click="handleAddToCart">Add to Cart</button>
    <button @click="handlePurchase">Buy Now</button>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useAnalytics } from '@/composables/useAnalytics';

const route = useRoute();
const { track } = useAnalytics();

const product = ref({
  id: 'prod-123',
  name: 'Awesome Product',
  price: 99.99
});

// 页面加载时追踪
onMounted(() => {
  track('product_viewed', {
    product_id: product.value.id,
    product_name: product.value.name,
    price: product.value.price,
    page: route.path
  });
});

// 添加到购物车
const handleAddToCart = () => {
  track('add_to_cart', {
    product_id: product.value.id,
    quantity: 1,
    price: product.value.price
  });
};

// 购买
const handlePurchase = () => {
  track('purchase_initiated', {
    product_id: product.value.id,
    amount: product.value.price
  });
};
</script>
```

## 方式三: Options API 使用

```vue
<template>
  <div>
    <button @click="trackClick">Track Event</button>
  </div>
</template>

<script>
export default {
  name: 'MyComponent',
  
  mounted() {
    // 页面加载时追踪
    this.$analytics.track('component_mounted', {
      component: 'MyComponent'
    });
  },
  
  methods: {
    trackClick() {
      this.$analytics.track('button_clicked', {
        button_name: 'track_event',
        timestamp: Date.now()
      });
    }
  }
}
</script>
```

## 完整示例项目结构

```
src/
├── main.js                      # 应用入口
├── App.vue
├── plugins/
│   ├── analytics.esm.js        # 复制的 ESM 文件
│   └── analytics.js            # Vue 3 插件包装器
├── composables/
│   └── useAnalytics.js         # Composable
├── views/
│   ├── Home.vue
│   └── Product.vue
└── router/
    └── index.js
```

## 高级用法

### 全局错误追踪

```javascript
// main.js
app.config.errorHandler = (err, instance, info) => {
  const analytics = app.config.globalProperties.$analytics;
  analytics.track('vue_error', {
    error: err.message,
    stack: err.stack,
    component: instance?.$options?.name,
    info: info
  });
};
```

### 路由守卫中使用

```javascript
// router/index.js
import { useAnalytics } from '@/composables/useAnalytics';

router.beforeEach((to, from, next) => {
  const { track } = useAnalytics();
  
  track('route_change', {
    from: from.path,
    to: to.path
  });
  
  next();
});
```

### 用户识别

```javascript
// 登录后识别用户
const { identify } = useAnalytics();

const handleLogin = async (credentials) => {
  const user = await login(credentials);
  
  identify(user.id, {
    email: user.email,
    name: user.name,
    plan: user.plan
  });
};
```

## TypeScript 支持

创建 `src/types/analytics.d.ts`:

```typescript
declare module './plugins/analytics.esm.js' {
  export function init(options: {
    appId: string;
    serverUrl: string;
    encrypt?: boolean;
    debug?: boolean;
  }): {
    track: (eventName: string, properties?: Record<string, any>) => void;
    identify: (userId: string, traits?: Record<string, any>) => void;
  };
}

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $analytics: {
      track: (eventName: string, properties?: Record<string, any>) => void;
      identify: (userId: string, traits?: Record<string, any>) => void;
    };
  }
}
```

## 注意事项

1. **文件路径**: 确保 `analytics.esm.js` 的导入路径正确
2. **加密密钥**: 前端和后端需要使用相同的加密密钥
3. **性能**: SDK 会自动批量发送事件，不会影响性能
4. **隐私**: 敏感元素可添加 `data-no-track` 属性排除追踪
