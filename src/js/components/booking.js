/* eslint-disable indent */
import AmountWidget from './amountwidget.js';
import { templates, select, settings, classNames } from '../settings.js';
import { utils } from '../utils.js';
import DatePicker from './datepicker.js';
import HourPicker from './hourpicker.js';

class Booking {
  constructor(element) {
    const thisBooking = this;

    thisBooking.render(element);
    thisBooking.initWidget();
    thisBooking.getData();
    thisBooking.selectTable();
  }

  getData() {

    const thisBooking = this;

    const startDateParam = settings.db.dateStartParamKey + '=' + utils.dateToStr(thisBooking.datePicker.minDate);
    const endDateParam = settings.db.dateEndParamKey + '=' + utils.dateToStr(thisBooking.datePicker.maxDate);

    const params = {
      booking: [
        startDateParam,
        endDateParam,
      ],
      eventsCurrent: [
        settings.db.notRepeatParam,
        startDateParam,
        endDateParam,
      ],
      eventsRepeat: [
        settings.db.repeatParam,
        endDateParam,
      ],
    };

    // console.log('getData params', params);

    const urls = {
      booking: settings.db.url + '/' + settings.db.booking + '?' + params.booking.join('&'),
      eventsCurrent: settings.db.url + '/' + settings.db.event + '?' + params.eventsCurrent.join('&'),
      eventsRepeat: settings.db.url + '/' + settings.db.event + '?' + params.eventsRepeat.join('&'),
    };

    // console.log('getData urls', urls);

    Promise.all([
      fetch(urls.booking),
      fetch(urls.eventsCurrent),
      fetch(urls.eventsRepeat)
    ])
      .then(function (allResponses) {
        const bookingResponse = allResponses[0];
        const eventsCurrentResponse = allResponses[1];
        const eventsRepeatResponse = allResponses[2];
        return Promise.all([
          bookingResponse.json(),
          eventsCurrentResponse.json(),
          eventsRepeatResponse.json(),
        ]);
      })
      .then(function ([bookings, eventsCurrent, eventsRepeat]) {
        // console.log(bookings);
        // console.log(eventCurrent);
        // console.log(eventRepaet);
        thisBooking.parseData(bookings, eventsCurrent, eventsRepeat);
      });
  }

