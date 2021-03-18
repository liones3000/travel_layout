import "@fancyapps/fancybox";
import Swiper from "swiper";
import Masonry from "masonry-layout";
import SwiperCore, { Navigation, Pagination } from "swiper/core";

SwiperCore.use([Navigation, Pagination]);

const tour__media = document.querySelector(".tour__media");
const about__slider = document.querySelector(".about__slider");
const container = document.querySelector(".gallery__list");
const video__wrapper = document.querySelector(".video__list");
const form = document.forms.email;
let slideText = document.querySelectorAll(".slide__descr");
let origin = [];

/**
 *
 * @param {NodeList} el
 * @param {string} short // yes - no
 */
const resizeText = (elems, short = 0) => {
  if (short) {
    elems.forEach((el, index) => {
      let text = el.textContent.replace(/\s+/g, " ").trim();
      if (text.length > 105) {
        let short = origin[index].match(/^.{105}/is)[0];
        // console.log(short);
        el.textContent = short;
      }
    });
  } else {
    elems.forEach((el, index) => {
      let text = el.textContent.replace(/\s+/g, " ").trim();
      if (text.length < origin[index].length) {
        el.textContent = origin[index];
        // console.log(el.textContent);
      }
    });
  }
};

const measureWidth = () => {
  let el = document.querySelector(".slide__text");
  let width = getComputedStyle(el).width;
  if (parseInt(width) < 500) {
    resizeText(slideText, 1);
    // let msnry = new Masonry(container, {
    //   itemSelector: ".gallery__item",
    //   percentPosition: true,
    //   gutter: 8,
    //   fitWidth: true,
    // });
  } else {
    resizeText(slideText, 0);
    // let msnry = new Masonry(container, {
    //   itemSelector: ".gallery__item",
    //   percentPosition: true,
    //   gutter: 16,
    //   fitWidth: true,
    // });
  }
};

const saveText = (el) => {
  el.forEach((el) => {
    let text = el.textContent.replace(/\s+/g, " ").trim();
    origin.push(text);
  });
  measureWidth();
};

$(window).resize(measureWidth);

let getwidth = () => {
  let el = document.querySelector(".gallery__item");
  return getComputedStyle(el).width;
};

// Masonry
const msnry = new Masonry(container, {
  columnWidth: ".gallery__item",
  itemSelector: ".gallery__item",
  percentPosition: true,
  fitWidth: true,
  // gutter: $(window).width > 500 ? 16 : 8,
});

// Swiper .tour__media
const mediaSlider = new Swiper(tour__media, {
  wrapperClass: "media-wrapper",
  slideClass: "media__item",
  slidesPerView: "auto",
  loop: true,
  grabCursor: true,
  navigation: {
    nextEl: ".tour .media__btn--next",
    prevEl: ".tour .media__btn--prev",
  },
});

// Swiper .about__slider
const aboutSlider = new Swiper(about__slider, {
  wrapperClass: "about__wrapper",
  slideClass: "slide",
  slidesPerView: "auto",
  navigation: {
    nextEl: ".about .media__btn--next",
    prevEl: ".about .media__btn--prev",
  },
});

// Swiper .video__wrapper
const videoWrapper = new Swiper(video__wrapper, {
  wrapperClass: "video__wrapper",
  slideClass: "video__item",
  loop: true,
  spaceBetween: 17,
  slidesPerView: 4,
  // freeMode: true,
  // grabCursor: true,
});

// EVENTS
document.addEventListener("DOMContentLoaded", saveText(slideText));

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const mail = e.target.querySelector("#mail").value;
  if (mail) {
    console.log(mail);
    form.reset();
  }
});
