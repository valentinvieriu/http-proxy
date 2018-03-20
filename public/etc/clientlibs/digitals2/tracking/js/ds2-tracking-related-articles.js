(function(window, document, $, undefined) {
  $.widget('digitals2.ds2TrackingRelatedArticles', $.digitals2.ds2TrackingBase, {

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
      var numberOfTeasers;
      self.showMoreText =  $('.ds2-magazine--overview-showmore span',self.element).text();

      $(self.element).on('ds2-related-articles-loaded', function() {
        var trackingComponent = $(this).data('tracking-component');
        var componentID = trackingComponent.componentInfo.componentID;

        trackingComponent.componentInfo.componentHeadline = self._getArticleHeadlines(this, false);
        self.api.initComponentTracking(componentID, trackingComponent, self.api.getCurrentPageIndex());
        self._registerTrackedArticles(this);
        numberOfTeasers = $('.ds2-relatedarticles--thumb:visible').length;
      });

      $(self.element).on('click', '.ds2-relatedarticles--thumb a', function(e) {
          e.preventDefault();

          var parent = $(this).closest('.ds2-relatedarticles--thumb');
          var parentHeadline = parent.find('.ds2-relatedarticles--thumb-headline');
          var chapterHeadline = $(self.element).find('.ds2-related-articles--headline');
          var thumbLink = parent.find('.ds2-relatedarticles--thumb-link');
          var tOptions = self.bmwTrackOptionsBuilder.options().build();
          var href = $(this).attr('href') || '';
          var eventName = thumbLink.text();
          var cause = chapterHeadline.text() + '::' + parentHeadline.text();
          var active = {active:true};
          var eventPoints = parent.data('article-index') + 1;

          tOptions.content = active;
          tOptions.name = 'page_link';

          var pEvent = self._populateClickEvent(e, tOptions.name, href, eventName, cause);
          pEvent.eventInfo.eventPoints = eventPoints;
          dataTracking = self._parseDataFromEvent(pEvent,tOptions, e, true);

          self._setWindowLocation(href, dataTracking.useTimer);
      });

      $(self.element).on('ds2-relatedarticles-show-more', function (e, element) {
        var eventName = self.showMoreText;
        var eventAction = 'Show More';
        var target = self._getArticleHeadlines(element, true, numberOfTeasers);
        var eventPoints = self._getArticleIndizes(element, true, numberOfTeasers);

        self._trackArticleEvent(eventName, eventAction, target, eventPoints);
        self._registerTrackedArticles(parent);

        numberOfTeasers = $('.ds2-relatedarticles--thumb:visible').length;
      });

      this._super();
    },

    /**
     * Builds a new Article Event
     * @param  {String} name   eventName
     * @param  {String} action eventAction
     * @param  {String} target target
     * @param  {String} points eventPoints
     * @return {None}          None
     */
    _trackArticleEvent: function(name, action, target, points) {
      var self = this;
      self._callExpandEvent(
          self.eventBuilder.newEvent()
              .eventName(name)
              .eventAction(action)
              .eventPoints(points)
              .target(target)
              .primaryCategoryIsInteraction()
              .build(),
          self.bmwTrackOptionsBuilder.options()
              .expandOptions()
              .build()
        );
    },

    /**
     * Returns a summary of all visible article headlines in the magazine overview.
     * @param  {String} element           The magazine overview component.
     * @param  {boolean} considerRegister Consider if the article is already tracked
     * @return {String}                   All article headlines
     */
    _getArticleHeadlines: function(element, considerRegister, numTeasers) {
      var self = this;
      var articles = $('.ds2-relatedarticles--thumb:visible', $(element));
      var componentHeadline = '' ||  $('.ds2-related-articles--headline', $(element)).text();

      for (var i = numTeasers, artLen = articles.length; i < artLen; i++) {
        var articleRegistered = false;
        var headline = $(articles[i]).find('.ds2-relatedarticles--thumb-headline');

        if(considerRegister) {
          articleRegistered = self._isArticleRegistered($(articles[i]));
        }

        if(!articleRegistered) {
          if(componentHeadline === '') {
            componentHeadline = headline.text();
          } else {
            if (i === numTeasers) {
              componentHeadline += '::' + headline.text();
            } else {
              componentHeadline += '|' + headline.text();
            }
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
    _getArticleIndizes: function (element, considerRegister, numTeasers) {
      var self = this;
      var articles = $('.ds2-relatedarticles--thumb:visible', $(element));
      var componentIndizes = '';

      for (var i = numTeasers, artLen = articles.length; i < artLen; i++) {
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
