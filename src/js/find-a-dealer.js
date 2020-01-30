import {
  $win,
  $siteHeader,
  $mainSiteContainer,
  $body,
  $siteFooter,
} from './ui';
import gmapsTheme from './lib/gmaps-color-theme.js';

//keeps forms from auto-submitting when true
const DEVMODE = true;

const supportsGeo =
  'geolocation' in window.navigator && Modernizr && Modernizr.geolocation;
const isSubmitted = /(zipcode=|coords=)/.test(window.location.href);
const gmapsKey = 'AIzaSyCviaUhZ7P0rENfc92YUTGXFNF3qhaClvQ';
const mapCenterDefault = { lat: 40.73061, lng: -73.935242 }; //NYC?
const markerIconUrl =
  'https://cdn2.hubspot.net/hubfs/3974799/2018-web/location-marker.png';
const markersInBounds = 8; // default num of markers to show in map window

let gmap = null;
let gmapBounds = null;
let gmapMarkers = [];
let prevInfoWindow = null;
let formWillAutoSubmit = false;
let errorBoxOpen = false;
let mapOverlayShowing = true;
let scrolled = false;

const $mapOuter = $('.cs-wtb-map');
const $mapTarget = $('#cs-locator-maptarget');
const $mapOverlay = $('#cs-locator-mapoverlay');
const $overlayMsgBox = $('#cs-locator-msgtarget');

const $searchForm = $('#cs-wtb-searchform');
const $zipInput = $('#cs-wtb-zipcode');
const $coordsInput = $('#cs-wtb-coords');
const $submitBtn = $('#cs-wtb-submitbtn');
const $errorBox = $('#cs-wtb-errors');
const $errorsOuter = $('.cs-wtb--errors');

const $searchActionBar = $('#cs-wtb-actionbar');
const $searchAgainBtn = $('#wtb-search-again-btn');
const $searchBacktopBtn = $('#wtb-back-top-btn');

const $resultsList = $('#cs-locator-results');
let $resultsListItems = null;

const currentSearch = { zip: $zipInput.val(), coords: $coordsInput.val() };

//helpers
const getGeocodeUrl = addr =>
  'https://maps.googleapis.com/maps/api/geocode/json?address=' +
  addr +
  '&key=' +
  gmapsKey;
const setCoordsInput = (lat, lng) => $coordsInput.val(lat + '|' + lng);
const setErrorMsg = (msg, classname) =>
  $errorBox.html(`<p class="${classname}">${msg}</p>`);
const setOverlayMsg = (msg, classname) =>
  $overlayMsgBox.html(`<p class="${classname}">${msg}</p>`);

const showMapOverlay = () => TweenMax.to($mapOverlay, 0.3, { autoAlpha: 1 }),
  hideMapOverlay = () => TweenMax.to($mapOverlay, 0.3, { autoAlpha: 0 });

//calc mid-page point for element offset
const getHalfwayTarget = $target => {
  return $target.offset().top - $win.height() * 0.5 + $siteHeader.outerHeight();
};

// Find a Dealer Forms
const $dealerForms = $('[data-footer-dealersearch]');

const findDealerFormHandler = (index, element) => {
  const $this = $(element);
  const $input = $this.find('input[name="zipcode"]');
  const $hiddenInput = $this.find('input[name="coords"]');
  const $errs = $this.find('.cs-dealersearch--err');
  const actionUrl = $this.attr('action');

  let willAutoSubmit = false;
  let geoXHR = null;

  const geocodeFail = xhr => {
    $this.addClass('has-error');
  };
  const geocodeDone = data => {
    if (data.status === 'OK') {
      const coords = data.results[0].geometry.location;
      $hiddenInput.val(coords.lat + '|' + coords.lng);
      willAutoSubmit = true;
      $this.submit();
    } else {
      $this.addClass('has-error');
    }
  };

  const onFormSubmit = event => {
    if (!willAutoSubmit) {
      event.preventDefault();
    } else {
      return;
    }
    const val = $input.val();

    if (val.length < 2) {
      $this.addClass('has-error');
    } else {
      $this.removeClass('has-error');
      geoXHR = $.getJSON(getGeocodeUrl(val));
      geoXHR.done(geocodeDone);
      geoXHR.fail(geocodeFail);
    }
  };

  $this.on('submit', onFormSubmit);
};
//end find-a-dealer forms

//control map & list toolbar sizing/positioning
const handleActionBarPlacement = (screenwidth, container) => {
  if (screenwidth > container) {
    $searchActionBar.css({
      left: (screenwidth - container) / 2,
      width: container - $mapOuter.width(),
    });
  } else {
    if ($searchActionBar.length) {
      $searchActionBar.removeAttr('style');
    }
  }
};
const handleMapPlacement = () => {
    const winWidth = $win.width();
    const containWidth = $mainSiteContainer.width();
    const headerHeight = $siteHeader.outerHeight();
    const mapStyles = {
      top: headerHeight,
      height: $win.height() - headerHeight,
    };
    if (winWidth > containWidth) {
      mapStyles.right = (winWidth - containWidth) / 2;
      mapStyles.width = containWidth / 2.1;
    } else {
      mapStyles.right = 0;
      mapStyles.width = '47%';
    }
    $mapOuter.css(mapStyles);
    if ($searchActionBar.length > 0) {
      handleActionBarPlacement(winWidth, containWidth);
    }
  },
  bindMapPlacementHandlers = () => {
    handleMapPlacement();
    $win.bind('resize', handleMapPlacement);
  };

