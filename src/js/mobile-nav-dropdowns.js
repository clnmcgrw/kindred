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

      resize: () => {
        const { methods } = module;
        methods.closeDropdowns();
        methods.scrollCheck();
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
            methods.findChild(this);
            const $this = $(this);

            $nodes.mobileParents.each(function() {
              if (this !== event.target) {
                $(this).removeClass('open');
              }
            });

            $this.addClass('open');
          }
        });

        $nodes.navToggle.click(function() {
          if (data.navOpen) {
            // when the menu is closed
            methods.reset();
            methods.enableScroll();
          } else {
            // when the menu is opened
            methods.disableScroll();
          }

          data.navOpen = !data.navOpen;
        });
      },

      closeDropdowns: () => {
        const { $nodes } = module;
        $nodes.mobileContainers.slideUp();
      },

      disableScroll: () => {
        document.body.style.overflow = 'hidden';
      },

      enableScroll: () => {
        document.body.style.overflow = 'visible';
      },

      findChild: parent => {
        const { $nodes, methods } = module;

        $nodes.mobileContainers.each(function() {
          const $this = $(this);
          if (this.dataset.mobileChild === parent.dataset.mobileParent) {
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

      scrollCheck: () => {
        const { data, methods } = module;
        if (window.innerWidth > data.breakpoints.md && data.navOpen) {
          methods.enableScroll();
        } else if (window.innerWidth < data.breakpoints.md && data.navOpen) {
          methods.disableScroll();
        }
      },
    },
  };

  module.hooks.mounted();
  window.addEventListener('debouncedResize', module.hooks.resize);
};
