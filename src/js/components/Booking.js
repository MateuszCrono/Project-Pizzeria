import { templates, select, settings, classNames } from '../settings.js';
import { AmountWidget } from './AmountWidget.js';
import { DatePicker } from './DatePicker.js';
import { HourPicker } from './HourPicker.js';
import { utils } from '../utils.js';

export class Booking {
  constructor(bookingWrapper) {
    const thisBooking = this;
    thisBooking.render(bookingWrapper);
    thisBooking.initWidgets();
    thisBooking.getData();
    thisBooking.selectTable();
  }

  render(bookingWrapper) {
    const thisBooking = this;
    const generatedHTML = templates.bookingWidget();
    thisBooking.dom = {};
    thisBooking.dom.wrapper = bookingWrapper;
    thisBooking.dom.wrapper.innerHTML = generatedHTML;
    thisBooking.dom.peopleAmount = thisBooking.dom.wrapper.querySelector(select.booking.peopleAmount);
    thisBooking.dom.hoursAmount = thisBooking.dom.wrapper.querySelector(select.booking.hoursAmount);
    thisBooking.dom.datePicker = thisBooking.dom.wrapper.querySelector(select.widgets.datePicker.wrapper);
    thisBooking.dom.hourPicker = thisBooking.dom.wrapper.querySelector(select.widgets.hourPicker.wrapper);
    thisBooking.dom.tables = thisBooking.dom.wrapper.querySelectorAll(select.booking.tables);
    thisBooking.dom.starters = thisBooking.dom.wrapper.querySelectorAll(select.booking.starters);
    thisBooking.dom.form = thisBooking.dom.wrapper.querySelector(select.booking.form);
  }

  initWidgets() {
    const thisBooking = this;
    thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);
    thisBooking.datePicker = new DatePicker(thisBooking.dom.datePicker);
    thisBooking.hourPicker = new HourPicker(thisBooking.dom.hourPicker);
    thisBooking.dom.wrapper.addEventListener('updated', function () {
      thisBooking.updateDOM();
    });