//handle disabled button states
const inputKeyupHandler = e => {
  if ($zipInput.val().length > 1) {
    $submitBtn.removeAttr('disabled');
    if (errorBoxOpen) {
      closeErrorBox();
    }
  } else {
    $submitBtn.attr('disabled', true);
  }
};

//handles slideDown/Up for any error show/hide
const openErrorBox = (onEnd = false) => {
    errorBoxOpen = true;
    TweenMax.set($errorsOuter, { height: 'auto' });
    TweenMax.from($errorsOuter, 0.2, {
      height: 0,
      onComplete: () => {
        if (onEnd) {
          onEnd.call();
        }
      },
    });
  },
  closeErrorBox = (onEnd = false) => {
    errorBoxOpen = false;
    TweenMax.to($errorsOuter, 0.1, {
      height: 0,
      onComplete: () => {
        $errorsOuter.removeAttr('style');
        if (onEnd) {
          onEnd.call();
        }
      },
    });
  };

//do form autosubmission (after hidden input vals set)
const doAutoFormSubmission = () => {
  formWillAutoSubmit = true;
  //$submitBtn.removeAttr('disabled');
  $searchForm.submit();
};

//geolocate if in a supported browser
const attemptGeolocation = () => {
  openErrorBox();
  setOverlayMsg('Determining Current Position', 'cs-wtp-overlay-p');
  const onGeoAccept = position => {
      setCoordsInput(position.coords.latitude, position.coords.longitude);
      //closeErrorBox();
      doAutoFormSubmission();
    },
    onGeoReject = () => {
      $zipInput.focus();
      setOverlayMsg('Search By City, State, or Zip', 'cs-wtp-overlay-p');
      closeErrorBox();
    };
  window.navigator.geolocation.getCurrentPosition(onGeoAccept, onGeoReject);
};

//sets gmap up at initial location w/o dropping pins
const setupGoogleMaps = () => {
  gmap = new google.maps.Map($mapTarget[0], {
    center: mapCenterDefault,
    zoom: 8,
    scrollwheel: Modernizr && Modernizr.touchevents ? false : true,
    styles: gmapsTheme(),
  });
  gmapBounds = new google.maps.LatLngBounds();
};

//the searchform submit handler
//validation happends through gmaps geocoder
//send input value as addr param in req
const searchFormHandler = event => {
  if (!formWillAutoSubmit) {
    event.preventDefault();
  } else {
    return;
  }
  if (errorBoxOpen) {
    closeErrorBox();
  }

  const searchVal = $zipInput.val();

  if (searchVal.length < 2) {
    setErrorMsg('Please enter a valid search term.', 'cs-wtb-err-p');
    openErrorBox();
    return;
  }

  const onGeocodeSuccess = data => {
      if (data.status === 'OK') {
        const gdata = data.results[0];
        $zipInput.val(gdata.formatted_address);
        setCoordsInput(
          gdata.geometry.location.lat,
          gdata.geometry.location.lng
        );
        doAutoFormSubmission();
      } else {
        setErrorMsg('No results found for "' + searchVal + '"');
        openErrorBox();
        errorBoxOpen = true;
      }
    },
    onGeocodeErr = err => {
      setErrorMsg(
        'Something went wrong, we apoligize and are working to fix it.',
        'cs-wtb-err-p'
      );
      openErrorBox();
    };
  $.ajax({
    url: getGeocodeUrl(searchVal),
    success: onGeocodeSuccess,
    error: onGeocodeErr,
  });
};

// Map marker stuff
const getInfoWindowHtml = $el => {
  const $clone = $el.children().clone();
  return `<div class="cs-infowindow-content">
            <div class="cs-infowindow-liner">
              ${$clone.html()}
            </div>
          </div>`;
};

const getMapMarker = (lat, lng, $el) => {
  const markerBaseX = 24,
    markerBaseY = 32;
  const markerIcon = {
    url: markerIconUrl,
    size: new google.maps.Size(markerBaseX, markerBaseY),
    origin: new google.maps.Point(0, 0),
    anchor: new google.maps.Point(0, markerBaseX),
    scaledSize: new google.maps.Size(markerBaseX, markerBaseY),
  };
  return new google.maps.Marker({
    position: { lat: lat, lng: lng },
    map: gmap,
    icon: markerIcon,
    animation: google.maps.Animation.DROP,
    infoWindow: {
      content: getInfoWindowHtml($el),
    },
  });
};

