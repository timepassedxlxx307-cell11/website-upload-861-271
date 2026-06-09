(function () {
    var navToggle = document.querySelector('[data-nav-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (navToggle && mobileNav) {
        navToggle.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
        });
    }

    var slider = document.querySelector('[data-hero-slider]');

    if (slider) {
        var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
        var prev = slider.querySelector('[data-hero-prev]');
        var next = slider.querySelector('[data-hero-next]');
        var current = 0;
        var timer = null;

        var showSlide = function (index) {
            if (!slides.length) {
                return;
            }

            current = (index + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === current);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === current);
            });
        };

        var play = function () {
            clearInterval(timer);
            timer = setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        };

        if (prev) {
            prev.addEventListener('click', function () {
                showSlide(current - 1);
                play();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                showSlide(current + 1);
                play();
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
                play();
            });
        });

        play();
    }

    var searchFields = Array.prototype.slice.call(document.querySelectorAll('[data-search-field]'));
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));
    var chips = Array.prototype.slice.call(document.querySelectorAll('[data-filter-value]'));
    var activeFilter = '';

    var normalize = function (value) {
        return String(value || '').toLowerCase().trim();
    };

    var getQuery = function () {
        var value = '';
        searchFields.forEach(function (field) {
            if (document.activeElement === field || field.value) {
                value = field.value;
            }
        });
        return normalize(value);
    };

    var ensureEmptyState = function () {
        var grid = cards.length ? cards[0].parentNode : null;

        if (!grid || grid.querySelector('[data-empty-state]')) {
            return grid ? grid.querySelector('[data-empty-state]') : null;
        }

        var node = document.createElement('div');
        node.className = 'empty-state';
        node.setAttribute('data-empty-state', '');
        node.textContent = '未找到匹配内容';
        grid.appendChild(node);
        return node;
    };

    var applySearch = function () {
        if (!cards.length) {
            return;
        }

        var query = getQuery();
        var visibleCount = 0;

        cards.forEach(function (card) {
            var text = normalize([
                card.getAttribute('data-title'),
                card.getAttribute('data-tags'),
                card.getAttribute('data-year'),
                card.getAttribute('data-region')
            ].join(' '));
            var matchesQuery = !query || text.indexOf(query) !== -1;
            var matchesFilter = !activeFilter || text.indexOf(normalize(activeFilter)) !== -1;
            var visible = matchesQuery && matchesFilter;

            card.style.display = visible ? '' : 'none';

            if (visible) {
                visibleCount += 1;
            }
        });

        var emptyState = ensureEmptyState();

        if (emptyState) {
            emptyState.style.display = visibleCount ? 'none' : 'block';
        }
    };

    searchFields.forEach(function (field) {
        field.addEventListener('input', function () {
            searchFields.forEach(function (otherField) {
                if (otherField !== field) {
                    otherField.value = field.value;
                }
            });
            applySearch();
        });
    });

    chips.forEach(function (chip) {
        chip.addEventListener('click', function () {
            var group = chip.parentNode;
            Array.prototype.slice.call(group.querySelectorAll('[data-filter-value]')).forEach(function (item) {
                item.classList.remove('active');
            });
            chip.classList.add('active');
            activeFilter = chip.getAttribute('data-filter-value') || '';
            applySearch();
        });
    });
})();
