/* global rangeSlider */

import { select, settings } from '../settings.js';
import { utils } from '../utils.js';
import { BaseWidget } from './BaseWidget.js';

export class HourPicker extends BaseWidget {
  constructor(wrapper) {
    super(wrapper, settings.hours.open);
    const thisWidget = this;
    thisWidget.dom.input = thisWidget.dom.wrapper.querySelector(select.widgets.hourPicker.input);
    thisWidget.dom.output = thisWidget.dom.wrapper.querySelector(select.widgets.hourPicker.output);
    thisWidget.value = thisWidget.dom.input.value;
    thisWidget.initPlugin();
    thisWidget.value = thisWidget.dom.input.value;
  }
  initPlugin(){
    const thisWidget = this;

    rangeSlider.create(thisWidget.dom.input);
    thisWidget.dom.input.addEventListener('input', function() {
      thisWidget.value = thisWidget.dom.input.value;
    });
  }
  parseValue(value) {
    return utils.numberToHour(value);
  }
  isValid() {
    return true;
  }
  renderValue() {
    const thisWidget = this;
    thisWidget.dom.output.innerHTML = thisWidget.value;
    
  }
}