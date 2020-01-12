import { tween, styler } from 'popmotion';

const headerElement = document.getElementById('ks-main-header');
const navToggleBtn = document.getElementById('ks-nav-toggle');
const mainNav = document.getElementById('ks-main-nav');

const searchTrigger = document.querySelectorAll('[data-search-trigger]');
const cartTrigger = document.querySelectorAll('[data-cart-trigger]');

export let navOpen = false;


const navToggleHandler = e => {
  e.preventDefault();
};


export default () => {
  if (!headerElement) return;

  navToggleBtn.addEventListener('click', navToggleHandler);
};