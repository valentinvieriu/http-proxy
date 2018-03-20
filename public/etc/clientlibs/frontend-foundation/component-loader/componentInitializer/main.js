define('componentInitializer', ['use!jquery', 'bluebird', 'use!jqueryLazy'], function($, BluebirdPromise) {
    'use strict';

    var CONST_VIEWPORT_THRESHOLD = 500;

    var CONST_ATTR_DATA_LOADER = 'data-loader';

    var CONST_ATTR_COMPONENTS_INIT_SELECTOR = 'data-component-path';

    var CONST_ATTR_COMPONENTS_ALREADY_INITIALIZED_SELECTOR = 'data-component-initialized';

    var CONST_ATTR_COMPONENT_CONTROLLER = 'controller';

    var jqueryLazyInstance = null;

    var numberOfComponents = 0;

    var numberOfLoadedComponents = 0;

    var jqueryLazyConfiguration = {
        threshold: CONST_VIEWPORT_THRESHOLD,
        bind: 'event',
        chainable: false,

        // Custom loader which will be applied to all components
        // which shall be loaded as asynchronous module
        amdLoader: loadAmdModule
    };

    function init(element) {
        //Initialize jQuery lazy in case it didn't happened
        getJqueryLazy();

        if(element !== undefined)
        {
            var $element = $(element);
            var $itemsToBeAdded = $element.find('['+ CONST_ATTR_DATA_LOADER +']');
            numberOfComponents += $itemsToBeAdded.length;
            $(document).trigger('componentInitialized', [ numberOfComponents, numberOfLoadedComponents ]);
            getJqueryLazy().addItems($itemsToBeAdded);
            getJqueryLazy().update();
        }
    }

    function loadAmdModule(element) {
        var $element = $(element);

        initElement($element);
    }

    function getJqueryLazy() {
        if (jqueryLazyInstance == null)
        {
            initJqueryLazy();
        }

        return jqueryLazyInstance;
    }

    function initJqueryLazy() {
        var $lazyLoadElements = $('['+ CONST_ATTR_DATA_LOADER +']');

        numberOfComponents += $lazyLoadElements.length;
        $(document).trigger('componentInitialized', [ numberOfComponents, numberOfLoadedComponents ]);

        $lazyLoadElements.each(function(index, lazyLoadElement){
            var $lazyLoadElement = $(lazyLoadElement);

            if($lazyLoadElement.attr(CONST_ATTR_DATA_LOADER) === 'direct')
            {
                initElement($lazyLoadElement);
            }
        });

        jqueryLazyInstance = $lazyLoadElements.lazy(jqueryLazyConfiguration);
    }

    function getController($baseElement, init) {
        // Ensure it's an jquery parameter
        $baseElement = $($baseElement);

        // Check if the element has the component attribute
        if (typeof $baseElement.attr(CONST_ATTR_COMPONENTS_INIT_SELECTOR) === 'undefined')
        {
            //throw new Error("Given base element has no attribute '" + CONST_ATTR_COMPONENTS_INIT_SELECTOR + "'");
            return BluebirdPromise.reject(new Error("Given base element has no attribute '" + CONST_ATTR_COMPONENTS_INIT_SELECTOR + "'"));
        }

        if (init)
        {
            return initElement($baseElement);
        }
        else
        {
            var componentModule = $baseElement.data(CONST_ATTR_COMPONENT_CONTROLLER);

            return BluebirdPromise.resolve(componentModule)
        }
    }

    function initElement($elementToBeInstantiated) {

        return new BluebirdPromise(function(resolve){

            var element = $elementToBeInstantiated[0];

            var componentModule = $elementToBeInstantiated.attr(CONST_ATTR_COMPONENTS_INIT_SELECTOR);
            var componentAlreadyInitialized = $elementToBeInstantiated.attr(CONST_ATTR_COMPONENTS_ALREADY_INITIALIZED_SELECTOR);

            // Initialize component only when it's not done
            if (componentAlreadyInitialized !== 'true')
            {
                numberOfLoadedComponents++;

                require([componentModule], function(componentModule) {

                    var componentModuleInstance = null;

                    // When the module itself is a function, it will be instantiated
                    if (typeof componentModule === 'function')
                    {
                        componentModuleInstance = new componentModule(element);
                        $elementToBeInstantiated.data(CONST_ATTR_COMPONENT_CONTROLLER, componentModuleInstance);
                    }
                    // when the object provides an init function, it will be called
                    else if (typeof componentModule === 'object' && typeof componentModule.init === 'function')
                    {
                        componentModuleInstance = componentModule.init.call(element, $elementToBeInstantiated);
                        $elementToBeInstantiated.data(CONST_ATTR_COMPONENT_CONTROLLER, componentModuleInstance);
                    }

                    // Set flag that the component is initialized
                    $elementToBeInstantiated.attr(CONST_ATTR_COMPONENTS_ALREADY_INITIALIZED_SELECTOR, 'true');


                    $(document).trigger('componentInitialized', [ numberOfComponents, numberOfLoadedComponents ]);

                    resolve(componentModuleInstance);
                });
            }
            else
            {
                var componentModuleInstance = $elementToBeInstantiated.data(CONST_ATTR_COMPONENT_CONTROLLER);
                resolve(componentModuleInstance);
            }

        });
    }

    function initAll($baseElement) {
        var $componentsToBeInitialized = $('*[' + CONST_ATTR_COMPONENTS_INIT_SELECTOR + ']', $baseElement);
        var promisesComponentsToBeInitialized = [];

        $componentsToBeInitialized.each(function(index, element) {

            var $element = $(element);
            promisesComponentsToBeInitialized.push(initElement($element));
        });

        return BluebirdPromise.all(promisesComponentsToBeInitialized);
    }

    return {
        init: init,
        initElement: initElement,
        getController: getController,
        initAll: initAll,
        numberOfComponents: numberOfComponents,
        numberOfLoadedComponents: numberOfLoadedComponents
    };

});