// Map element event handlers
const mapMarkerClickHandler = (index, infoWindow, mrkr, scrollto = false) => {
  if (prevInfoWindow) {
    prevInfoWindow.close();
  }
  $resultsListItems
    .removeClass('is-currently-selected')
    .eq(index)
    .addClass('is-currently-selected');
  gmap.panTo(mrkr.getPosition());
  infoWindow.open(gmap, mrkr);
  if (scrollto) {
    TweenMax.to(window, 0.4, {
      scrollTo: { y: getHalfwayTarget($resultsListItems.eq(index)) },
      ease: Power4.easeInOutCirc,
    });
  }
  prevInfoWindow = infoWindow;
};
const handleInfoWindowClose = () => {
  $resultsListItems.removeClass('is-currently-selected');
  prevInfoWindow = null;
};

// loop through each server-rendered result
const resultListItemIterator = (i, item, boundsFit = false) => {
  const $this = $(item);
  const pos = $this.data('dealer-location');

  const marker = getMapMarker(pos.lat, pos.lng, $this);
  const infoWindow = new google.maps.InfoWindow(marker.infoWindow);

  gmapMarkers.push(marker); //maintain global markers collection

  marker.addListener('click', () =>
    mapMarkerClickHandler(i, infoWindow, marker, true)
  );
  infoWindow.addListener('closeclick', () => handleInfoWindowClose());
  $this.on('click', () => mapMarkerClickHandler(i, infoWindow, marker));

  //control how many pins are in map view
  if (i < markersInBounds) {
    gmapBounds.extend(new google.maps.LatLng(pos.lat, pos.lng));
    if (i === markersInBounds - 1 && !boundsFit) {
      gmap.fitBounds(gmapBounds);
      boundsFit = true;
    }
  }
};

//auto scroll to first result
const revealResultsList = (
  delay = false,
  doScroll = false,
  halfScroll = false
) => {
  $resultsListItems.first().trigger('click');
  if (doScroll) {
    const scrollDest = halfScroll
      ? getHalfwayTarget($resultsList)
      : $resultsList.offset().top - $siteHeader.outerHeight();
    TweenMax.to(window, 1, {
      scrollTo: { y: scrollDest, autoKill: false },
      delay: delay ? delay : 0,
    });
  }
};

//rare cases when overlay is clicked
const mapOverlayClickHandler = () => {
  const $msg = $overlayMsgBox.find('p');
  if ($msg.length === 0) {
    return;
  }
  const msgtext = $msg.text();

  if (msgtext.indexOf('Search By') > -1) {
    $zipInput.focus();
  }
};

const actionBarHandlers = () => {
  if ($searchActionBar.length === 0) {
    return false;
  }

  $searchBacktopBtn.on('click', () => revealResultsList(0, true));

  return window.setInterval(() => {
    if (scrolled) {
      const thresh =
        $resultsList.offset().top - ($siteHeader.outerHeight() + 10);
      if (window.pageYOffset > thresh) {
        $body.addClass('is-showing-actionbar');
      } else {
        $body.removeClass('is-showing-actionbar');
      }
      scrolled = false;
    }
  }, 300);
};

// - INIT ------------------------------//
// run this in index after import
const init = () => {
  setupGoogleMaps();

  //true if either ?zipcode or ?coords is present
  if (isSubmitted) {
    //check to remove disabled search
    inputKeyupHandler();
    //search with only zip field set, call form handler w/ dummy event
    if (currentSearch.zip && !currentSearch.coords) {
      searchFormHandler({ preventDefault: $.noop });
      // * todo *
      // reverse geocode the coords from geolocation, fill zipInput w/ addr
    }
  }

  //geolocation
  if (supportsGeo && !isSubmitted) {
    attemptGeolocation();
  }

  //results html list is in the DOM
  if ($resultsList.length > 0) {
    $resultsListItems = $resultsList.find('[data-dealer-location]');
    $resultsListItems.each((i, item) => resultListItemIterator(i, item));

    $win.on({
      load: () => revealResultsList(false, true, true),
      scroll: () => (scrolled = true),
    });

    let abh = actionBarHandlers();
  } else {
    $mapOverlay.on('click', () => mapOverlayClickHandler());
  }

  //form el handlers
  $zipInput.on('keyup', event => inputKeyupHandler(event));
  $searchForm.on('submit', event => searchFormHandler(event));

  //map fixedplacement
  bindMapPlacementHandlers();
};

export default () => {
  //footer dealer forms
  if ($dealerForms.length > 0) {
    $dealerForms.each((index, el) => findDealerFormHandler(index, el));
  }

  if ($mapOuter.length === 0) {
    return false;
  }

  document.body.classList.add('is-location-finder');
  $('.ks-sampleoffer').hide();
  $siteFooter.hide();
  $.getScript('//maps.googleapis.com/maps/api/js?key=' + gmapsKey, init);
};
