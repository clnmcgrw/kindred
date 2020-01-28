import { $win, $siteHeader } from './ui';

const $navToggleBtn = $('#ks-nav-toggle');
// const $mainNav = $('#ks-main-nav');
// const $searchTrigger = $('.ks-searchtrigger');
// const $cartTrigger = $('.ks-carttrigger');

export let navOpen = false;

let didScroll = false;
let lastScroll = 0;

function headerScroll() {
  if (didScroll) {
    const thisScroll = $win.scrollTop();

    if (thisScroll > 0) {
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
