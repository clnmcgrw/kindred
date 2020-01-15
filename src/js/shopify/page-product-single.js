import { getProductById, getProductByHandle } from './functions';

const $productDataDump = $('#shopify-product-data');
const $featuredImage = $('#ks-featuredimage');
const $featuredThumb = $('#ks-featuredthumb');
const $skuTarget = $('#ks-skutarget');
const $priceTarget = $('#ks-pricetarget');
const $descriptionTarget = $('#ks-descriptiontarget');
const $selectionTarget = $('#ks-selectiontarget');
const $variantsTarget = $('#ks-variantstarget');
const $optionsTarget = $('#ks-optionstarget');
const storefrontId = $productDataDump.data('storefront-id');
const childCategory = $productDataDump.data('child-cat');

let $variantEls;

/**
 * Populates the items that we don't get from the HubSpot-Shopify bridge.
 * @param {GraphModel} product - the product Object we get back from Storefront
 *
 */
async function renderProduct(product) {
  const { options, images, variants } = product;

  renderDetails(product);
  renderGalleryImages(images);
  renderOptions(options);
  renderVariants(variants, $optionsTarget.find('.active').data('option-name'));
  attachEventListeners(product);
}

function renderDetails(product) {
  const { descriptionHtml, variants } = product;
  const firstVariant = variants[0];

  $skuTarget.text(firstVariant.sku);
  $priceTarget.text(`$${firstVariant.price}`);
  $descriptionTarget.html(descriptionHtml);
  $selectionTarget.text(firstVariant.title);
}

function renderGalleryImages(images) {
  images.forEach(({ src }, i) => {
    if (i === 0) return; // the first img is already included in the template

    $featuredThumb.after(/*html*/ `
      <div class="ks-producthero__thumbslide">
        <img src="${src}" />
      </div>
    `);
  });
}

function renderOptions(options) {
  if (childCategory === 'fire-bowls') {
    const { values } = options.filter(opt => opt.name === 'Fuel').shift();

    values.forEach((val, i) =>
      $optionsTarget.append(/*html*/ `
      <button
        class="ks-producthero__option ${i === 0 ? 'active' : ''}"
        data-option-name="${val.value}"
      >
        ${val.value}
      </button>
    `)
    );
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

  matchedVariants.forEach((variant, i) => {
    $variantsTarget.append(/*html*/ `
    <div
      class="
        ks-producthero__variant
        ${variant.available === false ? 'out-of-stock' : ''}
      "
      data-variant-id="${variant.id}"
      data-variant-type-1="${variant.selectedOptions[0].value}"
      data-variant-type-2="${
        variant.selectedOptions[1] ? variant.selectedOptions[1].value : ''
      }"
    >
      <img src="${variant.image.src}" alt=""/>
    </div>
    `);
  });

  $variantEls = $('.ks-producthero__variant');
  const $firstInStock = $variantEls.not('.out-of-stock').first();

  $firstInStock.addClass('active');

  if (!$firstInStock.length) return;

  $selectionTarget.text(
    `${$firstInStock.data('variant-type-1')} ${
      $firstInStock.data('variant-type-2')
        ? ` / ${$firstInStock.data('variant-type-2')}`
        : ''
    }`
  );
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
  renderProduct(thisProduct);

  console.log(thisProduct);
  console.log(`Storefront ID: ${thisProduct.id}`);
};