    thisBooking.dom.form.addEventListener('submit', function (event) {
      event.preventDefault();
      thisBooking.sendBooking();
    });
  }

  getData() {
    const thisBooking = this;
    const startEndDates = {};
    startEndDates[settings.db.dateStartParamKey] = utils.dateToStr(thisBooking.datePicker.minDate);
    startEndDates[settings.db.dateEndParamKey] = utils.dateToStr(thisBooking.datePicker.maxDate);

    const endDate = {};
    endDate[settings.db.dateEndParamKey] = startEndDates[settings.db.dateEndParamKey];

    const params = {
      booking: utils.queryParams(startEndDates),
      eventsCurrent: settings.db.notRepeatParam + '&' + utils.queryParams(startEndDates),
      eventsRepeat: settings.db.repeatParam + '&' + utils.queryParams(endDate),
    };
    //console.log('getData params', params);

    const urls = {
      booking: settings.db.url + '/' + settings.db.booking + '?' + params.booking,
      eventsCurrent: settings.db.url + '/' + settings.db.event + '?' + params.eventsCurrent,
      eventsRepeat: settings.db.url + '/' + settings.db.event + '?' + params.eventsRepeat,
    };

    //console.log('getData urls', urls);

    Promise.all([
      fetch(urls.booking),
      fetch(urls.eventsCurrent),
      fetch(urls.eventsRepeat),
    ])
      .then(function ([bookingsResponse, eventsCurrentResponse, eventsRepeatResponse]) {
        return Promise.all([
          bookingsResponse.json(),
          eventsCurrentResponse.json(),
          eventsRepeatResponse.json(),
        ]);
      })
      .then(function ([bookings, eventsCurrent, eventsRepeat]) {
        thisBooking.parseData(bookings, eventsCurrent, eventsRepeat);
      });
  }

  parseData(bookings, eventsCurrent, eventsRepeat) {
    const thisBooking = this;
    thisBooking.booked = {};

    for (let item of eventsCurrent) {
      console.log('item:', item);
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    for (let item of bookings) {
      console.log('item:', item);
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
    console.log('thisBooking.booked:', thisBooking.booked);
    thisBooking.updateDOM();
  }

  makeBooked(date, hour, duration, table) {
    const thisBooking = this;

    if (typeof thisBooking.booked[date] == 'undefined') {
      thisBooking.booked[date] = {};
    }

    const startHour = utils.hourToNumber(hour);

    for (let hourBlock = startHour; hourBlock < startHour + duration; hourBlock += 0.5) {
      if (typeof thisBooking.booked[date][hourBlock] == 'undefined') {
        thisBooking.booked[date][hourBlock] = [];
      }
      thisBooking.booked[date][hourBlock].push(table);
    }
  }
  updateDOM() {
    const thisBooking = this;
    console.log('lol', thisBooking);

    thisBooking.date = thisBooking.datePicker.value;
    thisBooking.hour = utils.hourToNumber(thisBooking.hourPicker.value);

    for (let table of thisBooking.dom.tables) {
      let tableId = table.getAttribute(settings.booking.tableIdAttribute);

      console.log(tableId, thisBooking.date, thisBooking.hour);

      if (typeof thisBooking.booked[thisBooking.date] != 'undefined'
        && typeof thisBooking.booked[thisBooking.date][thisBooking.hour] != 'undefined'
        && thisBooking.booked[thisBooking.date][thisBooking.hour].includes(parseInt(tableId))) {
        table.classList.add(classNames.booking.tableBooked);
        console.log('booked');
      } else {
        table.classList.remove(classNames.booking.tableBooked);
        console.log('free table');
      }
    }
    thisBooking.colorSlider();
  }
  selectTable() {
    const thisBooking = this;
    console.log('selectTable');

    for (let table of thisBooking.dom.tables) {
      table.addEventListener('click', function (event) {
        event.preventDefault();



        const tableClicked = table.getAttribute(settings.booking.tableIdAttribute);


        if (table.classList.contains(classNames.booking.tableBooked)) {
          table.classList.remove(classNames.booking.tableBooked);
          console.log('Booking is removed now.');

        } else {
          table.classList.add(classNames.booking.tableBooked);

          console.log('Table is booked now.');
        }

        thisBooking.tableBooked = tableClicked;
      });
    }
  }
  sendBooking() {
    const thisBooking = this;
    console.log('sendBooking');

    const url = settings.db.url + '/' + settings.db.booking;

    const booking = {
      date: thisBooking.datePicker.value,
      hour: thisBooking.hourPicker.value,
      duration: thisBooking.hoursAmount.value,
      ppl: thisBooking.peopleAmount.value,
      table: parseInt(thisBooking.tableBooked),
      starters: [],
    };

    for (let starter of thisBooking.dom.starters) {
      if (starter.checked == true) {
        booking.starter.push(starter.value);
      }
    }

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(booking),
    };

    fetch(url, options)
      .then(function (response) {
        return response.json();
      })
      .then(function (parsedResponse) {
        console.log('parsedResponse', parsedResponse);
      });
  }
  colorSlider() {
    const thisBooking = this;
    const rangeSlider = document.querySelector('.rangeSlider__horizontal');
    let colors = 'linear-gradient(to right';
    let progress = 0;
    let next = 4.2;

    for (let timeOfBooking = 12; timeOfBooking <= 24; timeOfBooking += 0.5) {
      if (typeof thisBooking.booked[thisBooking.date] === 'undefined' || typeof thisBooking.booked[thisBooking.date][timeOfBooking] === 'undefined') {
        let nextValue = progress + next;
        colors += ',green' + ' ' + progress + '%' + ' ' + nextValue + '%';
        progress += next;
      } else if (thisBooking.booked[thisBooking.date][timeOfBooking].length == 2) {
        let nextValue = progress + next;
        colors += ',yellow' + ' ' + progress + '%' + ' ' + nextValue + '%';
        progress += next;
      } else if (thisBooking.booked[thisBooking.date][timeOfBooking].length == 3) {
        let nextValue = progress + next;
        colors += ',red' + ' ' + progress + '%' + ' ' + nextValue + '%';
        progress += next;
      }
    }
    colors += ')';
    console.log(colors);
    rangeSlider.style.backgroundImage = colors;
  }
}