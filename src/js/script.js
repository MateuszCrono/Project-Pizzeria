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
    db: {
      url: '//localhost:3131',
      product: 'product',
      order: 'order',
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
      thisProduct.prepareCartProductParams();
      thisProduct.processOrder();
      thisProduct.prepareCartProduct();



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
      // console.log(thisProduct);
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
        thisProduct.addtoCart();
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
          thisProduct.priceSingle = price;
          // price = thisProduct.priceSingle;
          // console.log('singlowy price', thisProduct.priceSingle)
          thisProduct.price = thisProduct.priceSingle * thisProduct.amountWidget.value;
          // console.log(thisProduct.amountWidget.value);
          thisProduct.dom.priceElem.innerHTML = thisProduct.price;
          // console.log('totalny price', thisProduct.price);


    }
    addtoCart() {
      const thisProduct = this;

      app.cart.add(thisProduct.prepareCartProduct());
      // console.log(addtoCart);
    }

    prepareCartProductParams() {
      const thisProduct = this;

        // covert form to object structure e.g. { sauce: ['tomato'], toppings: ['olives', 'redPeppers']}
        const formData = utils.serializeFormToObject(thisProduct.dom.form);
        // console.log('formData', formData);
        const params = {};
     // for every category (param)...
        for(let paramId in thisProduct.data.params) {
          // determine param value, e.g. paramId = 'toppings', param = { label: 'Toppings', type: 'checkboxes'... }
          const param = thisProduct.data.params[paramId];
          params[paramId] = {
            name: param.label,
            options: {}
          }
          // console.log(params)
          // console.log(paramId, param);
          // for every option in this category
          for(let optionId in param.options) {

            const option = param.options[optionId];
            const optionSelected = formData[paramId] && formData[paramId].includes(optionId);
            // console.log(optionId);
            if (optionSelected) {
              params[paramId].options[optionId] = option.label
              // console.log(params)
            }
      }
    }
        return params;
    }
    prepareCartProduct() {
      const thisProduct = this;

      const productSummary = {
      id: thisProduct.id,
      name: thisProduct.data.name,
      amount: thisProduct.amountWidget.value,
      priceSingle : thisProduct.priceSingle,
      price: thisProduct.price,
      params: thisProduct.prepareCartProductParams()
      }
      return productSummary;
      // console.log(productSummary);
  }
  // console.log('productSummary', productSummary);
  // console.log('prepareCartProduct'. thisProduct.prepareCartProduct);
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

      const event = new CustomEvent ('updated',  {
        bubbles: true
      });
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
      thisCart.deliveryFee = settings.cart.defaultDeliveryFee;
      thisCart.getElements(element);
      thisCart.initActions();
      // console.log('New Cart', thisCart);


    }
    getElements(element) {
      const thisCart = this;

      thisCart.dom = {};
      thisCart.dom.wrapper = element,
      thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(select.cart.toggleTrigger)
      thisCart.dom.productList = thisCart.dom.wrapper.querySelector(select.cart.productList);
      thisCart.dom.deliveryFee = thisCart.dom.wrapper.querySelector(select.cart.deliveryFee);
      thisCart.dom.subtotalPrice = thisCart.dom.wrapper.querySelector(select.cart.subtotalPrice);
      thisCart.dom.totalPrice = thisCart.dom.wrapper.querySelector(select.cart.totalPrice);
      thisCart.dom.totalNumber = thisCart.dom.wrapper.querySelector(select.cart.totalNumber);
      thisCart.dom.form = thisCart.dom.wrapper.querySelector(select.cart.form);
      thisCart.dom.address = thisCart.dom.wrapper.querySelector(select.cart.address);
      thisCart.dom.phone = thisCart.dom.wrapper.querySelector(select.cart.phone);

      // console.log(thisCart.dom.productList);

    }

    initActions() {
      const thisCart = this;

      thisCart.dom.toggleTrigger.addEventListener('click', function() {
          thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
      });
      thisCart.dom.productList.addEventListener('updated', function() {
        thisCart.update();
      })
      thisCart.dom.productList.addEventListener('remove', function() {
        thisCart.remove(event.detail.cartProduct);
      })
      thisCart.dom.form.addEventListener('submit', function() {
        event.preventDefault();
        thisCart.sendOrder();

      })
  }
    sendOrder() {
      const thisCart = this;
      const url = settings.db.url + '/' + settings.db.order;
      const payload =  {
        address: thisCart.dom.address.value,
        phone: thisCart.dom.phone.value,
        totalPrice: thisCart.totalPrice,
        subTotalPrice: thisCart.subtotalPrice,
        totalNumber: thisCart.totalNumber,
        deliveryFee: thisCart.deliveryFee,
        products: [],
      }
      for (let prod of thisCart.products) {
        payload.products.push(prod.getData());
      }
      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      };

      fetch(url, options);
    }

    add(menuProduct) {
    const thisCart = this;
    const generateHTML = templates.cartProduct(menuProduct);
    const generatedDOM = utils.createDOMFromHTML(generateHTML);
    thisCart.dom.productList.appendChild(generatedDOM);
    thisCart.products.push(new cartProduct(menuProduct, generatedDOM));
    thisCart.update();
    // console.log('thisCard.products',thisCart.products);

    // console.log('adding Product', menuProduct);
  }
  update() {
    const thisCart = this;
    thisCart.totalNumber = 0;
    thisCart.subtotalPrice = 0;

    if (thisCart.totalNumber == 0 ) {
      thisCart.deliveryFee == 0
    }

    for (let element of thisCart.products) {
      thisCart.totalNumber += element.amount
      thisCart.subtotalPrice += element.price
    }
    thisCart.totalPrice = thisCart.subtotalPrice + thisCart.deliveryFee

    thisCart.dom.deliveryFee.innerHTML = thisCart.deliveryFee;
    thisCart.dom.subtotalPrice.innerHTML = thisCart.subtotalPrice;
    thisCart.dom.totalNumber.innerHTML = thisCart.totalNumber;
    thisCart.dom.totalPrice.innerHTML = thisCart.totalPrice;

    console.log('TotalNumber', thisCart.totalNumber,)
    console.log('TotalSubtotalPrice', thisCart.subtotalPrice,)
    console.log('TotalPrice', thisCart.totalPrice,)
  }


  remove(cartProduct) {
    const thisCart = this;
    const indexOfThisCart = thisCart.products.indexOf(cartProduct);
    thisCart.products.splice(indexOfThisCart, 1);
    cartProduct.dom.wrapper.remove();
    thisCart.update();
  }
}

