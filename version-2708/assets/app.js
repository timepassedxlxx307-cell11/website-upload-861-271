(function () {
  var menuButton = document.querySelector("[data-menu-toggle]");
  var mobileMenu = document.querySelector("[data-mobile-menu]");

  if (menuButton && mobileMenu) {
    menuButton.addEventListener("click", function () {
      mobileMenu.classList.toggle("open");
      document.body.classList.toggle("menu-open", mobileMenu.classList.contains("open"));
    });
  }

  document.querySelectorAll("[data-hero]").forEach(function (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === index);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        restart();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        restart();
      });
    });

    restart();
  });

  document.querySelectorAll("[data-filter-scope]").forEach(function (scope) {
    var input = scope.querySelector("[data-search-input]");
    var selects = Array.prototype.slice.call(scope.querySelectorAll("[data-filter-select]"));
    var reset = scope.querySelector("[data-filter-reset]");
    var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card"));

    function normalize(value) {
      return String(value || "").trim().toLowerCase();
    }

    function update() {
      var query = normalize(input ? input.value : "");
      var filters = selects.map(function (select) {
        return {
          key: select.getAttribute("data-filter-select"),
          value: normalize(select.value)
        };
      });

      cards.forEach(function (card) {
        var text = normalize(card.getAttribute("data-search"));
        var matchText = !query || text.indexOf(query) !== -1;
        var matchFilters = filters.every(function (filter) {
          return !filter.value || normalize(card.getAttribute("data-" + filter.key)) === filter.value;
        });
        card.hidden = !(matchText && matchFilters);
      });
    }

    if (input) {
      input.addEventListener("input", update);
    }

    selects.forEach(function (select) {
      select.addEventListener("change", update);
    });

    if (reset) {
      reset.addEventListener("click", function () {
        if (input) {
          input.value = "";
        }
        selects.forEach(function (select) {
          select.value = "";
        });
        update();
      });
    }
  });
})();

window.setupPlayer = function (playerId, playUrl) {
  var video = document.getElementById(playerId);

  if (!video) {
    return;
  }

  var shell = video.closest(".player-shell");
  var cover = shell ? shell.querySelector(".player-cover") : null;
  var playButton = shell ? shell.querySelector(".play-action") : null;
  var hlsInstance = null;
  var attached = false;

  function attach() {
    if (attached) {
      return;
    }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = playUrl;
    } else if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        lowLatencyMode: true,
        enableWorker: true
      });
      hlsInstance.loadSource(playUrl);
      hlsInstance.attachMedia(video);
    } else {
      video.src = playUrl;
    }

    attached = true;
  }

  function play() {
    attach();
    video.controls = true;
    if (shell) {
      shell.classList.add("is-playing");
    }
    var promise = video.play();
    if (promise && typeof promise.catch === "function") {
      promise.catch(function () {});
    }
  }

  if (cover) {
    cover.addEventListener("click", play);
  }

  if (playButton) {
    playButton.addEventListener("click", function (event) {
      event.stopPropagation();
      play();
    });
  }

  video.addEventListener("click", function () {
    if (!attached || video.paused) {
      play();
    }
  });

  video.addEventListener("error", function () {
    if (hlsInstance && window.Hls) {
      hlsInstance.recoverMediaError();
    }
  });
};
