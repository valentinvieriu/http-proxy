var aemsearch = aemsearch || {};
var console = window.console || { log: function() {},debug: function() {},dir: function() {}};

aemsearch.trackingProperties = {
	lastSearchResultComponent:undefined,
	searchResultTrackingPageId:undefined,
	searchResultTrackingComponentIdx:undefined,

	lastSearchFieldComponent:undefined,
	searchFieldTrackingComponentIdx:undefined,
	searchFieldTrackingPageId:undefined,

	searchResultItemIdx:0,
	searchMoreClickCount:0

};
aemsearch.resetResultItemIndex = function() {
	aemsearch.trackingProperties.searchResultItemIdx=0;
};
aemsearch.incResultItemIndex = function() {
	return aemsearch.trackingProperties.searchResultItemIdx++;
};
aemsearch.resetSearchMoreClickCount = function() {
	aemsearch.trackingProperties.searchMoreClickCount=0;
};
aemsearch.incSearchMoreClickCount = function() {
	return ++aemsearch.trackingProperties.searchMoreClickCount;
};

aemsearch.isTrackingEnabled = function() {
	if (window.digitals2 !== undefined && window.digitals2.tracking !== undefined && window.digitals2.tracking.api !== undefined) {
		return !window.digitals2.tracking.api.isTrackingDisabled();
	} else {
		return false;
	}

};

aemsearch.setSearchResultTrackingComponent = function(component) {
	if (typeof(aemsearch.trackingProperties.searchResultTrackingComponentIdx)==="undefined") {
		var properties = window.digitals2.tracking.api.initComponentTracking(component);
		aemsearch.trackingProperties.searchResultTrackingComponentIdx = properties.componentIndex;
		aemsearch.trackingProperties.searchResultTrackingPageId = properties.pageId;
	} else {
		window.digitals2.tracking.api.updateComponentTracking(aemsearch.trackingProperties.searchResultTrackingComponentIdx,
															component,
															aemsearch.trackingProperties.searchResultTrackingPageId);
	}
	aemsearch.trackingProperties.lastSearchResultComponent = component;
};

aemsearch.getSearchResultTrackingComponent = function() {
	return aemsearch.trackingProperties.lastSearchResultComponent;
};

aemsearch.setSearchFieldTrackingComponent = function(component) {
	if (typeof(aemsearch.trackingProperties.searchFieldTrackingComponentIdx)==="undefined") {
		var properties = window.digitals2.tracking.api.initComponentTracking(component);
		aemsearch.trackingProperties.searchFieldTrackingComponentIdx = properties.componentIndex;
		aemsearch.trackingProperties.searchFieldTrackingPageId = properties.pageId;
	} else {
		window.digitals2.tracking.api.updateComponentTracking(aemsearch.trackingProperties.searchFieldTrackingComponentIdx,
															component,
															aemsearch.trackingProperties.searchFieldTrackingPageId);
	}

	aemsearch.trackingProperties.lastSearchFieldComponent = component;
};

aemsearch.storeAemsTrackingCookie = function(value) {
	if (typeof(cookiecontroller) !=="undefined") {
		cookiecontroller.api.setCookie("aems_tracking", value);
	}
};

aemsearch.trackSearchFieldIdentification = function() {
	if (aemsearch.isTrackingEnabled()) {
		var component ={
				componentInfo:{
					/** As search is a global component, the ID should be a concatenation of the word "global" + componentName + timestamp of creation date or version of the search. */
					componentID: 				"global : search fields : " + new Date().getTime(),
					/** Component name is onsite search. */
					componentName: 				"Search field",
					/** Stay empty for onsite search. */
					componentHeadline: 			""
				},
				category:{
					/** Primary category is "application" */
					primaryCategory: 			"Application",
					/** Subcategory is "search" */
					subCategory01: 				"Search",
					/** Type is "custom" */
					componentType: 				"Custom"
				}
		};
		aemsearch.setSearchFieldTrackingComponent(component);
	}
};




