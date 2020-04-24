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

export function debounce(func, wait = 20, immediate = true) {
  let timeout;
  return function() {
    let context = this,
      args = arguments;
    let later = function() {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    let callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
}

export async function asyncForEach(array, callback) {
  for (let i = 0; i < array.length; i++) {
    await callback(array[i], i, array);
  }
}

export function loadDynamicFigures() {
  const figures = document.querySelectorAll('figure.ks-dynamic-padding');
  figures.forEach(figure => {
    try {
      figure.style.paddingBottom = `${(figure.dataset.height /
        figure.dataset.width) *
        100}%`;
    } catch (e) {
      console.error(e);
    }
  });
}
