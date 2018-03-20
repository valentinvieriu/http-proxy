/**
 * partial: Save configuration
 * author: Thomas Grass
 */

(function (window, document, $, undefined) {

  var saveConfiguration = {
    initSaveConfigurationModal: function () {
      // check if configuration save is available and configurator is loaded
      if ($('#ds2-configuration-save').length > 0 && $('body').hasClass('ds2-page--h5vco')) {
        // main navigation click
        $(document).on('click', '.ds2-navigation-main--link', function (e) {
          if (saveConfiguration.configuratorInCorrectStep()) {
            if ($(this).attr('href') != '#') {
              console.log('Main Navigation clicked.');
              e.stopImmediatePropagation();
              e.preventDefault();
              saveConfiguration.openSaveConfigurationModal($(this).attr('href'));
            }
          }
        });
        $('.ds2-navigation-main--link').on('click', function (e) {
          if (saveConfiguration.configuratorInCorrectStep()) {
            if ($(this).attr('href') != '#') {
              console.log('Main Navigation clicked.');
              e.stopImmediatePropagation();
              e.preventDefault();
              saveConfiguration.openSaveConfigurationModal($(this).attr('href'));
            }
          }
        });
        $('.ds2-main-footer--link').on('click', function (e) {
          if (saveConfiguration.configuratorInCorrectStep()) {
            if ($(this).attr('href') != '#') {
              console.log('Footer clicked.');
              e.stopImmediatePropagation();
              e.preventDefault();
              saveConfiguration.openSaveConfigurationModal($(this).attr('href'));
            }
          }
        });
      }
    },

    openSaveConfigurationModal: function (href) {
      var configurationSaveContainer = document.getElementById('ds2-configuration-save');
      var saveConfigurationSaveModalCloseButton = document.getElementById('configuration-save--modal-close');
      var saveConfigurationSaveModalSaveButton = document.getElementById('configuration-save--button--save');
      var saveConfigurationSaveModalCancelButton = document.getElementById('configuration-save--button--cancel');
      var saveConfigurationSaveModalCarName = document.getElementById('configuration-save--car-name');
      var saveConfigurationSaveModalPreviewImage = document.getElementById('configuration-save--preview-image');

      if (configurationSaveContainer) {
        configurationSaveContainer.classList.add('visible');
        saveConfigurationSaveModalCarName.innerHTML = saveConfiguration.nameOfConfiguredCar();
        var imageUrl = saveConfiguration.imageOfConfiguredCar();
        if (imageUrl) {
          saveConfigurationSaveModalPreviewImage.innerHTML = '<img src="' + imageUrl + '" style="width: 100%; height: auto;"/>';
        }
        else {
          saveConfigurationSaveModalPreviewImage.innerHTML = '';
        }
      }

      if (saveConfigurationSaveModalCloseButton) {
        saveConfigurationSaveModalCloseButton.onclick = function (e) {
          e.preventDefault();
          configurationSaveContainer.classList.remove('visible');
        }
      }

      if (saveConfigurationSaveModalSaveButton) {
        saveConfigurationSaveModalSaveButton.onclick = function () {
          saveConfiguration.saveConfiguration();
          configurationSaveContainer.classList.remove('visible');
        }
      }

      if (saveConfigurationSaveModalCancelButton) {
        saveConfigurationSaveModalCancelButton.onclick = function () {
          saveConfiguration.cancelConfiguration();
          if (href !== null) {
            window.location.href = href;
          }
          else {
            configurationSaveContainer.classList.remove('visible');
          }
        }
      }
    },

    saveConfiguration: function () {
      if (window.ds2configurator && window.ds2configurator.$) {
        window.ds2configurator.$.publish('h5vco.garage.saveToMyGarage');
      }
      console.log('Configuration saved');
      // TODO must be implemented
    },

    cancelConfiguration: function () {
      console.log('Configuration canceled');
      // TODO must be implemented
    },

    garageIsAvailable: function () {
      var garageJson = localStorage.getItem('Garage');
      return garageJson !== null;
    },
    /**
     * Check if configurator has steps (not in overview) and is not in step 0 and step 1.
     * @returns {boolean}
     */
    configuratorInCorrectStep: function () {
      return $('#h5vco-save-button').hasClass('h5vco-enabled');
    },
    /**
     * Get name of configured car from local-storage
     * @returns name or null
     */
    nameOfConfiguredCar: function () {
      var currentConfigLocalStorageJson = localStorage.getItem('h5vco.configurations.currentConfig');
      if (currentConfigLocalStorageJson) {
        var currentConfigLocalStorage = JSON.parse(currentConfigLocalStorageJson);
        if (currentConfigLocalStorage.configData.description != undefined) {
          return currentConfigLocalStorage.configData.description;
        }
      }
      return null;
    },
    /**
     * Get image of configured car from local-storage
     * @returns cosy-url or null
     */
    imageOfConfiguredCar: function () {
      var currentConfigLocalStorageJson = localStorage.getItem('h5vco.configurations.currentConfig');
      if (currentConfigLocalStorageJson) {
        var currentConfigLocalStorage = JSON.parse(currentConfigLocalStorageJson);
        if (currentConfigLocalStorage.configData.cosyImageUrls.FRONTSIDE_VIEW != undefined) {
          return currentConfigLocalStorage.configData.cosyImageUrls.FRONTSIDE_VIEW;
        }
      }
      return null;
    }
  };

  saveConfiguration.initSaveConfigurationModal();

}(window, document, jQuery));
