import {
  getAllCollections,
  getAllProducts,
  getProductByHandle,
} from './functions';

import handleProductSingle from './page-product-single';
import './cart';

const shop = {
  allCollections: [],
  allProducts: [],
  product: {},
};

(async function() {
  // const allCollections = await getAllCollections();
  // const allProducts = await getAllProducts();
  // shop.product = await getProductByHandle('talus');

  // console.log('Collections: \n', allCollections);
  // console.log('All Products: \n', allProducts);
  // console.log('Single Product: \n', shop.product);

  // allCollections[1].products.forEach(product => console.log(product));

  handleProductSingle();
})();
