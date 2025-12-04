import { getSelector } from '../utils/index.js';

export function enableClickTracking(tracker) {
    document.addEventListener('click', (event) => {
        const target = event.target;

        // Don't track if explicitly disabled
        if (target.hasAttribute('data-no-track')) return;

        const properties = {
            tag: target.tagName.toLowerCase(),
            id: target.id,
            className: target.className,
            text: target.innerText ? target.innerText.substring(0, 100) : '', // Truncate long text
            selector: getSelector(target),
            x: event.clientX,
            y: event.clientY
        };

        // Try to get more context if it's a link or button
        const closestAnchor = target.closest('a');
        if (closestAnchor) {
            properties.href = closestAnchor.href;
            properties.link_text = closestAnchor.innerText;
        }

        tracker.track('click', properties);
    }, true); // Capture phase to ensure we catch it
}
