import { $win, $body, $siteHeader, headerHeight, $cartSidebar } from './ui';

const $navToggleBtn = $('#ks-nav-toggle');

export let navOpen = false;

let didScroll = false;
let lastScroll = 0;

function headerScroll() {
  if ($body.hasClass('is-location-finder')) return;

  if (didScroll) {
    const thisScroll = $win.scrollTop();

    if (thisScroll > $siteHeader.outerHeight()) {
      $siteHeader.addClass('traveling');

      if (thisScroll > lastScroll) {
        $siteHeader.removeClass('scroll-visible');
      } else {
        $siteHeader.addClass('scroll-visible solid');
      }

      lastScroll = thisScroll;
    } else {
      $siteHeader.removeClass('traveling scroll-visible solid');
    }
    didScroll = false;

    if (thisScroll <= headerHeight() && $cartSidebar.hasClass('active')) {
      $siteHeader.addClass('solid');
    }
  }
  requestAnimationFrame(headerScroll);
}

export default () => {
  if (!$siteHeader.length) return;

  headerScroll();

  $win.scroll(() => (didScroll = true));

  if (
    window.location.pathname === '/' ||
    window.location.pathname === '/homepage'
  ) {
    $siteHeader.addClass('ks-mainheader--alt');
  }

  $navToggleBtn.click(function(e) {
    e.preventDefault();

    const $t = $(this);
    $t.toggleClass('open');
    $siteHeader.toggleClass('solid');
  });
};
