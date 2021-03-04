import {templates, select, settings, classNames} from '../settings.js';
import {utils} from '../utils.js';
import AmountWidget from './AmountWidget.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js';

class Booking {
  constructor(reserveTable) {
    const thisBooking = this;
    // const selectedTable = {};
    thisBooking.product = [];
    thisBooking.render(reserveTable);
    thisBooking.initWidgets();
    thisBooking.getData();
    thisBooking.initTable();
  }
  render(reserveTable) {
    const thisBooking = this;
    const generateBookingHTML = templates.bookingWidget();
    thisBooking.dom = {};
    thisBooking.dom.wrapper = reserveTable;
    thisBooking.dom.wrapper.innerHTML = generateBookingHTML;
    thisBooking.dom.peopleAmount = document.querySelector(select.booking.peopleAmount);
    thisBooking.dom.hoursAmount = document.querySelector(select.booking.hoursAmount);
    thisBooking.dom.datePicker = document.querySelector(select.widgets.datePicker.wrapper);
    thisBooking.dom.hourPicker = document.querySelector(select.widgets.hourPicker.wrapper);
    thisBooking.dom.tables = document.querySelectorAll(select.booking.tables);
    thisBooking.dom.form = document.querySelector(select.booking.form);
    thisBooking.dom.phone = thisBooking.dom.wrapper.querySelector(select.booking.phone);
    thisBooking.dom.address = thisBooking.dom.wrapper.querySelector(select.booking.address);
    thisBooking.dom.starters = thisBooking.dom.wrapper.querySelectorAll(select.booking.starters);


  }
  initWidgets() {
    const thisBooking = this;
    thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);
    thisBooking.datePicker = new DatePicker(thisBooking.dom.datePicker);
    thisBooking.hourPicker = new HourPicker(thisBooking.dom.hourPicker);

    thisBooking.dom.wrapper.addEventListener('updated', function(){
      thisBooking.updateDOM();
    });

