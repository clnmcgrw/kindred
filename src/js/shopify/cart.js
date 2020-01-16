import { $doc, $cartSidebar } from '../ui';
import {
  getCheckout,
  addItemToCheckout,
  updateCheckoutItem,
  removeCheckoutItem,
} from './functions';
import { cartSidebarItem, cartSubtotal, emptyCartNotice } from '../components';

const $addToCartTrigger = $('#ks-addtocart');
const $cartItemsTarget = $('#ks-cartitems');
const $goToCheckoutTarget = $('#ks-checkout');
const $cartActions = $cartSidebar.find('.ks-cartsidebar__actions');

/**
 * These need to be queried after all cart items have been rendered
 */
let $incrementTriggers;
let $decrementTriggers;
let $removeTriggers;

let currentCheckout;

$addToCartTrigger.click(async function() {
  const $allVariants = $('.ks-producthero__variants');
  const $quantityTarget = $('#ks-quantitytarget');
  const variantId = $allVariants.find('.active').data('variant-id');
  const quantity = parseInt($quantityTarget.text());

  $cartSidebar.addClass('loading');

  const updatedCheckout = await addItemToCheckout(currentCheckout.id, {
    variantId,
    quantity,
  });

  updateCart(updatedCheckout);

  $cartSidebar.addClass('active');
});

function renderCartContent(checkout) {
  $cartItemsTarget.empty();

  if (!checkout.lineItems.length) {
    $cartItemsTarget.append(emptyCartNotice());
    $cartSidebar.removeClass('loading');

    return;
  }

  checkout.lineItems.forEach(item =>
    $cartItemsTarget.append(cartSidebarItem(item))
  );

  $goToCheckoutTarget.attr('href', checkout.webUrl);

  $cartActions.find('.ks-cartsidebar__subtotal').remove();
  $cartActions.prepend(cartSubtotal(checkout.subtotalPrice));

  // Attach the listeners once the items are in the DOM
  $incrementTriggers = $('.ks-cartsidebar__item__add');
  $decrementTriggers = $('.ks-cartsidebar__item__minus');
  $removeTriggers = $('.ks-cartsidebar__item__remove');

  $cartSidebar.removeClass('loading');

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
}

function updateCart(newCheckout) {
  currentCheckout = newCheckout;
  renderCartContent(currentCheckout);
  $cartSidebar.removeClass('loading');
}

$doc.ready(async function() {
  $cartSidebar.addClass('loading');
  currentCheckout = await getCheckout();

  renderCartContent(currentCheckout);
});
