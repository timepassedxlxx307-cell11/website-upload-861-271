(function () {
  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  function setupMenu() {
    var button = document.querySelector('[data-menu-toggle]');
    var nav = document.querySelector('[data-site-nav]');
    if (!button || !nav) {
      return;
    }
    button.addEventListener('click', function () {
      nav.classList.toggle('open');
    });
  }

  function setupHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var current = 0;
    function show(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === current);
      });
    }
    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
      });
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
      });
    });
    show(0);
    window.setInterval(function () {
      show(current + 1);
    }, 5200);
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function setupFilters() {
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
    if (!cards.length) {
      return;
    }
    var queryInput = document.querySelector('[data-search-input]');
    var regionInput = document.querySelector('[data-region-input]');
    var yearInput = document.querySelector('[data-year-input]');
    var empty = document.querySelector('[data-empty-state]');
    function apply() {
      var query = normalize(queryInput && queryInput.value);
      var region = normalize(regionInput && regionInput.value);
      var year = normalize(yearInput && yearInput.value);
      var visible = 0;
      cards.forEach(function (card) {
        var pool = normalize([
          card.dataset.title,
          card.dataset.region,
          card.dataset.type,
          card.dataset.year,
          card.dataset.genre,
          card.textContent
        ].join(' '));
        var ok = true;
        if (query && pool.indexOf(query) === -1) {
          ok = false;
        }
        if (region && normalize(card.dataset.region).indexOf(region) === -1) {
          ok = false;
        }
        if (year && normalize(card.dataset.year).indexOf(year) === -1) {
          ok = false;
        }
        card.classList.toggle('hidden-card', !ok);
        if (ok) {
          visible += 1;
        }
      });
      if (empty) {
        empty.style.display = visible ? 'none' : 'block';
      }
    }
    [queryInput, regionInput, yearInput].forEach(function (input) {
      if (input) {
        input.addEventListener('input', apply);
      }
    });
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q');
    if (q && queryInput) {
      queryInput.value = q;
    }
    apply();
  }

  function bindMoviePlayer(streamUrl) {
    var shell = document.querySelector('[data-player]');
    if (!shell) {
      return;
    }
    var video = shell.querySelector('video');
    var cover = shell.querySelector('[data-play-cover]');
    if (!video || !streamUrl) {
      return;
    }
    var attached = false;
    function attach() {
      if (attached) {
        return;
      }
      attached = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({ enableWorker: true });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
        video._hls = hls;
      } else {
        video.src = streamUrl;
      }
    }
    function play() {
      attach();
      if (cover) {
        cover.hidden = true;
      }
      var promise = video.play();
      if (promise && promise.catch) {
        promise.catch(function () {
          video.controls = true;
        });
      }
    }
    if (cover) {
      cover.addEventListener('click', play);
    }
    video.addEventListener('click', function () {
      if (video.paused) {
        play();
      }
    });
  }

  window.bindMoviePlayer = bindMoviePlayer;

  ready(function () {
    setupMenu();
    setupHero();
    setupFilters();
  });
})();
