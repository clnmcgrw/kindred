const sampleOffer = document.querySelector('.ks-sampleoffer');

export default () => {
  if (!sampleOffer) return;

  const module = {
    $nodes: {},

    data: {
      pathnames: [
        '/about-us',
        '/contact-us',
        '/sitemap',
        '/shop/outdoors/signature-kitchens',
        '/shop/outdoors/outdoor-cabinets',
        '/resources',
      ],
    },

    hooks: {
      mounted: () => {
        const { data, methods } = module;
        if (data.pathnames.includes(window.location.pathname)) {
          methods.hideSampleOffer();
        }
      },
    },
    methods: {
      hideSampleOffer: () => {
        console.log('hiding');
        sampleOffer.style.display = 'none';
      },
    },
  };

  module.hooks.mounted();
};
