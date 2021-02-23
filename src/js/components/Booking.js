// import { render } from 'node-sass';
import { templates, select} from '../settings.js';
// import { utils } from '../utils.js';
import AmountWidget from './AmountWidget.js';

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
  }
  initWidgets() {
    const thisBooking = this;
    thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);
    // thisBooking.peopleAmount.AddEventListener('click', function(event) {
    //   event.preventDefault;
    // });
    // thisBooking.hoursAmount.AddEventListener('click', function(event) {
    //   event.preventDefault;
    // });
  }
}
export default Booking;
