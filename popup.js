let tableCount = 0;

function getChildID(key) {
  return `entry_${key}`;
}

function getChildEntry(key) {
  return document.getElementById(getChildID(key));
}

function getTable() {
  return document.getElementById('entries');
}

function getTableEntries() {
  return getTable().children;
}

function tableRemoveEntry(key) {
  getTable().removeChild(getChildEntry(key));
  tableCount--;
  if (tableCount == 0) {
    tableAddEmptyMessage();
  }
}

function tableRemoveAllEntries() {
  const table = getTable();
  const tableEntries = getTableEntries();
  [].forEach.call(tableEntries, (entry) => table.removeChild(entry));
  tableCount = 0;
  tableAddEmptyMessage();
}

function tableAddEntry(key, position, from, to, https) {
  if (tableCount == 0) {
    tableRemoveEmptyMessage();
  }
  tableCount++;
  const table = getTable();
  const entryRow = table.insertRow(position);
  entryRow.id = getChildID(key);
  const entryFromCell = entryRow.insertCell(0);
  const entryToCell = entryRow.insertCell(1);
  const entrySSLCell = entryRow.insertCell(2);
  const entryRemoveCell = entryRow.insertCell(3);
  entryFromCell.innerHTML = `http://${from}/`;
  entryToCell.innerHTML = `http${https ? 's' : ''}://${to}/`;
  entrySSLCell.innerHTML = https ? '<i class=\"material-icons\">check</i>' : '';
  entryRemoveButton = document.createElement("a");
  entryRemoveButton.className = "btn-floating waves-effect waves-light red removeEntry";
  entryRemoveButton.setAttribute("data-key", from);
  entryRemoveButton.innerHTML = "<i class=\"material-icons\">delete</i>";
  tableInitDeleteButton(entryRemoveButton, from);
  entryRemoveCell.appendChild(entryRemoveButton);
}

function tableInitDeleteButton(button, key) {
  button.addEventListener('click', () => removeEntry(key));
}

function tableAddEmptyMessage() {
  const table = getTable();
  const messageRow = table.insertRow(-1);
  messageRow.id = "table-empty-message";
  const messageCell = messageRow.insertCell(0);
  messageCell.colSpan = 3;
  messageCell.style.textAlign = "center";
  messageCell.innerHTML = "You have no rules.";
}

function tableRemoveEmptyMessage() {
  getTable().removeChild(document.getElementById("table-empty-message"));
}

function updatePage(entry, type) {
  if (entry != undefined) {
    switch (type) {
      case "remove":
        tableRemoveEntry(entry.key);
        break;
      case "add":
        if (entry.exists) {
          tableRemoveEntry(entry.key);
        }
        tableAddEntry(entry.key, entry.position, entry.from, entry.to, entry.https);
        break;
      default:
    }
  } else {
    tableRemoveAllEntries();
    chrome.storage.sync.get({'mapping': {}}, (cache) => {
      const mapKeys = Object.keys(cache.mapping).sort();
      mapKeys.forEach((key) => tableAddEntry(key, -1, key, cache.mapping[key].to, cache.mapping[key].https));
    });
  }
}

function addEntry() {
  const from = document.getElementById("newEntry-from").value;
  const to = document.getElementById("newEntry-to").value;

  if (!from || !to) {
    alert('Error: No value specified');
    return;
  }

  const newEntry = {
    'from': from,
    'to': to,
    'https': document.getElementById("newEntry-https").checked,
  };

  // Save it using the Chrome extension storage API.
  chrome.storage.sync.get({'mapping': {}}, (cache) => {
      const mapping = cache.mapping;
      const exists = (from in mapping);
      mapping[from] = newEntry;
      const position = Object.keys(mapping).sort().indexOf(from);
      chrome.storage.sync.set({'mapping': mapping}, () => updatePage({'key': from, 'from': from, 'to': to, 'position': position, 'exists': exists, 'https': newEntry.https}, "add"));
    }
  );
}

function removeEntry(key) {
  // Save it using the Chrome extension storage API.
  chrome.storage.sync.get({'mapping': {}}, (cache) => {
    const mapping = cache.mapping;
    delete mapping[key];
    chrome.storage.sync.set({'mapping': mapping}, () => updatePage({'key': key}, "remove"));
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const submitEntry = document.querySelector('#submitEntry');
  submitEntry.addEventListener('click', addEntry);
  const entryType = document.querySelector('#newEntry-https');
  entryType.addEventListener('change', (event) => {
    const prefix = event.target.checked ? "https://" : "http://";
    const entryPrefixes = document.getElementsByClassName('newEntry-prefix');
    [].forEach.call(entryPrefixes, (entryPrefix) => entryPrefix.innerHTML = prefix);
  });

  updatePage();
});
