import { generateUUID } from '../utils/index.js';
import CryptoJS from 'crypto-js';

class Tracker {
    constructor(options = {}) {
        this.options = Object.assign({
            appId: '',
            serverUrl: '',
            autoTrack: true,
            debug: false,
            bufferSize: 10,
            flushInterval: 5000,
            encrypt: true // Default to true
        }, options);

        this.queue = [];
        this.timer = null;
        this.distinctId = this._getDistinctId();
        this.sessionId = generateUUID();

        // Bind methods
        this.track = this.track.bind(this);
        this.flush = this.flush.bind(this);

        // Flush on page unload
        window.addEventListener('unload', this.flush);
    }

    _getDistinctId() {
        let id = localStorage.getItem('analytics_distinct_id');
        if (!id) {
            id = generateUUID();
            localStorage.setItem('analytics_distinct_id', id);
        }
        return id;
    }

    /**
     * Track an event
     * @param {string} eventName 
     * @param {object} properties 
     */
    track(eventName, properties = {}) {
        const event = {
            event: eventName,
            properties: {
                ...properties,
                distinct_id: this.distinctId,
                session_id: this.sessionId,
                time: new Date().getTime(),
                url: window.location.href,
                referrer: document.referrer,
                app_id: this.options.appId
            }
        };

        this.queue.push(event);

        if (this.options.debug) {
            console.log('[Analytics] Track:', eventName, event);
        }

        if (this.queue.length >= this.options.bufferSize) {
            this.flush();
        } else if (!this.timer) {
            this.timer = setTimeout(this.flush, this.options.flushInterval);
        }
    }

    /**
     * Send data to server
     */
    flush() {
        if (this.queue.length === 0) return;

        const data = [...this.queue];
        this.queue = [];
        clearTimeout(this.timer);
        this.timer = null;

        let payload = JSON.stringify(data);

        // Encrypt if enabled
        if (this.options.encrypt) {
            // Use a fixed key for demo purposes. In production, this should be managed securely.
            const SECRET_KEY = 'analytics-secret-key';
            payload = CryptoJS.AES.encrypt(payload, SECRET_KEY).toString();
        }

        if (navigator.sendBeacon) {
            // Send as text/plain to avoid CORS preflight if possible, but for encrypted string it's just a blob
            const blob = new Blob([payload], { type: 'text/plain' });
            navigator.sendBeacon(this.options.serverUrl, blob);
        } else {
            // Fallback for older browsers
            const xhr = new XMLHttpRequest();
            xhr.open('POST', this.options.serverUrl, true);
            xhr.setRequestHeader('Content-Type', 'text/plain');
            xhr.send(payload);
        }
    }
}

export default Tracker;
