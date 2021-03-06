import Flickity from 'flickity';
import 'flickity-fullscreen';
import { makeReadableLabel } from './lib/helpers';
import { $doc, $cartCover, $cartSidebar } from './ui';

const $parent = $('.ks-homepageslider');
const $mainImg = $parent.find('.ks-homepageslider__mainimg img');
const $carousel = $parent.find('.ks-homepageslider__carousel');
const $slides = $parent.find('.ks-homepageslider__slide');
const $prev = $parent.find('.ks-homepageslider__prevtrigger');
const $next = $parent.find('.ks-homepageslider__nexttrigger');
const $fullscreen = $parent.find('.ks-homepageslider__fullscreentrigger');
const $labels = $parent.find('.ks-homepageslider__product');

function setMainImage(idx) {
  if (!idx) {
    $mainImg.attr(
      'src',
      $carousel
        .find('img')
        .first()
        .attr('src')
    );
  } else {
    $parent.addClass('changing');

    setTimeout(function() {
      $mainImg.attr(
        'src',
        $($slides[idx])
          .find('img')
          .attr('src')
      );
    }, 200);

    setTimeout(function() {
      $parent.removeClass('changing');
    }, 200);
  }
}

export default () => {
  if (!$parent.length) return;

  const flkty = new Flickity($carousel[0], {
    cellSelector: '.ks-homepageslider__slide',
    prevNextButtons: false,
    cellAlign: 'left',
    pageDots: false,
    on: {
      ready() {
        setMainImage();
        $($labels[0])
          .find('a')
          .text(
            makeReadableLabel(
              $($slides[0])
                .find('img')
                .attr('src'),
              'hubfs/'
            )
          );
      },
      staticClick(_, __, ___, i) {
        setMainImage(i);
        this.select(i);
      },
      change(i) {
        setMainImage(i);

        $labels.each((_, label) => $(label).removeClass('visible'));

        $($labels[i]).addClass('visible');

        $($labels[i])
          .find('a')
          .text(
            makeReadableLabel(
              $($slides[i])
                .find('img')
                .attr('src'),
              'hubfs/'
            )
          );
      },
    },
  });

  $prev.on('click', () => flkty.previous());
  $next.on('click', () => flkty.next());
  $fullscreen.on('click', () => {
    $cartSidebar.hide();
    $cartCover.hide();
    $parent.toggleClass('fullscreen');
  });

  $labels.first().addClass('visible');

  $doc.on('keydown', ({ keyCode }) => {
    // escape key
    if (keyCode == 27 && $parent.hasClass('fullscreen')) {
      $cartSidebar.show();
      $cartCover.show();
      $parent.removeClass('fullscreen');
    }
  });
};
