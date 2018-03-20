define('ds2-accessoryteaser', ['use!jquery', 'historyManager'], function ($, historyManager) {
    'use strict';

    var ds2accessoryteaser = function (element) {
        this.element = $(element);
        this._create();
    };

    Object.assign(ds2accessoryteaser.prototype, {
    	
    	$accessoryteaser: undefined,
    	
    	currentCategory: undefined,
    	homeCategory: 'catalog-home',
    	
    	_create: function () {
            this.$accessoryteaser = this.element;
            
            var self = this,
                $catalogBaseAnchor = this.$accessoryteaser.find('a');
            
            var catalogBase = $catalogBaseAnchor.attr("href");
            catalogBase = catalogBase.substring(0, catalogBase.length - ".html".length);
            
            this.currentCategory = this._getCategory(window.location.href, catalogBase);

            var History = historyManager.historyApi;
            History.Adapter.bind(window, 'statechange', function() {
            	var state = History.getState();
            	//console.log("location", window.location.href, "state", state.url, state);
            	self._updateTeaser(state.url, catalogBase);
            });
        },
        
        _destroy: function() {
        },

    	_getCategory: function (url, catalogBase) {
        	var i = url.indexOf(catalogBase);
        	if (i == -1) {
        		return undefined;
        	}
        	var category = url.substring(i + catalogBase.length);
        	var sep = category.charAt(0);
        	// check, if catalog-home page
        	if (sep == '.') {
        		return this.homeCategory;
        	}
        	category = category.substring(1);
        	
        	// check sub-section separator
        	var j = category.indexOf('/');
        	if (j != -1) {
            	category = category.substring(0, j);
        	} else {
            	// check section separator
            	j = category.indexOf('.');
            	if (j == -1) {
            		return this.homeCategory;                		
            	}
            	category = category.substring(0, j);
        	}  
        	return category;
    	},
        
        _updateTeaser: function(url, catalogBase) {
        	
        	function replace(string, pattern, replacement) {
        		if (string === undefined || pattern === undefined || replacement === undefined) {
        			return string;
        		}
        		var re = new RegExp(pattern, 'g');
        		string = string.replace(re, replacement);
        		return string;
        	}
        	
        	var category = this._getCategory(url, catalogBase);
        	if (category === undefined) {
        		return;
        	}

        	var $teaserImage = this.$accessoryteaser.find('img');
        	
        	// replace category in image attributes
        	var attrs = ['src', 'data-img', 'data-interchange'];
        	for (var i=0; i<attrs.length; i++) {
        		var attr = attrs[i];
        		var value = $teaserImage.attr(attr);
        		value = replace(value, this.currentCategory, category);
	    		$teaserImage.attr(attr, value);
        	}
        	Foundation.libs.interchange.reflow();
        	
    		this.currentCategory = category;
        }
    });
    return ds2accessoryteaser;
});