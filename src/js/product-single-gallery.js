import Flickity from 'flickity';
import { $lightbox } from './ui';
import { thumbSlide } from './components';

const gallery = document.querySelector('.ks-producthero__gallery');

export default (event, $) => {
  if (!gallery) return;

  const module = {
    $nodes: {
      featuredImage: $('#ks-featuredimage'),
      thumbnailTarget: $('#ks-galleryimagestarget'),
      controls: $('.ks-gallerycontrols .ks-svg-wrapper'),
      thumbs: false, // queried on append
      flickityViewport: false, // queried on append
      thumbImages: false, // queried on append
    },

    data: {
      galleryImages: event.galleryImages,
      flickity: false,
      isInternetExplorer: false,
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
        const { controls, thumbs } = module.$nodes;
        const { methods } = module;

        controls.click(function() {
          methods.cycleSlides(this);
        });

        thumbs.click(function() {
          const { thumbs, featuredImage } = module.$nodes;
          const { flickity } = module.data;

          const $t = $(this);
          const src = $t.find('img').attr('src');
          const idx = thumbs.index($t);

          featuredImage.attr('src', src);
          flickity.select(idx);
        });
      },

      cycleSlides: clicked => {
        const { thumbs, featuredImage } = module.$nodes;
        const { flickity } = module.data;

        const $t = $(clicked);
        const isPrev = $t.hasClass('ks-gallerycontrols__prev');

        isPrev ? flickity.previous() : flickity.next();

        const selected = $(thumbs[flickity.selectedIndex]).find('img')[0];

        featuredImage.attr('src', selected.getAttribute('src'));
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
