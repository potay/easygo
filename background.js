chrome.webRequest.onBeforeRequest.addListener(
  function (info) {
    return {
      redirectUrl:
        info.url.replace(/^http:\/\/potay\//,
        	'http://paulchun.com/')
    };
  },
  { 
    urls: [ "http://potay/*" ],
    types: ["main_frame"],
  },
  [ "blocking" ]);
