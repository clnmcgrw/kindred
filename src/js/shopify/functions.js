import client from './client';

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

export async function getCheckout(id) {
  let checkout;

  try {
    checkout = await client.checkout.fetch(id);
  } catch (e) {
    console.log('Error fetching checkout:', e);
  }

  return checkout;
}

export async function addItemToCheckout(checkoutId, items) {
  let checkout;

  try {
    checkout = await client.checkout.addLineItems(checkoutId, items);
  } catch (e) {
    console.log('Error adding item to checkout:', e);
  }

  return checkout;
}
