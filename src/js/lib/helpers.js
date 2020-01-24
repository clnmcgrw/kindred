/**
 * Helpful for doing things like awaiting a transition delay or animation
 * before doing some other operation.
 *
 * @param {number} delay - how long to wait for
 * @returns {promise}
 */
export function pause(delay) {
  return new Promise(resolve => setTimeout(resolve, delay));
}