  parseData(bookings, eventsCurrent, eventsRepeat) {
    const thisBooking = this;

    thisBooking.booked = {};

    for (let item of bookings) {
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    for (let item of eventsCurrent) {
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    const minDate = thisBooking.datePicker.minDate;
    const maxDate = thisBooking.datePicker.maxDate;


    for (let item of eventsRepeat) {
      if (item.repeat == 'daily') {
        for (let loopDate = minDate; loopDate <= maxDate; loopDate = utils.addDays(loopDate, 1)) {
          thisBooking.makeBooked(utils.dateToStr(loopDate), item.hour, item.duration, item.table);
        }
      }
    }

    // console.log('thisBooking.booked', thisBooking.booked);

    thisBooking.updateDOM();
    thisBooking.rangeColourHour();
  }

  makeBooked(date, hour, duration, table) {
    const thisBooking = this;

    if (typeof thisBooking.booked[date] == 'undefined') {
      thisBooking.booked[date] = {};
    }

    const startHour = utils.hourToNumber(hour);

    for (let hourBlock = startHour; hourBlock < startHour + duration; hourBlock += 0.5) {
      // console.log('loop', hourBlock);

      if (typeof thisBooking.booked[date][hourBlock] == 'undefined') {
        thisBooking.booked[date][hourBlock] = [];
      }

      thisBooking.booked[date][hourBlock].push(table);
    }
  }

  selectTable() {
    const thisBooking = this;

    for (let table of thisBooking.dom.tables) {
      table.addEventListener('click', function () {
        table.classList.toggle('selected');
        thisBooking.tableId = table.getAttribute(settings.booking.tableIdAttribute);
      });
    }

    thisBooking.dom.submit.addEventListener('click', function () {
      event.preventDefault();
      thisBooking.sendBooking();
    });
  }

  rangeColourHour() {
    const thisBooking = this;
    const bookedHours = thisBooking.booked[thisBooking.date];

    const sliderDataForDay = [];
    thisBooking.dom.rangeSlider = thisBooking.dom.wrapper.querySelector(select.widgets.hourPicker.slider);

    const slider = thisBooking.dom.rangeSlider;

    for (let bookedHour in bookedHours) {
      const firstOfInterval = 0;//((bookedHour -12) * 100) / 12;
      const secondOfInterval = (((bookedHour - 12) + .5) * 100) / 12;
      if (bookedHour < 24) {
        if
          (bookedHours[bookedHour].length <= 1) {
          sliderDataForDay.push('/*' + bookedHour + '*/green ' + firstOfInterval + '%, green ' + secondOfInterval + '%');
        } else if
          (bookedHours[bookedHour].length == 2) {
          sliderDataForDay.push('/*' + bookedHour + '*/orange ' + firstOfInterval + '%, orange ' + secondOfInterval + '% ');
        } else if
          (bookedHours[bookedHour].length >= 3) {
          sliderDataForDay.push('/*' + bookedHour + '*/red ' + firstOfInterval + '%, red ' + secondOfInterval + '%');
        }
      }
    }
    sliderDataForDay.sort();
    const greenOrangeRedString = sliderDataForDay.join();
    slider.style.background = 'linear-gradient(to right, ' + greenOrangeRedString + ')';
  }

  sendBooking() {
    const thisBooking = this;

    const url = settings.db.url + '/' + settings.db.booking;

    const payload = {
      datePicked: thisBooking.datePicker.correctValue,
      hourPicked: thisBooking.hourPicker.value,
      bookingHourInput: thisBooking.hoursAmount.value,
      bookingPeopleInput: thisBooking.peopleAmount.value,
      table: [],
    };

    for (let table of this.dom.tables) {
      if (table.classList.contains('selected')) {
        thisBooking.tableId = table.getAttribute(settings.booking.tableIdAttribute);
        table.classList.add('booked');
        table.classList.remove('selected');
        if (!isNaN(thisBooking.tableId)) {
          thisBooking.tableId = parseInt(thisBooking.tableId);
        }
        payload.table.push(thisBooking.tableId);
      }
    }

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    };

    fetch(url, options)
      .then(function (response) {
        return response.json();
      })
      .then(function (parsedResponse) {
        thisBooking.makeBooked(payload.datePicked, payload.hourPicked, payload.bookHourInput, payload.table);
        // console.log('parsedResponse', parsedResponse);
      });
  }

  updateDOM() {
    const thisBooking = this;

    thisBooking.date = thisBooking.datePicker.value;
    thisBooking.hour = utils.hourToNumber(thisBooking.hourPicker.value);

    let allAvailable = false;

    if (
      typeof thisBooking.booked[thisBooking.date] == 'undefined'
      ||
      typeof thisBooking.booked[thisBooking.date][thisBooking.hour] == 'undefined'
    ) {
      allAvailable = true;
    }

    for (let table of thisBooking.dom.tables) {
      let tableId = table.getAttribute(settings.booking.tableIdAttribute);
      if (!isNaN(tableId)) {
        tableId = parseInt(tableId);
      }

      if (
        !allAvailable
        &&
        thisBooking.booked[thisBooking.date][thisBooking.hour].includes(tableId)
      ) {
        table.classList.add(classNames.booking.tableBooked);
      } else {
        table.classList.remove(classNames.booking.tableBooked);
      }
    }
  }

  render(element) {
    const thisBooking = this;

    const generatedHTML = templates.bookingWidget();
    // const bookingContainer = document.querySelector(select.containerOf.booking);

    thisBooking.dom = {};
    thisBooking.dom.wrapper = element;
    thisBooking.dom.wrapper.innerHTML = generatedHTML;
    // thisBooking.dom.html = utils.createDOMFromHTML(generatedHTML);
    // thisBooking.dom.wrapper.appendChild(thisBooking.dom.html);

    thisBooking.dom.peopleAmount = thisBooking.dom.wrapper.querySelector(select.booking.peopleAmount);
    thisBooking.dom.hoursAmount = thisBooking.dom.wrapper.querySelector(select.booking.hoursAmount);

    thisBooking.dom.datePicker = thisBooking.dom.wrapper.querySelector(select.widgets.datePicker.wrapper);
    thisBooking.dom.hourPicker = thisBooking.dom.wrapper.querySelector(select.widgets.hourPicker.wrapper);

    thisBooking.dom.tables = thisBooking.dom.wrapper.querySelectorAll(select.booking.tables);

    thisBooking.dom.submit = thisBooking.dom.wrapper.querySelector(select.booking.bookingSubmit);
  }

  initWidget() {
    const thisBooking = this;

    // console.log(thisBooking.dom);

    thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);

    thisBooking.datePicker = new DatePicker(thisBooking.dom.datePicker);
    thisBooking.hourPicker = new HourPicker(thisBooking.dom.hourPicker);

    thisBooking.dom.wrapper.addEventListener('updated', function () {
      thisBooking.updateDOM();
    });
  }
}

export default Booking;