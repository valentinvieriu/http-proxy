/**
 * partial: provinceselection
 * author: Thomas Grass
 */
$(function () {
  var provinceSelection = {
    init: function (provinceSelection) {
      if (window) {
        window.provinceSelection = provinceSelection;
      }

      var language = $('html').attr('lang');
      // check if canadian market
      if (language === 'en-CA' || language === 'fr-CA') {
        // configurator - no cookie set
        if ($('body').hasClass('ds2-page--h5vco') && null === provinceSelection.readCookie('prov_consentCookie')) {
          // go to link - show message
          provinceSelection.openProvinceSelectionModal(null, true, 1);
        }

        // not in configurator
        if (false === $('body').hasClass('ds2-page--h5vco') && null === provinceSelection.readCookie('prov_consentCookie')) {
          // open province selection without further action
          $(document).ready(function () {
            provinceSelection.openProvinceSelectionModal(null, false, 2);
          });
        }

        $('.ds2-main-footer--link.ds2-province-selection').on('click', function (e) {
          if (false === $('body').hasClass('ds2-page--h5vco')) {
            // not in configurator - do no action after selection province
            provinceSelection.openProvinceSelectionModal(null, false, 2);
          }
          else {
            // in configurator
            // go to link show message
            provinceSelection.openProvinceSelectionModal(null, true, 1);
          }
        });
      }
    },
    readCookie: function (name) {
      var nameEQ = name + "=";
      var ca = document.cookie.split(';');
      for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
          c = c.substring(1, c.length);
        }
        if (c.indexOf(nameEQ) == 0) {
          return c.substring(nameEQ.length, c.length);
        }
      }
      return null;
    },
    createCookie: function (name, value, days) {
      var expires = "";
      if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
      }
      document.cookie = name + "=" + value + expires + "; path=/";
    },
    validate: function (url, withWarning, reloadPage, e) {
      if ((ds2DataProvince && ds2DataProvince.provinceList && ds2DataProvince.provinceList.length > 0) &&
          (url.indexOf('configurator') !== -1 || url.indexOf('need-analyzer') !== -1)) {
        e.stopImmediatePropagation();
        e.preventDefault();
        provinceSelection.openProvinceSelectionModal(url, withWarning, (reloadPage ? 0 : 1));
      }
      return true;
    },
    /**
     * Open the province selection modal
     * @param withWarning : if true, a warning will be shown if the province is
     *     changed
     * @param actionType : type of action done after province change:
     *        0: reload current page
     *        1: redirect to url from select box
     *        2: no action (just close popup)
     */
    openProvinceSelectionModal: function (url, withWarning, actionType) {
      var provinceSelectionContainer = document.getElementById('ds2-province-selection');
      var provinceSelectionSelect = document.getElementById('province-selection--select');
      var provinceSelectionButton = document.getElementById('province-selection--button');
      var provinceSelectionModalClose = document.getElementById('province-selection--modal-close');
      var provinceSelectionChangeWarning = document.getElementById('province-selection--change-warning');
      var provinceSelectionSubheadline = document.getElementById('province-selection--subheadline');


      if (provinceSelectionContainer && provinceSelectionSelect && provinceSelectionButton) {
        provinceSelectionChangeWarning.style.display = 'none';
        // 1st try to read from cookie
        var selectedProvince = provinceSelection.readCookie('prov_consentCookie');
        provinceSelectionButton.disabled = (selectedProvince === null);

        provinceSelectionSelect.value = (selectedProvince === null ? '' : selectedProvince);

        // 2nd try to read from geolocation service
        if (selectedProvince === null) {
          provinceSelection.retrieveProvinceFromLocationService(provinceSelectionSelect, provinceSelectionButton, provinceSelectionSubheadline);
        }

        provinceSelectionContainer.classList.add('visible');

        provinceSelectionButton.onclick = function () {
          var newSelectedProvince = provinceSelectionSelect.value;
          provinceSelection.createCookie('prov_consentCookie', newSelectedProvince, 365);

          if (newSelectedProvince !== selectedProvince) {
            provinceSelection.createH5vcoEvent(newSelectedProvince);

            if (actionType === 0) {
              window.location.reload();
            }
            else if (actionType === 1) {
              var dataHref = provinceSelectionSelect.options[provinceSelectionSelect.selectedIndex].getAttribute('data-href');
              window.location.href = dataHref + window.location.hash;
            }
            else if (actionType === 2) {
              console.log('no action province selection');
            }
          }

          provinceSelection.closeProvinceSelectionModal();
        };

        provinceSelectionModalClose.onclick = function (e) {
          e.preventDefault();
          provinceSelection.closeProvinceSelectionModal();
        };

        provinceSelectionSelect.addEventListener('change', function () {
          provinceSelectionButton.disabled = (provinceSelectionSelect.value === '');
          if (withWarning && selectedProvince !== provinceSelectionSelect.value) {
            provinceSelectionChangeWarning.style.display = 'block';
          }
        });
      }
    },
    closeProvinceSelectionModal: function () {
      var provinceSelectionContainer = document.getElementById('ds2-province-selection');
      provinceSelectionContainer.classList.remove('visible');
    },
    createH5vcoEvent: function (selectedProvince) {
      console.log('h5vco.provinceSelectionNotification');
      if (window.ds2configurator && window.ds2configurator.$) {
        window.ds2configurator.$.publish('h5vco.provinceSelectionNotification', [{
          payload: btoa('{ "selectedProvince": "' + selectedProvince + '" }'),
        }]);
      }
      else {
        console.log('h5vco.provinceSelectionNotification not send: window.ds2configurator.$ not ready');
      }
    },
    /**
     * Get province from existing geolocation service and set it to the
     * province selection select
     * @param provinceSelectionSelect
     * @param provinceSelectionButton
     * @param provinceSelectionSubheadline
     */
    retrieveProvinceFromLocationService: function (provinceSelectionSelect, provinceSelectionButton, provinceSelectionSubheadline) {
      require(['postal.provider'] , function (postal) {
        setTimeout(function () {
          var chan = postal.channel("frontend/services/geolocation");
          chan.request({
            topic: "address.get",
            data: {positioningMethod: "IP", language: "en"},
            timeout: 2000
          }).then(function (data) {
            if (data.state) {
              var provinceName = data.state.toLowerCase().replace(' ', '-');
              console.log(provinceName);
              if (provinceSelection.provinceExistsInSelection(provinceName, provinceSelectionSelect)) {
                provinceSelectionSubheadline.innerHTML = provinceSelectionSubheadline.getAttribute('data-text-subheadline-geolocated');
                provinceSelectionSelect.value = provinceSelection.provinceExistsInSelection(provinceName, provinceSelectionSelect);
                provinceSelectionButton.disabled = false;
              }
              else {
                provinceSelectionSubheadline.innerHTML = provinceSelectionSubheadline.getAttribute('data-text-subheadline');
                console.log('Province not in list');
              }
            }
            else {
              provinceSelectionSubheadline.innerHTML = provinceSelectionSubheadline.getAttribute('data-text-subheadline');
              console.log('Could not load province');
            }
          });
        }, 100);
      });
    },
    /**
     * Check if province with given name exists in select-box and return key
     * @param name
     * @param provinceSelectionSelect
     * @returns province_key or null
     */
    provinceExistsInSelection: function (name, provinceSelectionSelect) {
      var optionsLength = provinceSelectionSelect.length;

      while (optionsLength--) {
        if (name.startsWith(provinceSelectionSelect.options[optionsLength].value)) {
          return provinceSelectionSelect.options[optionsLength].value;
        }
      }
      return null;
    }
  };
  provinceSelection.init(provinceSelection);

});
