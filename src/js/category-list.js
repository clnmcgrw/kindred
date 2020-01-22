import { $doc } from './ui';

const $categoryList = $('.ks-categorylist');
const $triggers = $categoryList.find('.ks-headline');
const $images = $categoryList.find('.ks-figure');

export default () => {
  if (!$categoryList.length) return;

  $triggers.hover(function() {
    const $t = $(this);
    const trigIdx = $triggers.index($t);
    const $targetImg = $($images[trigIdx]);

    $triggers.removeClass('active');
    $images.removeClass('active');
    $targetImg.addClass('active');
    $t.addClass('active');
  }, $.noop);

  $doc.ready(() => {
    $triggers.first().addClass('active');
    $images.first().addClass('active');
  });
};
