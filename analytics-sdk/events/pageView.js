export function enablePageViewTracking(tracker) {
    let lastUrl = window.location.href;

    const trackPageView = () => {
        tracker.track('pageview', {
            title: document.title,
            path: window.location.pathname,
            search: window.location.search,
            hash: window.location.hash
        });
        lastUrl = window.location.href;
    };

    // Track initial page load
    trackPageView();

    // History API handling
    const originalPushState = history.pushState;
    history.pushState = function (...args) {
        originalPushState.apply(this, args);
        trackPageView();
    };

    const originalReplaceState = history.replaceState;
    history.replaceState = function (...args) {
        originalReplaceState.apply(this, args);
        trackPageView();
    };

    // Popstate and Hashchange
    window.addEventListener('popstate', trackPageView);
    window.addEventListener('hashchange', trackPageView);
}
