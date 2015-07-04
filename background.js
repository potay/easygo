var currentCallbackDict = {};

function addRedirectListener(from, to) {
  currentCallbackDict[from] = function (request) {
    var re = new RegExp("^http:\/\/"+from+"\/");
    return {
      redirectUrl:
        request.url.replace(re,
          'http://'+to+'/')
    };
  }
  chrome.webRequest.onBeforeRequest.addListener(
    currentCallbackDict[from],
    {
      urls: [ "http:\/\/"+from+"\/*" ],
      types: ["main_frame"],
    },
    [ "blocking" ]
  );
}

function startListening(fromList) {
  fromList = fromList || []
  chrome.storage.sync.get({"mapping": {}}, function (cache) {
    if (fromList.length == 0){
      for (pair in cache.mapping) {
        addRedirectListener(pair, cache.mapping[pair]);
      }
    } else {
      for (key in fromList) {
        if (key in cache.mapping) {
          addRedirectListener(key, cache.mapping[key]);
        }
      }
    }
  });
}

function update(keys) {
  keys = keys || []
  if (keys.length > 0){
    for (key in keys) {
      if (key in currentCallbackDict && typeof currentCallbackDict[key] === "function") {
        chrome.webRequest.onBeforeRequest.removeListener(currentCallbackDict[key]);
        currentCallbackDict[key] = null;
      }
    }
    startListening(keys);
  } else {
    for (key in currentCallbackDict) {
      if (typeof currentCallbackDict[key] === "function") {
        chrome.webRequest.onBeforeRequest.removeListener(currentCallbackDict[key]);
        currentCallbackDict[key] = null;
      }
    }
    startListening();
  }
}

update();

chrome.storage.onChanged.addListener(function(changes, namespace) {
  var hasChanged = false;
  if (namespace == "sync" && ("mapping" in changes)) {
    update();
  }
});
