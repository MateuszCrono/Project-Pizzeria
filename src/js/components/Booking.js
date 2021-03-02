
import {templates, select, settings, classNames} from '../settings.js';
import {utils} from '../utils.js';
import AmountWidget from './AmountWidget.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js';

class Booking {
  constructor(reserveTable) {
    const thisBooking = this;
    thisBooking.render(reserveTable);
    thisBooking.initWidgets();
    thisBooking.getData();
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
  }
  getData() {
    const thisBooking = this;

    const startDateParam = settings.db.dateStartParamKey + '=' + utils.dateToStr(thisBooking.DatePicker.minDate);
    const endDateParam = settings.db.dateEndParamKey + '=' + utils.dateToStr(thisBooking.DatePicker.maxDate);

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
    console.log('getData params', params);

    const urls = {
      booking:       settings.db.url + '/' +settings.db.booking
                                     + '?' + params.booking.join('&'),
      eventsCurrent: settings.db.url + '/' +settings.db.event
                                     + '?' + params.eventsCurrent.join('&'),
      eventsRepeat:  settings.db.url + '/' +settings.db.event
                                     + '?' + params.eventsRepeat.join('&')
                                    //  console.log('getData params', params);
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

    if (typeof thisBooking.booked[date][hourBlock] == 'undefined') {
      thisBooking.booked[date][hourBlock] = {};
    }

    thisBooking.booked[date][hourBlock].push(table);

    for (let hourBlock = startHour; hourBlock < startHour + duration; hourBlock += 0.5) {

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
         thisBooking.booked[thisBooking.date][thisBooking.hour].includes[tableId]
       ){
         table.classlist.add(classNames.booking.tableBooked);
       } else {
        table.classlist.remove(classNames.booking.tableBooked);
       }
       }
     }
  }
export default Booking;
