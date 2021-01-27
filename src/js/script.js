/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

// const { active } = require("browser-sync");

{
  ("use strict");

  const select = {
    templateOf: {
      menuProduct: "#template-menu-product",
      cartProduct: '#template-cart-product',
    },
    containerOf: {
      menu: "#product-list",
      cart: "#cart",
    },
    all: {
      menuProducts: "#product-list > .product",
      menuProductsActive: "#product-list > .product.active",
      formInputs: "input, select",
    },
    menuProduct: {
      clickable: ".product__header",
      form: ".product__order",
      priceElem: ".product__total-price .price",
      imageWrapper: ".product__images",
      amountWidget: ".widget-amount",
      cartButton: '[href="#add-to-cart"]',
    },
    widgets: {
      amount: {
        input: 'input.amount',
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
    cart: {
      productList: '.cart__order-summary',
      toggleTrigger: '.cart__summary',
      totalNumber: `.cart__total-number`,
      totalPrice: '.cart__total-price strong, .cart__order-total .cart__order-price-sum strong',
      subtotalPrice: '.cart__order-subtotal .cart__order-price-sum strong',
      deliveryFee: '.cart__order-delivery .cart__order-price-sum strong',
      form: '.cart__order',
      formSubmit: '.cart__order [type="submit"]',
      phone: '[name="phone"]',
      address: '[name="address"]',
    },
    cartProduct: {
      amountWidget: '.widget-amount',
      price: '.cart__product-price',
      edit: '[href="#edit"]',
      remove: '[href="#remove"]',
    },
  };

  const classNames = {
    menuProduct: {
      wrapperActive: "active",
      imageVisible: "active",
    },
    cart: {
      wrapperActive: 'active',
    },
  };

  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 10,
    },
    cart: {
      defaultDeliveryFee: 20,
    },
  };

  const templates = {
      menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
      cartProduct: Handlebars.compile(document.querySelector(select.templateOf.cartProduct).innerHTML),
  };

  class Product {
    constructor(id, data) {
      const thisProduct = this;

      thisProduct.id = id;
      thisProduct.data = data;
      thisProduct.renderInMenu();
      thisProduct.getElements();
      thisProduct.initAccordion();
      thisProduct.initOrderForm();
      thisProduct.initAmountWidget();
      thisProduct.processOrder();


      // console.log("new Product", thisProduct);
    }
    renderInMenu() {
      const thisProduct = this;

      //generate HTML based on template //
      const generatedHTML = templates.menuProduct(thisProduct.data);
      //Create element using utils.createElementfromHTML //
      thisProduct.element = utils.createDOMFromHTML(generatedHTML);
      // find menu container //
      const menuContainer = document.querySelector(select.containerOf.menu);
      //add element to menu //
      menuContainer.appendChild(thisProduct.element);
    }
    getElements(){
      const thisProduct = this;

      thisProduct.dom = {};

      thisProduct.dom.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable),
      // console.log(this.accordionTrigger) - ACCORDION;
      thisProduct.dom.form = thisProduct.element.querySelector(select.menuProduct.form),
      // console.log(thisProduct.form); - TYPE OF ORDER FoE CHECKBOX
      thisProduct.dom.formInputs = thisProduct.dom.form.querySelectorAll(select.all.formInputs),
      // console.log(thisProduct.formInputs); - ALL INPUTS
      thisProduct.dom.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton),
      // console.log(thisProduct.cartButton); - SHOPPING CART
      thisProduct.dom.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem),
      // console.log(thisProduct.priceElem); - PRICE
      thisProduct.dom.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper),
      // console.log(thisProduct.imageWrapper); - IMAGES
      thisProduct.dom.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget)
      // console.log(thisProduct.amountWidgetElem);
    };

    initAccordion() {
      const thisProduct = this;
      // console.log(thisProduct);
      /* find the clickable trigger (the element that should react to clicking) */
      // getElements(accordionTrigger) = thisProduct.element.querySelector(select.menuProduct.clickable);
      // console.log(accordionTrigger);

      /* START: add event listener to clickable trigger on event click */
      thisProduct.dom.accordionTrigger.addEventListener("click", function(event) {
        /* prevent default action for event */
        event.preventDefault();
        /* find active product (product that has active class) */
        const activeProducts = document.querySelector(select.all.menuProductsActive);
        // console.log("activeProducts", activeProducts);
        /* if there is active product and it's not thisProduct.element, remove class active from it */
          if (activeProducts != null && activeProducts != thisProduct.element) {
            activeProducts.classList.remove("active");
          }
            /* toggle active class on thisProduct.element */
            thisProduct.element.classList.toggle("active");
        });
        }


    initOrderForm() {
      const thisProduct = this;
      console.log(thisProduct);
      thisProduct.dom.form.addEventListener('submit', function(event){
        event.preventDefault();
        thisProduct.processOrder();
      });

      for(let input of thisProduct.dom.formInputs){
        input.addEventListener('change', function(){
          thisProduct.processOrder();
        });
      }

      thisProduct.dom.cartButton.addEventListener('click', function(event){
        event.preventDefault();
        thisProduct.processOrder();
      });
    }

    initAmountWidget() {
      const thisProduct = this;

      thisProduct.amountWidget = new AmountWidget(thisProduct.dom.amountWidgetElem);
      thisProduct.dom.amountWidgetElem.addEventListener('updated', function() {
        thisProduct.processOrder();
      });

    }
      processOrder() {
        const thisProduct = this;

        // covert form to object structure e.g. { sauce: ['tomato'], toppings: ['olives', 'redPeppers']}
        const formData = utils.serializeFormToObject(thisProduct.dom.form);
        // console.log('formData', formData);

        // set price to default price
        let price = thisProduct.data.price;

        // for every category (param)...
        for(let paramId in thisProduct.data.params) {
          // determine param value, e.g. paramId = 'toppings', param = { label: 'Toppings', type: 'checkboxes'... }
          const param = thisProduct.data.params[paramId];

          // console.log(paramId, param);

          // for every option in this category
          for(let optionId in param.options) {
            // determine option value, e.g. optionId = 'olives', option = { label: 'Olives', price: 2, default: true }
            const option = param.options[optionId];
            const optionSelected = formData[paramId] && formData[paramId].includes(optionId);
            const optionImage = thisProduct.dom.imageWrapper.querySelector("." + paramId + "-" + optionId);
            // console.log(optionImage);
              // check if the option is not default
              if (optionSelected) {
                // check if the option is not default
                if (option.default !== true) {
                  // add option price to price variable
                  price = price + option.price;
                }
              } else {
                // check if the option is default
                if (option.default == true) {
                  // reduce price variable
                  price = price - option.price;
                }
              }
              if(optionImage){
                if (optionSelected) {
                  optionImage.classList.add(classNames.menuProduct.imageVisible)
                }
                else {
                  optionImage.classList.remove(classNames.menuProduct.imageVisible);
                }
          }
        }
          // update calculated price in the HTML
      }
      price *= thisProduct.amountWidget.value;
          console.log(thisProduct.amountWidget.value);
          thisProduct.dom.priceElem.innerHTML = price;
    }
  }


  class AmountWidget{
    constructor(element) {
      const thisWidget = this;
      thisWidget.getElements(element);
      thisWidget.announce();
      thisWidget.setValue(thisWidget.input.value);
      thisWidget.initActions();
      // console.log('AmountWidget', AmountWidget);
      // console.log('constructor arguments', element);
    }
    getElements(element) {
      const thisWidget = this;

      thisWidget.value = settings.amountWidget.defaultValue;
      thisWidget.element = element;
      thisWidget.input = thisWidget.element.querySelector(select.widgets.amount.input);
      thisWidget.linkDecrease = thisWidget.element.querySelector(select.widgets.amount.linkDecrease);
      thisWidget.linkIncrease = thisWidget.element.querySelector(select.widgets.amount.linkIncrease);
    }
    announce() {
      const thisWidget = this;

      const event = new Event ('updated');
      thisWidget.element.dispatchEvent(event);

    }

    setValue(value) {
      const thisWidget = this;

      const newValue = parseInt(value);

      // TO DO ADD VALIDATION //
      if (thisWidget.value != newValue && !isNaN(newValue) && value <= settings.amountWidget.defaultMax && value >= settings.amountWidget.defaultMin)
      {
      thisWidget.value = newValue;

    }
    thisWidget.announce();
    thisWidget.input.value = thisWidget.value;
  }
  initActions() {
    const thisWidget = this;

    thisWidget.input.addEventListener ("change", function() {
      // event.preventDefault();
      thisWidget.setValue(thisWidget.input.value);
    });
    thisWidget.linkIncrease.addEventListener ('click', function(event) {
      event.preventDefault();
      thisWidget.setValue(++thisWidget.input.value)
    });
    thisWidget.linkDecrease.addEventListener ('click', function(event) {
      event.preventDefault();
      thisWidget.setValue(--thisWidget.input.value)
    });

  }
  }

  class Cart {
    constructor(element) {
      const thisCart = this;

      thisCart.products = [];

      thisCart.getElements(element);
      thisCart.initActions();
      console.log('New Cart', thisCart);


    }
    getElements(element) {
      const thisCart = this;

      thisCart.dom = {};
      thisCart.dom.wrapper = element,
      thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(select.cart.toggleTrigger)

    }

    initActions() {
      const thisCart = this;

      thisCart.dom.toggleTrigger.addEventListener('click', function() {
          thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
      });
  }
}

  const app = {
    initMenu: function () {
      const thisApp = this;
      // console.log("ThisApp Data", thisApp.data);
      for (let productData in thisApp.data.products) {
        new Product(productData, thisApp.data.products[productData]);
      }
    },
    initData: function () {
      const thisApp = this;

      thisApp.data = dataSource;
    },
    initCart: function() {
      const thisApp = this;

      const cartElem = document.querySelector(select.containerOf.cart);
      thisApp.cart = new Cart(cartElem);

    },
    init: function () {
      const thisApp = this;
      // console.log("*** App starting ***");
      // console.log("thisApp:", thisApp);
      // console.log("classNames:", classNames);
      // console.log("settings:", settings);
      // console.log("templates:", templates);
      thisApp.initData();
      thisApp.initMenu();
      thisApp.initCart();
    },
  };

  app.init();
}
