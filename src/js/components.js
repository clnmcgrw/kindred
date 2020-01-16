export function productHeroVariant(variant) {
  return /*html*/ `
    <div
      class="
        ks-producthero__variant
        ${variant.available === false ? 'out-of-stock' : ''}
      "
      data-variant-id="${variant.id}"
      data-variant-type-1="${variant.selectedOptions[0].value}"
      data-variant-type-2="${
        variant.selectedOptions[1] ? variant.selectedOptions[1].value : ''
      }"
    >
      <img src="${variant.image.src}" alt=""/>
    </div>
  `;
}

export function thumbSlide(image) {
  return /*html*/ `
    <div class="ks-producthero__thumbslide">
      <img src="${image.src}" />
    </div>
  `;
}

export function productHeroOption(option, idx) {
  return /*html*/ `
    <button
      class="ks-producthero__option ${idx === 0 ? 'active' : ''}"
      data-option-name="${option.value}"
    >
      ${option.value}
    </button>
  `;
}

export function emptyCartNotice() {
  return /*html*/ `
    <li class="ks-cartsidebar__noitems">
      <h3>You have no items in your cart.</h3>
      <a href="/">Start Shopping!</a>
    </li>
  `;
}

export function cartSidebarItem(item) {
  return /*html*/ `
    <li class="ks-cartsidebar__item">
      <div class="ks-cartsidebar__item__flex">
        <div class="ks-cartsidebar__item__image">
          <img src="${item.variant.image.src}" alt=""/>
        </div>
        <div class="ks-cartsidebar__item__main">
          <p class="ks-cartsidebar__item__title">${item.title}</p>
          <p class="ks-cartsidebar__item__variant">${item.variant.title}</p>
          <p class="ks-cartsidebar__item__quantity">Quantity: ${item.quantity}</p>
          <p class="ks-cartsidebar__item__price">Price: $${item.variant.price}</p>
        </div>
        <div class="ks-cartsidebar__item__actions">
          <span class="ks-cartsidebar__item__add" data-variant-id="${item.variant.id}">
            <div class="ks-svg-wrapper">
              <div class="ks-svg-wrapper__liner">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-plus-circle">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="16"></line>
                  <line x1="8" y1="12" x2="16" y2="12"></line>
                </svg>
              </div>
            </div>
          </span>
          <span
            class="ks-cartsidebar__item__minus"
            data-current-quantity="${item.quantity}"
            data-line-item-id="${item.id}"
          >
            <div class="ks-svg-wrapper">
              <div class="ks-svg-wrapper__liner">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-minus-circle">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="8" y1="12" x2="16" y2="12"></line>
                </svg>
              </div>
            </div>
          </span>
          <span class="ks-cartsidebar__item__remove" data-line-item-id="${item.id}">
            Remove
          </span>
        </div>
      </div>
    </li>
  `;
}
