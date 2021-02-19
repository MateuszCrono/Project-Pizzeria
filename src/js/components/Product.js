
import {select, classNames, templates} from '../settings.js';
import utils from '../utils.js';
import AmountWidget from './AmountWidget.js';

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
    thisProduct.dom.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);
    // console.log(thisProduct.amountWidgetElem);
  }

  initAccordion() {
    const thisProduct = this;
    // console.log(thisProduct);
    /* find the clickable trigger (the element that should react to clicking) */
    // getElements(accordionTrigger) = thisProduct.element.querySelector(select.menuProduct.clickable);
    // console.log(accordionTrigger);

    /* START: add event listener to clickable trigger on event click */
    thisProduct.dom.accordionTrigger.addEventListener('click', function(event) {
      /* prevent default action for event */
      event.preventDefault();
      /* find active product (product that has active class) */
      const activeProducts = document.querySelector(select.all.menuProductsActive);
      // console.log("activeProducts", activeProducts);
      /* if there is active product and it's not thisProduct.element, remove class active from it */
      if (activeProducts != null && activeProducts != thisProduct.element) {
        activeProducts.classList.remove('active');
      }
      /* toggle active class on thisProduct.element */
      thisProduct.element.classList.toggle('active');
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
        const optionImage = thisProduct.dom.imageWrapper.querySelector('.' + paramId + '-' + optionId);
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
            optionImage.classList.add(classNames.menuProduct.imageVisible);
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

    // app.cart.add(thisProduct.prepareCartProduct());
    const event = new CustomEvent('add-to-cart', {
      bubbles: true,
      detail: {
        product: thisProduct,
      },
    });
    thisProduct.element.dispatchEvent(event);
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
      };
      // console.log(params)
      // console.log(paramId, param);
      // for every option in this category
      for(let optionId in param.options) {

        const option = param.options[optionId];
        const optionSelected = formData[paramId] && formData[paramId].includes(optionId);
        // console.log(optionId);
        if (optionSelected) {
          params[paramId].options[optionId] = option.label;
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
    };
    return productSummary;
    // console.log(productSummary);
  }
// console.log('productSummary', productSummary);
// console.log('prepareCartProduct'. thisProduct.prepareCartProduct);
}

export default Product;
