import Flickity from 'flickity';
import { $win, $lightbox, $lightboxClose } from './ui';
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
const $galleryControls = $('.ks-gallerycontrols .ks-svg-wrapper');
const $enlarge = $('.ks-producthero__enlarge');
const productHandle = $productDataDump.data('product-handle');
const storefrontId = $productDataDump.data('storefront-id');

let $variantEls;
let $galleryThumbs;
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

  renderVariants(variants, getSelectedOptions());
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
 * @param {array} images - an array of the Product images
 */
function renderGalleryImages(images) {
  const loadQueue = images.map(({ src }) => ({ src, loaded: false }));

  loadQueue.forEach(image => {
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
  /**
   * 'Color & Finish' is a given w/ all of their products so far, and we're using
   * that option as the main variant selector, so don't render it out as an
   * additional option.
   */
  const relevantOptionGroups = options.filter(
    opt => opt.name !== 'Color & Finish'
  );

  relevantOptionGroups.forEach((optionGroup, i) =>
    optionGroup.values.forEach((option, j) => {
      option.parentGroup = optionGroup.name;
      $($optionsTarget.children()[i]).append(productHeroOption(option, j));
    })
  );
}

function renderVariants(variants, userSelectedOpts = []) {
  $variantsTarget.empty();

  /**
   * Only render variants that match all of the currently
   * selected options. This gets tricky because not all
   * products have the same number of options.
   */
  const matchedVariants = variants.filter(variant => {
    let matched,
      matchCount = 0;

    userSelectedOpts.forEach(defaultOpt => {
      variant.selectedOptions.forEach(opt => {
        if (opt.value === defaultOpt) {
          matchCount++;

          if (matchCount === userSelectedOpts.length) {
            matched = opt;
          }
        }
      });
    });

    return matched;
  });

  if (userSelectedOpts.length) {
    matchedVariants.forEach(variant =>
      $variantsTarget.append(productHeroVariant(variant))
    );
  } else {
    variants.forEach(variant =>
      $variantsTarget.append(productHeroVariant(variant))
    );
  }

  // Have to query here since these are added/removed from the DOM on the fly
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

  attachVariantClick();

  $optionTriggers.click(function() {
    const $t = $(this);

    $t.siblings().removeClass('active');
    $t.addClass('active');

    renderVariants(variants, getSelectedOptions());
    attachVariantClick();
  });

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
    // Query now that they're in the DOM
    $galleryThumbs = $('.ks-producthero__thumbslide');

    flkty = new Flickity($galleryImagesTarget[0], {
      cellSelector: '.ks-producthero__thumbslide',
      cellAlign: 'left',
      prevNextButtons: false,
      pageDots: false,
      draggable: false,
    });

    $galleryControls.click(function() {
      const $t = $(this);
      const isPrev = $t.hasClass('ks-gallerycontrols__prev');

      isPrev ? flkty.previous() : flkty.next();
    });

    $galleryThumbs.click(function() {
      const src = $(this)
        .find('img')
        .attr('src');

      $featuredImage.attr('src', src);
    });
  });

  $enlarge.click(() => {
    const src = $featuredImage.attr('src');

    $lightbox.addClass('active');
    $lightbox.find('img').attr('src', src);
  });

  $lightboxClose.click(() => $lightbox.removeClass('active'));
}

function getSelectedOptions() {
  const currentSelectedOpts = [];

  $optionsTarget.find('.active').each(function() {
    const $t = $(this);
    const optionValue = $t.data('option-value');

    currentSelectedOpts.push(optionValue);
  });

  return currentSelectedOpts;
}

function attachVariantClick() {
  /**
   * Variants get removed & replaced when a user
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
