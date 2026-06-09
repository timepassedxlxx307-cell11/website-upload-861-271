(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function normalize(value) {
        return (value || "").toString().toLowerCase();
    }

    ready(function () {
        var toggle = document.querySelector("[data-menu-toggle]");
        var nav = document.querySelector("[data-main-nav]");
        if (toggle && nav) {
            toggle.addEventListener("click", function () {
                nav.classList.toggle("open");
            });
        }

        var slider = document.querySelector("[data-hero-slider]");
        if (slider) {
            var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
            var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
            var current = 0;
            var timer = null;
            function show(index) {
                current = (index + slides.length) % slides.length;
                slides.forEach(function (slide, i) {
                    slide.classList.toggle("active", i === current);
                });
                dots.forEach(function (dot, i) {
                    dot.classList.toggle("active", i === current);
                });
            }
            function start() {
                if (timer) {
                    clearInterval(timer);
                }
                timer = setInterval(function () {
                    show(current + 1);
                }, 5200);
            }
            dots.forEach(function (dot, index) {
                dot.addEventListener("click", function () {
                    show(index);
                    start();
                });
            });
            show(0);
            start();
        }

        var panels = document.querySelectorAll(".filter-panel");
        panels.forEach(function (panel) {
            var scope = document.querySelector("[data-filter-scope]");
            if (!scope) {
                return;
            }
            var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card"));
            var search = panel.querySelector("[data-filter-search]");
            var year = panel.querySelector("[data-filter-year]");
            var type = panel.querySelector("[data-filter-type]");
            var category = panel.querySelector("[data-filter-category]");
            var reset = panel.querySelector("[data-filter-reset]");
            function apply() {
                var q = normalize(search && search.value);
                var y = normalize(year && year.value);
                var t = normalize(type && type.value);
                var c = normalize(category && category.value);
                cards.forEach(function (card) {
                    var haystack = normalize([
                        card.getAttribute("data-title"),
                        card.getAttribute("data-year"),
                        card.getAttribute("data-region"),
                        card.getAttribute("data-genre"),
                        card.getAttribute("data-type"),
                        card.getAttribute("data-category")
                    ].join(" "));
                    var visible = true;
                    if (q && haystack.indexOf(q) === -1) {
                        visible = false;
                    }
                    if (y && normalize(card.getAttribute("data-year")) !== y) {
                        visible = false;
                    }
                    if (t && normalize(card.getAttribute("data-type")).indexOf(t) === -1) {
                        visible = false;
                    }
                    if (c && normalize(card.getAttribute("data-category")) !== c) {
                        visible = false;
                    }
                    card.classList.toggle("hidden-by-filter", !visible);
                });
            }
            [search, year, type, category].forEach(function (input) {
                if (input) {
                    input.addEventListener("input", apply);
                    input.addEventListener("change", apply);
                }
            });
            if (reset) {
                reset.addEventListener("click", function () {
                    [search, year, type, category].forEach(function (input) {
                        if (input) {
                            input.value = "";
                        }
                    });
                    apply();
                });
            }
        });
    });

    window.initializeMoviePlayer = function (shell, source) {
        var video = shell.querySelector("video");
        var cover = shell.querySelector(".player-cover");
        var started = false;
        function attach() {
            if (!video || started) {
                return;
            }
            started = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls();
                hls.loadSource(source);
                hls.attachMedia(video);
            } else {
                video.src = source;
            }
        }
        function play() {
            attach();
            if (cover) {
                cover.classList.remove("is-visible");
            }
            var action = video.play();
            if (action && typeof action.catch === "function") {
                action.catch(function () {});
            }
        }
        if (cover) {
            cover.addEventListener("click", play);
        }
        if (video) {
            video.addEventListener("click", function () {
                if (video.paused) {
                    play();
                }
            });
            attach();
        }
    };
}());
