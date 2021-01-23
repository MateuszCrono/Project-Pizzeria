/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

// const { active } = require("browser-sync");

{
  ("use strict");

  const select = {
    templateOf: {
      menuProduct: "#template-menu-product",
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
        input: 'input[name="amount"]',
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
  };

  const classNames = {
    menuProduct: {
      wrapperActive: "active",
      imageVisible: "active",
    },
  };

  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 9,
    },
  };

  const templates = {
    menuProduct: Handlebars.compile(
      document.querySelector(select.templateOf.menuProduct).innerHTML
    ),
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

      thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
      // console.log(this.accordionTrigger) - ACCORDION;
      thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);
      // console.log(thisProduct.form); - TYPE OF ORDER FoE CHECKBOX
      thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs);
      // console.log(thisProduct.formInputs); - ALL INPUTS
      thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
      // console.log(thisProduct.cartButton); - SHOPPING CART
      thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
      // console.log(thisProduct.priceElem); - PRICE
      thisProduct.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);
      console.log(thisProduct.imageWrapper);
    }
    initAccordion() {
      const thisProduct = this;
      // console.log(thisProduct);
      /* find the clickable trigger (the element that should react to clicking) */
      // getElements(accordionTrigger) = thisProduct.element.querySelector(select.menuProduct.clickable);
      // console.log(accordionTrigger);

      /* START: add event listener to clickable trigger on event click */
      thisProduct.accordionTrigger.addEventListener("click", function(event) {
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
      thisProduct.form.addEventListener('submit', function(event){
        event.preventDefault();
        thisProduct.processOrder();
      });

      for(let input of thisProduct.formInputs){
        input.addEventListener('change', function(){
          thisProduct.processOrder();
        });
      }

      thisProduct.cartButton.addEventListener('click', function(event){
        event.preventDefault();
        thisProduct.processOrder();
      });
    }
      processOrder() {
        const thisProduct = this;

        // covert form to object structure e.g. { sauce: ['tomato'], toppings: ['olives', 'redPeppers']}
        const formData = utils.serializeFormToObject(thisProduct.form);
        // console.log('formData', formData);

        // set price to default price
        let price = thisProduct.data.price;

        // for every category (param)...
        for(let paramId in thisProduct.data.params) {
          // determine param value, e.g. paramId = 'toppings', param = { label: 'Toppings', type: 'checkboxes'... }
          const param = thisProduct.data.params[paramId];

          console.log(paramId, param);

          // for every option in this category
          for(let optionId in param.options) {
            // determine option value, e.g. optionId = 'olives', option = { label: 'Olives', price: 2, default: true }
            const option = param.options[optionId];
            const optionSelected = formData[paramId] && formData[paramId].includes(optionId);
            const optionImage = thisProduct.imageWrapper.querySelector("." + paramId + "-" + optionId);
            console.log(optionImage);
              // check if the option is not default
            if (optionSelected) {
              if (option.default != true) {
              price = price + option.price;
              // optionImage.classList.add(classNames.menuProduct.imageVisible);
              // console.log("classlist", optionImage.classList);
              }
            else { (option.default == true)
              // check if the option is default
                // reduce price variable
              price = price - option.price
              // optionImage.classList.remove(classNames.menuProduct.imageVisible);
            }
            thisProduct.priceElem.innerHTML = price;
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
      }
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
    init: function () {
      const thisApp = this;
      // console.log("*** App starting ***");
      // console.log("thisApp:", thisApp);
      // console.log("classNames:", classNames);
      // console.log("settings:", settings);
      // console.log("templates:", templates);
      thisApp.initData();
      thisApp.initMenu();
    },
  };

  app.init();
}
