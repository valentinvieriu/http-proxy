/**
 * @author Andrei Dumitrescu
 * @description Accordion component refactoring using AMD
 */
define(
    'ds2-accordion-element',
    [
        'use!jquery',
        'ds2-image-lazyLoad',
        'use!jquery-ui',
        'use!log',
        'ds2-main'
    ],
    function($, ds2imagelazyLoad) {
        'use strict';

        function ds2AccordionElementAmd(element) {
            new ds2imagelazyLoad(element);
            this.options = {
                titleClass: '.ds2-accordion--title',
                headClass: '.ds2-accordion--head'
            };
            this.element = $(element);
            this.create();
            this.registerEventListeners();
        };

        ds2AccordionElementAmd.prototype.create = function() {
            var self = this,
                activeId = self.element.find('li:has(.ds2-accordion--selected)').index(),
                activated = (activeId !== -1) ? activeId : false;

            self.element.accordion({
                animate: 500,
                collapsible: true,
                header: self.options.titleClass,
                active: activated,
                heightStyle: 'content',
                activate: function(event, ui) {
                    if (!$(ui.newHeader).hasClass('ui-state-active')) {
                        self.showExpandButton($('.ds2-accordion--hide-all', self.element), self.element);
                    }
                }
            });

            var openAccordion = $('.ds2-accordion--title.ui-state-active', self.element);
            if (openAccordion.length > 0) {
                setTimeout(function() {
                    openAccordion.parent('.ds2-tracking-js--accordion-expand').trigger('ds2-accordion-event', ['automatic']);
                }, 500);
            }

        };

        ds2AccordionElementAmd.prototype.showExpandButton = function(target,element) {
            target.addClass('disable');
            $('.ds2-accordion--show-all', element).removeClass('disable');
        };

        ds2AccordionElementAmd.prototype.registerEventListeners = function() {
            var self = this;
            $('.ds2-accordion--show-all', self.element).on('click', function(e) {
                e.preventDefault();
                $(e.currentTarget).addClass('disable');
                $('.ds2-accordion--hide-all', self.element).removeClass('disable');

                $(self.options.headClass, self.element).accordion({
                    heightStyle: 'content',
                    collapsible: true,
                    active: 0
                });
                return false;
            });
            $('.ds2-accordion--list-item', self.element).off('click.track');
            $('.ds2-accordion--list-item', self.element).on('click.track', function(e) {
              $(this).trigger('ds2-accordion-event', ['active', e]);
            });
            //COLLAPSE ALL
            $('.ds2-accordion--hide-all', self.element).on('click', function(e) {
                e.preventDefault();
                self.showExpandButton(e.currentTarget, self.element);
                $('.accordion').accordion({
                    heightStyle: 'content',
                    collapsible: true,
                    active: false
                });
                return false;
            });
        };

        return ds2AccordionElementAmd;

    }
);
