(function () {

var style = document.createElement('style');
style.id = 'd2s-css';
style.innerHTML = '\
  * { box-sizing: border-box; margin: 0; padding: 0; }\
  html, body { background: #ccc; height: 100%; }\
  body { position: relative; }\
  main { background: #fff; display: block; height: 200px; overflow: hidden; position: relative; width: 200px; }\
  /* cannot use `main:before` because we apply `overflow: hidden` */\
  .d2s-caption { color: #999; font: 10px monospace; position: absolute; padding: 10px; text-align: right; }\
  .d2s-caption:before { color: #777; display: block; float: left; }\
  .d2s-domCaption:before { content: "Image"; }\
  .d2s-screenshotCaption:before { content: "Screenshot"; }\
  #d2s-screenshot { position: absolute; bottom: 0; left: 0; }\
  #d2s-uploadLink { background: cyan; color: #333; font: 600 10px monospace; letter-spacing: 2px; padding: 10px 15px; position: absolute; text-decoration: none; text-transform: uppercase; bottom: 10px; right: 10px; }\
  #d2s-uploadLink:hover { background: yellow; color: #333; }\
  #d2s-uploadLink:active { opacity: 0.6; }\
';
document.head.appendChild(style);

var scripts = [
  'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/0.4.1/html2canvas.min.js',
  'https://ucarecdn.com/widget/2.5.5/uploadcare/uploadcare.full.min.js'
];
var script;
scripts.forEach(function (url) {
  script = document.createElement('script');
  script.src = url;
  document.head.appendChild(script);
});


if (!window.UPLOADCARE_LOCALE) {
  window.UPLOADCARE_LOCALE = 'en';
}
if (!window.UPLOADCARE_PUBLIC_KEY) {
  window.UPLOADCARE_PUBLIC_KEY = 'd8498171c34e5cff6628';
}


if (!HTMLCanvasElement.prototype.toBlob) {
  Object.defineProperty(HTMLCanvasElement.prototype, 'toBlob', {
    value: function (callback, type, quality) {
      var binStr = atob(this.toDataURL(type, quality).split(',')[1]);
      var len = binStr.length;
      var arr = new Uint8Array(len);
      for (var i = 0; i < len; i++ ) {
        arr[i] = binStr.charCodeAt(i);
      }
      callback(new Blob([arr], {type: type || 'image/png'}));
    }
  });
}

window.addEventListener('load', function () {
  function getFormattedSize (size) {
    size = String(size || '');
    if (!size) {
      return '';
    }
    if (/^\d+$/.test(size)) {
      return size + 'px';
    }
    return size;
  }

  var main = document.querySelector('main');

  var domCaption = document.createElement('div');
  domCaption.id = 'd2s-domCaption';
  domCaption.className = 'd2s-caption d2s-domCaption';
  document.body.appendChild(domCaption);

  var screenshotCaption = document.createElement('div');
  screenshotCaption.id = 'd2s-screenshotCaption';
  screenshotCaption.className = 'd2s-caption d2s-screenshotCaption';
  document.body.appendChild(screenshotCaption);

  var screenshot = document.createElement('img');
  screenshot.id = 'd2s-screenshot';
  document.body.appendChild(screenshot);

  var uploadLink = document.createElement('a');
  uploadLink.href = '#';
  uploadLink.id = 'd2s-uploadLink';
  uploadLink.textContent = 'Upload';
  uploadLink.setAttribute('target', '_blank');
  uploadLink.addEventListener('click', function (e) {
    if ('uploadcare' in window) {
      e.preventDefault();
      uploadScreenshot();
      this.blur();
    }
  });
  document.body.appendChild(uploadLink);

  var mainCanvas;

  function recalcSize () {
    var width = getFormattedSize(getComputedStyle(main).getPropertyValue('width'));
    var height = getFormattedSize(getComputedStyle(main).getPropertyValue('height'));
    domCaption.textContent = width + ' × ' + height;
    domCaption.style.width = width;
    if (mainCanvas) {
      screenshotCaption.textContent = getFormattedSize(mainCanvas.width) + ' × ' + getFormattedSize(mainCanvas.height);
      screenshotCaption.style.bottom = getFormattedSize(mainCanvas.height + 10);
      screenshotCaption.style.width = getFormattedSize(mainCanvas.width);
    }
  }

  function renderScreenshot () {
    window.html2canvas(main, {
      useCORS: true,
      onrendered: function (canvas) {
        mainCanvas = canvas;
        screenshot.src = canvas.toDataURL();
        recalcSize();
      }
    });
  }

  function uploadScreenshot () {
    if (!mainCanvas) { return; }
    mainCanvas.toBlob(function (blob) {
      var file = window.uploadcare.fileFrom('object', blob);
      file.done(function (fileInfo) {
        console.log(fileInfo.cdnUrl);
        window.alert(fileInfo.cdnUrl);
     });
    }, window.DOM2SCREENSHOT_FORMAT || 'image/jpeg', window.DOM2SCREENSHOT_QUALITY || 0.9);
  }

  function action () {
    renderScreenshot();
    recalcSize();
  }

  action();
  window.addEventListener('resize', action);

  // To handle CSS changes on CodePen.
  var head = document.head;
  var Observer = new MutationObserver(action);
  Observer.observe(head, {childList: true, attributes: true, characterData: true});

  window.renderScreenshot = renderScreenshot;
  window.recalcSize = recalcSize;
  window.action = action;
});

})();
