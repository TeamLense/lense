var savedData = {};

function saveData(enabled) {
  var data = {};
  data['key'] = { enable: enabled };
  chrome.storage.sync.set(data);
}

document.addEventListener('DOMContentLoaded', () => {
    chrome.storage.sync.get('key', function(data) {
      if (!chrome.runtime.error) 
        savedData = data.key;

      console.log(savedData);

      var switchCheckbox = $('.switch-checkbox');
      var statusText = $('p.status');
      var filter = $('.filter');
      if (savedData.enable) {
        switchCheckbox.parent().addClass('active');
        switchCheckbox.prop('checked', true);
        statusText.html('<b>18-</b> running');
        filter.slideDown();
      }

      switchCheckbox.parent().removeClass('hide');

      switchCheckbox.click(function() {
        $(this).parent().toggleClass('active');
        filter.is(':visible') ? filter.slideUp() : filter.slideDown();
        console.log('checked: ' + this.checked);
        statusText.html(this.checked ? '<b>18-</b> running' : '<b>18-</b> sleeping');
        saveData(this.checked);
      });
    });
});