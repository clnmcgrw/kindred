import { pause } from './lib/helpers';

const $resourcesParent = $('.ks-resourcelist');
const $triggers = $resourcesParent.find('span[data-toggle-type]');
const $cardsParent = $resourcesParent.find('.ks-resourcelist__items');
const $cards = $resourcesParent.find('.ks-card');

function filterResources() {
  const $t = $(this);
  const targetType = $t.data('toggle-type');

  $cardsParent.addClass('hiding');

  $triggers.removeClass('active');
  $t.addClass('active');

  if (targetType === 'all') {
    return pause(250).then(() => {
      $cards.show();
      $cardsParent.removeClass('hiding');
    });
  }

  $cards.each(function() {
    const $card = $(this);
    const cardType = $card.data('resource-type');

    cardType.indexOf(targetType) === -1 ? $card.hide() : $card.show();
  });

  pause(250).then(() => $cardsParent.removeClass('hiding'));
}

function attachEventListeners() {
  $triggers.click(filterResources);
}

export default () => attachEventListeners();
