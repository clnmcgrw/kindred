export const $doc = $(document);
export const $win = $(window);
export const $siteHeader = $('#ks-main-header');
export const $mainSiteContainer = $('main > .ks-site-container');
export const headerHeight = () => $siteHeader.outerHeight();

function setHeaderHeight() {
  $mainSiteContainer.css({ 'padding-top': headerHeight() });
}

$doc.ready(setHeaderHeight);
