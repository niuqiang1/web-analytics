import Tracker from './core/tracker.js';
import { enableClickTracking } from './events/click.js';
import { enablePageViewTracking } from './events/pageView.js';
import { enableErrorTracking } from './events/error.js';

let instance = null;

/**
 * Initialize the analytics SDK
 * @param {object} options 
 * @returns {Tracker}
 */
export function init(options = {}) {
    if (instance) return instance;

    instance = new Tracker(options);

    if (instance.options.autoTrack) {
        enableClickTracking(instance);
        enablePageViewTracking(instance);
        enableErrorTracking(instance);
    }

    return instance;
}

export default {
    init
};
