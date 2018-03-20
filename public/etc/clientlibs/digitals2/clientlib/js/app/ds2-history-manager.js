/**
 * @fileOverview Functionality for managing the history/browser address from components.
 * Since this functionality is not used in every page, the vendor modules doing the heavyweight work
 * are loaded on demand via a separate clientlib 'vendor/history.js'. See also comment in "main.js" there.
 */
define('historyManager', ['use!jquery', '/etc/clientlibs/digitals2/clientlib/js/vendor/historyjs.js'], function($, History) {
    'use strict';

    var // an action within the app that isn't the back or forward browser button
        inAppAction = false,
        currentTitle = document.title,
        currentURL = window.location.href,
        currentData = null,
        hasHistoryApi = !!History.enabled;

    /**
     * Override History.onPopState for configurator routes.
     */
    function overridePopState () {


        if (!hasHistoryApi) {
            return;
        }

        $(window).unbind('popstate', History.onPopState);

        /**
         * History.onPopState(event,extra)
         * Refresh the Current State
         */
        History.onPopState = function(event, extra) {
            // Prepare
            var stateId = false, newState = false, currentHash, currentState;

            if (!hasHistoryApi) {
                return;
            }

            // Reset the double check
            History.doubleCheckComplete();

            // Check for a Hash, and handle apporiatly
            currentHash = History.getHash();

            if (currentHash) {
                // Expand Hash
                currentState = History.extractState(currentHash || History.getLocationHref(), true);
                if (currentState) {

                    // We were able to parse it, it must be a State!
                    // Let's forward to replaceState
                    //History.debug('History.onPopState: state anchor', currentHash, currentState);

                    // Override History.onPopState in order to be able to change routes at configurator
                    // MINDIGB-5720: Fixes issue with a '/' being added to the hash when clicking the browser
                    // 'Back' button while the configurator is open
                    if (currentState.url.indexOf('configurator') === -1 && currentState.url.indexOf('returnURL') === -1) {
                        if (currentState.hash === '/') {
                            $.publish('md:configurator:unload');
                        } else {
                            History.replaceState(currentState.data, currentState.title, currentState.url, false);
                        }
                    }
                } else {
                    // Traditional Anchor
                    //History.debug('History.onPopState: traditional anchor', currentHash);
                    History.Adapter.trigger(window, 'anchorchange');
                    History.busy(false);
                }

                // We don't care for hashes
                History.expectedStateId = false;
                return false;
            }

            // Ensure
            stateId = History.Adapter.extractEventData('state', event, extra) || false;

            // Fetch State
            if (stateId) {
                // Vanilla: Back/forward button was used
                newState = History.getStateById(stateId);
            } else if (History.expectedStateId) {
                // Vanilla: A new state was pushed, and popstate was called manually
                newState = History.getStateById(History.expectedStateId);
            } else {
                // Initial State
                newState = History.extractState(History.getLocationHref());
            }

            // The State did not exist in our store
            if (!newState) {
                // Regenerate the State
                newState = History.createStateObject(null, null, History.getLocationHref());
            }

            // Clean
            History.expectedStateId = false;

            // Check if we are the same state
            if (History.isLastSavedState(newState)) {
                // There has been no change (just the page's hash has finally propagated)
                //History.debug('History.onPopState: no change', newState, History.savedStates);
                History.busy(false);
                return false;
            }

            // Store the State
            History.storeState(newState);
            History.saveState(newState);

            // Force update of the title
            History.setTitle(newState);

            // Fire Our Event
            History.Adapter.trigger(window, 'statechange');
            History.busy(false);

            // Return true
            return true;
        };
        History.Adapter.bind(window, 'popstate', History.onPopState);
    }

    /**
     * Bind to statechange Event
     */
    History.Adapter.bind(window, 'statechange', function() {

        if (!hasHistoryApi) {
            return;
        }

        var State = History.getState();

        if (!inAppAction) {

            // NOTE this is temporary so that the configurator works with
            // history.js until the configurator stops using pushState
            // TODO remove this condition! Currently nowhere in the app is
            // using the hash other than the configurator, in future it
            // probably will
            if (window.location.hash.replace(/^#/, '') === '' && window.location.href.indexOf('/configurator') === -1) {
                window.location.href = State.url;
            }

        }
        inAppAction = false;

        /**
         * Uncomment the History.log to see the push/pop state data
         */
        // History.log(State.data, State.title, State.url);
    });

    /**
     * this pushes the state of the app to the title bar and browser URL
     */
    function pushState (obj) {
        /**
         * this is kind of a hack to drive the history from this utility
         * allowing you to differentiate in app actions and browser actions
         */
        inAppAction = true;
        currentTitle = obj.title;
        currentURL = obj.uri;
        currentData = obj.data ? obj.data : null;

        if (hasHistoryApi) {
            History.pushState(currentData, currentTitle, currentURL);
        }
    }

    // NOTE that ideally this shouldn't exist as the angular app
    // that is the configurator is shouldn't be pushing the state (which
    // in turn fires statechange) it should only fire hashchange
    function setInAppAction () {
        inAppAction = true;
    }

    // Override History.onPopState in order to be able to change routes at configurator
    overridePopState();

    return {
        historyApi: History,
        pushState: pushState,
        setInAppAction: setInAppAction,
        getCurrentTitle: function() {
            return currentTitle;
        },
        getCurrentURL: function() {
            return currentURL;
        }
    };
});
