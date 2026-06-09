(function () {
  function toggleNavigation() {
    var button = document.querySelector('.nav-toggle');
    var nav = document.querySelector('.main-nav');
    if (!button || !nav) {
      return;
    }
    button.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  function setupHero() {
    var root = document.querySelector('[data-hero]');
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(root.querySelectorAll('[data-hero-dot]'));
    var prev = root.querySelector('[data-hero-prev]');
    var next = root.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function move(step) {
      show(current + step);
      restart();
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(current + 1);
      }, 6500);
    }

    if (prev) {
      prev.addEventListener('click', function () {
        move(-1);
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        move(1);
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        restart();
      });
    });
    if (slides.length > 1) {
      restart();
    }
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function filterCards(input) {
    var selector = input.getAttribute('data-target');
    var scope = selector ? document.querySelector(selector) : document;
    if (!scope) {
      return;
    }
    var keyword = normalize(input.value);
    var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card'));
    var visible = 0;
    cards.forEach(function (card) {
      var text = normalize(card.getAttribute('data-search-text') || card.textContent);
      var matched = !keyword || text.indexOf(keyword) !== -1;
      card.style.display = matched ? '' : 'none';
      if (matched) {
        visible += 1;
      }
    });
    var empty = document.querySelector('[data-empty-state]');
    if (empty) {
      empty.classList.toggle('is-visible', visible === 0);
    }
  }

  function setupFilters() {
    var inputs = Array.prototype.slice.call(document.querySelectorAll('[data-filter-input]'));
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';
    inputs.forEach(function (input) {
      if (input.getAttribute('data-query-sync') === 'true' && query) {
        input.value = query;
      }
      input.addEventListener('input', function () {
        filterCards(input);
      });
      filterCards(input);
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    toggleNavigation();
    setupHero();
    setupFilters();
  });
})();
