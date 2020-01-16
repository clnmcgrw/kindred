import {
  headerHeight,
  $doc,
  $win,
  $mainSiteContainer,
  $cartSidebar,
  $cartCover,
} from './ui';

const $cartContent = $cartSidebar.find('.ks-cartsidebar__content');
const $cartItemsParent = $cartSidebar.find('.ks-cartsidebar__items');
const $cartActions = $cartSidebar.find('.ks-cartsidebar__actions');
const $cartTriggers = $('.ks-carttrigger');

function setCartPositioning() {
  const hHeight = headerHeight();

  $cartContent.css({
    height: `calc(100vh - ${hHeight}px)`,
  });

  $cartSidebar.css({
    top: hHeight,
    right: ($win.width() - $mainSiteContainer.width()) / 2,
  });

  $cartCover.css({
    top: hHeight,
    right: ($win.width() - $mainSiteContainer.width()) / 2,
  });

  $cartItemsParent.css({
    'max-height': $cartContent.outerHeight() - $cartActions.outerHeight(),
  });
}

$cartTriggers.click(function() {
  $cartSidebar.toggleClass('active');
});

$doc.ready(setCartPositioning);
$win.resize(setCartPositioning);
