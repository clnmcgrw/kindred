let targets = document.querySelectorAll('*[data-src]');

export function lazyloadRestart() {
  targets = document.querySelectorAll('*[data-src]');

  startWatcher(checkInView);
}

function startWatcher(handler) {
  const opts = {
    threshold: 0.125,
  };

  const observer = new IntersectionObserver(handler, opts);

  targets.forEach(el => observer.observe(el));
}

function checkInView(entries) {
  entries.forEach(entry => {
    if (entry.intersectionRatio > 0) {
      lazyload(entry.target);
    }
  });
}

function lazyload(element) {
  const src = element.getAttribute('data-src');
  const isAlreadyLoaded =
    element.classList.contains('lazyload--progress') ||
    element.classList.contains('lazyload--complete');

  /**
   * the data-src gets removed once lazyload is complete, so we can check
   * against this attribute to keep from doubling-up
   */
  if (isAlreadyLoaded) return;

  const img = new Image();

  element.classList.add('lazyload--progress');

  img.src = src;
  img.onload = () => {
    const isBgImg = element.tagName === 'DIV';

    if (isBgImg) {
      element.setAttribute('style', `background-image: url(${src})`);
    } else {
      element.setAttribute('src', src);
    }

    element.classList.add('lazyload--complete');

    if (typeof onComplete === 'function') onComplete();
  };
}

export default () => startWatcher(checkInView);
