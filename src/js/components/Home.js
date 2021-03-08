import {templates, select} from '../settings.js';

class Home{
  constructor(element){
    const thisHome = this;
    thisHome.render(element);
    thisHome.initCarousel();
    thisHome.initAction();
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

  initAction(){
    const thisHome = this;
    thisHome.dom.onlineOrder.addEventListener('click', function(){
      console.log('clicked onlineOrder');
    });

    thisHome.dom.bookTable.addEventListener('click', function(){
      console.log('clicked bookTable');
    });

  }
}
export default Home;
