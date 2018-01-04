const callbackDict = {};

function addRedirectListener(from, to, https) {
  callbackDict[from] = (request) => {
    const re = new RegExp(`^http:\/\/${from}\/`);
    return {
      redirectUrl:
        request.url.replace(re,
          `http${(https ? 's' : '')}://${to}/`)
    };
  };

  chrome.webRequest.onBeforeRequest.addListener(
    callbackDict[from],
    {
      urls: ["http:\/\/"+from+"\/*"],
      types: ["main_frame"],
    },
    [ "blocking" ]
  );
}

function startListening(fromList) {
  fromList = fromList || []
  chrome.storage.sync.get({"mapping": {}}, (cache) => {
    if (fromList.length == 0) {
      for (from in cache.mapping) {
        addRedirectListener(from, cache.mapping[from].to, cache.mapping[from].https);
      }
    } else {
      fromList.forEach((from) => {
        if (from in cache.mapping) {
          addRedirectListener(from, cache.mapping[from].to, cache.mapping[from].https);
        }
      });
    }
  });
}

function update(fromList) {
  fromList = fromList || [];
  if (fromList.length > 0){
    fromList.forEach((from) => {
      if (from in callbackDict && typeof callbackDict[from] === "function") {
        chrome.webRequest.onBeforeRequest.removeListener(callbackDict[from]);
        callbackDict[from] = null;
      }
    });
    startListening(fromList);
  } else {
    for (from in callbackDict) {
      if (typeof callbackDict[from] === "function") {
        chrome.webRequest.onBeforeRequest.removeListener(callbackDict[from]);
        callbackDict[from] = null;
      }
    }
    startListening();
  }
}

function upgradeStorage(version, doneFn) {
  switch (version) {
    case null:
    case "0.3":
      chrome.storage.sync.get({"mapping": {}}, (cache) => {
        const mapping = cache.mapping;
        const newMapping = {};
        for (from in mapping) {
          const to = mapping[from];
          newMapping[from] = {
            'to': to,
            'https': false,
          };
        }
        chrome.storage.sync.set({"mapping": newMapping}, () => doneFn());
      });
      break;
    default:
  }
}

function start() {
  update();
  chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace == "sync" && ("mapping" in changes)) {
      update();
    }
  });
}

function init(initFn) {
  chrome.storage.sync.get({"easygoVersion": null}, (cache) => {
    const currentVersion = chrome.runtime.getManifest().version;
    if (!cache.easygoVersion || cache.easygoVersion != currentVersion) {
      upgradeStorage(cache.easygoVersion, () => start());
      chrome.storage.sync.set({"easygoVersion": currentVersion});
    } else {
      start();
    }
  });
}

init();
