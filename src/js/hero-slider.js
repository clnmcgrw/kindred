import Flickity from 'flickity';

const heroSlider = document.getElementById('ks-hero-slider');

export default () => {
  if (!heroSlider || heroSlider.classList.contains('ks-heroslider--nocarousel'))
    return;

  const flkty = new Flickity(heroSlider, {
    cellSelector: '.ks-heroslider--slide',
    prevNextButtons: false,
  });
};
