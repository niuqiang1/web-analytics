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
     * Identify a user with a unique ID and optional traits
     * @param {string} userId - Unique user identifier
     * @param {object} traits - User attributes (name, email, etc.)
     */
    identify(userId, traits = {}) {
        if (!userId) {
            console.warn('[Analytics] identify: userId is required');
            return;
        }

        // Update distinct_id
        this.distinctId = userId;
        localStorage.setItem('analytics_distinct_id', userId);

        // Store user traits
        if (Object.keys(traits).length > 0) {
            const existingTraits = this._getUserTraits();
            const updatedTraits = { ...existingTraits, ...traits };
            localStorage.setItem('analytics_user_traits', JSON.stringify(updatedTraits));
        }

        // Track identify event
        this.track('identify', {
            user_id: userId,
            ...traits
        });

        if (this.options.debug) {
            console.log('[Analytics] Identify:', userId, traits);
        }
    }

    /**
     * Get stored user traits
     * @returns {object} User traits
     */
    _getUserTraits() {
        try {
            const traits = localStorage.getItem('analytics_user_traits');
            return traits ? JSON.parse(traits) : {};
        } catch (e) {
            return {};
        }
    }

    /**
     * Reset user identity (logout)
     */
    reset() {
        // Generate new distinct_id
        const newId = generateUUID();
        this.distinctId = newId;
        localStorage.setItem('analytics_distinct_id', newId);

        // Clear user traits
        localStorage.removeItem('analytics_user_traits');

        // Generate new session
        this.sessionId = generateUUID();

        if (this.options.debug) {
            console.log('[Analytics] Reset: new distinct_id', newId);
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
