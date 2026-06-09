(function() {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function setupMenu() {
        var button = document.querySelector("[data-menu-button]");
        var menu = document.querySelector("[data-mobile-menu]");
        if (!button || !menu) {
            return;
        }
        button.addEventListener("click", function() {
            menu.classList.toggle("open");
        });
    }

    function setupHero() {
        var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
        if (!slides.length) {
            return;
        }
        var index = 0;
        function show(nextIndex) {
            index = nextIndex % slides.length;
            slides.forEach(function(slide, slideIndex) {
                slide.classList.toggle("active", slideIndex === index);
            });
            dots.forEach(function(dot, dotIndex) {
                dot.classList.toggle("active", dotIndex === index);
            });
        }
        dots.forEach(function(dot) {
            dot.addEventListener("click", function() {
                var nextIndex = Number(dot.getAttribute("data-hero-dot")) || 0;
                show(nextIndex);
            });
        });
        window.setInterval(function() {
            show(index + 1);
        }, 5200);
    }

    function setupCardFilter() {
        var input = document.querySelector("[data-card-filter]");
        var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));
        if (!input || !cards.length) {
            return;
        }
        input.addEventListener("input", function() {
            var keyword = input.value.trim().toLowerCase();
            cards.forEach(function(card) {
                var text = [
                    card.getAttribute("data-title"),
                    card.getAttribute("data-genre"),
                    card.getAttribute("data-year"),
                    card.getAttribute("data-type")
                ].join(" ").toLowerCase();
                card.classList.toggle("hidden", keyword && text.indexOf(keyword) === -1);
            });
        });
    }

    function cardTemplate(movie) {
        var tags = [movie.year, movie.region, movie.type].filter(Boolean).map(function(item) {
            return "<span>" + escapeHtml(item) + "</span>";
        }).join("");
        return [
            "<article class=\"movie-card\">",
            "<a href=\"" + escapeHtml(movie.url) + "\" class=\"poster-link\" aria-label=\"观看" + escapeHtml(movie.title) + "\">",
            "<img src=\"" + escapeHtml(movie.cover) + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">",
            "<span class=\"card-badge\">" + escapeHtml(movie.category) + "</span>",
            "</a>",
            "<div class=\"card-body\">",
            "<h2><a href=\"" + escapeHtml(movie.url) + "\">" + escapeHtml(movie.title) + "</a></h2>",
            "<p>" + escapeHtml(movie.oneLine) + "</p>",
            "<div class=\"meta-row\">" + tags + "</div>",
            "</div>",
            "</article>"
        ].join("");
    }

    function escapeHtml(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }

    function setupSearchPage() {
        var box = document.querySelector("[data-search-page]");
        var results = document.querySelector("[data-search-results]");
        var input = document.querySelector("[data-search-input]");
        var select = document.querySelector("[data-search-category]");
        var button = document.querySelector("[data-search-button]");
        var info = document.querySelector("[data-search-info]");
        var movies = window.SITE_MOVIES || [];
        if (!box || !results || !input || !select || !button || !movies.length) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var initial = params.get("q") || "";
        if (initial) {
            input.value = initial;
        }
        function render() {
            var keyword = input.value.trim().toLowerCase();
            var category = select.value;
            var filtered = movies.filter(function(movie) {
                var content = [movie.title, movie.year, movie.region, movie.type, movie.genre, movie.category, movie.oneLine, (movie.tags || []).join(" ")].join(" ").toLowerCase();
                var matchedKeyword = !keyword || content.indexOf(keyword) !== -1;
                var matchedCategory = !category || movie.category === category;
                return matchedKeyword && matchedCategory;
            }).slice(0, 120);
            results.innerHTML = filtered.map(cardTemplate).join("");
            if (info) {
                info.textContent = filtered.length ? "已匹配到相关影片" : "没有找到匹配影片";
            }
        }
        button.addEventListener("click", render);
        input.addEventListener("input", render);
        select.addEventListener("change", render);
        render();
    }

    ready(function() {
        setupMenu();
        setupHero();
        setupCardFilter();
        setupSearchPage();
    });
})();
