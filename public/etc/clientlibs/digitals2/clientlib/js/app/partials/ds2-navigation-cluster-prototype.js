/**
 * partial: navigation-top
 * author: ronny
 *
 * this file is referenced in /app/templates/pages/navigation.hbs
 */

(function(window, document, $, undefined) {

  /**
   * keep everything in our digitals2 namespace
   * window.digitals2.loremIpsum = 'dolor sit';
   */

  $.widget('digitals2.ds2NavigationCluster', {

    options: {
      color: 'yellow'
    },

    scope: undefined,
    shadowRoot: undefined,
    subMenuDistanceHoverEffect: 14,
    flyout: undefined,
    $flyout: undefined,
    mainMenu: undefined,
    mainMenuSub: undefined,
    clusterSub: undefined,
    additionalButtons: undefined,
    clusterIsOpen: false,
    salesbarIsOpen: false,
    mediaQuerie: '',

    _create: function() {
      this.scope = this.element;
      this.hiresNavigationCluster = this.element;
      this.clusterSub = $('.ds2-cluster-navigation-sub', this.element);
      this.clusterSubList = $('.ds2-cluster-navigation-sub-list', this.element);
      this.additionalButtons = $('.ds2-additionalButtons', this.element);
      this.salesbar = $('.ds2-navigation-cluster-salesbar', this.element);
      this.breadcrump = $('.ds2-breadcrump', this.element);
      this.mediaQueriesInit();
      this.additionalButtonsBuild();
      this.clusterBuild();
      this.stickyBehavior();


      this.element.bind('clusterSubClose', function(e) {
        self.clusterSubClose();
      });

      $(window)
        //.unbind('scroll')
        .bind('scroll', function() {
          var decision = self.salesbarIsScrolledIntoView(self.salesbar);
          if (decision === false) {
            self.salesbarClose();
          }
          if (self.mediaQuerie !== 'small') {
            self.clusterSubClose();
          }

          if (self.mediaQuerie && self.mediaQuerie === 'small') {
            if ($(window).scrollTop() > 0) {
              // hide all levels except last one
              $('.ds2-navigation-cluster--breadcrump-path a:not(:last-child)').hide(300);
              $(self.breadcrump).css({
                minHeight: 60
              });
            } else {
              // show all levels
              $('.ds2-navigation-cluster--breadcrump-path a').show(300);
              $(self.breadcrump).css({
                minHeight: ''
              });
            }
          }
        })
        .bind('resize', function() {
          if (self.mediaQuerie !== 'small') {
            $('.ds2-breadcrump-button-primary').css('display', 'inline');
          } else {
            $('.ds2-breadcrump-button-primary').css('display', 'block');
          }
          if (self.salesbarIsOpen) {
            self.salesbarOpen();
          }

          if (self.clusterIsOpen) {
            self.clusterSubOpenAnimate();
          }

          $('.sticky-wrapper').css({
            height: $('.sticky-wrapper .ds2-navigation-cluster--container').height()
          });
        });

    },

    _destroy: function() {
    },
    stickyBehavior: function() {
      var self = this;
      $('.ds2-navigation-cluster-wrapper').sticky({topSpacing: 0});
      $('.ds2-navigation-cluster-wrapper').on('sticky-start', function() {
          self.clusterStickyStart();
      });
      $('.ds2-navigation-cluster-wrapper').on('sticky-end', function() {
          self.clusterStickyEnd();
      });
    },
    mediaQueriesInit: function() {
      var self = this,
          widthMatchSmall = window.matchMedia('all and (max-width: 480px)'),
          widthMatchMedium = window.matchMedia('all and (min-width: 481px) ' +
              'and (max-width: 768px)'),
          widthMatchLarge = window.matchMedia('all and (min-width: 769px) ' +
              'and (max-width: 1280px)');

      var widthHandlerLarge = function(matchList) {
        if (matchList.matches) {
          self.mediaQuerie = 'large';
        }
      };

      var widthHandlerMedium = function(matchList) {
        if (matchList.matches) {
          self.mediaQuerie = 'medium';
        }
      };

      var widthHandlerSmall = function(matchList) {
        if (matchList.matches) {
          self.mediaQuerie = 'small';
        }
        self.clusterSubClose();
      };

      widthMatchSmall.addListener(widthHandlerSmall);
      widthMatchMedium.addListener(widthHandlerMedium);
      widthMatchLarge.addListener(widthHandlerLarge);
      widthHandlerSmall(widthMatchSmall);
      widthHandlerMedium(widthMatchMedium);
      widthHandlerLarge(widthMatchLarge);

    },
    additionalButtonsBuild: function() {
      var buttonArr = $(this.additionalButtons).find('.ds2-buttonShopping');
      self = this;
      $.each(buttonArr, function(index, button) {
        $(button)
          .unbind('click touchend')
          .bind({'click touchend': function(e) {
            e.preventDefault();
            self.salesbarClick();
          },
          mouseenter: function() {

          },
          mouseleave: function() {

          }
         });
      });

    },
    clusterBuild: function() {
      var breadcrumbButton = $(this.hiresNavigationCluster)
              .find('.ds2-breadcrump-button'),
          self = this;

      $('a.ds2-navigation-cluster-first-row', this.clusterSubList)
          .unbind('click touchend')
          .bind({
            'click touchend': function(e) {

              self.subClusterClick(e);
              e.preventDefault();
            }
          });

      $('.ds2-cluster-navigation-sub-sub-list a', this.clusterSubList)
          .unbind('click touchend')
          .bind({
            'click touchend': function(e) {

              self.subSubClusterClick(e);
              e.preventDefault();
            }
          });

      $('a', this.breadcrump)
          .unbind('click touchend')
          .bind({
            'click touchend': function(e) {
              e.preventDefault();

              if (self.clusterIsOpen) {
                $(breadcrumbButton).removeClass('ds2-active');
                self.clusterSubClose();
              } else {
                $(breadcrumbButton).addClass('ds2-active');
                self.clusterSubOpen();
              }
            }
          });

    },

    subClusterClick: function(e) {
      var newHeight,
          subList = $(e.currentTarget).parent(),
          elementIsOpen = false,
          self = this;


      $('.ds2-breadcrump-button-primary.level-2')
        .html(' ')
        .removeClass('ds2-cluster-headcolor-inactiv ds2-cluster-headcolor-activ');


      //if is page without children --> ds2-cluster-headcolor-activ
      log('sublist length: ', $('.ds2-cluster-navigation-sub-sub-list li', subList).length);
      if ($('.ds2-cluster-navigation-sub-sub-list li', subList).length <= 0) {
         $('.ds2-breadcrump-button-primary.level-2').addClass('ds2-cluster-headcolor-activ');
      }

      $('.ds2-navigation-cluster--breadcrump-path .level-3').prev().remove();
      $('.ds2-navigation-cluster--breadcrump-path .level-3').remove();

      $('.ds2-breadcrump-button-primary.level-2').append($('a.ds2-navigation-cluster-first-row', subList).text());

      //tell sublist it is open
      if ($(e.currentTarget).hasClass('open')) {
        $(e.currentTarget).removeClass('open ds2-active');
        elementIsOpen = true;
        //set height to 0 to close nav element
        newHeight = 0;
      } else {
        $('.ds2-cluster-navigation-sub-list a').removeClass('open ds2-active');
        $(e.currentTarget).addClass('open ds2-active');

        $('li', subList).addClass('ds2-cluster-display');
        $('.ds2-navigation-cluster-first-row', subList).addClass('ds2-cluster-color');

        newHeight = $('ul', subList).height();
      }

      $('ul li', subList).css({
        display: 'block'
      });

      this.clusterSubOpenAnimate();

      $('ul li', subList).css({
        display: ''
      });

      if (!elementIsOpen) {
        $('ul', subList)
        .css({
          height: 0
        });
      }

      $('ul', subList)
        .animate({
          height: newHeight
        }, 300);


      self.hideSubListElements();

    },
    subSubClusterClick: function(e) {
      var subSubList = $(e.currentTarget).parent(),
          self = this;


      $('.ds2-cluster-navigation-sub-sub-list a').removeClass('ds2-cluster-color');
      $('a', subSubList).addClass('ds2-cluster-color');

      $('.ds2-navigation-cluster--breadcrump-path .ds2-cluster-headcolor-activ')
        .removeClass('ds2-cluster-headcolor-activ');


      $('.ds2-navigation-cluster--breadcrump-path .level-3').prev().remove();
      $('.ds2-navigation-cluster--breadcrump-path .level-3').remove();

      $('.ds2-breadcrump .ds2-navigation-cluster--breadcrump-path').append(
        '<span>/</span>' +
        '<a href="" class="ds2-breadcrump-buttons ds2-cluster-headcolor-activ level-3">' + $(e.currentTarget).text() + '</a>');
    },
    hideSubListElements: function() {
      var subList = $('.ds2-cluster-navigation-sub-list a:not(.open)').parent();

      $('ul', subList)
        .animate({
          height: 0
        }, 300, function() {

          $('.ds2-cluster-navigation-sub-sub-list li', subList)
            .removeClass('ds2-cluster-display');
          $('.ds2-cluster-navigation-sub-sub-list', subList).css({
            height: ''
          });
          $('.ds2-cluster-navigation-sub-list a:not(.open)').removeClass('ds2-cluster-color');
        });



    },
    clusterStickyStart: function() {
      $(this.additionalButtons).fadeIn();
      $('.ds2-navigation-top').trigger('flyoutClose');
      $('.ds2-navigation-top').trigger('salesbarClose');
    },
    clusterStickyEnd: function() {
      $(this.additionalButtons).hide();
    },
    clusterSubOpen: function() {
      self.clusterIsOpen = true;
      $(this.clusterSub).show();
      this.clusterSubOpenAnimate();
      if (this.mediaQuerie === 'large')
        this.clusterSubScrollDetectInit();
      this.salesbarClose();

      $('.ds2-navigation-top').trigger('flyoutClose');
      $('.ds2-navigation-top').trigger('salesbarClose');
      $('.ds2-navigation-top').trigger('mainMenuMobileClose');

    },
    clusterSubOpenAnimate: function() {

     if (self.mediaQuerie !== 'small') {
        clusterSubHeight = $(this.clusterSub)
          .find('.ds2-cluster-navigation-sub-list').outerHeight() + 40 + 'px';
      } else {
        clusterSubHeight = $(window).height();
      }
      log(clusterSubHeight);
     $(this.clusterSub)
         .stop()
         .animate({height: clusterSubHeight},{duration: 300, easing: 'swing'});
    },
    clusterSubClose: function() {
      var breadcrumbButton = $('.ds2-breadcrump-button', self.hiresNavigationCluster);
      $(breadcrumbButton).removeClass('ds2-active');
      self.clusterIsOpen = false;
      $(this.clusterSub)
          .stop()
          .animate({height: 0},{duration: 200, easing: 'swing',
            complete: this.clusterSubCloseEnded});
    },
    clusterSubCloseEnded: function() {
      $(this.clusterSub).hide();
    },
    clusterSubScrollDetectInit: function() {
      var self = this;
    },
    clusterSubScrolledIntoView: function(elem)
    {
      var docViewTop = $(window).scrollTop(),
          elemTop = $(elem)[0].offsetTop,
          elemBottom = elemTop + $(elem).height(),
          decision = (elemBottom >= docViewTop);
      return decision;
    },
    salesbarClick: function() {
      if (this.salesbarIsOpen === true) {
        this.salesbarClose();
      } else {
        this.salesbarOpen();
      }
    },
    salesbarClickFromExtern: function() {
      if (this.salesbarIsOpen === true) {
        this.salesbarClose();
      } else {
        this.salesbarOpenScrollTo();
        this.salesbarOpen();

      }
    },
    salesbarOpenScrollTo: function() {
      var offsetTop = $(this.salesbar)[0].offsetTop;
      $('html, body').animate({
        scrollTop: offsetTop
      }, 500);
    },
    salesbarOpen: function() {
      var self = this,
          buttonAdditional = $('.additional', this.additionalButtons),
          buttonArr = $('.ds2-buttonShopping', this.additionalButtons);

      this.salesbarIsOpen = true;
      $(this.salesbar).show();
      this.clusterSubClose();
      this.salesbarOpenAnimate();

      buttonAdditional.addClass('disable');
      buttonArr.addClass('ds2-active');
      if (self.mediaQuerie === 'small') {
        $('.ds2-breadcrump').addClass('salesbar-border-on');
        $('.ds2-navigation-cluster-salesbar').removeClass('salesbar-border-off');
      }
    },
    salesbarOpenAnimate: function() {
      salsebarHeight = $('.ds2-navigation-cluster-salesbar .ds2-navigation-cluster-salesbar-list').outerHeight(); //'57px';
      $(this.salesbar)
          .stop()
          .animate({height: salsebarHeight},{duration: 300, easing: 'swing'});
    },
    salesbarClose: function() {
      var buttonAdditional = $('.additional', this.additionalButtons),
          buttonArr = $('.ds2-buttonShopping', this.additionalButtons);


      buttonAdditional.removeClass('disable');
      buttonArr.removeClass('ds2-active');

      this.salesbarIsOpen = false;
      $(this.salesbar)
          .stop()
          .animate({height: '0px'},{duration: 200, easing: 'swing',
            complete: this.salesbarCloseEnded});
      if (self.mediaQuerie === 'small') {
        $('.ds2-breadcrump').removeClass('salesbar-border-on');
        $('.ds2-navigation-cluster-salesbar').addClass('salesbar-border-off');
      }
    },
    salesbarCloseEnded: function() {
      $(this.salesbar).hide();
    },
    salesbarIsScrolledIntoView: function()
    {
      return false;
    }

  });

  $(window).on('initializeComponents', function() {
    $('.ds2-navigation-cluster').ds2NavigationCluster();
  });

}(window, document, jQuery));