    thisBooking.dom.form.addEventListener('submit', function(event) {
      event.preventDefault();
      thisBooking.sendBooking();
    });
    // thisBooking.dom.wrapper.addEventListener('click', function(){
    //   // event.preventDefault
    //   thisBooking.initTables();
    // });
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
        endDateParam
      ]
    };
    const urls = {
      booking:       settings.db.url + '/' +settings.db.booking
                                     + '?' + params.booking.join('&'),
      eventsCurrent: settings.db.url + '/' +settings.db.event
                                     + '?' + params.eventsCurrent.join('&'),
      eventsRepeat:  settings.db.url + '/' +settings.db.event
                                     + '?' + params.eventsRepeat.join('&')
    };
    Promise.all([
      fetch(urls.booking),
      fetch(urls.eventsCurrent),
      fetch(urls.eventsRepeat)
    ])
      .then(function(allResponses) {
        const bookingResponse = allResponses[0];
        const eventsCurrentResponse = allResponses[1];
        const eventsRepeatResponse = allResponses[2];
        return Promise.all([
          bookingResponse.json(),
          eventsCurrentResponse.json(),
          eventsRepeatResponse.json(),
        ]);
      })
      .then(function([bookings, eventsCurrent, eventsRepeat]){
        thisBooking.parseDate(bookings,eventsCurrent,eventsRepeat);
      });
  }
  parseDate(bookings,eventsCurrent,eventsRepeat) {
    const thisBooking = this;

    thisBooking.booked = {};

    for (let item of bookings) {
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);

    }

    for (let item of eventsCurrent) {
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);

    }

    const minDate =  thisBooking.datePicker.minDate;
    const maxDate =  thisBooking.datePicker.maxDate;

    for (let item of eventsRepeat) {
      if (item.repeat == 'daily') {
        for(let loopDate = minDate; loopDate <= maxDate; loopDate = utils.addDays(loopDate, 1))
          thisBooking.makeBooked(utils.dateToStr(loopDate), item.hour, item.duration, item.table);
      }
    }
    thisBooking.updateDOM();
  }
  makeBooked(date, hour, duration, table) {
    const thisBooking = this;

    if (typeof thisBooking.booked[date] == 'undefined') {
      thisBooking.booked[date] = {};
    }
    const startHour = utils.hourToNumber(hour);

    for (let hourBlock = startHour; hourBlock < startHour + duration; hourBlock += 0.5) {
      // console.log('hourBlock',hourBlock)
      if (typeof thisBooking.booked[date][hourBlock] == 'undefined') {
        thisBooking.booked[date][hourBlock] = [];
      }
      thisBooking.booked[date][hourBlock].push(table);
    }
  }
  updateDOM(){
    const thisBooking = this;

    thisBooking.date = thisBooking.datePicker.value;
    thisBooking.hour = utils.hourToNumber(thisBooking.hourPicker.value);

    let allAvailable = false;

    if(
      typeof thisBooking.booked[thisBooking.date] == 'undefined'
      ||
      typeof thisBooking.booked[thisBooking.date][thisBooking.hour] == 'undefined'
    ){
      allAvailable = true;
    }
    for(let table of thisBooking.dom.tables){
      let tableId = table.getAttribute(settings.booking.tableIdAttribute);
      if(!isNaN(tableId)){
        tableId = parseInt(tableId);
      }

      if(
        !allAvailable
        &&
        thisBooking.booked[thisBooking.date][thisBooking.hour].includes(tableId)
      ){
        table.classList.add(classNames.booking.tableBooked);
        table.classList.remove('selected');
      } else {
        table.classList.remove(classNames.booking.tableBooked);
      }
    }
  }
  initTable() {
    const thisBooking = this;
    thisBooking.selectedTableId = null;

    thisBooking.timePicker();

    for (let table of thisBooking.dom.tables) {
      let tableId = table.getAttribute(settings.booking.tableIdAttribute);

      table.addEventListener('click', function () {
        if (table.classList.contains('selected')) {
          table.classList.remove('selected');
          thisBooking.selectedTableId = null;
          return;
        }
        thisBooking.removeSelected();
        if (table.classList.contains('table')) {
          if (!table.classList.contains('booked')) {
            thisBooking.selectedTableId = tableId;
            table.classList.toggle('selected');
            console.log(thisBooking.selectedTableId);

          }
          else {
            alert('Stolik jest zajęty!');
          }
        }
      });
    }
  }

  removeSelected() {
    const thisBooking = this;
    for (let table of thisBooking.dom.tables) {
      table.classList.remove('selected');
    }

  }

  timePicker() {
    const thisBooking = this;

    thisBooking.dom.hourPicker.addEventListener('change', function () {
      console.log('zmieniona godzina');
      for (let table of thisBooking.dom.tables) {
        if (table.classList.contains('booked' && 'selected')) {
          table.classList.remove('selected');
        }
      }
      });
        thisBooking.dom.datePicker.addEventListener('change', function () {
          console.log('zmieniony dzien');
          for (let table of thisBooking.dom.tables) {
            if (table.classList.contains('booked' && 'selected')) {
              table.classList.remove('selected');
            }
          }
    });
    thisBooking.dom.peopleAmount.addEventListener('click', function () {
      console.log('zmieniono ilość osób');
      for (let table of thisBooking.dom.tables) {
        if (table.classList.contains('booked' && 'selected')) {
          table.classList.remove('selected');
        }
      }
  });
  thisBooking.dom.hoursAmount.addEventListener('click', function () {
  console.log('zmieniono ilośc godzin');
  for (let table of thisBooking.dom.tables) {
    if (table.classList.contains('booked' && 'selected')) {
      table.classList.remove('selected')
    }
  }

  });
  }

  }
  sendBooking() {
    const thisBooking = this;
    const url = settings.db.url + '/' + settings.db.booking;
    const payload =  {
      date: thisBooking.datePicker.value,
      hour: thisBooking.hourPicker.value,
      table: parseFloat(thisBooking.selectedTableId),
      duration: thisBooking.hoursAmount.value,
      ppl: thisBooking.peopleAmount.value,
      starters: [],
      phone: thisBooking.dom.phone.value,
      address: thisBooking.dom.address.value,
    };
    console.log(payload);
    for (let prod of thisBooking.products) {
      payload.products.push(prod.getData());
    }
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    };

    fetch(url, options);
  }

}


export default Booking;
