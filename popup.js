var submittest,
    dialog;

var salert = function(thing) {
  //alert(thing);
}

function updatePage(pairDict, type) {
  var entriesTable = document.getElementById('entries');
  var currentEntries = entriesTable.children;

  console.log(pairDict);

  if (pairDict == undefined) {

    while(currentEntries.length > 0) {
      entriesTable.removeChild(currentEntries[0]);
    }

    chrome.storage.sync.get({'mapping': {}},
      function(cache) {
        var pairs = Object.keys(cache.mapping).sort()
        console.log(pairs);
        for (i in pairs){
          var pair = pairs[i];
          var entryRow = entriesTable.insertRow(-1);
          entryRow.id = "entry_"+pair;
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
  } else {
    console.log(type);
    if (type == "delete") {
      var childEntry = document.getElementById('entry_'+pairDict.from);
      entriesTable.removeChild(childEntry);
    } else if (type == "add") {
      if (pairDict.repeat) {
        var childEntry = document.getElementById('entry_'+pairDict.from);
        entriesTable.removeChild(childEntry);
      }
      var entryRow = entriesTable.insertRow(pairDict.i);
      entryRow.id = "entry_"+pairDict.from;
      var entryFromCell = entryRow.insertCell(0);
      var entryToCell = entryRow.insertCell(1);
      var entryDeleteCell = entryRow.insertCell(2);
      entryFromCell.innerHTML = "http://"+pairDict.from+"/";
      entryToCell.innerHTML = "http://"+pairDict.to+"/";
      entryDeleteCell.innerHTML = "<a class=\"btn-floating waves-effect waves-light red deleteEntry\" data-from=\""+pairDict.from+"\"><i class=\"material-icons\">delete</i></a>";

      deleteButtons = document.getElementsByClassName('deleteEntry');
      for (i = 0; i < deleteButtons.length; i++) {
        deleteButtons[i].addEventListener('click', generateDeleteEntryButton(deleteButtons[i].dataset.from));
      }
    }
  }
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
      if (theFromValue in newMapping) {
        var repeat = true;
        newMapping[theFromValue] = theToValue;
        var i = Object.keys(newMapping).sort().indexOf(theFromValue);
      } else {
        var repeat = false;
        newMapping[theFromValue] = theToValue;
        var i = Object.keys(newMapping).sort().indexOf(theFromValue);
      }
      chrome.storage.sync.set({'mapping': newMapping},
        function() {
          updatePage({'from': theFromValue, 'to': theToValue, 'i': i, 'repeat': repeat}, "add");
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
      var to = cache.mapping[from];
      delete newMapping[from];
      chrome.storage.sync.set({'mapping': newMapping},
        function() {
          updatePage({'from': from, 'to': to}, "delete");
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
