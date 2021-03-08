import {templates, select} from '../settings.js';
import {app} from '../app.js';

class Home{
  constructor(element){
    const thisHome = this;
    thisHome.render(element);
    thisHome.initCarousel();
    thisHome.initLink();
  }

  render(element){
    const thisHome = this;

    const generateHomeHTML = templates.home();

    thisHome.dom = {};
    thisHome.dom.wrapper = element;
    thisHome.dom.wrapper.innerHTML = generateHomeHTML;
    thisHome.dom.onlineOrder = document.querySelector(select.home.onlineOrder);
    thisHome.dom.bookTable = document.querySelector(select.home.bookTable);
  }
  initCarousel(){
    const elem = document.querySelector('.main-carousel');
    new Flickity(elem, { // eslint-disable-line
    // options
      cellAlign: 'left',
      contain: true,
      autoPlay: true,
    });
  }

  initLink(){
    const thisHome = this;
    thisHome.dom.onlineOrder.addEventListener('click', function(){
      app.ActivatePage('order');
      window.location.hash = '/order';
    });

    thisHome.dom.bookTable.addEventListener('click', function(){
      app.ActivatePage('booking');
      window.location.hash = '/booking';
    });
  }
}
export default Home;
