(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function normalize(value) {
    return (value || "").toString().toLowerCase().trim();
  }

  function setupMenu() {
    var button = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-main-nav]");
    if (!button || !nav) {
      return;
    }
    button.addEventListener("click", function () {
      nav.classList.toggle("is-open");
      button.textContent = nav.classList.contains("is-open") ? "×" : "☰";
    });
  }

  function setupHero() {
    var root = document.querySelector("[data-hero]");
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
    if (!slides.length) {
      return;
    }
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    function start() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5000);
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        start();
      });
    });

    show(0);
    start();
  }

  function filterCards(scope, query, year, category) {
    var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card"));
    var q = normalize(query);
    var y = normalize(year);
    var c = normalize(category);
    cards.forEach(function (card) {
      var text = normalize(card.getAttribute("data-search"));
      var cardYear = normalize(card.getAttribute("data-year"));
      var cardCategory = normalize(card.getAttribute("data-category"));
      var visible = true;
      if (q && text.indexOf(q) === -1) {
        visible = false;
      }
      if (y && cardYear !== y) {
        visible = false;
      }
      if (c && cardCategory !== c) {
        visible = false;
      }
      card.classList.toggle("is-hidden-card", !visible);
    });
  }

  function setupFilters() {
    var scopes = Array.prototype.slice.call(document.querySelectorAll(".filter-scope"));
    if (!scopes.length) {
      return;
    }
    var url = new URL(window.location.href);
    var queryFromUrl = url.searchParams.get("q") || "";
    var searchInput = document.querySelector("[data-search-input]") || document.querySelector("[data-card-filter]");
    var yearFilter = document.querySelector("[data-year-filter]");
    var categorySelect = document.querySelector("[data-category-select]");

    if (searchInput && queryFromUrl) {
      searchInput.value = queryFromUrl;
    }

    function run() {
      scopes.forEach(function (scope) {
        filterCards(
          scope,
          searchInput ? searchInput.value : "",
          yearFilter ? yearFilter.value : "",
          categorySelect ? categorySelect.value : ""
        );
      });
    }

    [searchInput, yearFilter, categorySelect].forEach(function (control) {
      if (control) {
        control.addEventListener("input", run);
        control.addEventListener("change", run);
      }
    });
    run();
  }

  function bindVideo(video, url) {
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = url;
      return;
    }
    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(url);
      hls.attachMedia(video);
      video._hlsPlayer = hls;
      return;
    }
    video.src = url;
  }

  window.initMoviePlayer = function (videoId, url) {
    var video = document.getElementById(videoId);
    if (!video || !url) {
      return;
    }
    var box = video.closest(".player-box");
    var cover = box ? box.querySelector(".play-cover") : null;
    var attached = false;

    function attach() {
      if (!attached) {
        bindVideo(video, url);
        attached = true;
      }
    }

    function play() {
      attach();
      if (cover) {
        cover.classList.add("is-hidden");
      }
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {});
      }
    }

    attach();

    if (cover) {
      cover.addEventListener("click", play);
    }

    video.addEventListener("play", function () {
      if (cover) {
        cover.classList.add("is-hidden");
      }
    });

    video.addEventListener("click", function () {
      if (cover && !cover.classList.contains("is-hidden")) {
        play();
      }
    });
  };

  ready(function () {
    setupMenu();
    setupHero();
    setupFilters();
  });
})();
