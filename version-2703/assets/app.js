(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function setupMenu() {
        var button = document.querySelector("[data-menu-toggle]");
        var nav = document.querySelector("[data-site-nav]");
        if (!button || !nav) {
            return;
        }
        button.addEventListener("click", function () {
            nav.classList.toggle("open");
        });
    }

    function setupHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var prev = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        if (slides.length < 2) {
            return;
        }
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("active", i === index);
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

        dots.forEach(function (dot, i) {
            dot.addEventListener("click", function () {
                show(i);
                restart();
            });
        });
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
        restart();
    }

    function setupSearch() {
        var inputs = Array.prototype.slice.call(document.querySelectorAll("[data-card-search]"));
        inputs.forEach(function (input) {
            input.addEventListener("input", function () {
                var q = input.value.trim().toLowerCase();
                var targetId = input.getAttribute("data-search-target");
                var scope = targetId ? document.getElementById(targetId) : document;
                if (!scope) {
                    scope = document;
                }
                var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card"));
                cards.forEach(function (card) {
                    var text = (card.getAttribute("data-search") || card.textContent || "").toLowerCase();
                    card.classList.toggle("is-hidden", q && text.indexOf(q) === -1);
                });
            });
        });
    }

    ready(function () {
        setupMenu();
        setupHero();
        setupSearch();
    });

    window.initMoviePlayer = function (streamUrl) {
        ready(function () {
            var video = document.querySelector(".movie-video");
            var shell = document.querySelector(".video-shell");
            var button = document.querySelector(".play-overlay");
            var hls = null;
            if (!video || !shell || !button || !streamUrl) {
                return;
            }

            function attach() {
                if (video.getAttribute("data-ready") === "1") {
                    return;
                }
                video.setAttribute("data-ready", "1");
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = streamUrl;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: false
                    });
                    hls.loadSource(streamUrl);
                    hls.attachMedia(video);
                } else {
                    video.src = streamUrl;
                }
            }

            function play() {
                attach();
                shell.classList.add("playing");
                var attempt = video.play();
                if (attempt && typeof attempt.catch === "function") {
                    attempt.catch(function () {
                        shell.classList.remove("playing");
                    });
                }
            }

            button.addEventListener("click", play);
            video.addEventListener("click", function () {
                if (video.paused) {
                    play();
                }
            });
            video.addEventListener("play", function () {
                shell.classList.add("playing");
            });
            video.addEventListener("pause", function () {
                if (!video.ended) {
                    shell.classList.remove("playing");
                }
            });
            window.addEventListener("beforeunload", function () {
                if (hls) {
                    hls.destroy();
                }
            });
        });
    };
})();
