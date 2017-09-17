// By ...
// Basic logic of eighteen minus

/***********************
*        DEBUG         *
************************/
const DEBUG_MODE = true;
const VIOLENCE_LIST = ["Shoot", "Horror", "Gun"];

if (DEBUG_MODE) {
  console.log('Eighteen Minus Started');
}

/***********************
*        CODE         *
************************/
const ATTR = "EighteenMinus";

//var setting = {enable: false};
//chrome.runtime.onMessage.addListener(function(data, sender, sendResponse) {
//    setting = data;
//});

function checkImage(imageUrl, callback) {
  return callback(true);
}

function getReplacementUrl() {
  return chrome.runtime.getURL('/replacements/r1.png');
}

document.addEventListener('DOMContentLoaded', onDOMContentLoaded(), false);

function censorImage(img) {
  // // remove srcsets, forcing browser to show the replacement - eg, BBC News
  // if (img.hasAttribute('srcset')) {
  //     img.removeAttribute('srcset');
  // };
  //
  // // remove source srcsets if children of same parent <picture> element - eg, the Guardian
  // if (img.parentElement.nodeName == 'PICTURE') {
  //     var theparent = img.parentNode;
  //     for (var child = theparent.firstChild; child !== null; child = child.nextSibling) {
  //         if (child.nodeName == "SOURCE") {
  //             child.removeAttribute('src');
  //             child.removeAttribute('srcset');
  //         };
  //     };
  // };
  //
  // // knock out lazyloader data URLs so it doesn't overwrite kittens
  // if (img.hasAttribute('data-src')) {
  //     img.removeAttribute('data-src');
  // };
  // if (img.hasAttribute('data-hi-res-src')) {
  //     img.removeAttribute('data-hi-res-src');
  // };
  // if (img.hasAttribute('data-low-res-src')) {
  //     img.removeAttribute('data-low-res-src');
  // };

  // Replacing
  img.src = getReplacementUrl();
  img.width = initWidth;
  img.height = initHeight;
  img.alt = 'This image is blocked by Eighteen Minus';
}

function onDOMContentLoaded() {
  console.log('in');
  chrome.storage.sync.get('key', function(setting) {
    if (!setting.key.enable) return;

    if (DEBUG_MODE) {
      console.log('DOM fully loaded and parsed');
      var imgBlocked = 0;
    }

    var currentTabImages = document.getElementsByTagName("img");
    for (var i = 0; i < currentTabImages.length; ++i) {
      let img = currentTabImages[i];

      // Image is already checked if it has the attribute
      if (!img.hasAttribute(ATTR)) {
        // Save image URL in debug mode
        img.style.visibility = "hidden";
        var attrValue = DEBUG_MODE ? img.src : '';
        img.setAttribute(ATTR, attrValue);

        let alttext = String(img.alt).toLowerCase();
        let imgsrc = String(img.src);
        let req = new XMLHttpRequest();
        let req_url = `${config.url}classify?version=2016-05-20&api_key=${config.api_key}&classifier_ids=${config.classifiers.violence}&url=${imgsrc}`;

        $.ajax( req_url, {
            dataType: 'json',
            crossDomain: true
          })
         .done(function (res) {
          if (res.hasOwnProperty('status') && res.status == 'ERROR') {
            console.error("something went wrong");
            if (res.hasOwnProperty('statusInfo')) {
              console.error(res.statusInfo);
            }
          } else if (res.hasOwnProperty('images') && res.images.length != 0) {
            for (let j = 0; j < res.images.length; j++) {
              for (var cls in VIOLENCE_LIST) {

                if ( res.images[j].classifiers.length > 0 && res.images[j].classifiers.includes(cls) ) {
                  if (img.hasAttribute('srcset')) {
                    img.removeAttribute('srcset');
                  };

                  // remove source srcsets if children of same parent <picture> element - eg, the Guardian
                  if (img.parentElement.nodeName == 'PICTURE') {
                    var theparent = img.parentNode;
                    for (var child = theparent.firstChild; child !== null; child = child.nextSibling) {
                      if (child.nodeName == "SOURCE") {
                        child.removeAttribute('src');
                        child.removeAttribute('srcset');
                      };
                    };
                  };

                  // knock out lazyloader data URLs so it doesn't overwrite NSFW
                  if (img.hasAttribute('data-src')) {
                    img.removeAttribute('data-src');
                  };
                  if (img.hasAttribute('data-hi-res-src')) {
                    img.removeAttribute('data-hi-res-src');
                  };
                  if (img.hasAttribute('data-low-res-src')) {
                    img.removeAttribute('data-low-res-src');
                  };

                  // Replacing
                  var initWidth = img.clientWidth;
                  var initHeight = img.clientHeight;
                  img.src = getReplacementUrl();
                  img.width = initWidth;
                  img.height = initHeight;
                  img.alt = 'This image is blocked by Eighteen Minus';

                  imgBlocked++;
                  if (DEBUG_MODE) {
                    console.log('Number of images blocked: ' + imgBlocked);
                  }
                  break;
                }
              }
            }
          }
          }
        )
        .fail(function (req, status, err) {
          console.log(status);
        })
        .always(function () {
          img.style.visibility = 'visible';
        });
      }
    }
  });
}
