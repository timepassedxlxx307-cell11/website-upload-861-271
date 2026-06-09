(function () {
    var boot = function () {
        var video = document.querySelector('[data-player]');
        var layer = document.querySelector('[data-play-layer]');

        if (!video) {
            return;
        }

        var stream = video.getAttribute('data-stream') || '';
        var hlsInstance = null;
        var started = false;

        var start = function () {
            if (!stream) {
                return;
            }

            if (layer) {
                layer.classList.add('is-hidden');
            }

            if (!started) {
                started = true;

                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = stream;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hlsInstance.loadSource(stream);
                    hlsInstance.attachMedia(video);
                } else {
                    video.src = stream;
                }
            }

            var playPromise = video.play();

            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(function () {});
            }
        };

        if (layer) {
            layer.addEventListener('click', start);
        }

        video.addEventListener('click', function () {
            if (!started) {
                start();
            }
        });

        video.addEventListener('play', function () {
            if (layer) {
                layer.classList.add('is-hidden');
            }
        });

        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else {
        boot();
    }
})();
