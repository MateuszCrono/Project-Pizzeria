import {Product} from './components/product.js';
import {Cart} from './components/cart.js';
import {select, settings, classNames,} from './settings.js';
import {Booking} from './components/Booking.js';


const app = {
  initMenu: function () {
    const thisApp = this;
      
    for(let productData in thisApp.data.products){
      new Product(thisApp.data.products[productData].id, thisApp.data.products[productData]);
    }
  },
  initPages: function () {
    const thisApp = this;

    thisApp.pages = Array.from(document.querySelector(select.containerOf.pages).children);
    thisApp.navLinks = Array.from(document.querySelectorAll(select.nav.links));
    //thisApp.activatePage(thisApp.pages[0].id);
    let pagesMatchingHash = [];

    if (window.location.hash.lenght > 2){
      const idFromHash = window.location.hash.replace('#/', '');
      pagesMatchingHash = thisApp.pages.filter(function(page){
        return page.id == idFromHash;
      });
    }
    thisApp.activatePage(
      pagesMatchingHash.length ? pagesMatchingHash[0].id : thisApp.pages[0].id
    );

    for(let link of thisApp.navLinks){
      link.addEventListener('click', function(event) {
        const clickedElement = this;
        event.preventDefault();
        /* TODO: get page id from href */
        const id = clickedElement.getAttribute('href').replace('#', '');
        console.log(id);
        /* TODO: activate page */
        thisApp.activatePage(id);
      });
    }
  },
  initData: function(){
    const thisApp = this;
    thisApp.data = {};
    const url = settings.db.url + '/' + settings.db.product;
    fetch(url)
      .then(function(rawResponse){
        return rawResponse.json();
      })
      .then(function(parsedResponse){
        //console.log('parsedResponse', parsedResponse);
        /* save parsedResponse as thisApp.data.products */
        thisApp.data.products = parsedResponse;
        /* execute initMenu method */
        thisApp.initMenu();
      });
    //console.log('thisApp.data', JSON.stringify(thisApp.data));
  },
  initCart: function(){
    const thisApp = this;
    const cartElem = document.querySelector(select.containerOf.cart);
    thisApp.cart = new Cart(cartElem);
    thisApp.productList = document.querySelector(select.containerOf.menu);
    thisApp.productList.addEventListener('add-to-cart', function(event){
      app.cart.add(event.detail.product);
    });
  },
  activatePage: function(pageId){
    const thisApp = this;
    
    for(let link of thisApp.navLinks){
      link.classList.toggle(classNames.nav.active, link.getAttribute('href') == '#' + pageId);
    }
    for(let page of thisApp.pages){
      page.classList.toggle(classNames.pages.active, page.getAttribute('id') == pageId);
    }
    window.location.hash = '#/' + pageId;
  },
  initBooking: function(){
    const thisApp = this;
    const bookingWrapper = document.querySelector(select.containerOf.booking);
    //console.log('bookingwrapper', bookingWrapper);

    thisApp.booking = new Booking(bookingWrapper);
  },

  init: function () {
    const thisApp = this;
    //console.log('*** App starting ***');
    //console.log('thisApp:', thisApp);
    //console.log('classNames:', classNames);
    //console.log('settings:', settings);
    //console.log('templates:', templates);
    thisApp.initPages();
    thisApp.initData();
    thisApp.initCart();
    thisApp.initBooking();
  },
};
app.init();
