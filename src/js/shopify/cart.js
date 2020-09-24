/**
 * Here's a fun one --
 *
 * On doc.ready, this will:
 *
 * 1. Fetch an ongoing or fresh checkout
 * 2. Render the checkout items into the cart sidebar
 * 3. Handle increment/decrement/removal of individal cart items
 * 4. Handle discount/promo code application/removal
 *
 * There's a lot here, so major functionality is encapsulated into
 * their own functions.
 *
 * The actual Shopify CRUD functionality comes from /src/js/shopify/functions,
 * so if you're trying to debug something a bit lower than the UI of it all,
 * I'd start there.
 */

import { $doc, $siteHeader, $cartSidebar, $backdrop } from '../ui';
import {
  getCheckout,
  addItemToCheckout,
  getLineItemTotal,
  updateCheckoutItem,
  removeCheckoutItem,
  addPromoCodeToCheckout,
  removePromoCodeFromCheckout,
} from './functions';
import {
  cartSidebarItem,
  cartSubtotal,
  emptyCartNotice,
  cartDiscountItem,
} from '../components';

const $addToCartTrigger = $('#ks-addtocart');
const $cartItemsTarget = $('#ks-cartitems');
const $goToCheckoutTarget = $('#ks-checkout');
const $cartActions = $cartSidebar.find('.ks-cartsidebar__actions');
const $couponTrigger = $cartActions.find('#ks-coupontrigger');
const $couponModal = $cartSidebar.find('.ks-cartsidebar__couponmodal');
const $couponModalClose = $couponModal.find('.ks-couponmodal__close');
const $couponForm = $couponModal.find('.ks-form');

/**
 * These need to be queried after all cart items have been rendered
 */
let $incrementTriggers,
  $decrementTriggers,
  $removeTriggers,
  $subtotal,
  $discountCode,
  $couponRemoveTrigger;

let currentCheckout;

function renderCartContent(checkout) {
  $cartItemsTarget.empty();

  /**
   * Handle an empty cart
   */
  if (!checkout.lineItems.length) {
    $cartItemsTarget.append(emptyCartNotice());
    $cartSidebar.removeClass('loading');

    /**
     * These remain present if the cart previously had items and gets
     * emptied. Clear them in that case.
     */
    if ($discountCode) {
      $discountCode.remove();
    }

    if ($subtotal) {
      $subtotal.remove();
    }

    return;
  }

  checkout.lineItems.forEach(item =>
    $cartItemsTarget.append(cartSidebarItem(item))
  );

  $cartSidebar
    .find('.ks-cartsidebar__yourcart span')
    .text(`${getLineItemTotal(checkout)} items`);

  /**
   * Apply the dynamic checkout URL to the checkout button
   */
  $goToCheckoutTarget.attr('href', checkout.webUrl);

  renderSubtotal(checkout.subtotalPrice);
  renderDiscounts(checkout.discountApplications);

  /**
   * Query these elements once they're in the DOM so that
   * event listeners can be attached later.
   */
  $incrementTriggers = $('.ks-cartsidebar__item__add');
  $decrementTriggers = $('.ks-cartsidebar__item__minus');
  $removeTriggers = $('.ks-cartsidebar__item__remove');
  $subtotal = $('.ks-cartsidebar__subtotal');
  $discountCode = $('.ks-cartsidebar__discountcode');
  $couponRemoveTrigger = $('#ks-couponremove');

  attachDynamicListeners();

  $cartSidebar.removeClass('loading');
}

function updateCart(newCheckout) {
  currentCheckout = newCheckout;
  renderCartContent(currentCheckout);
  $cartSidebar.removeClass('loading');
}

function renderSubtotal(subtotal) {
  /**
   * Otherwise this could get prepended infinitely
   */
  if ($subtotal) {
    $subtotal.remove();
  }
  $cartActions.prepend(cartSubtotal(subtotal));
}

function renderDiscounts(discounts) {
  if ($discountCode) {
    /**
     * Otherwise this could get prepended infinitely
     */
    $discountCode.remove();
  }

  const shouldShowCoupons = discounts.length && discounts[0].applicable;

  if (shouldShowCoupons) {
    const { code } = discounts[0];
    $cartActions.prepend(cartDiscountItem(code));
  }
}

function attachDynamicListeners() {
  $incrementTriggers.click(async function() {
    const id = $(this).data('variant-id');

    $cartSidebar.addClass('loading');
    const updatedCheckout = await addItemToCheckout(currentCheckout.id, {
      variantId: id,
      quantity: 1,
    });

    updateCart(updatedCheckout);
  });

  $decrementTriggers.click(async function() {
    const $t = $(this);
    const id = $t.data('line-item-id');
    const currentQuantity = $t.data('current-quantity');

    $cartSidebar.addClass('loading');
    const updatedCheckout = await updateCheckoutItem(currentCheckout.id, {
      id,
      quantity: currentQuantity - 1,
    });

    updateCart(updatedCheckout);
  });

  $removeTriggers.click(async function() {
    const id = $(this).data('line-item-id');

    $cartSidebar.addClass('loading');
    const updatedCheckout = await removeCheckoutItem(currentCheckout.id, id);

    updateCart(updatedCheckout);
  });

  $couponRemoveTrigger.click(async () => {
    $cartSidebar.addClass('loading');

    const updatedCheckout = await removePromoCodeFromCheckout(
      currentCheckout.id
    );

    $discountCode.remove();
    updateCart(updatedCheckout);
  });
}

$addToCartTrigger.on('click', async function() {
  const $allVariants = $('.ks-producthero__variants');
  const $quantityTarget = $('#ks-quantitytarget');
  const variantId =
    $allVariants.find('.active').data('variant-id') ||
    $(this).data('variant-id');
  const quantity = parseInt($quantityTarget.text());

  $cartSidebar.addClass('loading');

  const updatedCheckout = await addItemToCheckout(currentCheckout.id, {
    variantId,
    quantity,
  });

  updateCart(updatedCheckout);

  $siteHeader.addClass('solid');
  $cartSidebar.addClass('active');
  $backdrop.addClass('active');
});

$couponTrigger.on('click', () => {
  $cartSidebar.addClass('loading');
  $couponModal.addClass('active');
});

$couponForm.on('submit', async function(e) {
  e.preventDefault();

  const $t = $(this);
  const code = $t.find('input[type="text"]').val();
  const updatedCheckout = await addPromoCodeToCheckout(
    currentCheckout.id,
    code
  );

  if (updatedCheckout.userErrors.length) {
    return alert(updatedCheckout.userErrors.shift().message);
  }

  $couponModal.removeClass('active');
  updateCart(updatedCheckout);
});

$couponModalClose.click(() => {
  $couponModal.removeClass('active');
  $cartSidebar.removeClass('loading');
});

$backdrop.click(() => {
  if ($cartSidebar.hasClass('active')) {
    $cartSidebar.removeClass('active');
    $backdrop.removeClass('active');
  }
});

$doc.ready(async () => {
  $cartSidebar.addClass('loading');
  currentCheckout = await getCheckout();

  window.currentCheckout = currentCheckout;
  window.renderCartContent = renderCartContent;

  renderCartContent(currentCheckout);
});
