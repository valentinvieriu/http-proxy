(function(window, document, $, undefined) {
  $.widget('digitals2.ds2TrackingMagazineOverview', $.digitals2.ds2TrackingBase, {

    _init: function() {
      var self = this;
      self.options.trackedArticlesIDs = [];
    },

    /**
     * Overrides listenerInit. Implements component tracking and event
     * tracking for page links, filters and the show more button.
     * @return {None}     None
     */
    _listnersInit: function() {
      var self = this;
      self.showMoreText =  $(".ds2-magazine--overview-showmore span",self.element).text();

      $(self.element).on('ds2-articles-loaded', function() {
        var trackingComponent = $(this).data('tracking-component');
        var componentID = trackingComponent.componentInfo.componentID;
        trackingComponent.componentInfo.componentHeadline = self._getArticleHeadlines(this, false);
        self.api.initComponentTracking(componentID, trackingComponent, self.api.getCurrentPageIndex());

        self._registerTrackedArticles(this);
      });

      $(self.element).on('click', '.ds2-magazine--thumb a', function(e) {
        e.preventDefault();
        self._trackMagazineLink(e);          
      });

      $(self.element).on('ds2-articles-show-more', function (e, element) {
        self._trackShowMoreButton(e, element);
      });

      $(self.element).on('ds2-articles-filter', function (e, element) {
        self._trackArticleFilter(e, element);
      });

      this._super();
    },

    /**
     * Tracks the links in the magazine overview component
     * @param  {Object} e   The click event
     * @return {None}       None
     */
    _trackMagazineLink: function(e) {
      var self = this;
      var parent = $(e.target).closest('.ds2-magazine--thumb');
      var link = parent.find('.ds2-magazine--thumb-link');
      var trackOptions = self.bmwTrackOptionsBuilder.options().build();
      var href = parent.find('a').attr('href');
      var eventName = link.text();
      var cause = parent.find('.ds2-magazine--thumb-headline').text();
      var active = {active:true};
      var eventPoints = parent.data('article-index');

      trackOptions.content = active;
      trackOptions.name = 'page_link';

      var pEvent = self._populateClickEvent(e, trackOptions.name, href, eventName, cause);
      pEvent.eventInfo.eventPoints = eventPoints;
      dataTracking = self._parseDataFromEvent(pEvent,trackOptions, e, true);

      self._setWindowLocation(href, dataTracking.useTimer);
    },

    /**
     * Tracks the show more button in the magazine overview component
     * @param  {Object} e         The dispatcher event
     * @param  {Object} element   The element the event happend on 
     * @return {None}             None
     */
    _trackShowMoreButton: function(e, element) {
      var self = this;
      var parent = $(element).closest('.ds2-magazine--overview');
      var eventName = self.showMoreText;
      var eventAction = 'Show More';
      var eventTarget = self._getArticleHeadlines(parent, true);
      var eventPoints = self._getArticleIndizes(parent, true);
      var tEvent = self.eventBuilder.newEvent();
      var tOptions = self.bmwTrackOptionsBuilder.options();

      tEvent.eventName(eventName);
      tEvent.eventAction(eventAction);
      tEvent.eventPoints(eventPoints);
      tEvent.target(eventTarget);
      tEvent.primaryCategoryIsInteraction();

      tOptions.name('show_more');

      tEvent = tEvent.build();
      tOptions = tOptions.build();

      self._addEventAttributes(tEvent);

      window.digitals2.tracking.dispatcher.trackEvent(tEvent, tOptions);
      self._registerTrackedArticles(parent);
    },

    /**
     * Tracks the filter buttons in the magazine overview component
     * @param  {Object} e         The dispatcher event
     * @param  {Object} element   The element the event happend on 
     * @return {None}             None
     */
    _trackArticleFilter: function(e, element) {
      var self = this;
      var parent = $(element).closest('.ds2-magazine--overview');
      var eventName = $(element).text();
      var eventAction = 'Filter';
      var eventTarget = self._getArticleHeadlines(parent, false);
      var eventPoints = "";

      var tEvent = self.eventBuilder.newEvent();
      var tOptions = self.bmwTrackOptionsBuilder.options();

      tEvent.eventName(eventName);
      tEvent.eventAction(eventAction);
      tEvent.eventPoints(eventPoints);
      tEvent.target(eventTarget);
      tEvent.primaryCategoryIsInteraction();

      tOptions.name('filter');

      tEvent = tEvent.build();
      tOptions = tOptions.build();

      self._addEventAttributes(tEvent);

      window.digitals2.tracking.dispatcher.trackEvent(tEvent, tOptions);
    },

    /**
     * Returns a summary of all visible article headlines in the magazine overview.
     * @param  {String} element           The magazine overview component.
     * @param  {boolean} considerRegister Consider if the article is already tracked
     * @return {String}                   All article headlines
     */
    _getArticleHeadlines: function(element, considerRegister) {
      var self = this;
      var article = $('.ds2-magazine--thumb:visible', $(element));
      var componentHeadline = '';

      for(var i=0;i<article.length;i++) {
        var articleRegistered = false;
        var headline = $(article[i]).find('.ds2-magazine--thumb-headline');

        if(considerRegister) {
          articleRegistered = self._isArticleRegistered($(article[i]));
        }

        if(!articleRegistered) {
          if(componentHeadline === '') {
            componentHeadline = headline.text();
          } else {
            componentHeadline = componentHeadline + '|' + headline.text();
          }
        }
      }

      return componentHeadline;
    },

    /**
     * Returns an array of indezies of all visible article  in the magazine overview.
     * @param  {String} element           The magazine overview component.
     * @param  {Boolean} considerRegister Consider if the article is already tracked
     * @return {String}                   All article indezies
     */
    _getArticleIndizes: function (element, considerRegister) {
      var self = this;
      var articles = $('.ds2-magazine--thumb:visible', $(element));
      var componentIndizes = '';

      for(var i=0;i<articles.length;i++) {
        var articleRegistered = false;

        if(considerRegister) {
          articleRegistered = self._isArticleRegistered($(articles[i]));
        }

        if(!articleRegistered) {
          if(componentIndizes === '') {
            componentIndizes = i.toString();
          } else {
            componentIndizes = componentIndizes + '|' + i.toString();
          }
        }
      }

      return componentIndizes;
    },

    /**
     * Register Articles when they got tracked.
     * @param  {String} element The magazine overview component.
     * @return {None}           None
     */
    _registerTrackedArticles: function (element) {
      var self = this;
      var articles = $('.ds2-magazine--thumb:visible', $(element));

      articles.each(function() {
        var articleID = $(this).data('article-index');
        self.options.trackedArticlesIDs.push(articleID);
      });
    },

    /**
     * Returns if the article is allready tracked/registered.
     * @param  {String}  article The article to request.
     * @return {Boolean}         Is the article already tracked/registered.
     */
    _isArticleRegistered: function (article) {
      var self = this;
      var articleIDs = self.options.trackedArticlesIDs;
      var articleID = article.data('article-index');

      for(var i = 0;i < articleIDs.length;i++) {
        if(articleIDs[i] === articleID) {
          return true;
        }
      }

      return false;
    }
  });

}(window, document, jQuery));
