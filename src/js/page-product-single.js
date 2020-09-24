import { $body, $win, $lightbox, $lightboxClose } from './ui';
import { getProductById, getProductByHandle } from './shopify/functions';
import { productHeroVariant, productHeroOption } from './components';

import productSingleGallery from './product-single-gallery';

const $productDataDump = $('#shopify-product-data');
const $featuredImage = $('#ks-featuredimage');
// const $galleryImagesTarget = $('#ks-galleryimagestarget');
const $skuTarget = $('#ks-skutarget');
const $priceTarget = $('#ks-pricetarget');
const $selectionTarget = $('#ks-selectiontarget');
const $variantsTarget = $('#ks-variantstarget');
const $optionsTarget = $('#ks-optionstarget');
const $quantityAdjust = $('.ks-quantity__action');
const $quantityTarget = $('#ks-quantitytarget');
// const $galleryControls = $('.ks-gallerycontrols .ks-svg-wrapper');
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

  window.__sfyProduct = product;

  renderInitialDetails(variants[0]);
  renderGalleryImages(images);
  renderOptions(options);

  if (variants.length) {
    renderVariants(variants, getSelectedOptions());
  } else {
    $('.ks-producthero__currentselection').css('opacity', 0);
  }

  attachEventListeners(product);
}

/**
 * Uses the first variant in the set to seed the initial SKU, price, etc.
 * @param {GraphModel} product - the first variant in the Product's set of variants
 */
function renderInitialDetails(firstVariant) {
  let { sku, price, title } = firstVariant;

  $skuTarget.text(sku);
  $priceTarget.text(`$${price}`);
  $selectionTarget.text(title);
}

/**
 * Asynchronously loads all gallery images and triggers a custom event to let Flickity
 * know when to take over and intialize the gallery.
 * @param {array} images - an array of the Product images
 */
function renderGalleryImages(images) {
  const loadQueue = images.map(({ src }) => ({ src, loaded: false }));
  const loadedImages = [];
  loadQueue.forEach(image => {
    const newImage = new Image();

    newImage.onload = () => {
      image.loaded = true;
      loadedImages.push(newImage);

      const numLoaded = loadQueue.filter(({ loaded }) => loaded).length;

      if (numLoaded === loadQueue.length) {
        $win.trigger({
          type: 'gallery-images-loaded',
          galleryImages: loadedImages, // pass the actual created image elements, not just the src
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

  if ($variantEls.length === 1) {
    // removeSelectionAndVariants();
  } else {
    $('.ks-producthero__currentselection').css('opacity', '1');
  }

  if (!$firstInStock.length) return;

  $firstInStock.addClass('active');
  $skuTarget.text($firstInStock.data('variant-sku'));

  let vType1 = $firstInStock.data('variant-type-1');
  let vType2 = $firstInStock.data('variant-type-2');

  if (vType1.toLowerCase() === 'default title')
    vType1 = '1 option(s) available';

  $selectionTarget.text(`${vType1} ${vType2 ? ` / ${vType2}` : ''}`);

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

  $win.on('gallery-images-loaded', function(thing) {
    productSingleGallery(thing, $);
  });

  // $enlarge.click(() => {
  //   const src = $featuredImage.attr('src');
  //   const width = $featuredImage.attr('data-width');
  //   const height = $featuredImage.attr('data-height');
  //   $body.addClass('scroll-disabled');
  //   $lightbox.addClass('active');
  //   $lightbox.find('img').attr('src', src);
  //   $lightbox.find('figure').css({
  //     paddingBottom: `${(height / width) * 100}%`,
  //   });
  // });

  // $lightboxClose.click(() => {
  //   $lightbox.removeClass('active');
  //   $body.removeClass('scroll-disabled');
  // });
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
  if (window.__sfyProduct.variants.length <= 1) return;
  /**
   * Variants get removed & replaced when a user
   * selects an option that has different variants attached; eg fire bowls.
   *
   * In that case, we need to reattach a click listener to those new els.
   */
  $variantEls.on('click', function() {
    const $t = $(this);

    console.log($t);

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
  }
};
