import { $searchModal } from './ui';
import { searchResult } from './components';

// This can get re-queried if no results are available
let $searchTriggers = $('.ks-searchtrigger');

const $searchForm = $searchModal.find('.ks-form');
const $searchCloseTrigger = $searchModal.find('.ks-modal__close');
const $resultsTarget = $('#ks-searchresults-target');
const $loadingIndicator = $('.ks-searchresults__indicator');

const searchEndpoint = val =>
  `https://api.hubapi.com/contentsearch/v2/search?term=${val}&portalId=6084868&length=LONG&limit=38&type=SITE_PAGE&type=BLOG_POST&type=LANDING_PAGE`;

$searchForm.submit(function(e) {
  e.preventDefault();

  const $t = $(this);
  const searchVal = $t.find('input[type="text"]').val();

  window.location.href = `/search?q=${searchVal}`;
});

$searchCloseTrigger.click(() => $searchModal.removeClass('active'));

function attachTriggerClick() {
  $searchTriggers.click(function() {
    $searchModal.addClass('active');
  });
}

async function handleResultsPage(query) {
  const value = query.replace('?q=', '');

  const get = await fetch(searchEndpoint(value));
  const { results } = await get.json();

  if (!results.length) {
    $loadingIndicator.text('No results found.');
    $resultsTarget.append(/*html*/ `
      <div class="ks-searchresults__noresults">
        <a href="#search" class="ks-searchtrigger">Try Again?</a>
      </div>
    `);

    $searchTriggers = $('.ks-searchtrigger');

    attachTriggerClick();

    return;
  }

  $loadingIndicator.text(`Found ${results.length} results:`);

  results.forEach(result => $resultsTarget.append(searchResult(result)));
}

export default async () => {
  const { pathname, search } = window.location;

  attachTriggerClick();

  if (pathname === '/search') {
    handleResultsPage(search);
  }
};
