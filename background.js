var from, to;

var thething = function (details) {
      alert("hi again");
      var result;
      //var thing = "^http:\/\/"+from+"\/";
      //var re = new RegExp(thing);
      //alert(JSON.stringify([from, to, thing, {
      //  redirectUrl:
      //    info.url.replace(re,
      //                     'http://'+to+'/')
      //}]));
      result = {
        redirectUrl:
          info.url.replace("http://asdasd.com/",
                           'http://google.com/')
      };
      alert(JSON.stringify(result));
      return result;
    }

chrome.storage.sync.get(['from', 'to'], function(items) {
  alert("hi");
  from = items.from;
  to = items.to;
  alert(from);
  alert(to);

  chrome.webRequest.onBeforeRequest.addListener(
    thething,
    {
      urls: [ "<all_urls>" ],
    },
    [ "blocking" ]
  );

  alert(chrome.webRequest.onBeforeRequest.hasListener());

  chrome.storage.onChanged.addListener(function(changes, namespace) {
    //alert("hi again2");
    for (key in changes) {
      var storageChange = changes[key];
      console.log('Storage key "%s" in namespace "%s" changed. ' +
                  'Old value was "%s", new value is "%s".',
      key,
      namespace,
      storageChange.oldValue,
      storageChange.newValue);
      if (key == "from") {
        from = storageChange.newValue;
      } else if (key == "to") {
        to = storageChange.newValue;
      }
    }
    chrome.webRequest.onBeforeRequest.removeListener(
      function () {
        alert("delete?");
        chrome.webRequest.onBeforeRequest.addListener(
          thething,
          {
            urls: [ "<all_urls>" ],
            types: ["main_frame"],
          },
          [ "blocking" ]
        );
      }
    );
  });
  alert("hi last");

});
