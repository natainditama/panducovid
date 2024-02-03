import $ from "jquery";
import Flickity from "flickity";
import { Fancybox } from "@fancyapps/ui";
import SmoothScroll from "smooth-scroll";
import { formatDate, getMouseDirection, sortTime, sliceString, splitNumber } from "./utils";

// import data
import artikel from "../assets/data/artikel.json";
import panduan from "../assets/data/panduan.json";
import bacaan from "../assets/data/bacaan.json";
import checklist from "../assets/data/checklist.json";
import fullData from "../assets/data/full.json";
import imgNews from "../assets/images/news.jpg";

// import css
import "flickity/dist/flickity.min.css";
import "@fancyapps/ui/dist/fancybox/fancybox.css";

async function main() {
  $("html, body").animate({ scrollTop: 0 }, 1000);

  Fancybox.bind("[data-fancybox]", {});

  // if (location.pathname == "/vaksin.html") {
  //   $("#popup, #popup-mobile").hide();
  // }

  // Fetching and displaying latest articles
  const latestArticles = artikel?.pageProps?.posts ?? [];
  [...latestArticles.filter((article) => article.excerpt.rendered.length > 150)].slice(0, 5).forEach(function (article) {
    $(".news-carousel").append(
      `<div class="carousel-cell p-4 w-full md:w-1/2"><div class="hover:shadow transition rounded-lg overflow-hidden h-full"><img src=${imgNews} class="w-full" alt="${article.slug}" /><a href="#" class="flex flex-1 flex-col p-4 gap-4 h-full"><span class="text-lg font-medium hover:text-primary hover:underline">${sliceString(article.title.rendered, 27)}</span><div class="flex">${sliceString(article.excerpt.rendered, 150)}</div></a></div></div>`
    );
  });

  // Fetching and displaying suggested news
  const suggestedNews = panduan.pageProps.posts ?? [];
  [...sortTime(suggestedNews, "date_gmt", "desc")].slice(0, 5).forEach(function (news) {
    $(".news-suggest").append(
      `<li class="text-primary opacity-75 hover:opacity-100 transition-colors py-4 px-6 border-t"><a href="#" class="flex justify-between items-center gap-4 news-link capitalize">${news.title.rendered}<i class="fa-solid fa-arrow-right"></i></a></li>`
    );
  });

  $(".hamburger").click(function () {
    $(".hamburger").toggleClass("is-active"),
      setTimeout(() => $("body").toggleClass("sidebar-open"), 25),
      setTimeout(() => $("body").removeClass("search-open"), 25);
  });
  $(".btn-search").click(function () {
    $(".hamburger").removeClass("is-active"),
      $("input#search").focus().select(),
      setTimeout(() => $("body").addClass("search-open"), 25),
      setTimeout(() => $("body").removeClass("sidebar-open"), 25);
  });
  $(".close-search").click(function () {
    $(".hamburger").removeClass("is-active"),
      setTimeout(() => $("body").toggleClass("search-open"), 25),
      setTimeout(() => $("body").removeClass("sidebar-open"), 25);
  });
  $(document).click(function (t) {
    $(t.target).closest(".hamburger").length ||
      $(t.target).closest("nav").length ||
      $(t.target).closest(".sidebar").length ||
      ($("body").removeClass("sidebar-open"), $(".hamburger").removeClass("is-active")),
      $(t.target).closest(".btn-search").length || $(t.target).closest(".search-box").length || $("body, html").removeClass("search-open");
  });

  // Initializing mouse movement tracking for symptoms grid
  const mouseState = { x: 0, y: 0, dir: "left" };
  mouseState.dir = $(window).width() > 768 ? "left" : "down";

  $(".symptoms-grid").mousemove(function (event) {
    mouseState.dir = getMouseDirection(event, mouseState.x, mouseState.y, mouseState.dir);
    mouseState.x = event.pageX;
    mouseState.y = event.pageY;
  });

  // Handling card hover effects
  $(".card").hover(
    function (event) {
      mouseState.dir = getMouseDirection(event, mouseState.x, mouseState.y, mouseState.dir);
      mouseState.x = event.pageX;
      mouseState.y = event.pageY;
      $(this).attr("class", "card");
      $(this).addClass(`card-slide-${mouseState.dir}`).addClass("card");
    },
    function (event) {
      mouseState.dir = getMouseDirection(event, mouseState.x, mouseState.y, mouseState.dir);
      mouseState.x = event.pageX;
      mouseState.y = event.pageY;
      $(this).attr("class", "card");
      $(this).addClass(`card-slide-${mouseState.dir}`).addClass("card");
    }
  );

  // Handling navigation links and sidebar behavior
  $(".side-link").each(function () {
    $(this).css("transition-delay", 0.1 * $(this).index() + 0.2 + "s");
    $(this).attr("href") == location.pathname && $(this).addClass("active");
    "/" == location.pathname && $('[href="/index.html"]').addClass("active");
  });

  $(".nav-link").each(function () {
    $(this).attr("href") == location.pathname && $(this).addClass("active");
    "/" == location.pathname && $('[href="/index.html"]').addClass("active");
  });

  $(".scroll-top").fadeOut(0);

  // Handling scroll behavior
  $(window).scroll(function () {
    if ($("#popup").is(":hidden")) $(".navbar").css("filter", "none");
    if ($(this).scrollTop() >= $(".navbar").offset().top) {
      $(".navbar").addClass("animate");
      $(".bg-line").addClass("md:pt-20");
    } else {
      $(".navbar").removeClass("animate");
      $(".bg-line").removeClass("md:pt-20");
    }

    if ($(this).scrollTop() >= $("body").height() - $("body").height() / 4) {
      $(".scroll-top").fadeIn(100);
    } else {
      $(".scroll-top").fadeOut(300);
    }
  });

  // Initializing smooth scroll for scroll-to-top button
  new SmoothScroll().animateScroll($("#top"), $(".scroll-top"), {
    speed: 3000,
    easing: "easeInOutCubic",
  });

  // Handling accordion behavior
  $(window).width() > 768 && $(".accordion li").first().addClass("open");

  $(".accordion-header").click(function () {
    $(this).next().slideToggle(50);
    $(this).parent().toggleClass("open");
    $(".accordion-body").not($(this).next()).slideUp(0).parent().removeClass("open");
    $(this).find("i").toggleClass("fa-plus").toggleClass("fa-minus");
    $(this).parent().siblings().find("i").removeClass("fa-minus").addClass("fa-plus");
  });

  $(".accordion li").each(function () {
    if ($(this).hasClass("open")) {
      $(this).find(".accordion-body").slideDown(0);
      $(this).find(".accordion-header i").addClass("fa-minus").removeClass("fa-plus");
    }
  });

  // Handling category and order change events
  let currentCategory = $('input[name="category"]').val() ?? "artikel";
  let currentOrder = $('input[name="order"]').val() ?? "desc";

  fetchPosts(currentCategory, currentOrder);
  $('input[name="category"]').change(function () {
    currentCategory = $(this).val();
    fetchPosts($(this).val(), currentOrder);
  });

  $('input[name="order"]').change(function () {
    currentOrder = $(this).val();
    fetchPosts(currentCategory, $(this).val());
  });

  try {
    // Fetching and displaying COVID-19 statistics
    const covidData = await fetchAPI("https://apicovid19indonesia-v2.vercel.app/");

    for (let key in covidData) {
      $(".counter").each(function () {
        if ($(this).attr("data-target") == key) {
          $(this).attr("data-count", covidData[key]);
        }
      });

      animateCount(`.counter[data-target="${key}"]`);
    }

    $(".last-update").text(`* Last updated: ${formatDate(covidData?.lastUpdate ?? Date.now())} Indonesia Time`);
  } catch (error) {
    console.error("error", error);
    $(".last-update").text("* Mohon maaf, terjadi kesalahan.Mohon coba lagi.");
  }

  try {
    // Fetching and displaying vaccination statistics
    const vaccinationData = await fetchAPI("https://vaksincovid19-api.vercel.app/api/vaksin");

    for (let key in vaccinationData) {
      $(".counter").each(function () {
        if ($(this).attr("data-target") == key) {
          $(this).attr("data-count", vaccinationData[key]);
        }
      });

      animateCount(`.counter[data-target="${key}"]`);
    }

    $(".last-update-vaksin").text(`* Last updated: ${formatDate(vaccinationData.lastUpdate)} Indonesia Time`);
  } catch (error) {
    console.error("error", error);
    $(".last-update-vaksin").text("* Mohon maaf, terjadi kesalahan.Mohon coba lagi.");
  }

  // Handling search form submission
  $(".search-form").submit(function (event) {
    event.preventDefault();
    const searchTerm = $(this).serializeArray()[0].value;
    $("#search").attr("value", searchTerm);

    if (searchTerm.length > 0) {
      const searchData = fullData.pageProps.posts;

      $(".search-form").next().empty();
      $(".search-form").next().append('<span class="inset-0 m-auto h-max w-max absolute">Not found</span>');

      searchData.forEach(function (result) {
        const { title, excerpt } = result;
        let content = $.trim($(excerpt.rendered).text()).toLowerCase();
        const index = content.indexOf(searchTerm);

        if (index >= 0) {
          content =
            content.substring(0, index) +
            `<span class='highlight'>${content.substring(index, index + searchTerm.length)}</span>` +
            content.substring(index + searchTerm.length);

          $(".search-form")
            .next()
            .append(
              `<li class="opacity-75 transition-colors py-4 px-6 border-b"><a href="#" class="hover:text-primary flex justify-start capitalize items-center font-medium">${title.rendered}</a><p>${content}</p></li>`
            );

          $(".search-form").next().find("span.absolute").remove();
        }
      });
    } else {
      $(".search-form").next().empty();
      $(".search-form").next().append('<span class="inset-0 m-auto h-max w-max absolute">Not found</span>');
    }
  });

  try {
    // Displaying category counts
    const { posts: artikelCount } = artikel?.pageProps;
    $('[data-category="artikel"]').text(artikelCount.length);
    const { posts: bacaanCount } = bacaan?.pageProps;
    $('[data-category="bacaan"]').text(bacaanCount.length);
    const { posts: panduanCount } = panduan?.pageProps;
    $('[data-category="panduan"]').text(panduanCount.length);
    const { posts: checklistCount } = checklist?.pageProps;
    $('[data-category="checklist"]').text(checklistCount.length);
  } catch (error) {
    console.error("error", error);
  }

  const flickityElement = document.querySelector(".news-carousel");
  if (flickityElement) {
    new Flickity(flickityElement, {
      cellAlign: "left",
      fullscreen: true,
      prevNextButtons: false,
      autoPlay: true,
    });
  }
}

