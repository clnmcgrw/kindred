import Flickity from 'flickity';
import { debounce } from '../js/lib/helpers';

const gs = document.querySelectorAll('.ks-galleryslider');

export default () => {
  if (!gs) return;

  gs.forEach(slider => {
    const container = slider.querySelector('.ks-flickity-container');

    const flickity = new Flickity(container, {
      cellSelector: '.ks-galleryslider__slide',
      pageDots: false,
      prevNextButtons: false,
    });

    const state = {
      targets: {
        allSlides: slider.querySelectorAll('.ks-galleryslider__slide'),
        progressThumb: slider.querySelector(
          '.ks-galleryslider__progress-thumb'
        ),
        progressTrack: slider.querySelector('.ks-galleryslider__progress-line'),
        currentSlide: slider.querySelector(
          '.ks-galleryslider__slide-number-current'
        ),
        totalSlides: slider.querySelector(
          '.ks-galleryslider__slide-number-total'
        ),
        previous: slider.querySelectorAll('.ks-galleryslider [data-previous]'),
        next: slider.querySelectorAll('.ks-galleryslider [data-next]'),
        fsToggle: slider.querySelectorAll(
          '.ks-galleryslider__fullscreen-toggle'
        ),
      },

      mounted: targets => {
        state.addListeners(targets);
      },

      // methods ------------------------------//
      addListeners: targets => {
        const { previous, next, fsToggle } = targets;

        state.assignInitialPositions(targets);

        flickity.on('change', function() {
          state.assignPositions();
          state.trackProgress(targets);
        });

        previous.forEach(control => {
          control.addEventListener('click', function() {
            flickity.previous(false);
          });
        });

        next.forEach(control => {
          control.addEventListener('click', function() {
            flickity.next(false);
          });
        });

        fsToggle.forEach(toggle => {
          toggle.addEventListener('click', () => {
            state.toggleFullscreen();
          });
        });
      },

      assignInitialPositions: targets => {
        const { totalSlides } = targets;
        const wait = setInterval(() => {
          // wait for flickity to initialize
          if (flickity.slides) {
            state.assignPositions(targets);
            state.trackProgress(targets);
            totalSlides.innerHTML = flickity.slides.length;
            clearInterval(wait);
          }
        }, 100);
      },

      toggleFullscreen: () => {
        switch (true) {
          case slider.classList.contains('fullscreen'): {
            slider.classList.remove('fullscreen');
            flickity.resize();
            break;
          }
          case !slider.classList.contains('fullscreen'): {
            slider.classList.add('fullscreen');
            // setTimeout(() => {
            flickity.resize();
            // }, 350);
            break;
          }
          default: {
            console.warn('Unable to toggle fullscreen.');
          }
        }
      },

      trackProgress: targets => {
        const { progressTrack, progressThumb, currentSlide } = targets;

        const widthPerSlide =
          progressTrack.offsetWidth / flickity.slides.length;

        progressThumb.style.width = `${widthPerSlide}px`;

        progressThumb.style.transform = `translate(
          ${widthPerSlide * flickity.selectedIndex}px, -50%)`;

        if (flickity.slides.length >= 10 && flickity.selectedIndex + 1 < 10) {
          currentSlide.innerHTML = `0${flickity.selectedIndex + 1}`;
        } else if (
          flickity.slides.length >= 10 &&
          flickity.selectedIndex + 1 >= 10
        ) {
          currentSlide.innerHTML = `${flickity.selectedIndex + 1}`;
        } else {
          currentSlide.innerHTML = `${flickity.selectedIndex + 1}`;
        }
      },

      assignPositions: () => {
        flickity.slides.forEach((slide, index) => {
          if (index < flickity.selectedIndex) {
            slide.cells[0].element.classList.add('is-left');
          } else {
            slide.cells[0].element.classList.add('is-right');
          }
          if (slide.cells[0].element.classList.contains('is-selected')) {
            slide.cells[0].element.classList.remove('is-left');
            slide.cells[0].element.classList.remove('is-right');
          }
        });
      },
    };

    state.mounted(state.targets);
  });
};
