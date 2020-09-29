export const $doc = $(document);
export const $win = $(window);
export const $body = $('body');
export const $siteHeader = $('#ks-main-header');
export const $siteFooter = $('.ks-footer');
export const $mainSiteContainer = $('main > .ks-site-container');
export const $cartSidebar = $('#ks-cartsidebar');
export const $cartCover = $('#ks-cartsidebar__cover');
export const $lightbox = $('.ks-modal--lightbox');
export const $lightboxTriggers = $('.ks-lightbox-trigger');
export const $lightboxClose = $lightbox.find('.ks-modal__close');
export const $searchModal = $('.ks-modal--search');
export const $cookieNotice = $('.ks-cookienotice');
export const $backdrop = $('#ks-backdrop');
export const headerHeight = () => $siteHeader.outerHeight();

import { debounce, loadDynamicFigures } from '../js/lib/helpers';

function setHeaderHeight() {
  if ($siteHeader.hasClass('ks-mainheader--alt')) return;

  $mainSiteContainer.css({ 'padding-top': headerHeight() });
}

const debouncedResize = new CustomEvent('debouncedResize');

window.addEventListener('resize', debounce(emitDebouncedResize, 30));

function emitDebouncedResize() {
  window.dispatchEvent(debouncedResize);
}

/**
 * Cookie notice stuff
 */
// const KS_COOKIE_NAME = '__kindred_cookieconsent';
// const KS_COOKIE_EXP = ';max-age=31536000'; // 1yr
// function handleCookieNotice() {
//   document.cookie.indexOf(KS_COOKIE_NAME) > -1
//     ? $cookieNotice.removeClass('active')
//     : $cookieNotice.addClass('active');
// }
// $cookieNotice.find('.ks-btn').click(() => {
//   document.cookie = KS_COOKIE_NAME + '=1' + KS_COOKIE_EXP;
//   handleCookieNotice();
// });

$doc.ready(() => {
  setHeaderHeight();
  // handleCookieNotice();
  loadDynamicFigures();

  // Make the footer mountain bg gap fill with the previous section's bg color
  const targetBgColor = $('main .ks-site-container section')
    .last()
    .css('background-color');
  $siteFooter.find('.ks-site-container').css({
    backgroundColor: targetBgColor,
  });

  // Fire bowls page gets special ordering and I can't be bothered to do this in HubL
  if ($body.hasClass('hs-content-id-24294764548')) {
    const $productList = $('.ks-productlist');
    const $products = $productList.find('.ks-card');
    const $woodTop = $productList.find('[data-product-id="26132525875"]');
    const $propaneTank = $productList.find('[data-product-id="26134899101"]');

    $propaneTank.insertAfter($products.last());
    $woodTop.insertBefore($propaneTank);
  }
});

$win.resize(setHeaderHeight);
