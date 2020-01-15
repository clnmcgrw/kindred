import { $doc, $cartSidebar } from '../ui';
import {
  getCheckout,
  addItemToCheckout,
  updateCheckoutItem,
  removeCheckoutItem,
} from './functions';
import { cartSidebarItem } from '../components';

const $addToCartTrigger = $('#ks-addtocart');
const $cartItemsTarget = $('#ks-cartitems');
const $goToCheckoutTarget = $('#ks-checkout');

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

  const updatedCheckout = await addItemToCheckout(currentCheckout.id, {
    variantId,
    quantity,
  });

  updateCart(updatedCheckout);

  $cartSidebar.addClass('active');
});

function renderCartContent(checkout) {
  $cartItemsTarget.empty();

  checkout.lineItems.forEach(item =>
    $cartItemsTarget.append(cartSidebarItem(item))
  );

  $goToCheckoutTarget.attr('href', checkout.webUrl);

  // Attach the listeners once the items are in the DOM
  $incrementTriggers = $('.ks-cartsidebar__item__add');
  $decrementTriggers = $('.ks-cartsidebar__item__minus');
  $removeTriggers = $('.ks-cartsidebar__item__remove');

  $incrementTriggers.click(async function() {
    const id = $(this).data('variant-id');

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

    const updatedCheckout = await updateCheckoutItem(currentCheckout.id, {
      id,
      quantity: currentQuantity - 1,
    });

    updateCart(updatedCheckout);
  });

  $removeTriggers.click(async function() {
    const id = $(this).data('line-item-id');

    const updatedCheckout = await removeCheckoutItem(currentCheckout.id, id);

    updateCart(updatedCheckout);
  });
}

function updateCart(newCheckout) {
  currentCheckout = newCheckout;
  renderCartContent(currentCheckout);
}

$doc.ready(async function() {
  currentCheckout = await getCheckout();

  if (currentCheckout.lineItems.length) {
    renderCartContent(currentCheckout);
  } else {
    console.log('no items in cart');
  }
});
