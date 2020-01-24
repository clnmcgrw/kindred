import Flickity from 'flickity';
import { $win } from './ui';
import { getProductById, getProductByHandle } from './shopify/functions';
import {
  productHeroVariant,
  thumbSlide,
  productHeroOption,
} from './components';

const $productDataDump = $('#shopify-product-data');
const $featuredImage = $('#ks-featuredimage');
const $galleryImagesTarget = $('#ks-galleryimagestarget');
const $skuTarget = $('#ks-skutarget');
const $priceTarget = $('#ks-pricetarget');
const $selectionTarget = $('#ks-selectiontarget');
const $variantsTarget = $('#ks-variantstarget');
const $optionsTarget = $('#ks-optionstarget');
const $quantityAdjust = $('.ks-quantity__action');
const $quantityTarget = $('#ks-quantitytarget');
const productHandle = $productDataDump.data('product-handle');
const storefrontId = $productDataDump.data('storefront-id');
const childCategory = $productDataDump.data('child-cat');

let $variantEls;
let flkty;

/**
 * Populates the items that we don't get from the HubSpot-Shopify bridge.
 * @param {GraphModel} product - the product Object we get back from Storefront
 */
async function renderProduct(product) {
  const { options, images, variants } = product;

  renderInitialDetails(variants[0]);
  renderGalleryImages(images);
  renderOptions(options);
  renderVariants(variants, $optionsTarget.find('.active').data('option-name'));
  attachEventListeners(product);
}

/**
 * Uses the first variant in the set to seed the initial SKU, price, etc.
 * @param {GraphModel} product - the first variant in the Product's set of variants
 */
function renderInitialDetails(firstVariant) {
  $skuTarget.text(firstVariant.sku);
  $priceTarget.text(`$${firstVariant.price}`);
  $selectionTarget.text(firstVariant.title);
}

/**
 * Asynchronously loads all gallery images and triggers a custom event to let Flickity
 * know when to take over and intialize the gallery.
 *
 * This is needed because all the images need to be loaded so Flickity can measure their
 * height w/o triggering a resize. In that case, checking for all images to be loaded
 * first would be needed anyway.
 * @param {array} images - an array of the Product images
 */
function renderGalleryImages(images) {
  const loadQueue = images.map(({ src }) => ({ src, loaded: false }));
  // loadQueue.shift(); // don't need first image since it's included in the template

  loadQueue.forEach((image, i) => {
    const newImage = new Image();
    newImage.onload = () => {
      image.loaded = true;

      const numLoaded = loadQueue.filter(({ loaded }) => loaded).length;

      if (numLoaded === loadQueue.length) {
        $win.trigger({
          type: 'gallery-images-loaded',
          galleryImages: loadQueue.map(({ src }) => src),
        });
      }
    };
    newImage.src = image.src;
  });
}

function renderOptions(options) {
  let fuelOpts, sizeOpts;

  switch (childCategory) {
    case 'fire-bowls':
      fuelOpts = options.filter(opt => opt.name === 'Fuel').shift();
      sizeOpts = options.filter(opt => opt.name === 'Size').shift();

      const allOpts = [
        fuelOpts.values,
        sizeOpts ? sizeOpts.values : null,
      ].flat();

      allOpts.forEach((option, i) => {
        if (!option) return;
        $optionsTarget.append(productHeroOption(option, i));
      });
      break;
    case 'building-blocks':
      sizeOpts = options.filter(opt => opt.name === 'Size').shift().values;

      sizeOpts.forEach((option, i) =>
        $optionsTarget.append(productHeroOption(option, i))
      );
      break;
    default:
      return;
  }
}

