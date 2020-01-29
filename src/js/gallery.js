import { $doc } from './ui';
import { lazyloadRestart } from './lazyloading';
import { galleryItem } from './components';

const $galleryNav = $('.ks-gallery .ks-resourcelist__nav');
const $filterTriggers = $('*[data-toggle-type]');
const $galleryParent = $('.ks-gallery__main > .ks-inner');
const $loadMore = $('#ks-loadmore');

/**
 * This list can grow as more items are appended. This being a
 * func allows us to always have this be a live list of elements.
 */
const $galleryItems = () => $('.ks-gallery__item');

const itemsToLoad = window.remainingGalleryItems || [];
const chunk = 6;

export default () => {
  if (!$galleryNav.length) return;

  $loadMore.click(() => {
    for (let i = 0, n = chunk; i < n; i++) {
      if (!itemsToLoad.length) {
        $loadMore.attr('disabled', true);
        $loadMore.text('No more!');
        return;
      }

      $galleryParent.append(galleryItem(itemsToLoad.shift()));
    }
    lazyloadRestart();
  });

  $filterTriggers.click(function() {
    const targetType = $(this).data('toggle-type');

    $galleryItems().each(function() {
      const $t = $(this);

      $t.data('product-type') !== targetType ? $t.hide() : $t.show();
    });
  });
};
