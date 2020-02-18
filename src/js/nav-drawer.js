const drawer = document.querySelector('.ks-navdrawer');

export default () => {
  if (!drawer) return;

  const module = {
    $nodes: {
      parents: [...document.querySelectorAll('[data-parent]')],
      children: [...drawer.querySelectorAll('[data-child]')],
      inner: document.querySelector('.ks-mainheader [data-container]'),
      notParents: document.querySelectorAll(
        '.ks-mainnav li:not([data-parent])'
      ),
    },
    data: {
      matches: [],
    },
    hooks: {
      mounted: () => {
        const { methods } = module;
        methods.addListeners();
        methods.setDrawerHeight();
        methods.setMatches();
        methods.positionChildren();
      },

      resize: () => {
        const { methods } = module;
        methods.setDrawerHeight();
        methods.positionChildren();
      },
    },
    methods: {
      addListeners: () => {
        const { $nodes, methods } = module;
        $nodes.parents.forEach(parent => {
          parent.addEventListener('mouseenter', () => {
            methods.positionChildren();
            methods.showChild();
          });
        });
        drawer.addEventListener('mouseleave', methods.maybeHideDrawer);
        $nodes.notParents.forEach(notParent => {
          notParent.addEventListener('mouseenter', methods.hideDrawer);
        });
      },

      hideDrawer: () => {
        const { methods } = module;
        methods.resetChildren();
        drawer.classList.remove('ks-navdrawer--open');
      },

      maybeHideDrawer: () => {
        const { $nodes, methods } = module;
        if (event.relatedTarget === $nodes.inner) return;
        methods.hideDrawer();
      },

      // positionChild: (parent, child) => {
      //   const parentPos = parent.getBoundingClientRect();
      //   const childPos = child.getBoundingClientRect();
      //   const difference = parentPos.left - childPos.left;
      //   console.log(difference);
      //   if (difference > 1) {
      //     child.style.transform = `translate3d(${difference}px, 0, 0)`;
      //   }
      // },

      positionChildren: () => {
        const { data } = module;

        data.matches.forEach(pair => {
          const { parent, child } = pair;

          // clear previous positioning
          child.removeAttribute('style');

          const parentBox = parent.getBoundingClientRect();
          const childBox = child.getBoundingClientRect();

          const difference = parentBox.left - childBox.left;
          child.style.transform = `translate3d(${difference}px, 0, 0)`;
        });
      },

      resetChildren: (child = false) => {
        const { methods } = module;
        const shownChildren = drawer.querySelectorAll('.show');

        if (shownChildren && child) {
          shownChildren.forEach(previouslyShown => {
            if (previouslyShown !== child) {
              methods.resetChild(previouslyShown);
            }
          });
        } else if (shownChildren) {
          shownChildren.forEach(shownChild => {
            methods.resetChild(shownChild);
          });
        }
      },

      resetChild(child) {
        child.classList.remove('show');
        // child.removeAttribute('style');
      },

      setDrawerHeight: () => {
        const { $nodes } = module;
        let tallest = 0;

        $nodes.children.forEach(child => {
          const childHeight = child.getBoundingClientRect().height;
          if (childHeight > tallest) {
            tallest = childHeight;
          }
        });

        drawer.style.height = `${tallest}px`;
      },

      setMatches: () => {
        const { $nodes, data } = module;

        $nodes.parents.forEach(parent => {
          $nodes.children.forEach(child => {
            if (parent.dataset.parent === child.dataset.child) {
              let match = {
                parent,
                child,
              };
              data.matches.push(match);
            }
          });
        });
      },

      showChild: () => {
        const { $nodes, methods } = module;
        const parent = event.target;
        const category = parent.dataset.parent;

        const child = $nodes.children
          .filter(child => child.dataset.child === category)
          .shift();

        methods.resetChildren(child);

        if (child) {
          drawer.classList.add('ks-navdrawer--open');
          child.classList.add('show');
        }
      },
    },
  };

  module.hooks.mounted();
  window.addEventListener('debouncedResize', module.hooks.resize);
};
