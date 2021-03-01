
import { templates, select} from '../settings.js';
import AmountWidget from './AmountWidget.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js';

class Booking {
  constructor(reserveTable) {
    const thisBooking = this;
    thisBooking.render(reserveTable);
    thisBooking.initWidgets();
  }
  render(reserveTable) {
    const thisBooking = this;
    const generateBookingHTML = templates.bookingWidget();
    thisBooking.dom = {};
    thisBooking.dom.wrapper = reserveTable;
    thisBooking.dom.wrapper.innerHTML = generateBookingHTML;
    thisBooking.dom.amount =
    thisBooking.dom.peopleAmount = document.querySelector(select.booking.peopleAmount);
    thisBooking.dom.hoursAmount = document.querySelector(select.booking.hoursAmount);
    thisBooking.dom.datePicker = document.querySelector(select.widgets.datePicker.wrapper);
    thisBooking.dom.hourPicker = document.querySelector(select.widgets.hourPicker.wrapper);
  }
  initWidgets() {
    const thisBooking = this;
    thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);
    thisBooking.datePicker = new DatePicker(thisBooking.dom.datePicker);
    thisBooking.hourPicker = new HourPicker(thisBooking.dom.hourPicker);
    // thisBooking.peopleAmount.AddEventListener('click', function(event) {
    //   event.preventDefault;
    // });
    // thisBooking.hoursAmount.AddEventListener('click', function(event) {
    //   event.preventDefault;
    // });
  }
}
export default Booking;
