/**
 * Helpful for doing things like awaiting a transition delay or animation
 * before doing some other operation.
 *
 * @param {number} delay - how long to wait for
 * @returns {promise}
 */
export function pause(delay) {
	return new Promise((resolve) => setTimeout(resolve, delay));
}

/**
 * Find a single var in window.location.search and return its value
 * @param {string} variable - var to search for in window.location.search
 */
export function getQueryVar(variable) {
	const query = window.location.search.substring(1);
	const vars = query.split('&');

	for (let i = 0; i < vars.length; i++) {
		const pair = vars[i].split('=');

		if (decodeURIComponent(pair[0]) == variable) {
			return decodeURIComponent(pair[1]);
		}
	}
}
