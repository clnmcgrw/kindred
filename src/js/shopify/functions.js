import differenceInDays from 'date-fns/differenceInDays';
import client from './client';

const lsKeyName = 'ks-checkout-id';

export async function getAllProducts() {
  let products;

  try {
    products = await client.product.fetchAll();
  } catch (e) {
    console.log('Error fetching all products:', e);
  }

  return products;
}

export async function getProductByHandle(handle) {
  let product;

  try {
    product = await client.product.fetchByHandle(handle);
  } catch (e) {
    console.log('Error fetching product by handle:', e);
  }

  return product;
}

export async function getProductById(id) {
  let product;

  try {
    product = await client.product.fetch(id);
  } catch (e) {
    console.log('Error fetching product by id:', e);
  }

  return product;
}

export async function getAllCollections() {
  let collections;

  try {
    collections = await client.collection.fetchAllWithProducts();
  } catch (e) {
    console.log('Error fetching all collections:', e);
  }

  return collections;
}

export async function createCheckout() {
  let checkout;

  try {
    checkout = await client.checkout.create();
  } catch (e) {
    console.log('Error creating checkout:', e);
  }

  return checkout;
}

/**
 * Will return one of:
 * 1) a checkout that hasn't been completed yet (0 or more items still in "cart"), or
 * 2) a fresh checkout
 */
export async function getCheckout() {
  let checkout;
  let createNew = false;

  // Check to see if there's an existing checkout already created for this user
  let existingCheckout = localStorage.getItem(lsKeyName);

  if (existingCheckout) {
    try {
      existingCheckout = JSON.parse(existingCheckout);
    } catch (e) {
      console.log(
        'Could not parse localStorage checkout value:\n',
        e,
        '\nCreating new checkout...'
      );

      const newCheckout = await createAndCacheCheckout();

      return newCheckout;
    }
  }

  if (existingCheckout && existingCheckout.id) {
    // If it exists, go fetch the in-progress checkout
    checkout = await client.checkout.fetch(existingCheckout.id);
  } else {
    // No checkout has been attempted yet, make a new one
    createNew = true;
  }

  // In case the checkout no longer exists (clear cookies/cache/time expires), or the checkout has been successfully completed
  if (!checkout || (checkout && checkout.completedAt)) {
    localStorage.removeItem(lsKeyName);

    createNew = true;
  }

  if (createNew) {
    checkout = await createAndCacheCheckout();
  }

  return checkout;
}

export async function addItemToCheckout(checkoutId, { variantId, quantity }) {
  let checkout;

  try {
    checkout = await client.checkout.addLineItems(checkoutId, [
      {
        variantId,
        quantity,
      },
    ]);
  } catch (e) {
    console.log('Error adding item to checkout:', e);
  }

  return checkout;
}

export async function updateCheckoutItem(checkoutId, updatedItem) {
  let checkout;

  try {
    checkout = await client.checkout.updateLineItems(checkoutId, updatedItem);
  } catch (e) {
    console.log('Error updating line item:', e);
  }

  return checkout;
}

export async function removeCheckoutItem(checkoutId, lineItemId) {
  let checkout;

  try {
    checkout = await client.checkout.removeLineItems(checkoutId, [lineItemId]);
  } catch (e) {
    console.log('Error removing item from checkout:', e);
  }

  return checkout;
}

export async function addPromoCodeToCheckout(checkoutId, code) {
  let checkout;

  try {
    checkout = await client.checkout.addDiscount(checkoutId, code);
  } catch (e) {
    console.log('Error adding promo code to checkout', e);
  }

  return checkout;
}

export async function removePromoCodeFromCheckout(checkoutId) {
  let checkout;

  try {
    checkout = await client.checkout.removeDiscount(checkoutId);
  } catch (e) {
    console.log('Error removing discount from checkout:', e);
  }

  return checkout;
}

export function getLineItemTotal(checkout) {
  let num = 0;

  checkout.lineItems.forEach(item => (num += item.quantity));

  return num;
}

async function createAndCacheCheckout() {
  const checkout = await createCheckout();

  localStorage.setItem(
    lsKeyName,
    JSON.stringify({ id: checkout.id, createdAt: new Date(Date.now()) })
  );

  return checkout;
}
