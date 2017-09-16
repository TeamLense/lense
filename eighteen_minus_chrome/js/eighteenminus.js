// By ...
// Basic logic of eighteen minus

/***********************
*        DEBUG         *
************************/
var debugMode = true;

if (debugMode) {
    console.log('Eighteen Minus Started');
}

/***********************
*        CODE         *
************************/
var attr = "EighteenMinus";

function checkImage(imageUrl, callback) {
    return callback(true);
}

function getReplacementUrl() {
    return chrome.runtime.getURL('/replacements/r1.png');
}

document.addEventListener('DOMContentLoaded', onDOMContentLoaded(), false);

function onDOMContentLoaded() {
    if (debugMode) {
        console.log('DOM fully loaded and parsed');
        var imgBlocked = 0;
    }

    var currentTabImages = document.getElementsByTagName("img");
    for (var i = 0; i < currentTabImages.length; ++i) {
        var img = currentTabImages[i];

        // Image is already checked if it has the attribute
        if (!img.hasAttribute(attr)) {
            // Save image URL in debug mode
            var attrValue = debugMode ? img.src : '';
            img.setAttribute(attr, attrValue);

            var alttext = String(img.alt).toLowerCase();
            var imgsrc = String(img.src);

            checkImage(imgsrc, shouldBlock => {
                if (shouldBlock) {
                    // remove srcsets, forcing browser to show the replacement - eg, BBC News
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

                    // knock out lazyloader data URLs so it doesn't overwrite kittens
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
                    if (debugMode) {
                        console.log('Number of images blocked: ' + imgBlocked);
                    }
                }
            })
        }
    }
}