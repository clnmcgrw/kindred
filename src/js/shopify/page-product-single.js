import { getProductById, getProductByHandle } from './functions';
import client from './client';

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

/**
 * Populates the items that we don't get from the HubSpot-Shopify bridge.
 * @param {GraphModel} product - the product Object we get back from Storefront
 *
 */
async function renderProductDetails(product) {
  const { descriptionHtml, options, images, variants } = product;
  const firstVariant = variants[0];

  $skuTarget.text(firstVariant.sku);
  $priceTarget.text(`$${firstVariant.price}`);
  $descriptionTarget.html(descriptionHtml);
  $selectionTarget.text(firstVariant.title);

  images.forEach(({ src }, i) => {
    if (i === 0) return; // the first img is already included in the template

    $featuredThumb.after(/*html*/ `
      <div class="ks-producthero__thumbslide">
        <img src="${src}" />
      </div>
    `);
  });

  const $sliderThumbs = $('.ks-producthero__thumbslide');
  $sliderThumbs.click(function() {
    const $t = $(this).find('img');

    $featuredImage.attr('src', $t.attr('src'));
  });

  variants.forEach((variant, i) => {
    if (i % 2 === 0) {
      $variantsTarget.append(/*html*/ `
        <div
          class="ks-producthero__variant ${
            variant.available === false ? 'out-of-stock' : ''
          }"
          data-variant-id="${variant.id}"
          data-variant-type-1="${variant.selectedOptions[0].value}"
          data-variant-type-2="${variant.selectedOptions[1].value}"
        >
          <img src="${variant.image.src}" alt=""/>
        </div>
      `);
    }
  });

  if (childCategory === 'fire-bowls') {
    const { values } = options.filter(opt => opt.name === 'Fuel').shift();

    values.forEach((val, i) =>
      $optionsTarget.append(/*html*/ `
      <button class="ks-producthero__option ${i === 0 ? 'active' : ''}">${
        val.value
      }</button>
    `)
    );
  }
}

export default async () => {
  if (!$productDataDump.length) return;

  const thisProduct = await getProductById(storefrontId);
  renderProductDetails(thisProduct);

  console.log(thisProduct);
  /**
   * Log this out until we get all these storefront ID's manually entered in HubDB
   */
  console.log(`Storefront ID: ${thisProduct.id}`);
};
