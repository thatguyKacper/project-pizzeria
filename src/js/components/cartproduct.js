import { select } from '../settings.js';
import AmountWidget from './amountwidget.js';


class CartProduct {
  constructor(menuProduct, element) {
    const thisCartProduct = this;

    thisCartProduct.id = menuProduct.id;
    thisCartProduct.name = menuProduct.name;
    thisCartProduct.price = menuProduct.price;
    thisCartProduct.priceSingle = menuProduct.priceSingle;
    thisCartProduct.amount = menuProduct.amount;
    thisCartProduct.params = JSON.parse(JSON.stringify(menuProduct.params));

    thisCartProduct.getElements(element);

    // console.log('thisCartProduct', thisCartProduct);
    // console.log('productData', menuProduct);

    thisCartProduct.initAmountWidget();
    thisCartProduct.initActions();
  }

  getElements(element) {
    const thisCartProduct = this;

    thisCartProduct.dom = {};

    thisCartProduct.dom.wrapper = element;
    thisCartProduct.dom.wrapper.amountWidget = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.amountWidget);
    thisCartProduct.dom.wrapper.price = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.price);
    thisCartProduct.dom.wrapper.edit = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.edit);
    thisCartProduct.dom.wrapper.remove = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.remove);
  }

  initAmountWidget() {
    const thisCartProduct = this;

    thisCartProduct.amountWidget = new AmountWidget(thisCartProduct.dom.wrapper.amountWidget);

    thisCartProduct.dom.wrapper.amountWidget.addEventListener('updated', function () {

      thisCartProduct.amount = thisCartProduct.amountWidget.value;

      thisCartProduct.price = thisCartProduct.priceSingle * thisCartProduct.amount;

      thisCartProduct.dom.wrapper.price.innerHTML = thisCartProduct.price;

    });

  }

  remove() {
    const thisCartProduct = this;

    const event = new CustomEvent('remove', {
      bubbles: true,
      detail: {
        cartProduct: thisCartProduct,
      },
    });

    thisCartProduct.dom.wrapper.dispatchEvent(event);
  }

  initActions() {
    const thisCartProduct = this;

    thisCartProduct.dom.wrapper.edit.addEventListener('click', function (event) {
      event.preventDefault();
    });

    thisCartProduct.dom.wrapper.remove.addEventListener('click', function (event) {
      event.preventDefault();
      thisCartProduct.remove();
      // console.log('test');
    });

  }

  getData() {
    const thisCartProduct = this;

    thisCartProduct.data = {};
    thisCartProduct.data.id = thisCartProduct.id;
    thisCartProduct.data.amount = thisCartProduct.amount;
    thisCartProduct.data.price = thisCartProduct.price;
    thisCartProduct.data.priceSingle = thisCartProduct.priceSingle;
    thisCartProduct.data.params = thisCartProduct.params;

    return thisCartProduct.data;
  }

}

export default CartProduct;