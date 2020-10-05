import Flickity from 'flickity';
import { makeReadableLabel } from './lib/helpers';
import { $lightbox, $cartCover, $cartSidebar } from './ui';
import { thumbSlide } from './components';

const gallery = document.querySelector('.ks-producthero__gallery');

export default (event, $) => {
  if (!gallery) return;

  const module = {
    $nodes: {
      featuredImage: $('#ks-featuredimage'),
      thumbnailTarget: $('#ks-galleryimagestarget'),
      controls: $('.ks-gallerycontrols .ks-svg-wrapper'),
      fullscreenTrigger: $('.ks-producthero__fullscreen'),
      fullscreenClose: $('.ks-producthero__close'),
      prevSlideTrigger: $('.ks-producthero__prevtrigger'),
      nextSlideTrigger: $('.ks-producthero__nexttrigger'),
      label: $('.ks-producthero__gallery figcaption'),
      thumbs: false, // queried on append
      flickityViewport: false, // queried on append
      thumbImages: false, // queried on append
    },

    data: {
      galleryImages: event.galleryImages,
      flickity: false,
      isInternetExplorer: false,
      currentIndex: 0,
    },

    hooks: {
      mounted: $nodes => {
        const { methods } = module;
        methods.setInitialModalAttrs();
        methods.insertComponents();
        methods.initFlickity();
        methods.addListeners();

        const ua = navigator.userAgent;
        module.data.isInternetExplorer =
          ua.indexOf('MSIE ') > -1 || ua.indexOf('Trident/') > -1;

        if (module.data.isInternetExplorer) {
          module.hooks.resize();
        }
      },
      resize: () => {
        const { $nodes } = module;
        $nodes.thumbImages.each(function(index, item) {
          item.removeAttribute('width');
          item.removeAttribute('height');
        });
      },
    },
    methods: {
      setInitialModalAttrs: () => {
        const { featuredImage } = module.$nodes;

        const width = featuredImage[0].width;
        const height = featuredImage[0].height;

        $lightbox.find('figure').css({
          paddingBottom: `${(height / width) * 100}%`,
        });
      },

      insertComponents: () => {
        const { galleryImages } = module.data;
        const { thumbnailTarget } = module.$nodes;

        galleryImages.forEach((imageElement, index) => {
          const skipImage =
            imageElement.width < 225 &&
            imageElement.width === imageElement.height;

          if (!skipImage) {
            thumbnailTarget.append(thumbSlide(index));
            imageElement.dataset.width = imageElement.width;
            imageElement.dataset.height = imageElement.height;

            const slot = $(`.ks-producthero__thumbslide__liner--${index}`);
            slot[0].insertAdjacentElement('afterbegin', imageElement);
          }
        });

        module.$nodes.thumbs = $('.ks-producthero__thumbslide');
      },

      addListeners: () => {
        const {
          controls,
          thumbs,
          featuredImage,
          fullscreenTrigger,
          fullscreenClose,
          prevSlideTrigger,
          nextSlideTrigger,
          thumbnailTarget,
          label,
        } = module.$nodes;
        const { methods } = module;

        controls.click(function() {
          methods.cycleSlides(this);
        });

        thumbs.click(function() {
          const { thumbs } = module.$nodes;
          const { flickity } = module.data;

          const $t = $(this);
          const src = $t.find('img').attr('src');
          const idx = thumbs.index($t);

          featuredImage.attr('src', src);
        });

        fullscreenTrigger.on('click', function() {
          const className = 'fullscreen';
          const isFullscreen = gallery.classList.contains(className);
          const thumbs = thumbnailTarget.find('img');

          for (let i = 0, n = thumbs.length; i < n; i++) {
            const $t = $(thumbs[i]);

            if ($t.attr('src') === featuredImage.attr('src')) {
              module.data.currentIndex = thumbs.index($t);
              break;
            } else {
              module.data.currentIndex = 0;
            }
          }

          $cartSidebar.hide();
          $cartCover.hide();

          const targetSrc = $('.flickity-slider')
            .find('.is-selected img')
            .attr('src');

          label.text(makeReadableLabel(targetSrc));
          gallery.classList[isFullscreen ? 'remove' : 'add'](className);
        });

        fullscreenClose.on('click', function() {
          $cartSidebar.show();
          $cartCover.show();

          gallery.classList.remove('fullscreen');
        });

        prevSlideTrigger.on('click', function() {
          const thumbs = thumbnailTarget.find('img');
          const prevImgSrc = $(thumbs[module.data.currentIndex - 1]).attr(
            'src'
          );

          nextSlideTrigger.show();

          if (!prevImgSrc) {
            $(this).hide();
            return;
          }

          featuredImage.attr('src', prevImgSrc);

          label.text(makeReadableLabel(prevImgSrc));

          module.data.currentIndex--;
        });

        nextSlideTrigger.on('click', function() {
          const thumbs = thumbnailTarget.find('img');
          let nextImgSrc = $(thumbs[module.data.currentIndex + 1]).attr('src');

          prevSlideTrigger.show();

          if (!nextImgSrc) {
            $(this).hide();
            return;
          }

          featuredImage.attr('src', nextImgSrc);

          label.text(makeReadableLabel(nextImgSrc));

          module.data.currentIndex++;
        });
      },

      cycleSlides: clicked => {
        const { thumbs, featuredImage } = module.$nodes;
        const { flickity } = module.data;

        const $t = $(clicked);
        const isPrev = $t.hasClass('ks-gallerycontrols__prev');

        isPrev ? flickity.previous() : flickity.next();

        const selected = $(thumbs[flickity.selectedIndex]).find('img')[0];
        const src = selected.getAttribute('src');

        featuredImage.attr('src', src);
        featuredImage.attr('data-width', selected.dataset.width);
        featuredImage.attr('data-height', selected.dataset.height);
      },

      initFlickity: () => {
        const { $nodes, data } = module;
        data.flickity = new Flickity($nodes.thumbnailTarget[0], {
          cellSelector: '.ks-producthero__thumbslide',
          cellAlign: 'left',
          prevNextButtons: false,
          pageDots: false,
        });
        module.$nodes.thumbImages = $(
          '.ks-producthero__thumbslider .flickity-viewport img'
        );
      },
    },
  };

  module.hooks.mounted();
  if (module.data.isInternetExplorer) {
    window.addEventListener('debouncedResize', module.hooks.resize);
  }
};
