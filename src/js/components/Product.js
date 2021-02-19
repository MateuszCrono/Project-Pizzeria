
import {select, classNames, templates} from '../settings.js';
import {utils} from '../utils.js';
import {AmountWidget} from './AmountWidget.js';
export class Product{
  constructor(id, data){
    const thisProduct = this; // eslint-disable-line no-unused-vars
    thisProduct.id = id;
    thisProduct.data = data;
    thisProduct.renderInMenu();
    thisProduct.getElements();
    thisProduct.initAccordion();
    thisProduct.initOrderForm();
    thisProduct.initAmountWidget();
    thisProduct.processOrder();
  }
  renderInMenu(){
    const thisProduct = this;
    /* generate HTML based on template */
    const generatedHTML = templates.menuProduct(thisProduct.data);
    /* create element using utils.createElementformHTML */
    thisProduct.element = utils.createDOMFromHTML(generatedHTML);
    /* find menu container */
    const menuContainer = document.querySelector(select.containerOf.menu);
    /* add element to menu */
    menuContainer.appendChild(thisProduct.element);
  }
  getElements(){
    const thisProduct = this;
    
    thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
    thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);
    thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs);
    thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
    thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
    thisProduct.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);
    thisProduct.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);
  }
  initAccordion(){
    const thisProduct = this;

    /* find the clickable trigger (the element that should react to clicking) */
    thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
    /* START: click event listener to trigger */
    thisProduct.accordionTrigger.addEventListener('click', function (event){
      /* prevent default action for event */
      event.preventDefault();
      /* toggle active class on element of thisProduct */
      thisProduct.element.classList.add('active');
      /* find all active products */
      const activeProducts = document.querySelectorAll('active');
      /* START LOOP: for each active product */
      for(let activeProduct of activeProducts) {
        /* START: if the active product isn't the element of thisProduct */
        if (activeProduct != thisProduct.element) {
          /* remove class active for the active product */
          activeProduct.classList.remove('active');
          /* END: if the active product isn't the element of thisProduct */
        }
      }
      /* END LOOP: for each active product */
    });
    /* END: click event listener to trigger */
  }
    
  initOrderForm(){
    const thisProduct = this;
    //console.log('initOrderForm', thisProduct);
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
      thisProduct.addToCart();
    });
  }

  processOrder() {
    const thisProduct = this;
    thisProduct.params = {};
    //console.log('processOrder', thisProduct);


    /* read all data from the form (using utils.serializeFormToObject) and save it to const formData */
    const formData = utils.serializeFormToObject(thisProduct.form);
      
    /* set variable price to equal thisProduct.data.price */
    let productPrice = thisProduct.data.price;
    const params = thisProduct.data.params;

    /* START LOOP: for each paramId in thisProduct.data.params */
    for (let paramId in params) {

      /* save the element in thisProduct.data.params with key paramId as const param */
      const param = params[paramId];
      const options = param.options;

      /* START LOOP: for each optionId in param.options */
      for (let optionId in options) {
        const option = param.options[optionId];
        const optionSelected = formData.hasOwnProperty(paramId) && formData[paramId].indexOf(optionId) > -1;
        const imageSelector = '.' + paramId + '-' + optionId;
        const image = thisProduct.imageWrapper.querySelector(imageSelector);
        /* START IF: if option is selected and option is not default */
        if(optionSelected && !option.default) {
          /* add price of option to variable price */
          productPrice += option.price;
        } else if (!optionSelected && option.default) {
          /* deduct price of option from price */
          productPrice -= option.price;
        }
        //Cart
        if(!thisProduct.params[paramId]){
          thisProduct.params[paramId] = {
            label:param.label,
            options: {},
          };
        }
        thisProduct.params[paramId].options[optionId] = option.label;
        //image
        if (image && optionSelected) {
          image.classList.add(classNames.menuProduct.imageVisible);
        } else if (image && !optionSelected) {
          image.classList.remove(classNames.menuProduct.imageVisible);
        }
        //console.log('label', thisProduct.params);
      }
    }
    const totalPrice = thisProduct.element.getElementsByClassName('product__total-price price');
    totalPrice.innerHTML = '';
    /* multiply price by amount */
    thisProduct.priceSingle = productPrice;
    thisProduct.price = thisProduct.priceSingle * thisProduct.amountWidget.value;
      
    /* set the contents of thisProduct.priceElem to be the value of variable price */
    thisProduct.priceElem.innerHTML = thisProduct.price;
  }
  initAmountWidget() {
    const thisProduct = this;

    thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem);
    thisProduct.amountWidgetElem.addEventListener('updated', function () {
      thisProduct.processOrder();
    });
  }
  addToCart(){
    const thisProduct = this;
    thisProduct.name = thisProduct.data.name;
    thisProduct.amount = thisProduct.amountWidget.value;
    const event = new CustomEvent('add-to-cart', {
      bubbles: true,
      detail: {
        product: thisProduct,
      },
    });
    thisProduct.element.dispatchEvent(event);
  }
}
  