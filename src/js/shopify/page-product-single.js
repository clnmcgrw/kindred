import { getProductById, getProductByHandle } from './functions';

const $productDataDump = $('#shopify-product-data');
const $featuredImage = $('#ks-featuredimage');
const $featuredThumb = $('#ks-featuredthumb');
const $skuTarget = $('#ks-skutarget');
const $priceTarget = $('#ks-pricetarget');
const $descriptionTarget = $('#ks-descriptiontarget');
const $selectionTarget = $('#ks-selectiontarget');
const $variantsTarget = $('#ks-variantstarget');
const $mainSlider = $('.ks-producthero__mainslider');
const storefrontId = $productDataDump.data('storefront-id');

export default async () => {
  if (!$productDataDump.length) return;

  const thisProduct = await getProductById(storefrontId);
  const {
    id,
    availableForSale,
    descriptionHtml,
    handle,
    title,
    options,
    images,
    variants,
  } = thisProduct;

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

  variants.forEach(({ image }, i) => {
    if (i % 2 === 0) {
      $variantsTarget.append(/*html*/ `
        <div class="ks-producthero__variant">
          <img src="${image.src}" alt=""/>
        </div>
      `);
    }
  });

  console.log(thisProduct);
  /**
   * Log this out until we get all these storefront ID's manually entered in HubDB
   */
  console.log(`Storefront ID: ${id}`);
};
