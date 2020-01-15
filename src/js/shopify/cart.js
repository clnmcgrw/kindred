import { createCheckout, getCheckout, addItemToCheckout } from './functions';

const $addToCartTriggers = $('#ks-addtocart');

const sampleItems = [
  {
    variantId: 'Z2lkOi8vc2hvcGlmeS9Qcm9kdWN0VmFyaWFudC8zMTY1NzM3ODAyMTUwNw==',
    quantity: 1,
  },
];

$addToCartTriggers.click(async function() {
  const $t = $(this);

  let checkout;

  const exisitingCheckoutId = localStorage.getItem('ks-checkout-id');

  /**
   * Also need to check if the id is no longer valid - for instance if
   * a checkout was successfully completed and now the user is making
   * another order at a later date.
   */
  if (exisitingCheckoutId) {
    checkout = await getCheckout(exisitingCheckoutId);
  } else {
    checkout = await createCheckout();

    localStorage.setItem('ks-checkout-id', checkout.id);
  }

  console.log(checkout);
});
