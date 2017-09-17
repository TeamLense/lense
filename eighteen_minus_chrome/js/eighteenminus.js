// By ...
// Basic logic of eighteen minus

/***********************
*        DEBUG         *
************************/
const DEBUG_MODE = true;
const CRAZY_FILTER_MODE = true;

if (DEBUG_MODE) {
  console.log('Eighteen Minus Started');
}

/***********************
*        CODE         *
************************/
const ATTR = "EighteenMinus";
const VIOLENT_KEYWORD_LIST = ["horror", "gun", "bloody", "shoot"];
const SEXUAL_KEYWORD_LIST = [];
var filterKeywordList = [];

var imgBlocked = 0;
var currentRightClickedTarget = null;
document.addEventListener("mousedown", function(event){
    // mouse right click to get the current target element
    if(event.button == 2) {
        currentRightClickedTarget = event.target;
    }
}, true);

// get the message sending from background
chrome.runtime.onMessage.addListener(function(data, sender, sendResponse) {
    if (data.event == 'unveil') {
        if (currentRightClickedTarget.nodeName.toLowerCase() === 'img')
            currentRightClickedTarget.src = currentRightClickedTarget.getAttribute('EighteenMinus');
        else {
            backgroundData = JSON.parse(currentRightClickedTarget.getAttribute(ATTR));
            currentRightClickedTarget.style.background = backgroundData.initBackground;
            currentRightClickedTarget.style.backgroundImage = backgroundData.initBackgroundImage;
        }
    }
});

function checkImage(imageUrl, callback) {
  return callback(true);
}

function getReplacementUrl() {
    var replacementUrl = chrome.runtime.getManifest().web_accessible_resources[0];
    return chrome.runtime.getURL(replacementUrl);
}

function onDOMContentLoaded(setting) {
    if (DEBUG_MODE)
        console.log('DOM fully loaded and parsed');

    onImgElementsLoaded(document.getElementsByTagName("img"), setting);
    onDOMupdated(setting);
}

function onImgElementsLoaded(imgElements, setting) {
    for (var i = 0; i < imgElements.length; ++i) {
        let img = imgElements[i];

        // Image is already checked if it has the attribute
        if (!img.hasAttribute(ATTR)) {
            img.style.visibility = "hidden";
            img.setAttribute(ATTR, img.src);

            if (CRAZY_FILTER_MODE) {
                // In this mode, we block every image!
                blockImage(img);
                img.style.visibility = 'visible';
                continue;
            }

            analyzeImage(String(img.src), 
                shouldBlock => {
                    if (shouldBlock) {
                        blockImage(img);
                    }
                },
                () => {},
                () => img.style.visibility = 'visible',
                setting );
        }
    }
}

function onDOMupdated(setting) {
    $("[style*='background:'], [style*='background-image:']").each((index, element) => {
        if (element.hasAttribute(ATTR)) return;

        let initBackground = element.style.background;
        let initBackgroundImage = element.style.backgroundImage;
        let backgroundUrl = getElementBackgroundUrl(element);

        element.setAttribute(ATTR, JSON.stringify({backgroundUrl: backgroundUrl, initBackground: initBackground, initBackgroundImage: initBackgroundImage}));
        
        let restoreBackground = () => {
            element.style.background = initBackground;
            element.style.backgroundImage = initBackgroundImage;
        }
        if (backgroundUrl.length > 0) {
            element.style.background = initBackground.replace(backgroundUrlRegex, "");
            element.style.backgroundImage = initBackgroundImage.replace(backgroundUrlRegex, "");

            if (CRAZY_FILTER_MODE) {
                // In this mode, we block every image!
                blockElementBackground(element);
                return;
            }

            analyzeImage(backgroundUrl,
                shouldBlock => {
                    if (shouldBlock) {
                        blockElementBackground(element);
                    } else {
                        restoreBackground();
                    }
                },
                () => restoreBackground(),
                () => {},
                setting);
        }
    })
}

function analyzeImage(imgUrl, onComplete, onError, onTerminate, setting) {
    var ids = '';
    if (setting.key.censor.violence) ids += config.classifiers.violence;
    if (setting.key.censor.sexual) ids += ',' + config.classifiers.sexual;
    if (ids.startsWith(',')) ids.substring(1, ids.length);

    let req_url = `${config.url}classify?version=2016-05-20&api_key=${config.api_key}&classifier_ids=${ids}&url=${imgUrl}`;

    $.ajax( req_url, {
        dataType: 'json',
        crossDomain: true
    })
    .done(function (res) {
        if (res.hasOwnProperty('status') && res.status == 'ERROR') {
            console.error("something went wrong");
            if (res.hasOwnProperty('statusInfo'))
                console.error(res.statusInfo);
            onError();
        } else if (res.hasOwnProperty('images') && res.images.length != 0) {
            let shouldBlock = false;
            for (let j = 0; j < res.images.length; j++) {
                for (var cls of filterKeywordList) {
                    if (res.images[j].classifiers && res.images[j].classifiers.length > 0) {
                        res.images[j].classifiers.forEach(classifier => {
                            classifier.classes.forEach(item => {
                                if (item.class === cls && item.score > 0.5) {
                                    shouldBlock = true;
                                }
                            })
						});


                        if (shouldBlock) break;
                    }
                }
            }
            onComplete(shouldBlock);
        } else {
            onComplete(false);
        }
    })
    .fail(function (req, status, err) {
        console.log(status);
        onError();
    })
    .always(function () {
        onTerminate();
    });
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

    imgBlocked++;
    chrome.runtime.sendMessage({event: 'number', number: imgBlocked}, function(response) {});
    if (DEBUG_MODE)
        console.log('Number of images blocked: ' + imgBlocked);
}

var backgroundUrlRegex = /url\(.*\)/;

function getElementBackgroundUrl(element) {
    let style = window.getComputedStyle(element, false);
    let background = style.background;
    let backgroundImage = style.backgroundImage;
    let url = "";
    let execRegex = (styleElement) => {
        let temp = backgroundUrlRegex.exec(styleElement);
        if (temp !== null && temp.length > 0) {
            return temp[0];
        }
        return "";
    }

    if (backgroundImage.length > 0) {
        url = execRegex(backgroundImage);
    }
    if (url.length === 0 && backgroundImage.length > 0) {
        url = execRegex(background);
    }
    if (DEBUG_MODE) {
        console.log("Parsed background URL: " + url);
    }
    return url;
}

function blockElementBackground(element) {
    let newUrl = 'url(\'' + getReplacementUrl() + '\')';
    let background = element.style.background;
    let backgroundImage = element.style.backgroundImage;

    element.style.background = background.replace(backgroundUrlRegex, newUrl);
    element.style.backgroundImage = newUrl;
    
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
        document.addEventListener('DOMContentLoaded', onDOMContentLoaded(setting), false);
        var observer = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === 1) {
                        onImgElementsLoaded(node.getElementsByTagName("img"));
                    }
                })
            });
            onDOMupdated();
        });
        observer.observe(document, { childList: true, subtree: true });
    }
});