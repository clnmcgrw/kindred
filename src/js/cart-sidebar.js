import { headerHeight, $doc, $win, $mainSiteContainer } from './ui';

const $cartSidebar = $('#ks-cartsidebar');
const $cartTriggers = $('.ks-carttrigger');

function setCartPositioning() {
  $cartSidebar.css({
    top: headerHeight(),
    right: ($win.width() - $mainSiteContainer.width()) / 2,
  });
}

$cartTriggers.click(function() {
  $cartSidebar.toggleClass('active');
});

$doc.ready(setCartPositioning);
$win.resize(setCartPositioning);
