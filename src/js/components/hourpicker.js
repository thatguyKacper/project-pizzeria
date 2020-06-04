import BaseWidget from './basewidget.js';
import { settings, select } from '../settings.js';
import { utils } from '../utils.js';

class HourPicker extends BaseWidget {
  constructor(wrapper) {
    super(wrapper, settings.hours.open);

    const thisWidget = this;

    thisWidget.dom.input = thisWidget.dom.wrapper.querrySelector(select.widgets.datePicker.input);
    thisWidget.dom.output = thisWidget.dom.wrapper.querrySelector(select.widgets.datePicker.output);

    thisWidget.initPlugin();
    thisWidget.value = thisWidget.dom.input.value;
  }

  initPlugin() {
    const thisWidget = this;

    rangeSlider.create(thisWidget.dom.input); // eslint-disable-line

    thisWidget.dom.input.addEventListener('input', function () {
      thisWidget.value = thisWidget.dom.input.value;
    });
  }

  parseValue(value) {
    return utils.numberToHour(value);
  }

  isValid(value) {
    return true;
  }

  renderValue() {
    const thisWidget = this;

    thisWidget.dom.output.innerHTML = thisWidget.value;
  }
}

export default HourPicker;