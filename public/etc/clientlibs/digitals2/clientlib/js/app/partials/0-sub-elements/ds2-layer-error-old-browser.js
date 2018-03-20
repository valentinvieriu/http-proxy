/**
 * partial: error-old-browser
 * author: patrick
 *
 * detection based on http://stackoverflow.com/a/21669794
 */


// no jquery used for old/unsupported browsers like ie7&8
window.onload = function() {
  var nVer = navigator.appVersion,
      nAgt = navigator.userAgent,
      browserName = navigator.appName,
      fullVersion = '' + parseFloat(navigator.appVersion),
      majorVersion = parseInt(navigator.appVersion, 10),
      minVersion = 0,
      browserLink = '',
      nameOffset, verOffset, ix;

  // In Opera, the true version is after "Opera" or after "Version"
  if ((verOffset = nAgt.indexOf('Opera')) != -1) {
    browserName = 'Opera';
    fullVersion = nAgt.substring(verOffset + 6);
    if ((verOffset = nAgt.indexOf('Version')) != -1)
      fullVersion = nAgt.substring(verOffset + 8);
    minVersion = 15;
    browserLink = 'http://www.opera.com/browser/';
  }

  // In MSIE, the true version is after "MSIE" in userAgent
  else if ((verOffset = nAgt.indexOf('MSIE')) != -1 || (verOffset = nAgt.indexOf('Microsoft Internet Explorer')) != -1) {
    browserName = 'Internet Explorer';
    fullVersion = nAgt.substring(verOffset + 5);
    minVersion = 9;
    browserLink = 'http://windows.microsoft.com/de-DE/internet-explorer/downloads/ie';
  }

  // In Chrome, the true version is after "Chrome"
  else if ((verOffset = nAgt.indexOf('Chrome')) != -1) {
    browserName = 'Chrome';
    fullVersion = nAgt.substring(verOffset + 7);
    if (((verOffset = nAgt.indexOf('Mobile')) != -1) || ((verOffset = nAgt.indexOf('Android')) != -1)) {
      //Chrome Mobile
      minVersion = 28;
    } else {
      //Chrome Desktop
      minVersion = 35;
    }
    browserLink = 'http://www.google.com/chrome?hl=de';
  }

  // In Safari, the true version is after "Safari" or after "Version"
  else if ((verOffset = nAgt.indexOf('Safari')) != -1) {
    browserName = 'Safari';
    fullVersion = nAgt.substring(verOffset + 7);
    if ((verOffset = nAgt.indexOf('Version')) != -1) {
      fullVersion = nAgt.substring(verOffset + 8);
    }
    if (((verOffset = nAgt.indexOf('Mobile')) != -1) || ((verOffset = nAgt.indexOf('Android')) != -1)) {
      //Safari Mobile
      minVersion = 4;
    }
    else {
      //Safari Desktop
      minVersion = 6;
    }
    browserLink = 'https://www.apple.com/de/safari/';
  }

  // In Firefox, the true version is after "Firefox"
  else if ((verOffset = nAgt.indexOf('Firefox')) != -1) {
    browserName = 'Firefox';
    fullVersion = nAgt.substring(verOffset + 8);
    minVersion = 30;
    browserLink = 'http://www.mozilla.com/firefox/';
  }

  // In most other browsers, "name/version" is at the end of userAgent
  else if ((nameOffset = nAgt.lastIndexOf(' ') + 1) <
    (verOffset = nAgt.lastIndexOf('/')))
  {
    browserName = nAgt.substring(nameOffset, verOffset);
    fullVersion = nAgt.substring(verOffset + 1);
    if (browserName.toLowerCase() == browserName.toUpperCase()) {
      browserName = navigator.appName;
    }
  }

  // trim the fullVersion string at semicolon/space if present
  if ((ix = fullVersion.indexOf(';')) != -1)
    fullVersion = fullVersion.substring(0, ix);
  if ((ix = fullVersion.indexOf(' ')) != -1)
    fullVersion = fullVersion.substring(0, ix);

  majorVersion = parseInt('' + fullVersion, 10);
  if (isNaN(majorVersion)) {
    fullVersion = '' + parseFloat(navigator.appVersion);
    majorVersion = parseInt(navigator.appVersion, 10);
  }


  //minVersion = majorVersion + 1; //dev
  //browserName = browserName + " (v" + majorVersion + ") ";

  // create Error
  if (majorVersion < minVersion) {
    // no jquery used for old/unsupported browsers like ie7&8

    // pure JavaScript find elements by class
    function getByClass(className, parent) {
      parent || (parent = document);
      var descendants = parent.getElementsByTagName('*'), i = -1, e, result = [];
      while (e = descendants[++i]) {
        ((' ' + (e['class'] || e.className) + ' ').indexOf(' ' + className + ' ') > -1) && result.push(e);
      }
      return result;
    }

    //replace the browser name
    var nodesN = getByClass('ds2-layer-error-old-browser--browser-name'), i = -1, nodeN;
    while (nodeN = nodesN[++i]) nodeN.innerHTML = browserName;

    //replace the required version
    var nodesV = getByClass('ds2-layer-error-old-browser--browser-minversion'), i = -1, nodeV;
    while (nodeV = nodesV[++i]) nodeV.innerHTML = minVersion;

    //replace the link to update the current browser
    var nodesL = getByClass('ds2-layer-error-old-browser--browser-link'), i = -1, nodeL;
    while (nodeL = nodesL[++i]) nodeL.href = browserLink;

    //show the error layer
    if (document.getElementById('ds2-messages-js--browser-error')) {
      document.getElementById('ds2-messages-js--browser-error').style.display = 'block';
    }
  }
  // destroy Error
  else {
    //log('hideBrowserError');
    //log('error: ', document.getElementById("ds2-messages-js--browser-error"));
    if (document.getElementById('ds2-messages-js--browser-error')) {
      document.getElementById('ds2-messages-js--browser-error').innerHTML = '';
    }
  }

  // dev output
  /*
  document.write(''
    +'Browser name  = '+browserName+'<br/>'
    +'Full version  = '+fullVersion+'<br/>'
    +'Major version = '+majorVersion+'<br/>'
    +'Requested version = '+minVersion+'<br/>'
    +'navigator.appName = '+navigator.appName+'<br/>'
    +'navigator.userAgent = '+navigator.userAgent+'<br/>'
  );
*/
}
