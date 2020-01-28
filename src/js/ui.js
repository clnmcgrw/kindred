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
export const headerHeight = () => $siteHeader.outerHeight();

function setHeaderHeight() {
  if ($siteHeader.hasClass('ks-mainheader--alt')) return;

  $mainSiteContainer.css({ 'padding-top': headerHeight() });
}

$doc.ready(setHeaderHeight);
$win.resize(setHeaderHeight);
