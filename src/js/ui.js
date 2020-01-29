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
export const headerHeight = () => $siteHeader.outerHeight();

function setHeaderHeight() {
  if ($siteHeader.hasClass('ks-mainheader--alt')) return;

  $mainSiteContainer.css({ 'padding-top': headerHeight() });
}

/**
 * Cookie notice stuff
 */
const KS_COOKIE_NAME = '__kindred_cookieconsent';
const KS_COOKIE_EXP = ';max-age=31536000'; // 1yr
$cookieNotice.find('.ks-btn').click(function() {
  document.cookie = KS_COOKIE_NAME + '=1' + KS_COOKIE_EXP;
  handleCookieNotice();
});
function handleCookieNotice() {
  document.cookie.indexOf(KS_COOKIE_NAME) > -1
    ? $cookieNotice.removeClass('active')
    : $cookieNotice.addClass('active');
}

$doc.ready(() => {
  setHeaderHeight();
  handleCookieNotice();
});
$win.resize(setHeaderHeight);
