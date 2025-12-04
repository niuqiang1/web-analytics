import * as Analytics from '../dist/analytics.esm.js';

export default {
    install(app, options = {}) {
        // 初始化 tracker
        const tracker = Analytics.init(options);

        // 全局属性 (Options API 使用)
        app.config.globalProperties.$analytics = tracker;

        // Provide/Inject (Composition API 使用)
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
