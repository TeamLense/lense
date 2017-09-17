function saveData(data) {
  var newData = {};
  newData['key'] = data;
  chrome.storage.sync.set(newData);
}

function sendMessage(data) {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, data, function(response) {});
  });
}

document.addEventListener('DOMContentLoaded', () => {
  chrome.storage.sync.get('key', function(data) {
    var savedData = {};

    if (!chrome.runtime.error)
      savedData = data.key || { enable: false, censor: { violence: true, sexual: true} };

    var switchCheckbox = $('.switch-checkbox');
    var statusText = $('p.status');
    var filter = $('.filter');
    var violence = $('#violence');
    var sexual = $('#sexual');

    if (savedData.enable) {
      switchCheckbox.parent().addClass('active');
      switchCheckbox.prop('checked', true);
      statusText.html('<b>Lense</b> running');
      filter.slideDown();
    }

    if (savedData.censor && savedData.censor.violence) violence.prop('checked', true);
    if (savedData.censor && savedData.censor.sexual) sexual.prop('checked', true);

    switchCheckbox.parent().removeClass('hide');

    function saveTotalData() {
      var data = {
        enable: switchCheckbox.is(':checked'),
        censor: {
          violence: violence.is(':checked'),
          sexual: sexual.is(':checked')
        }
      }
      saveData(data);
      //sendMessage(data);
    }

    switchCheckbox.click(function() {
      $(this).parent().toggleClass('active');
      filter.is(':visible') ? filter.slideUp() : filter.slideDown();
      statusText.html(this.checked ? '<b>Lense</b> running' : '<b>Lense</b> sleeping');
      saveTotalData();
    });

    filter.on('click', '#violence, #sexual', function() {
      saveTotalData();
    });
  });

  chrome.runtime.onInstalled.addListener(function() {
    chrome.contextMenus.create({
      id: 'Violence_1929902703',
      title: 'report this image as violence',
      contexts: ['image']
    });

    chrome.contextMenus.create({
      id: 'Sexual_415517634',
      title: 'report this image as sexual',
      contexts: ['image']
    });

    chrome.contextMenus.create({
      id: 'unveil',
      title: 'unveil this image',
      contexts: ['image']
    });
  });

  chrome.contextMenus.onClicked.addListener(function(info, tab) {
    if (info.menuItemId == 'unveil') {
      sendMessage({event: 'unveil', imgUrl: info.srcUrl});
    } else {
      // alert(info.menuItemId + '; ' + info.srcUrl);
      $.ajax({
        type: "POST",
        // url: `https://us-central1-htn-2017-6fb63.cloudfunctions.net/classifiers/new?classifier=${info.menuItemId}`,
        url: `https://d3e6bc75.ngrok.io/htn-2017-6fb63/us-central1/classifiers/new?classifier=${info.menuItemId}`,
        contentType: "application/json; charset=utf-8",
        dataType: 'json',
        data: JSON.stringify({
          url: info.srcUrl
        }),
        crossDomain: true
      })
      .done((res) => {
        console.log("Done: " + res)
      })
      .fail((req, status, err) => {
        console.log("Fail")
        console.log("Req: " + req)
        console.log("Status: " + status)
        console.log("Err: " + err)
      })
    }
  });
});