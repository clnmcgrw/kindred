import Flickity from 'flickity';

const heroSlider = document.getElementById('ks-hero-slider');


export default () => {
  if (!heroSlider) return;

  const flkty = new Flickity({
    cellSelector: '.ks-heroslider--slide',
  });

};