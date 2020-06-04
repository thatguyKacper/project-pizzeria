import BaseWidget from './basewidget.js';
import { settings, select } from '../settings.js';
import { utils } from '../utils.js';

class DatePicker extends BaseWidget {
  constructor(wrapper) {
    super(wrapper, utils.dateToStr(new Date()));

    const thisWidget = this;

    thisWidget.dom.input = thisWidget.dom.wrapper.querrySelector(select.widgets.datePicker.input);

    thisWidget.initPlugin();
  }

  initPlugin() {
    const thisWidget = this;

    thisWidget.minDate = new Date(thisWidget.value);

    thisWidget.maxDate = utils.addDays(thisWidget.minDate, settings.datePicker.maxDaysInFuture);

    flatpickr(thisWidget.dom.input, { // eslint-disable-line

      defaultDate: thisWidget.minDate,
      minDate: thisWidget.minDate,
      maxDate: thisWidget.maxDate,

      onChange: (function (selectedDates, dateStr) {
        thisWidget.value = dateStr;
      }),

      'disable': [
        function (date) {
          return (date.getDay() === 1);
        }
      ],

      'locale': {
        'firstDayOfWeek': 1
      }
    });
  }

  parseValue(value) {
    return value;
  }

  isValid(value) {
    return true;
  }

  renderValue() {
    const thisWidget = this;
  }
}

export default DatePicker;