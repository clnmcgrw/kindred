const mainNav = document.querySelector('.ks-mainnav');

export default ($ = window.$) => {
  if (!mainNav) return;

  const module = {
    $nodes: {
      navToggle: $('#ks-nav-toggle'),
      mobileParents: $('[data-mobile-parent]'),
      mobileChildren: $('[data-mobile-child]'),
      mobileContainers: $('.ks-mainnav__accordion'),
    },

    hooks: {
      mounted: () => {
        const { methods } = module;
        methods.closeDropdowns();
        methods.addListeners();
      },
    },

    data: {
      navOpen: false,
      breakpoints: {
        md: 767,
      },
    },

    methods: {
      addListeners: () => {
        const { $nodes, data, methods } = module;

        $nodes.mobileParents.click(function() {
          if (window.innerWidth < data.breakpoints.md) {
            event.preventDefault();
            methods.findChild(this.dataset.mobileParent);
          }
        });

        $nodes.navToggle.click(function() {
          if (data.navOpen) {
            methods.reset();
          }

          data.navOpen = !data.navOpen;
        });
      },

      closeDropdowns: () => {
        const { $nodes } = module;
        $nodes.mobileContainers.slideUp();
      },

      findChild: parent => {
        const { $nodes, methods } = module;

        $nodes.mobileContainers.each(function() {
          const $this = $(this);
          if (this.dataset.mobileChild === parent) {
            methods.openChild($this);
          } else {
            methods.closeChild($this);
          }
        });
      },

      openChild: $child => {
        $child.attr('data-opened', 'true');
        $child.slideDown();
      },

      closeChild: $child => {
        $child.attr('data-opened', 'false');
        $child.slideUp();
      },

      reset: () => {
        const { $nodes, methods } = module;

        $nodes.mobileContainers.each(function() {
          const $this = $(this);
          if (this.dataset.opened === 'true') {
            methods.closeChild($this);
          }
        });
      },
    },
  };

  module.hooks.mounted();
};
