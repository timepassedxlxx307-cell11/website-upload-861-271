(function () {
    function normalize(value) {
        return (value || "").toString().trim().toLowerCase();
    }

    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function initMenu() {
        var toggle = document.querySelector("[data-menu-toggle]");
        var panel = document.querySelector("[data-mobile-panel]");
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener("click", function () {
            panel.classList.toggle("is-open");
        });
    }

    function initHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
        if (slides.length < 2) {
            return;
        }
        var index = 0;
        var timer = null;
        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
            });
            dots.forEach(function (dot) {
                dot.classList.toggle("is-active", Number(dot.getAttribute("data-hero-dot")) === index);
            });
        }
        function start() {
            timer = window.setInterval(function () {
                show(index + 1);
            }, 6500);
        }
        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                window.clearInterval(timer);
                show(Number(dot.getAttribute("data-hero-dot")) || 0);
                start();
            });
        });
        start();
    }

    function initSearchForms() {
        Array.prototype.slice.call(document.querySelectorAll("[data-search-form]")).forEach(function (form) {
            form.addEventListener("submit", function (event) {
                var input = form.querySelector("input[name='q']");
                if (!input || !input.value.trim()) {
                    event.preventDefault();
                }
            });
        });
    }

    function initFilters() {
        var panel = document.querySelector("[data-filter-panel]");
        if (!panel) {
            return;
        }
        var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
        var input = panel.querySelector("[data-filter-input]");
        var region = panel.querySelector("[data-filter-region]");
        var type = panel.querySelector("[data-filter-type]");
        var year = panel.querySelector("[data-filter-year]");
        var empty = document.querySelector("[data-empty-state]");
        var params = new URLSearchParams(window.location.search);
        var query = params.get("q");
        if (input && query) {
            input.value = query;
        }
        function apply() {
            var q = normalize(input ? input.value : "");
            var r = normalize(region ? region.value : "");
            var t = normalize(type ? type.value : "");
            var y = normalize(year ? year.value : "");
            var visible = 0;
            cards.forEach(function (card) {
                var search = normalize(card.getAttribute("data-search"));
                var cardRegion = normalize(card.getAttribute("data-region"));
                var cardType = normalize(card.getAttribute("data-type"));
                var cardYear = normalize(card.getAttribute("data-year"));
                var matches = true;
                if (q && search.indexOf(q) === -1) {
                    matches = false;
                }
                if (r && cardRegion.indexOf(r) === -1) {
                    matches = false;
                }
                if (t && cardType.indexOf(t) === -1) {
                    matches = false;
                }
                if (y && cardYear !== y) {
                    matches = false;
                }
                card.style.display = matches ? "" : "none";
                if (matches) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.classList.toggle("is-visible", visible === 0);
            }
        }
        [input, region, type, year].forEach(function (node) {
            if (node) {
                node.addEventListener("input", apply);
                node.addEventListener("change", apply);
            }
        });
        apply();
    }

    function initPlayers() {
        Array.prototype.slice.call(document.querySelectorAll("[data-player]")).forEach(function (player) {
            var video = player.querySelector("video");
            var button = player.querySelector("[data-play-button]");
            var stream = player.getAttribute("data-stream");
            var attached = false;
            function attach() {
                if (!video || !stream || attached) {
                    return;
                }
                attached = true;
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = stream;
                    return;
                }
                if (window.Hls && window.Hls.isSupported()) {
                    var hls = new window.Hls({
                        maxBufferLength: 30,
                        backBufferLength: 30
                    });
                    hls.loadSource(stream);
                    hls.attachMedia(video);
                    return;
                }
                video.src = stream;
            }
            function play() {
                attach();
                if (button) {
                    button.classList.add("is-hidden");
                }
                var action = video.play();
                if (action && typeof action.catch === "function") {
                    action.catch(function () {});
                }
            }
            if (button) {
                button.addEventListener("click", play);
            }
            if (video) {
                video.addEventListener("click", function () {
                    if (video.paused) {
                        play();
                    }
                });
                video.addEventListener("play", function () {
                    if (button) {
                        button.classList.add("is-hidden");
                    }
                });
            }
        });
    }

    ready(function () {
        initMenu();
        initHero();
        initSearchForms();
        initFilters();
        initPlayers();
    });
})();