class cartProduct{
  constructor(menuProduct, element){
    const thisCartProduct = this;
    thisCartProduct.id = menuProduct.id;
    thisCartProduct.name = menuProduct.name;
    thisCartProduct.price = menuProduct.price;
    thisCartProduct.priceSingle = menuProduct.priceSingle;
    thisCartProduct.amount = menuProduct.amount;
    thisCartProduct.params = JSON.parse(JSON.stringify(menuProduct.params));
    thisCartProduct.getElements(element);
    thisCartProduct.initAmountWidget();
    thisCartProduct.initAction();
  }
  getElements(element) {
    const thisCartProduct = this;
    thisCartProduct.dom = {}
    thisCartProduct.dom.wrapper = element;
    thisCartProduct.dom.amount = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.amountWidget);
    thisCartProduct.dom.price = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.price);
    thisCartProduct.dom.edit = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.edit);
    thisCartProduct.dom.remove = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.remove);

  }
  initAmountWidget() {
    const thisCartProduct = this;

    thisCartProduct.amountWidget = new AmountWidget(thisCartProduct.dom.amount);
    thisCartProduct.dom.amount.addEventListener('updated', function() {
      event.preventDefault;
      thisCartProduct.amount = thisCartProduct.amountWidget.value
      thisCartProduct.price = thisCartProduct.priceSingle * thisCartProduct.amount
      thisCartProduct.dom.price.innerHTML = thisCartProduct.price;
    });
  }
  remove() {
    const thisCartProduct = this;

    const event = new CustomEvent ('remove',  {
      bubbles: true,
      detail: {
        cartProduct: thisCartProduct,
      },
    });
    thisCartProduct.dom.wrapper.dispatchEvent(event);
  }

  getData() {
    const thisCartProduct = this;

    const ProductData = {
      id: thisCartProduct.id,
      amount: thisCartProduct.amount,
      price: thisCartProduct.price,
      priceSingle: thisCartProduct.priceSingle,
      name: thisCartProduct.name,
      params: thisCartProduct.params
    }

    return ProductData;
  }
  initAction() {
    const thisCartProduct = this;

    thisCartProduct.dom.edit.addEventListener('click', function() {
      event.preventDefault;
    });
    thisCartProduct.dom.remove.addEventListener('click', function() {
      event.preventDefault;
      thisCartProduct.remove();
      console.log(thisCartProduct.remove)
    }
  );
}
}
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
      })


    },
    initCart: function() {
      const thisApp = this;

      const cartElem = document.querySelector(select.containerOf.cart);
      thisApp.cart = new Cart(cartElem);

    },

    init: function() {
      const thisApp = this;
      thisApp.initData();
      thisApp.initMenu();
      thisApp.initCart();
    },
  };

  app.init();
}
 