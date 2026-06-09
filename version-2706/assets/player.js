import { H as Hls } from './hls-vendor-dru42stk.js';

export function initMoviePlayer(options) {
  var video = document.getElementById(options.videoId);
  var cover = document.getElementById(options.coverId);
  var button = document.getElementById(options.buttonId);
  var hls = null;
  var ready = false;

  if (!video || !cover || !button || !options.src) {
    return;
  }

  function attachSource() {
    if (ready) {
      return;
    }
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = options.src;
    } else if (Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(options.src);
      hls.attachMedia(video);
      hls.on(Hls.Events.ERROR, function (eventName, data) {
        if (!data || !data.fatal) {
          return;
        }
        if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
          hls.startLoad();
        } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
          hls.recoverMediaError();
        } else {
          hls.destroy();
        }
      });
    } else {
      video.src = options.src;
    }
    ready = true;
  }

  function startPlayback() {
    attachSource();
    cover.classList.add('is-hidden');
    var playPromise = video.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {
        cover.classList.remove('is-hidden');
      });
    }
  }

  cover.addEventListener('click', startPlayback);
  button.addEventListener('click', function (event) {
    event.preventDefault();
    event.stopPropagation();
    startPlayback();
  });
  video.addEventListener('click', function () {
    if (video.paused) {
      startPlayback();
    }
  });
  window.addEventListener('pagehide', function () {
    if (hls) {
      hls.destroy();
      hls = null;
    }
  });
}
