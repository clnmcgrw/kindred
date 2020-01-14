const $doc = $(document);
const $win = $(window);
const $siteHeader = $('#ks-main-header');
const $heightShim = $('main > .ks-site-container');
const headerHeight = () => $siteHeader.outerHeight();

function setHeaderHeight() {
  $heightShim.css({ 'padding-top': headerHeight });
}

$doc.ready(setHeaderHeight);
