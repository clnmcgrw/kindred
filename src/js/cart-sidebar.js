import {
  headerHeight,
  $doc,
  $win,
  $body,
  $siteHeader,
  $mainSiteContainer,
  $cartSidebar,
  $cartCover,
  $backdrop,
} from './ui';

const $cartContent = $cartSidebar.find('.ks-cartsidebar__content');
const $cartItemsParent = $cartSidebar.find('.ks-cartsidebar__items');
const $cartActions = $cartSidebar.find('.ks-cartsidebar__actions');
const $cartTriggers = $('.ks-carttrigger');
const $cartClose = $('.ks-cartsidebar__close');

const extraPad = {
  sm: 32,
  lg: 64,
};

function setCartPositioning() {
  const hHeight = headerHeight();

  $cartContent.css({
    height: `calc(100vh)`,
    paddingTop: hHeight + extraPad.lg,
  });

  $cartSidebar.css({
    right: ($win.width() - $mainSiteContainer.width()) / 2,
  });

  $cartCover.css({
    right: ($win.width() - $mainSiteContainer.width()) / 2,
  });

  $cartClose.css({
    top: hHeight + extraPad.sm,
  });

  $cartItemsParent.css({
    'max-height': $cartContent.outerHeight() - $cartActions.outerHeight(),
  });
}

$cartClose.click(function() {
  if ($siteHeader.hasClass('solid')) {
    $siteHeader.removeClass('solid');
  }

  $backdrop.removeClass('active');
  $cartSidebar.removeClass('active');
});

$cartTriggers.click(function() {
  if (!$siteHeader.hasClass('solid')) {
    $siteHeader.addClass('solid');
  }

  $backdrop.toggleClass('active');
  $body.toggleClass('cart-open');
  $cartSidebar.toggleClass('active');
});

$doc.ready(setCartPositioning);
$win.resize(setCartPositioning);