function renderVariants(variants, selectedOption) {
  $variantsTarget.empty();

  const matchedVariants = variants.filter(variant => {
    let matched;

    variant.selectedOptions.forEach(option => {
      if (option.value === selectedOption) {
        matched = option;
      }
    });

    return matched;
  });

  /**
   * Some products have variants broken down by some other option,
   * for instance, Fire Bowls have a "fuel" option in addition to
   * the initial texture & color variant.
   *
   * In that case, if options are present, only render the options
   * that match the default selected option, which for now is the
   * first item in the set of options.
   *
   * If no options are present, just render out all of the variants.
   */
  if (selectedOption) {
    matchedVariants.forEach(variant =>
      $variantsTarget.append(productHeroVariant(variant))
    );
  } else {
    variants.forEach(variant =>
      $variantsTarget.append(productHeroVariant(variant))
    );
  }

  $variantEls = $('.ks-producthero__variant');
  const $firstInStock = $variantEls.not('.out-of-stock').first();

  if (!$firstInStock.length) return;

  $firstInStock.addClass('active');
  $skuTarget.text($firstInStock.data('variant-sku'));

  $selectionTarget.text(
    `${$firstInStock.data('variant-type-1')} ${
      $firstInStock.data('variant-type-2')
        ? ` / ${$firstInStock.data('variant-type-2')}`
        : ''
    }`
  );

  $priceTarget.text(`$${$firstInStock.data('variant-price').toFixed(2)}`);
}

function attachEventListeners(product) {
  const { variants } = product;
  const $optionTriggers = $optionsTarget.find('.ks-producthero__option');

  $optionTriggers.click(function() {
    const $t = $(this);
    const selectedOption = $t.data('option-name');

    $t.siblings().removeClass('active');
    $t.addClass('active');
    renderVariants(variants, selectedOption);

    attachVariantClick();
  });

  const $sliderThumbs = $('.ks-producthero__thumbslide');

  $sliderThumbs.click(function() {
    const $t = $(this).find('img');

    $featuredImage.attr('src', $t.attr('src'));
  });

  attachVariantClick();

  $quantityAdjust.click(function() {
    const $t = $(this);
    let currentVal = parseInt($quantityTarget.text());

    if ($t.hasClass('ks-quantity__minus') && currentVal > 1) {
      $quantityTarget.text(--currentVal);
    } else if ($t.hasClass('ks-quantity__plus')) {
      $quantityTarget.text(++currentVal);
    }
  });

  $win.on('gallery-images-loaded', function({ galleryImages }) {
    galleryImages.forEach(src => $galleryImagesTarget.append(thumbSlide(src)));

    flkty = new Flickity($galleryImagesTarget[0], {
      cellSelector: '.ks-producthero__thumbslide',
      cellAlign: 'left',
      groupCells: 3,
      prevNextButtons: false,
      pageDots: false,
    });

    // f.resize();
  });
}

function attachVariantClick() {
  /**
   * This exists because variants get removed & replaced when a user
   * selects an option that has different variants attached; eg fire bowls.
   *
   * In that case, we need to reattach a click listener to those new els.
   */
  $variantEls.click(function() {
    const $t = $(this);

    if ($t.hasClass('out-of-stock')) return;

    $variantEls.removeClass('active');
    $skuTarget.text($t.data('variant-sku'));
    $priceTarget.text(`$${$t.data('variant-price').toFixed(2)}`);
    $t.addClass('active');

    $selectionTarget.text(
      `${$t.data('variant-type-1')} ${
        $t.data('variant-type-2') ? ` / ${$t.data('variant-type-2')}` : ''
      }`
    );
  });
}

export default async () => {
  if (!$productDataDump.length) return;

  const thisProduct = await getProductById(storefrontId);

  if (!thisProduct) {
    console.log(productHandle);
    /**
     * If this condition is met, it's likely that the Storefront ID
     * hasn't been entered in HubDB yet. Check the console for the
     * ID in this case, then put it in HubDB so that the product can
     * be correctly fetched.
     */
    const p = await getProductByHandle(productHandle);

    console.log(`Storefront ID: ${p.id}`);
  } else {
    renderProduct(thisProduct);
    console.log(thisProduct);
  }
};
