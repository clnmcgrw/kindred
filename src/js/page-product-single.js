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
let currentSelectedOpts = [];

/**
 * Populates the items that we don't get from the HubSpot-Shopify bridge.
 * @param {GraphModel} product - the product Object we get back from Storefront
 */
async function renderProduct(product) {
  const { options, images, variants } = product;

  renderInitialDetails(variants[0]);
  renderGalleryImages(images);
  renderOptions(options);

  $optionsTarget.find('.active').each(function() {
    const $t = $(this);
    const optionValue = $t.data('option-value');

    currentSelectedOpts.push(optionValue);
  });

  renderVariants(variants, currentSelectedOpts);
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

  // TODO: Some products don't have opts besides Color & Finish, handle undefined in that case

  /**
   * If these outputs all remain the same regardless of the child category, we can
   * remove the switch and just blindly render all relevant options
   */
  switch (childCategory) {
    case 'fire-bowls':
      relevantOptionGroups.forEach((optionGroup, i) =>
        optionGroup.values.forEach((option, j) => {
          option.parentGroup = optionGroup.name;
          $($optionsTarget.children()[i]).append(productHeroOption(option, j));
        })
      );
      break;
    case 'building-blocks':
      relevantOptionGroups.forEach((optionGroup, i) =>
        optionGroup.values.forEach((option, j) => {
          option.parentGroup = optionGroup.name;
          $($optionsTarget.children()[i]).append(productHeroOption(option, j));
        })
      );
      break;
    case 'mantels':
      relevantOptionGroups.forEach((optionGroup, i) =>
        optionGroup.values.forEach((option, j) => {
          option.parentGroup = optionGroup.name;
          $($optionsTarget.children()[i]).append(productHeroOption(option, j));
        })
      );
      break;
    default:
      return;
  }
}

function renderVariants(variants, optsSelectedByDefault) {
  $variantsTarget.empty();

  const matchedVariants = variants.filter(variant => {
    let matched;

    variant.selectedOptions.forEach(option => {
      let matchCount = 0;

      optsSelectedByDefault.forEach(defaultOpt => {
        if (option.value.replace(/\\\//g, '') === defaultOpt) {
          console.log(option.value, defaultOpt);
          matchCount++;
        }
      });

      if (matchCount === optsSelectedByDefault.length - 1) {
        matched = option;
      }
    });

    // variant.selectedOptions.forEach(option => {
    //   optsSelectedByDefault.forEach(initOpt => {
    //     if (option.value === initOpt) {
    //       matched = option;
    //     }
    //   });
    // });

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
  if (optsSelectedByDefault) {
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
    const selectedOption = $t.data('option-value');

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

    new Flickity($galleryImagesTarget[0], {
      cellSelector: '.ks-producthero__thumbslide',
      cellAlign: 'left',
      groupCells: 3,
      prevNextButtons: false,
      pageDots: false,
    });
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
