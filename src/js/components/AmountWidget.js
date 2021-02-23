
import {settings, select} from '../settings.js';

class AmountWidget{
  constructor(element) {
    const thisWidget = this;
    thisWidget.value = settings.amountWidget.defaultValue;
    thisWidget.getElements(element);
    thisWidget.setValue(thisWidget.input.value);
    thisWidget.initActions();
  }
  getElements(element) {
    const thisWidget = this;
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
    if (thisWidget.value != newValue && !isNaN(newValue) && newValue <= settings.amountWidget.defaultMax && newValue >= settings.amountWidget.defaultMin)
    {
      thisWidget.value = newValue;
    }
    thisWidget.input.value = thisWidget.value;
    thisWidget.announce();
  }
  initActions() {
    const thisWidget = this;
    thisWidget.input.addEventListener ('change', function() {
    // event.preventDefault();
      thisWidget.setValue(thisWidget.input.value);
    });
    thisWidget.linkIncrease.addEventListener ('click', function(event) {
      event.preventDefault();
      thisWidget.setValue(++thisWidget.value);
    });
    thisWidget.linkDecrease.addEventListener ('click', function(event) {
      event.preventDefault();
      thisWidget.setValue(--thisWidget.value);
    });
  }
}
export default AmountWidget;