$(main);

function fetchPosts(category = "artikel", order = "desc") {
  const source = { artikel, panduan, bacaan, checklist };
  const data = source?.[category];
  if (!data) return;

  const posts = data?.pageProps?.posts;
  const pageCategory = data?.pageProps?.category;

  if ("/informasi.html" == location.pathname) {
    $("title").text(`PanduCovid - ${pageCategory.description}`);
    $(".inform-title").html(
      `<strong class="font-semibold">${pageCategory.name}</strong> <span class="hidden md:flex">-</span> ${pageCategory.description}`
    );
  }

  $(".inform-col").empty();
  [...sortTime(posts, "date_gmt", order)].forEach(function (post) {
    $(".inform-col").append(
      `<div class="hover:shadow transition rounded-lg overflow-hidden h-full mb-6"><img src=${imgNews} class="w-full" alt="${post.slug}" /><a href="#" class="bg-white flex flex-1 flex-col p-4 gap-4 h-full"><span class="text-sm opacity-75">${formatDate(post.date_gmt)}</span><span class="text-lg font-medium hover:text-primary hover:underline -mt-3">${post.title.rendered}</span><div class="flex">${sliceString(post.excerpt.rendered, 200)}</div></a></div>`
    );
  });
}

function animateCount(element) {
  $(element).each(function () {
    const count = parseInt($(this).attr("data-count"));
    $(this).text();
    $(this).animate(
      {
        countNum: count,
      },
      {
        duration: 3000,
        easing: "linear",
        step: function () {
          $(this).text(Math.floor(this.countNum));
          splitNumber(this);
        },
        complete: function () {
          $(this).text(this.countNum);
          splitNumber(this);
        },
      }
    );
  });
}

export async function fetchAPI(url, options = {}) {
  const response = await fetch(url, options);
  return await response.json();
}
