import { makeReadableLabel } from './lib/helpers';
import { $doc, $win } from './ui';

export default () => {
  var $galleryItems = $('a[data-hs-product-path]');
  var $lightbox = $('#ps-lightbox');
  var $productLink;
  var _gallery;

  document.addEventListener('DOMContentLoaded', function() {
    // Polyfills start
    if (!Element.prototype.matches)
      Element.prototype.matches =
        Element.prototype.msMatchesSelector ||
        Element.prototype.webkitMatchesSelector;
    if (!Element.prototype.closest) {
      Element.prototype.closest = function(s) {
        var el = this;
        do {
          if (el.matches(s)) return el;
          el = el.parentElement || el.parentNode;
        } while (el !== null && el.nodeType === 1);
        return null;
      };
    }
    // Polyfills end

    // get PhotoSwipe element
    var pswpElement = document.querySelectorAll('.pswp')[0];

    // add click event listener
    document.body.addEventListener('click', function(event) {
      var alias = event.target ? event.target.closest('.gridzy a') : null;
      if (alias) {
        event.preventDefault();
        openPhotoSwipe(alias.closest('.gridzy'), alias);
      }
    });

    // open picture from URL if directly requested
    setTimeout(function() {
      var hash = location.hash
        .substring(1)
        .split('&')
        .map(function(val) {
          return val.split('=');
        });
      var pos = hash.length,
        param = {},
        gridzyElement,
        itemElement;
      while (pos--) {
        param[hash[pos][0]] = hash[pos][1];
      }
      if ('gid' in param && 'pid' in param) {
        gridzyElement = document.querySelector(
          (param.gid.match(/^[0-9]+$/) ? '' : '#' + param.gid + '.gridzy, ') +
            '.gridzy[data-gridzyid="' +
            param.gid +
            '"]'
        );
        itemElement = gridzyElement.querySelector(
          (param.pid.match(/^[0-9]+$/)
            ? ''
            : '#' + param.pid + '.gridzyItem, ') +
            '.gridzyItem[data-gridzyitemid="' +
            param.pid +
            '"]'
        );
        openPhotoSwipe(gridzyElement, itemElement);
      }
    }, 0);

    // initialize and open PhotoSwipe
    function openPhotoSwipe(gridzyElement, itemElement) {
      var itemElements = gridzyElement.children;
      var pos = itemElements.length;
      var items = [],
        img,
        size,
        title,
        startImg,
        thumbnails = [],
        options,
        gallery;
      // prepare items
      while (pos--) {
        if (itemElements[pos].classList.contains('gridzyItemHidden')) {
          continue;
        }
        img = itemElements[pos].querySelector('img.gridzyImage');
        if ((size = itemElements[pos].getAttribute('data-size'))) {
          size = itemElements[pos].getAttribute('data-size').split('x');
          title = itemElements[pos].getAttribute('data-title');
          title = title
            ? title
            : (title = itemElements[pos].querySelector('.gridzyCaption'))
            ? title.innerText
            : '';
          items.unshift({
            src: itemElements[pos].href,
            w: parseInt(size[0], 10),
            h: parseInt(size[1], 10),
            msrc: img.src,
            title: title,
            pid: itemElements[pos].hasAttribute('id')
              ? itemElements[pos].id
              : itemElements[pos].getAttribute('data-gridzyitemid'),
          });
          thumbnails.unshift(img);
          if (itemElement === itemElements[pos]) {
            startImg = img;
          }
        }
      }
      // prepare options
      options = {
        index: thumbnails.indexOf(startImg) || 0,
        galleryUID: gridzyElement.hasAttribute('id')
          ? gridzyElement.id
          : gridzyElement.gridzy.id,
        getThumbBoundsFn: function(index) {
          var pageYScroll =
            window.pageYOffset || document.documentElement.scrollTop;
          var rect = thumbnails[index].getBoundingClientRect();
          return { x: rect.left, y: rect.top + pageYScroll, w: rect.width };
        },
      };
      // open PhotoSwipe
      gallery = new PhotoSwipe(
        pswpElement,
        PhotoSwipeUI_Default,
        items,
        options
      );
      gallery.init();

      /**
       * 6/23/2020
       * Everything above this line came w/ the plugin added by client. Need to
       * tap into the `afterChange` event to handle the product link that appears
       * above the image and links the user to the actual product.
       */
      _gallery = gallery;

      appendProductLink();

      gallery.listen('imageLoadComplete', function(_, item) {
        const { pid } = gallery.currItem;
        const $itemFromGrid = $($galleryItems[pid - 1]);
        const $srcFromGrid = $itemFromGrid.find('img').attr('src');
        // since images are lazyloaded w/ base64 encoding, we need to check for a base64-encoded str vs the one that we need to display
        const srcToFormat =
          $srcFromGrid.indexOf('data:image') > -1 ? item.src : $srcFromGrid;

        setProductLinkAttrs(
          makeReadableLabel(srcToFormat, '6084868/'),
          $itemFromGrid.data('hs-product-path')
        );
      });

      gallery.listen('afterChange', function() {
        const { pid } = gallery.currItem;
        const $itemFromGrid = $($galleryItems[pid - 1]);

        setLinkPosition(gallery);

        setProductLinkAttrs(
          makeReadableLabel($itemFromGrid.find('img').attr('src'), '6084868/'),
          $itemFromGrid.data('hs-product-path')
        );
      });
    }

    $galleryItems.click(function() {
      const $t = $(this);
      const productPath = $t.data('hs-product-path');
      const productTitle = $t.data('hs-product-title');

      // gallery may not have completed initializing on the first click
      const interval = setInterval(function waitForGallery() {
        if (_gallery) {
          clearInterval(interval);
          setLinkPosition(_gallery);

          setProductLinkAttrs(
            makeReadableLabel($t.find('img').attr('src'), '6084868/'),
            productPath
          );
        }
      }, 150);

      appendProductLink();

      $productLink
        .find('a')
        .text(productTitle)
        .attr('href', `/products/${productPath}`);
    });

    function appendProductLink() {
      if (!$productLink) {
        $lightbox.append(`<div class="ks-productlink"><a></a></div>`);
        $productLink = $('.ks-productlink');
      }
    }

    function setProductLinkAttrs(title, path) {
      $productLink
        .find('a')
        .text(title)
        .attr('href', `/products/${path}`);

      $('.pswp__caption__center').text(title);
    }

    /**
     * The label needs to be relative to the image, so we need to grab
     * the translate3d value of its container
     */
    function setLinkPosition(galleryRef) {
      const { container } = galleryRef.currItem;
      const $container = $(container);
      const translate3dVal = $container
        .attr('style')
        .slice(0, $container.attr('style').indexOf(')') + 1)
        .replace('transform: ', '');

      $productLink.css({
        transform: translate3dVal,
      });
    }
  });
};
