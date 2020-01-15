import { $doc } from '../ui';
import { createCheckout, getCheckout, addItemToCheckout } from './functions';

const $addToCartTrigger = $('#ks-addtocart');
const $quantityTarget = $('#ks-quantitytarget');
const $cartItemsTarget = $('#ks-cartitems');
// const sampleItems = [
//   {
//     variantId: 'Z2lkOi8vc2hvcGlmeS9Qcm9kdWN0VmFyaWFudC8zMTY1NzM3ODAyMTUwNw==',
//     quantity: 1,
//   },
// ];

$addToCartTrigger.click(async function() {
  const $t = $(this);
  const variantId = $t.data('variant-id');
  const quantity = $t.data('quantity');

  const { id } = await getCheckout();

  // Probably need to make this update line items instead of add line items?
  const updatedCheckout = await addItemToCheckout(id, [
    {
      variantId,
      quantity,
    },
  ]);

  console.log(updatedCheckout);

  // window.location.href = webUrl;
});

$doc.ready(async function() {
  const checkout = await getCheckout();

  if (checkout.lineItems.length) {
    console.log(checkout);
  } else {
    console.log('no items in cart');
  }
});
