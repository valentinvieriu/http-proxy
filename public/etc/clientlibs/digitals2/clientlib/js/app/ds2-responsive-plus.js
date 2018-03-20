// Also contains methods relevant for the tracking API.
// aems2-digitals2-base/
//  ds2-tracking/
//    ds2-tracking-clientlib/
//      src/
//        main/
//          content/
//            jcr_root/
//              etc/
//                clientlibs/
//                  digitals2-tracking/
//                    sources/
//                      tracking.js


window.digitals2 = window.digitals2 || {};
// name spacing jQuery
window.digitals2.$ = $;

window.digitals2.responsivePlus = {
  device: 99,//0 = desktop, 1 = tablet, 2 = mobile
  devices: ['desktop', 'tablet', 'mobile'],

  /**
   * Handles the changes of screen orientations and passes the updated
   * value to the window.digitals2.tracking.trackingObj.
   */
  handleScreenOrientation: function () {
    function setOrientationOnTrackingObject() {
      if (this.trackingObjectExists) {
        var mode = window.innerWidth / window.innerHeight ? "landscape" : 'portrait';
        window.digitals2.tracking.trackingObj.setOrientation(mode);
      }
    }

    setOrientationOnTrackingObject();

    $(window).resize(function () {
      setOrientationOnTrackingObject();
    });
  },

  responsivePlusInit: function () {

    var self = this;
    pResponsiveClass = '';

    if (self.shortestScreenWidth() < 600) {
      pResponsiveClass = 'ds2-responsive-plus-mobile';
      device = 2;
    }
    else if (self.checkUserAgent()) {
      if (self.shortestVPWidth() < 630) {
        pResponsiveClass = 'ds2-responsive-plus-mobile';
        device = 2;
      }
      else {
        pResponsiveClass = 'ds2-responsive-plus-tablet';
        device = 1;
      }
    }
    else {
      pResponsiveClass = 'ds2-responsive-plus-desktop';
      device = 0;
    }
    document.documentElement.className += ' ' + pResponsiveClass;
  },

  responsivePlusDeviceGet: function() {
    return device;
  },

  responsivePlusDeviceSet: function(pDevice) {
    device = pDevice;
  },

  // check Vviewport sizes
  shortestVPWidth: function () {
    return Math.min(document.documentElement.clientWidth,
        window.innerWidth,
        document.documentElement.clientHeight,
        window.innerHeight || 0);
  },

  // check screen sizes
  shortestScreenWidth: function () {
    return Math.min(screen.width, screen.height || 0);
  },

  // check user agent of reference tablets
  checkUserAgent: function () {
    var uachecked = 0;
    if (/ipad|android|silk|kindle|playbook|mobi/i.test(navigator.userAgent.toLowerCase())) {
      uachecked = 1;
    } else {
      if (/windows nt/i.test(navigator.userAgent.toLowerCase())) {
        if (/arm/i.test(navigator.userAgent.toLowerCase())) {
          uachecked = 1;
        }
      }
    }
    return uachecked;
  }
};
window.digitals2.responsivePlus.responsivePlusInit();


//INTEGRATION
window.integration = window.integration || {};
window.integration.deviceType = (function()
{
  if(window.digitals2.responsivePlus)
  {
    return window.digitals2.responsivePlus.responsivePlusDeviceGet();
  }
  else
  {
    return 0;
  }
}
)();
