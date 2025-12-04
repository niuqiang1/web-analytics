export function enableErrorTracking(tracker) {
    // Global error handler
    window.addEventListener('error', (event) => {
        tracker.track('error', {
            message: event.message,
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno,
            stack: event.error ? event.error.stack : ''
        });
    });

    // Unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
        tracker.track('error', {
            type: 'unhandledrejection',
            message: event.reason ? (event.reason.message || event.reason) : 'Unknown reason',
            stack: event.reason ? event.reason.stack : ''
        });
    });
}
