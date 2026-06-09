(function() {
    function initMoviePlayer(source) {
        var video = document.getElementById("moviePlayer");
        var overlay = document.getElementById("playerOverlay");
        var button = document.getElementById("playerStart");
        var hls = null;
        var prepared = false;
        if (!video || !source) {
            return;
        }
        function prepare() {
            if (prepared) {
                return;
            }
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(source);
                hls.attachMedia(video);
            } else {
                video.src = source;
            }
            prepared = true;
        }
        function start() {
            prepare();
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === "function") {
                playPromise.catch(function() {});
            }
        }
        if (button) {
            button.addEventListener("click", start);
        }
        if (overlay) {
            overlay.addEventListener("click", start);
        }
        video.addEventListener("click", function() {
            if (video.paused) {
                start();
            }
        });
        video.addEventListener("play", function() {
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
        });
        window.addEventListener("pagehide", function() {
            if (hls && typeof hls.destroy === "function") {
                hls.destroy();
            }
        });
    }
    window.initMoviePlayer = initMoviePlayer;
})();
