var submittest,
    dialog;

var salert = function(thing) {
  //alert(thing);
}

function updatePage() {
  var entriesTable = document.getElementById('entries');
  var currentEntries = entriesTable.children

  while(currentEntries.length > 0) {
    entriesTable.removeChild(currentEntries[0]);
  }

  chrome.storage.sync.get({'mapping': {}},
    function(cache) {
      for (pair in cache.mapping){
        var entryRow = entriesTable.insertRow(0);
        entryRow.id = pair;
        var entryFromCell = entryRow.insertCell(0);
        var entryToCell = entryRow.insertCell(1);
        var entryDeleteCell = entryRow.insertCell(2);
        entryFromCell.innerHTML = "http://"+pair+"/";
        entryToCell.innerHTML = "http://"+cache.mapping[pair]+"/";
        entryDeleteCell.innerHTML = "<a class=\"btn-floating waves-effect waves-light red deleteEntry\" data-from=\""+pair+"\"><i class=\"material-icons\">delete</i></a>";
      }
      deleteButtons = document.getElementsByClassName('deleteEntry');
      for (i = 0; i < deleteButtons.length; i++) {
        deleteButtons[i].addEventListener('click', generateDeleteEntryButton(deleteButtons[i].dataset.from));
      }
    }
  );
}

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
  chrome.storage.sync.get({'mapping': {}},
    function(cache) {
      var newMapping = cache.mapping;
      newMapping[theFromValue] = theToValue;
      chrome.storage.sync.set({'mapping': newMapping},
        function() {
          updatePage();
          return;
        }
      );
    }
  );
}

function deleteEntry(from) {
  // Save it using the Chrome extension storage API.
  chrome.storage.sync.get({'mapping': {}},
    function(cache) {
      var newMapping = cache.mapping;
      delete newMapping[from];
      chrome.storage.sync.set({'mapping': newMapping},
        function() {
          updatePage();
          return;
        }
      );
    }
  );
}

function generateDeleteEntryButton(from) {
  var deleteEntryButton = function() {
    deleteEntry(from);
  }
  return deleteEntryButton;
}

function init() {
  submitChanges = document.querySelector('#submitChanges');
  submitChanges.addEventListener('click', saveChanges, false);

  updatePage();
}
document.addEventListener('DOMContentLoaded', init);
