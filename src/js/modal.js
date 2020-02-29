import { $body, $lightbox } from './ui';

const modal = document.querySelector('.ks-modal');

export default () => {
  if (!modal) return;

  const module = {
    $nodes: {
      closeTrigger: modal.querySelector('.ks-modal__close-trigger'),
      content: modal.querySelector('.ks-modal--lightbox__content'),
    },

    hooks: {
      mounted: $nodes => {
        const { methods } = module;
        methods.addListeners();
      },
    },
    methods: {
      addListeners: () => {
        const { $nodes } = module;

        $nodes.content.addEventListener('click', () => {
          // prevent clicks inside the modal from reaching the close trigger.
          event.stopPropagation();
        });

        $nodes.closeTrigger.addEventListener('click', () => {
          $body.removeClass('scroll-disabled');
          $lightbox.removeClass('active');
        });
      },
    },
  };

  module.hooks.mounted(module.nodes);
};
