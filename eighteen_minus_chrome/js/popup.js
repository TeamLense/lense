var savedData = {};

function saveData(enabled, censor) {
  var data = {};
  data['key'] = { enable: enabled, censor: censor };
  chrome.storage.sync.set(data);
}

document.addEventListener('DOMContentLoaded', () => {
  chrome.storage.sync.get('key', function(data) {
    if (!chrome.runtime.error) 
      savedData = data.key;

    var switchCheckbox = $('.switch-checkbox');
    var statusText = $('p.status');
    var filter = $('.filter');
    var violence = $('#violence');
    var sexual = $('#sexual');

    if (savedData.enable) {
      switchCheckbox.parent().addClass('active');
      switchCheckbox.prop('checked', true);
      statusText.html('<b>18-</b> running');
      filter.slideDown();
    }

    if (savedData.censor && savedData.censor.violence) violence.prop('checked', true);
    if (savedData.censor && savedData.censor.sexual) sexual.prop('checked', true);

    switchCheckbox.parent().removeClass('hide');

    function saveTotalData() {
      saveData(switchCheckbox.is(':checked'), {violence: violence.is(':checked'), sexual: sexual.is(':checked')});
    }

    switchCheckbox.click(function() {
      $(this).parent().toggleClass('active');
      filter.is(':visible') ? filter.slideUp() : filter.slideDown();
      statusText.html(this.checked ? '<b>18-</b> running' : '<b>18-</b> sleeping');
      saveTotalData();
    });

    filter.on('click', '#violence, #sexual', function() {
      saveTotalData();
    });
  });
});