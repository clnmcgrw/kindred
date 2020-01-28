const $headerElement = $('#ks-main-header');
const $navToggleBtn = $('#ks-nav-toggle');
const $mainNav = $('#ks-main-nav');
const $searchTrigger = $('.ks-searchtrigger');
const $cartTrigger = $('.ks-carttrigger');

export let navOpen = false;

const navToggleHandler = e => {
  e.preventDefault();
};

export default () => {
  if (!$headerElement.length) return;

  if (
    window.location.pathname === '/' ||
    window.location.pathname === '/homepage'
  ) {
    $headerElement.addClass('ks-mainheader--alt');
  }

  $navToggleBtn.click(function(e) {
    e.preventDefault();

    const $t = $(this);
    $t.toggleClass('open');
  });
};
