import Client from 'shopify-buy';

const client = Client.buildClient({
  domain: 'kindred-outdoors-surrounds.myshopify.com/',
  storefrontAccessToken: '62ca7bd2b83fd93b476032b4b286c794',
});

export default client;
