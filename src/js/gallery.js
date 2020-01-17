import Isotope from 'isotope-layout';
import { $doc } from './ui';

const $galleryParent = $('.ks-gallery > .ks-inner');
const $galleryItems = $galleryParent.find('.ks-gallerycard');

let iso;

function attachEventListeners() {
  $galleryItems.each(function() {
    const $t = $(this);
    const imageWidth = $t.data('image-width');

    const computedWidth = ((imageWidth / $galleryParent.width()) * 100).toFixed(
      2
    );

    $t.css({
      'flex-basis': `${computedWidth}%`,
    });
  });
}

export default () => {
  attachEventListeners();
};
