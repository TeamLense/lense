// By ...
// Basic logic of eighteen minus

/***********************
*        DEBUG         *
************************/
const DEBUG_MODE = true;
const CRAZY_FILTER_MODE = true;

if (DEBUG_MODE) {
  console.log('Eighteen Minus Started');
  var imgBlocked = 0;
}

/***********************
*        CODE         *
************************/
const ATTR = "EighteenMinus";
const VIOLENT_KEYWORD_LIST = ["Shoot", "Horror", "Gun"];
const SEXUAL_KEYWORD_LIST = [];
const filterKeywordList = [];

//var setting = {enable: false};
//chrome.runtime.onMessage.addListener(function(data, sender, sendResponse) {
//    setting = data;
//});

function checkImage(imageUrl, callback) {
  return callback(true);
}

function getReplacementUrl() {
    var replacementUrl = chrome.runtime.getManifest().web_accessible_resources[0];
    return chrome.runtime.getURL(replacementUrl);
}

// Deprecated (image replacement)
//function censorImage(img) {
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
//  img.src = getReplacementUrl();
//  img.width = initWidth;
//  img.height = initHeight;
//  img.alt = 'This image is blocked by Eighteen Minus';
//}

function onDOMContentLoaded() {
    if (DEBUG_MODE)
        console.log('DOM fully loaded and parsed');

    onImgElementsLoaded(document.getElementsByTagName("img"));
}

function onImgElementsLoaded(imgElements) {
    for (var i = 0; i < imgElements.length; ++i) {
        let img = imgElements[i];

        // Image is already checked if it has the attribute
        if (!img.hasAttribute(ATTR)) {
            img.style.visibility = "hidden";
            img.setAttribute(ATTR, '');

            if (CRAZY_FILTER_MODE) {
                // In this mode, we block every image!
                blockImage(img);
                img.style.visibility = 'visible';
                continue;
            }

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
                    if (res.hasOwnProperty('statusInfo'))
                        console.error(res.statusInfo);
                } else if (res.hasOwnProperty('images') && res.images.length != 0) {
                    for (let j = 0; j < res.images.length; j++) {
                        for (var cls in filterKeywordList) {
                            if ( res.images[j].classifiers.length > 0 && res.images[j].classifiers.includes(cls) ) {
                                blockImage(img);
                                break;
                            }
                        }
                    }
                }
            })
            .fail(function (req, status, err) {
                console.log(status);
            })
            .always(function () {
                img.style.visibility = 'visible';
            });
        }
    }
}

function blockImage(image) {
    if (image.hasAttribute('srcset'))
    image.removeAttribute('srcset');

    // remove source srcsets if children of same parent <picture> element - eg, the Guardian
    if (image.parentElement.nodeName == 'PICTURE') {
        var theparent = image.parentNode;
        for (var child = theparent.firstChild; child !== null; child = child.nextSibling) {
            if (child.nodeName == "SOURCE") {
                child.removeAttribute('src');
                child.removeAttribute('srcset');
            }
        }
    }

    // knock out lazyloader data URLs so it doesn't overwrite NSFW
    if (image.hasAttribute('data-src'))
        image.removeAttribute('data-src');

    if (image.hasAttribute('data-hi-res-src'))
        image.removeAttribute('data-hi-res-src');

    if (image.hasAttribute('data-low-res-src'))
        image.removeAttribute('data-low-res-src');

    // Replacing
    var initWidth = image.clientWidth;
    var initHeight = image.clientHeight;
    image.src = getReplacementUrl();
    image.width = initWidth;
    image.height = initHeight;
    image.alt = 'This image is blocked by Eighteen Minus';

    if (DEBUG_MODE) {
        imgBlocked++;
        console.log('Number of images blocked: ' + imgBlocked);
    }
}

chrome.storage.sync.get('key', function(setting) {
    if (setting.key.censor.violence) {
        Array.prototype.push.apply(filterKeywordList, VIOLENT_KEYWORD_LIST);
    }
    if (setting.key.censor.sexual) {
        Array.prototype.push.apply(filterKeywordList, SEXUAL_KEYWORD_LIST);
    }
    if (DEBUG_MODE) {
        console.log(filterKeywordList);
    }
    if (CRAZY_FILTER_MODE) {
        // The content does not matter in this mode
        filterKeywordList.push('*');
    }

    if (setting.key.enable && filterKeywordList.length > 0) {
        document.addEventListener('DOMContentLoaded', onDOMContentLoaded(), false);
        var observer = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === 1) {
                        onImgElementsLoaded(node.getElementsByTagName("img"));
                    }
                })
            });
        });
        observer.observe(document, { childList: true, subtree: true });
    }
});