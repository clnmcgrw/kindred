import { $doc } from './ui';

const $categoryList = $('.ks-categorylist');
const $triggers = $categoryList.find('.ks-headline');
const $images = $categoryList.find('.ks-figure');

export default () => {
  if (
    !$categoryList.length ||
    $categoryList.hasClass('ks-categorylist--aboutus')
  )
    // The one on the About Us page doesn't get any of this stuff since it lists all categories in two cols
    return;

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
