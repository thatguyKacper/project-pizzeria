import { settings, select, classNames } from './settings.js';
import Product from './components/product.js';
import Cart from './components/cart.js';
import Booking from './components/booking.js';

const app = {
  initPages: function () {
    const thisApp = this;

    thisApp.pages = document.querySelector(select.containerOf.pages).children;
    thisApp.navLinks = document.querySelectorAll(select.nav.links);

    const idFromHash = window.location.replace('#/', '');

    let pageMatchingHash = thisApp.pages[0].id;

    for (let page of thisApp.pages) {
      if (page.id == idFromHash) {
        pageMatchingHash = page.id;
        break;
      }
    }

    thisApp.activatePage(thisApp.pages[0].id);

    for (let link of thisApp.navLinks) {
      link.addEventListener('click', function (event) {
        const clickedElement = this;
        event.preventDefault();

        /* get page id from href attribute */
        const id = clickedElement.getAttribute('href').replace('#', '');

        /* run thisApp.activePage with that id */
        thisApp.activatePage(id);

        /* change URL hash */
        window.location.hash = '#/' + id;

      });
    }
  },

  activatePage: function (pageId) {
    const thisApp = this;

    /* add class "active" to matching pages, remove from non-matching */
    for (let page of thisApp.pages) {
      page.classList.toggle(
        classNames.pages.active,
        page.id == pageId
      );
    }

    /* add class "active" to matching links, remove from non-matching */
    for (let link of thisApp.navLinks) {
      link.classList.toggle(
        classNames.nav.active,
        link.getAttribute('href') == '#' + pageId
      );
    }
  },

  initBooking: function () {
    const thisApp = this;

    const bookingWidget = document.querySelector(select.containerOf.booking);

    new Booking(bookingWidget);
  },

  initCart: function () {
    const thisApp = this;

    const cartElem = document.querySelector(select.containerOf.cart);
    thisApp.cart = new Cart(cartElem);

    thisApp.productList = document.querySelector(select.containerOf.menu);

    thisApp.productList.addEventListener('add-to-cart', function (event) {
      app.cart.add(event.detail.product);
    });
  },

  initCarousel() {
    // eslint-disable-next-line no-unused-vars
    let i = 0;
    const review = [];
    const time = 3000;

    review[0] = {
      title: 'Nulla',
      content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      author: 'Efficitur N.',
    };

    review[1] = {
      title: 'Vestibulum !!!',
      content: 'Aenean vitae quam suscipit, interdum arcu nec,',
      author: 'Pellentesque A.',
    };

    review[2] = {
      title: 'Lobortis ???',
      content: 'Mauris maximus ipsum sed.',
      author: 'Vel F.',
    };

    const dots = document.querySelectorAll('.carousel-dots i');

    function changeTitle() {

      const title = document.querySelector('.review-title');

      const pean = document.querySelector('.reviev-content');

      const author = document.querySelector('.review-author');

      for (let dot of dots) {
        if (dot.id == i + 1) {
          dot.classList.add('active');
        } else {
          dot.classList.remove('active');
        }
        title.innerHTML = review[i].title;
        pean.innerHTML = review[i].content;
        author.innerHTML = review[i].author;
      }

      if (i < review.length - 1) {
        i++;
      } else {
        i = 0;
      }
    }
    changeTitle();

    setInterval(() => {
      changeTitle();
    }, 3000);
  },

  initMenu: function () {
    const thisApp = this;
    // console.log('thisApp.data:', thisApp.data);

    for (let productData in thisApp.data.products) {
      new Product(thisApp.data.products[productData].id, thisApp.data.products[productData]);
    }
  },

  initData: function () {
    const thisApp = this;

    thisApp.data = {};

    const url = settings.db.url + '/' + settings.db.product;

    fetch(url)
      .then(function (rawResponse) {
        return rawResponse.json();
      })
      .then(function (parsedResponse) {
        // console.log('parsedResponse', parsedResponse);

        // save parsedResponse as thisApp.data.products
        thisApp.data.products = parsedResponse; //???

        // execute initMenu method
        thisApp.initMenu();

      });
    // console.log('thisApp.data', JSON.stringify(thisApp.data));
  },

  init: function () {
    const thisApp = this;
    /*  console.log('*** App starting ***');
      console.log('thisApp:', thisApp);
      console.log('classNames:', classNames);
      console.log('settings:', settings);
      console.log('templates:', templates); */


    thisApp.initPages();
    thisApp.initData();
    // thisApp.initMenu();
    thisApp.initCart();
    thisApp.initBooking();
    thisApp.initCarousel();
  },
};

app.init();
