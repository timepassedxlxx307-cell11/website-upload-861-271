(function () {
    function ready(fn) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", fn);
        } else {
            fn();
        }
    }

    function setupMenu() {
        var toggle = document.querySelector(".mobile-toggle");
        var nav = document.querySelector(".mobile-nav");
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener("click", function () {
            var open = nav.classList.toggle("open");
            toggle.setAttribute("aria-expanded", open ? "true" : "false");
        });
    }

    function setupHero() {
        var hero = document.querySelector(".hero");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
        var prev = hero.querySelector(".hero-prev");
        var next = hero.querySelector(".hero-next");
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

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
            }
        }

        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                start();
            });
        }
        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener("click", function () {
                show(dotIndex);
                start();
            });
        });
        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function valueOf(element, attr) {
        return (element.getAttribute(attr) || "").toLowerCase();
    }

    function setupFilters() {
        var panels = Array.prototype.slice.call(document.querySelectorAll(".filter-panel"));
        panels.forEach(function (panel) {
            var scope = panel.closest("main") || document;
            var input = panel.querySelector(".movie-search");
            var select = panel.querySelector(".movie-filter");
            var items = Array.prototype.slice.call(scope.querySelectorAll(".movie-card, .rank-row"));
            var empty = scope.querySelector(".no-result");

            function apply() {
                var query = input ? input.value.trim().toLowerCase() : "";
                var filter = select ? select.value.trim().toLowerCase() : "all";
                var visible = 0;
                items.forEach(function (item) {
                    var haystack = [
                        valueOf(item, "data-title"),
                        valueOf(item, "data-region"),
                        valueOf(item, "data-type"),
                        valueOf(item, "data-year"),
                        valueOf(item, "data-genre"),
                        valueOf(item, "data-tags")
                    ].join(" ");
                    var queryMatch = !query || haystack.indexOf(query) !== -1;
                    var filterMatch = filter === "all" || haystack.indexOf(filter) !== -1;
                    var show = queryMatch && filterMatch;
                    item.style.display = show ? "" : "none";
                    if (show) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.classList.toggle("show", visible === 0);
                }
            }

            if (input) {
                input.addEventListener("input", apply);
            }
            if (select) {
                select.addEventListener("change", apply);
            }
            apply();
        });
    }

    function setupPlayer() {
        var wrap = document.querySelector(".movie-player-wrap");
        if (!wrap) {
            return;
        }
        var video = wrap.querySelector("video");
        var button = wrap.querySelector(".big-play");
        var cover = wrap.querySelector(".player-cover");
        if (!video || !button) {
            return;
        }
        var stream = button.getAttribute("data-stream") || "";
        var loaded = false;
        var hls = null;

        function load() {
            if (loaded) {
                return;
            }
            loaded = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = stream;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({ enableWorker: true });
                hls.loadSource(stream);
                hls.attachMedia(video);
            } else {
                video.src = stream;
            }
        }

        function play() {
            load();
            if (cover) {
                cover.classList.add("hidden");
            }
            var promise = video.play();
            if (promise && typeof promise.catch === "function") {
                promise.catch(function () {});
            }
        }

        button.addEventListener("click", function (event) {
            event.preventDefault();
            play();
        });
        if (cover) {
            cover.addEventListener("click", function (event) {
                if (event.target !== button) {
                    play();
                }
            });
        }
        video.addEventListener("play", function () {
            if (cover) {
                cover.classList.add("hidden");
            }
        });
        window.addEventListener("pagehide", function () {
            if (hls && typeof hls.destroy === "function") {
                hls.destroy();
            }
        });
    }

    ready(function () {
        setupMenu();
        setupHero();
        setupFilters();
        setupPlayer();
    });
})();
