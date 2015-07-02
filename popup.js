var submittest,
    dialog;

function saveChanges() {
  var fromThing = document.getElementById("from");
  var toThing = document.getElementById("to");
  // Get a value saved in a form.
  var theFromValue = fromThing.value;
  var theToValue = toThing.value;
  // Check that there's some code there.
  if (!theFromValue || !theToValue) {
    alert('Error: No value specified');
    return;
  }
  // Save it using the Chrome extension storage API.
  chrome.storage.sync.set({'from': theFromValue, 'to': theToValue}, function() {
    // Notify that we saved.
    chrome.storage.sync.get(['from', 'to'], function(items) {
      alert('Settings saved. New redirect: "'+items.from+'" -> "'+items.to+'"');
    });
  });
} 

function showNotify() {
    var notify;

    if (window.webkitNotifications.checkPermission() == 0) {
        notify = window.webkitNotifications.createNotification(
            "",
            'Notification Test',
            'This is a test of the Chrome Notification System. This is only a test.'
        );
        notify.show();
    } else {
        window.webkitNotifications.requestPermission();
    }
}

function showDialog(){
    chrome.windows.create({
        url: 'dialog.html',
        width: 200,
        height: 120,
        type: 'popup'
    });
}    

function init() {
    submitChanges = document.querySelector('#submitChanges');
    dialog = document.querySelector('#dialog');

    submitChanges.addEventListener('click', saveChanges, false);
    dialog.addEventListener('click', showDialog, false);
    
    chrome.storage.sync.get(['from', 'to'], function(items) {
      alert('Current redirect: "'+items.from+'" -> "'+items.to+'"');
    });
}    
document.addEventListener('DOMContentLoaded', init);
