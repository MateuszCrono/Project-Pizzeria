import {settings, select} from './settings.js';
import Product from './components/Product.js';
import Cart from './components/Cart.js';
// import cartProduct from './components/CartProduct.js';
// import AmountWidget from './components/AmountWidget.js';

const app = {
  initMenu: function () {
    const thisApp = this;
    // console.log("ThisApp Data", thisApp.data);
    for (let productData in thisApp.data.products) {
      new Product(thisApp.data.products[productData].id, thisApp.data.products[productData]);
    }
  },
  initData: function () {
    const thisApp = this;

    thisApp.data = {};
    const url = settings.db.url + '/' + settings.db.product;

    fetch(url)
      .then(function(rawResponse) {
        return rawResponse.json();
      })
      .then(function(parsedResponse) {
        console.log('parsedResposne', parsedResponse);

        /*saved parsedResponse as thisApp.data.products */
        thisApp.data.products = parsedResponse;
        /* execute initMenu method */
        thisApp.initMenu();
      });


  },
  initCart: function() {
    const thisApp = this;

    const cartElem = document.querySelector(select.containerOf.cart);
    thisApp.cart = new Cart(cartElem);

    thisApp.productList = document.querySelector(select.containerOf.menu);

    thisApp.productList.addEventListener('add-to-cart', function(event) {
      app.cart.add(event.detail.product);
    });

  },

  init: function() {
    const thisApp = this;
    thisApp.initData();
    thisApp.initMenu();
    thisApp.initCart();
  },
};
app.init();

