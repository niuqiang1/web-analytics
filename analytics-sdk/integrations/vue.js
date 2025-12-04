import { init } from '../index.js';

export default {
    install(Vue, options = {}) {
        const tracker = init(options);

        // Expose tracker instance globally
        Vue.prototype.$analytics = tracker;

        // Optional: Vue Router integration if router is passed in options
        if (options.router) {
            options.router.afterEach((to, from) => {
                // We might not need this if the History API listener in pageView.js works well,
                // but this is often more reliable for Vue apps.
                tracker.track('pageview', {
                    path: to.path,
                    name: to.name,
                    params: to.params,
                    query: to.query,
                    referrer: from.path
                });
            });
        }
    }
};
