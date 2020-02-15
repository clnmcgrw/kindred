const drawer = document.querySelector('.ks-navdrawer');

export default () => {
  if (!drawer) return;

  const module = {
    $nodes: {
      parents: document.querySelectorAll('[data-parent]'),
      children: [...drawer.querySelectorAll('[data-child]')],
      inner: document.querySelector('.ks-mainheader [data-container]'),
      notParents: document.querySelectorAll(
        '.ks-mainnav li:not([data-parent])'
      ),
    },
    hooks: {
      mounted: () => {
        const { methods } = module;
        methods.addListeners();
      },
    },
    methods: {
      addListeners: () => {
        const { $nodes, methods } = module;
        $nodes.parents.forEach(parent => {
          parent.addEventListener('mouseenter', methods.showChild);
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

      positionChild: (parent, child) => {
        const parentPos = parent.getBoundingClientRect();
        const childPos = child.getBoundingClientRect();
        const difference = parentPos.left - childPos.left;
        if (difference !== 0) {
          child.style.transform = `translate3d(${difference}px, 0, 0)`;
        }
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
        child.removeAttribute('style');
      },

      showChild: () => {
        const { $nodes, methods } = module;
        const parent = event.target;
        const category = parent.dataset.parent;

        const child = $nodes.children.filter(
          child => child.dataset.child === category
        )[0];

        methods.resetChildren(child);

        if (child) {
          drawer.classList.add('ks-navdrawer--open');
          child.classList.add('show');
          methods.positionChild(parent, child);
        }
      },
    },
  };

  module.hooks.mounted();
};
