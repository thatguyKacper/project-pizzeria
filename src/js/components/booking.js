import AmountWidget from './amountwidget.js';
import { templates, select } from '../settings.js';
import { utils } from '../utils.js';
import DatePicker from './datepicker.js';
import HourPicker from './hourpicker.js';

class Booking {
  constructor(element) {
    const thisBooking = this;

    thisBooking.render(element);
    thisBooking.initWidget();
  }

  render(element) {
    const thisBooking = this;

    const generatedHTML = templates.bookingWidget();

    thisBooking.dom = {};
    thisBooking.dom.html = utils.createDOMFromHTML(generatedHTML);
    thisBooking.dom.wrapper = element;
    thisBooking.dom.wrapper.appendChild(thisBooking.dom.html);
    thisBooking.dom.peopleAmount = thisBooking.dom.wrapper.querySelector(select.booking.peopleAmount);
    thisBooking.dom.hoursAmount = thisBooking.dom.wrapper.querySelector(select.booking.hoursAmount);
    thisBooking.dom.datePicker = thisBooking.dom.wrapper.querySelector(select.widgets.datePicker.wrapper);
  }

  initWidget() {
    const thisBooking = this;

    // console.log(thisBooking.dom);

    thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);
    thisBooking.datePicker = new DatePicker(thisBooking.dom.datePicker);
    thisBooking.hourPicker = new HourPicker(thisBooking.dom.hourPicker);
  }
}

export default Booking;