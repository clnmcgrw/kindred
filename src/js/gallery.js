import { $doc } from './ui';
import Isotope from 'isotope-layout';
require('isotope-packery');

const gallery = document.querySelector('.ks-gallery');

export default () => {
  if (!gallery) return;

  const module = {
    $nodes: {
      container: $('.ks-gallery__main > .ks-inner'),
      filterTriggers: $('[data-filter-type]'),
      allItems: $('[data-category]'),
      buildingBlocks: $('[data-category="Buidling Blocks"]'),
      fireBowls: $('[data-category="Fire Bowls"]'),
      fireplaces: $('[data-category="Fireplaces"]'),
      signatureKitchens: $('[data-category="Signature Kitchens"]'),
      surrounds: $('[data-category="Surrounds"]'),
    },

    data: {
      grid: undefined,
      filterFunctions: {
        category: function(itemElem) {
          return itemElem.dataset.category;
        },
      },
    },

    hooks: {
      mounted: $nodes => {
        const { methods } = module;
        methods.initIsotope();
        methods.addListeners();
      },
    },
    methods: {
      addListeners: () => {
        const { $nodes, methods } = module;

        $nodes.filterTriggers.click(function() {
          const category = this.dataset.filterType;

          $nodes.filterTriggers.removeClass('active');
          this.classList.add('active');

          methods.setActiveCategory(category);
        });
      },

      initIsotope: () => {
        const { $nodes, data } = module;
        data.grid = new Isotope($nodes.container[0], {
          itemSelector: '.ks-gallery__item',
          layoutMode: 'packery',
        });
      },

      setActiveCategory: category => {
        const { data } = module;
        data.grid.arrange({
          filter: function() {
            // context: 'this' will be the itemSelector elements.
            const belongsTo = this.dataset.category;

            if (category === 'All') {
              // every item
              return true;
            } else {
              // only the items matching the data-filter-type
              return belongsTo === category;
            }
          },
        });
      },
    },
  };

  module.hooks.mounted(module.$nodes);
};
