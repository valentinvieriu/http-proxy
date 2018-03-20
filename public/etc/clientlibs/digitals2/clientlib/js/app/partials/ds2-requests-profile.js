(function(window, document, $, undefined) {

    //dirty fix to hack the policy into the accordion
    $(".ds2-profile-form > .headline:eq(1), .ds2-profile-form > .copytext:eq(1) ").wrapAll('<div class="baseform base section policy"><form name="policy" class="row ds2-inactive"><div class="before-success columns"><fieldset></fieldset></div></form><div class="loading__base"><p>Loading...</p></div></div>');


    $.widget('digitals2.ds2RequestsProfile', {
        _create: function() {
            var self = this;
            self.profileObj = [];
            self.accContainer = $('.form-requests .baseform fieldset', self.element);
            self.accHeader = self.element.find('form fieldset .headline:first-child');
            self.editBtn = self.element.find('.ds2-request--edit-btn');
            self.personalEditBtn = self.element.find('.profile .ds2-request--edit-btn');
            self.cancelBtn = self.element.find('.ds2-request--cancel-edit-btn');
            self.submitBtn = self.element.find('.ds2-request--submit-btn');
            self.dateOpenBtn = self.element.find('.nn-ui-input__date--opener');
            self.personalInterests = self.element.find('.interests__base');

            $('<span class="ds2-icon ds2-icon--plus-white ds2-icon--l ds2-icon--bg"></span>').appendTo(self.accHeader);

            var cqIsInEditMode = false;
            if (window.CQ && window.CQ.WCM && window.CQ.WCM.isEditMode() && !window.CQ.WCM.isPreviewMode()) {
                cqIsInEditMode = true;
            }

            if(!cqIsInEditMode){

                self.dateOpenBtn.addClass('ng-hide');

                // necessary for communication to vue-expandable
                document.querySelector('body').addEventListener('bridge.expandables.close', function () {
                    self.closeAll();
                });

                self.dateOpenBtn.addClass('ng-hide');


                $(self.accHeader).on('click', function(e){
                    // necessary for communication to vue-expandable
                    e.target.dispatchEvent(new Event('bridge.expandables.close', {'bubbles':true}));
                    //document.querySelector('body').dispatchEvent(new Event('ds2-exp-close-all'));
                    if($(this).is('.ds2-active')){
                        self.hide($(this));
                    }else{
                        self.closeAll();
                        self.show($(this));
                    }
                });

                self.closeAll();

                $(self.editBtn).not(self.personalEditBtn).on('click', function(e){
                    e.preventDefault();

                    var editMode = $(this).closest('.ds2-request--edit-mode');
                    var acc = editMode.closest('form');

                    editMode.addClass('ds2-active');
                    editMode.find('input, select').removeAttr('disabled');

                    self.updateAccHeight(acc);
                });

                $(self.personalEditBtn).on('click', function(e){
                    e.preventDefault();

                    var editMode = $(this).closest('.ds2-request--edit-mode');
                    var acc = editMode.closest('form');

                    editMode.addClass('ds2-active');
                    editMode.find('input, select').removeAttr('disabled');
                    self.dateOpenBtn.removeClass('ng-hide');

                    self.updateAccHeight(acc);
	                self.setUserProfile();
                });

                $(self.cancelBtn).on('click',function(e) {
                    e.preventDefault();

                    var editMode = $(this).closest('.ds2-request--edit-mode');
                    var acc = editMode.closest('form');

                    editMode.removeClass('ds2-active');
                    editMode.find('input, select').attr('disabled', 'disabled');
                    self.dateOpenBtn.addClass('ng-hide');

                    self.updateAccHeight(acc);

                    self.profileObj = self.resetProfilFields(self.profileObj);
                });

                $(self.personalInterests).on('click', function () {
                    var editMode = $(this).closest('.ds2-request--edit-mode');
                    var acc = editMode.closest('form');

                    self.updateAccHeight(acc);
                });

                $('#formprofile').on('ds2-profile-form:success', function () {
                    self.closeAll();
	                self.setUserProfile();
                });

                setTimeout(function(){
                    var formFields = self.accContainer.find('input, select');

                    formFields.attr('disabled', 'disabled');
                    self.element.find('form').on('keyup', function() {
                        self.updateAccHeight($(this));
                    });
                    formFields.on('change', function() {
                        self.updateAccHeight($(this).closest('form'));
                    });
                }, 500);
            }
        },
	    setUserProfile: function(){
		    var profile = $('.profile');
		    var inputs = profile.find('input:not(:checkbox)');
		    var selects = profile.find('select');
		    var checkboxes = profile.find('input:checkbox');

		    this.profileObj = this.saveProfileFields(inputs, this.profileObj);
		    this.profileObj = this.saveProfileFields(selects, this.profileObj);
		    this.profileObj = this.saveProfileCheckboxes(checkboxes, this.profileObj);
        },
        show: function(btn){
            var pan = btn.closest('fieldset').find('> .section.base:not(:first)');
            var acc = pan.closest('form');
            var delAccBtn = btn.closest('fieldset').find('> .multistepline__submit');

            btn.addClass('ds2-active');
            pan.removeClass('ds2-inactive');
            delAccBtn.removeClass('ds2-inactive');
            acc.removeClass('ds2-inactive');

            btn.find('span.ds2-icon').removeClass('ds2-icon--plus-white').addClass('ds2-icon--minus-white');

            this.updateAccHeight(acc);
        },

        hide: function(btn){
            var pan = btn.closest('fieldset').find('> .section.base:not(:first)');
            var acc = pan.closest('form');
            var delAccBtn = btn.closest('fieldset').find('> .multistepline__submit');

            btn.removeClass('ds2-active');
            pan.addClass('ds2-inactive');
            delAccBtn.addClass('ds2-inactive');
            acc.addClass('ds2-inactive');

            btn.find('span.ds2-icon').addClass('ds2-icon--plus-white').removeClass('ds2-icon--minus-white');

            this.resetEditMode(btn.closest('.ds2-request--edit-mode').find('.ds2-request--edit-btn'));
            this.updateAccHeight(acc, 40);
            this.updateAccHeightsAfterLoading();
        },

        closeAll: function() {
            var self = this;

            self.accHeader.each(function(){
                self.hide($(this));
            });
        },

        updateAccHeight: function (acc, height) {
            var accHeight = 40;
            var editMode = acc.find('.before-success');
            if(height === undefined) {
                accHeight = editMode.outerHeight(true);
            } else {
                accHeight = height;
            }
            acc.css({
                'height': accHeight
            });
        },

        updateAccHeightsAfterLoading: function () {
            //As Headlines are cut on smartphones. Measuring and setting height manually.
            this.element.find(".baseform").each(function () {
                var accForm = $(this).find("form");
                var headLineBase = accForm.find('.headline__base');
                if (headLineBase) {
                    var headLineHeight = headLineBase.outerHeight(true);
                    if (headLineHeight > 40 && accForm) {
                        accForm.css({'height': headLineHeight});
                        //Align the Icon vertically with text.
                        var expandButtton = headLineBase.next();
                        if (expandButtton && expandButtton.hasClass('ds2-icon--plus-white')) {
                            expandButtton.css({'top': (headLineHeight - 40) / 2});
                        }
                    }
                }
            });
        },

        resetEditMode: function(btn){
            var editMode = btn.closest('.ds2-request--edit-mode');

            btn.removeClass('ds2-active');
            editMode.removeClass('ds2-active');
            editMode.find('input, select').attr('disabled', 'disabled');
        },

        resetProfilFields: function(fieldObject) {
            var profile = $('.profile');
            var inputs = profile.find('input:not(:checkbox)');
            var selects = profile.find('select');
            var checkboxes = profile.find('input:checkbox');
            var objLength = Object.keys(fieldObject).length;

            if(profile !== undefined && objLength !== 0) {
                this.setProfileFields(inputs, fieldObject);
                this.setProfileFields(selects, fieldObject);
                this.setProfileFieldsCheckboxes(checkboxes, fieldObject);
            }

            return [];
        },

        saveProfileFields: function(fields, object) {
            fields.each(function() {
                var key = $(this).attr('id');
                var value = $(this).val();
                object[key] = value;
            });

            return object;
        },

        saveProfileCheckboxes: function(fields, object) {
            fields.each(function() {
                var key = $(this).attr('id');
                var value = $(this).is(':checked');
                object[key] = value;
            });

            return object;
        },

        setProfileFields: function(fields, object) {
            fields.each(function() {
                var key = $(this).attr('id');
                $(this).val(object[key]);
            });
        },

        setProfileFieldsCheckboxes: function(fields, object) {
            fields.each(function() {
                var key = $(this).attr('id');
                $(this).prop('checked', object[key]);
            });
        }

    });
    $(window).on('initializeComponents', function() {
        $('.ds2-profile-form-js').ds2RequestsProfile();
    });

}(window, document, jQuery));
