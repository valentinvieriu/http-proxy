window.digitals2 = window.digitals2 || {};
window.digitals2.tracking = window.digitals2.tracking || {};

/**
 *
 * @type {{mapping: object,
 *         primaryCategoryMap: {
 *           pdf_download_icon_link: {
 *             primaryCategory: string
 *           },
 *           download_link: {
 *             primaryCategory: string
 *           },
 *           video_link: {
 *             primaryCategory: string
 *           },
 *           external_link: {
 *             primaryCategory: string
 *           },
 *           request_link: {
 *             primaryCategory: string
 *           },
 *           configurator_link: {
 *             primaryCategory: string
 *           },
 *           page_link: {
 *             primaryCategory: string
 *           },
 *           highlight_link: {
 *             primaryCategory: string
 *           },
 *           email_link: {
 *             primaryCategory: string
 *           },
 *           phone_number: {
 *             primaryCategory: string
 *           },
 *           internal_link: {
 *             primaryCategory: string
 *           },
 *           outbound_link: {
 *             primaryCategory: string
 *           }
 *         },
 *         initMapping: Function,
 *         initTracking: Function,
 *         mapComponent: Function,
 *         _trackingApiExists: Function,
 *         _getNavigationSourceID: Function,
 *         navCookieGetData: Function,
 *         _navCookieSave: Function,
 *         bmwTrack: Function,
 *         _triggerOriginalEvent: Function,
 *         localStorageSave: Function,
 *         localStorageRead: Function}}
 */
window.digitals2.tracking.dispatcher = {

  /**
   * The mapping
   */
  mapping: {},

  primaryCategoryMap: {
    'pdf_download_icon_link': {
      primaryCategory: 'Engagement'
    },
    'download_link': {
      primaryCategory: 'Engagement'
    },
    'video_link': {
      primaryCategory: 'Engagement'
    },
    'external_link': {
      primaryCategory: 'Interaction'
    },
    'request_link': {
      primaryCategory: 'Success'
    },
    'configurator_link': {
      primaryCategory: 'Success'
    },
    'page_link': {
      primaryCategory: 'Interaction'
    },
    'highlight_link': {
      primaryCategory: 'Engagement'
    },
    'email_link': {
      primaryCategory: 'Engagement'
    },
    'phone_number': {
      primaryCategory: 'Engagement'
    },
    'internal_link': {
      primaryCategory: 'Success'
    },
    'outbound_link': {
      primaryCategory: 'Engagement'
    },
    'anchor_link': {
      primaryCategory: 'Interaction'
    },
    'anchor_link_extern': {
      primaryCategory: 'Interaction'
    },
    'usabilla_link': {
      primaryCategory: 'Navigation'
    }
  },

  trackingNameMapping: {
    'download_link': 'download',
    'video_link': 'open_video',
    'external_link': 'outbound_click',
    'email_link': 'email',
    'phone_number': 'call',
    'outbound_click': 'outbound_click',
    'accordion_element': 'open_content',
    'accordion_element_row': 'open_content',
    'technical_data': 'selection',
    'main_navigation': 'open_navigation',
    'model_card': 'open_tooltip',
    'anchor_link_extern': 'outbound_click'
  },

  initMapping: function () {
    /**
     * Creates the event data.
     *
     * @param {string} type
     *      The event's type.
     * @param {string} name
     *      The event's name.
     * @param {boolean} timing
     *      The event's timing indicator.
     * @param {boolean} useTimer
     *      The event's useTimer.
     * @param {boolean} active
     *      The event's 'active' indicator.
     * @return {{active: boolean, name: string, timing: boolean, type: string, useTimer: boolean}}
     * @private
     */
    function data(type, name, timing, useTimer, active) {
      return {
        active: active,
        name: name,
        timing: timing,
        type: type,
        useTimer: useTimer
      };
    }

    var download = data('click', 'download', true, false, true);
    var open_video = data('click', 'open_video', true, false, true);
    var open_highlight = data('click', 'open_highlight', true, false, true);
    var outbound_click = data('click', 'outbound_click', true, false, true);
    var email = data('click', 'email', true, false, true);
    var call = data('click', 'call', true, false, true);
    var impression = data('impression', 'impression', true, false, true);
    var show_information_layer = data('click', 'show_information_layer', true, false, true);
    var progress = data('impression', 'progress', true, false, true);
    var milestone = data('impression', 'milestone', true, false, true);
    var expand_click = data('click', 'expand', true, false, true);
    var expand_impression = data('impression', 'expand', true, false, true);
    var internal_click = data('click', 'internal_click', false, false, true);
    var start_request = data('click', 'start_XXX', false, false, true);
    var start_vco = data('click', 'start_vco', false, false, true);
    var anchor_link = data('click', 'reach_viewport', true, false, true);
    var anchor_link_extern = data('click', 'reach_viewport', true, false, true);
    var share = data('click', 'share', true, false, true);
    var open_image = data('click', 'open_image', false, false, true);

    return {
      'ds2-accordion': {
        record_impressions: {
          record_impressions: expand_impression
        },
        record_click: {
          download_link: download,
          video_link: open_video,
          highlight_link: open_highlight,
          external_link: outbound_click,
          page_link: internal_click,
          email_link: email,
          request_link: start_request,
          configurator_link: data('click', 'start_vco', false, false, true),
          anchor_link: anchor_link,
          anchor_link_extern: anchor_link_extern
        }
      },
      anchor: {record_reach: {record_reach: {}}},
      'ds2-pre-configuration': {
        record_click: {
          page_link: internal_click,
          request_link: start_request,
          configurator_link: start_vco,
          anchor_link: anchor_link,
          anchor_link_extern: anchor_link_extern
        }
      },
      'ds2-bottom-disclaimer': {},
      'ds2-business-card': {
        record_click: {
          email_link: email,
          phone_number: call
        }
      },
      'ds2-contact-box': {
        record_click: {
          email_link: email,
          phone_number: call
        }
      },
      'ds2-content-overview': {
        record_click: {
          page_link: internal_click,
          anchor_link: anchor_link,
          anchor_link_extern: anchor_link_extern
        }
      },
      'ds2-navigation-content-bar': {
        record_click_menu: {},
        record_click: {
          download_link: download,
          video_link: open_video,
          highlight_link: open_highlight,
          external_link: outbound_click,
          page_link: data('click', 'internal_click', false, false, true),
          email_link: email,
          request_link: start_request,
          configurator_link: data('click', 'start_vco', false, false, true),
          anchor_link: anchor_link,
          anchor_link_extern: anchor_link_extern
        },
        record_click_salesbar_icon: data('click', 'open_sales_bar', true, true, true),
        record_click_next_best_action: {}
      },
      'ds2-content-presentation': {
        record_click_highlight_button: {
          record_click_highlight_button: open_highlight
        },
        record_click_item: {
          download_link: download,
          external_link: outbound_click,
          video_link: open_video,
          request_link: start_request,
          configurator_link: start_vco,
          page_link: internal_click,
          anchor_link: anchor_link,
          anchor_link_extern: anchor_link_extern
        },
        record_click_unfold: {
          record_click_unfold: expand_click
        }
      },
      'ds2-cluster-overview': {
        record_click_teaser: {
          download_link: download,
          external_link: outbound_click,
          highlight_link: open_highlight,
          video_link: open_video,
          email_link: email,
          request_link: start_request,
          configurator_link: start_vco,
          page_link: internal_click,
          anchor_link: anchor_link,
          anchor_link_extern: anchor_link_extern
        }
      },
      'ds2-basic-teaser': {
        record_click_teaser: {
          download_link: download,
          external_link: outbound_click,
          highlight_link: open_highlight,
          video_link: open_video,
          email_link: email,
          request_link: start_request,
          configurator_link: start_vco,
          page_link: internal_click,
          anchor_link: anchor_link,
          anchor_link_extern: anchor_link_extern
        }
      },
      'ds2-efficiency-layer': {
        record_click_item: {
          record_click_item: show_information_layer
        },
        record_click_inline_link: {
          download_link: download,
          video_link: open_video,
          external_link: outbound_click,
          page_link: internal_click,
          anchor_link: anchor_link,
          anchor_link_extern: anchor_link_extern
        }
      },
      'error-handling': {
        record_error_messages: {
          record_error_messages: data('impression', 'error', true, false, true)
        },
        record_click: {
          record_click: outbound_click,
          anchor_link: anchor_link,
          anchor_link_extern: anchor_link_extern
        }
      },
      'ds2-main-footer': {
        record_click: {

          download_link: download,
          external_link: outbound_click,
          outbound_click: outbound_click,
          highlight_link: open_highlight,
          video_link: open_video,
          email_link: email,
          request_link: start_request,
          configurator_link: start_vco,
          page_link: internal_click,
          anchor_link: anchor_link,
          anchor_link_extern: anchor_link_extern,
          share: share
        }
      },
      'ds2-gallery': {
        record_impressions: {
          record_impressions: data('impression', 'impression', true, false, true)
        },
        record_gallery_image_expansion: {
          record_gallery_image_expansion: data('click', 'open_image', true, false, true)
        },
        record_click_download: {
          record_click_download: download
        },
        record_video_start: {
          record_video_start: data('click', 'start_video', true, false, true)
        },
        record_video_progress_seconds: {
          record_video_progress_seconds: progress
        },
        record_video_progress_percent: {
          record_video_progress_percent: milestone
        },
        record_click_unfold: {
          record_click_unfold: expand_click
        }
      },
      'ds2-glossary-article': {
        record_click: {
          download_link: download,
          page_link: internal_click,
          video_link: open_video,
          request_link: start_request,
          configurator_link: start_vco,
          anchor_link: anchor_link,
          anchor_link_extern: anchor_link_extern
        }
      },
      'ds2-glossary-overview': {
        record_use_filter: {
          record_use_filter: data('click', 'simulated page', true, false, true)
        },
        record_click: {
          record_click: {}
        }
      },
      'info-i-disclaimer-layer': {
        record_click_item: {
          record_click_item: show_information_layer
        },
        record_click_inline_link: {
          download_link: download,
          video_link: open_video,
          external_link: outbound_click,
          page_link: internal_click,
          anchor_link: anchor_link,
          anchor_link_extern: anchor_link_extern
        }
      },
      'legal-image': {},
      'ds2-navigation-main': {
        record_click_item: {
          page_link: internal_click,
          anchor_link: anchor_link,
          anchor_link_extern: anchor_link_extern
        },
        record_click_search_icon: data('click', 'open_search', true, true, true),
        record_click_sales_bar: data('click', 'open_sales_bar', true, true, true)
      },
      'ds2-language-selection': {
        record_click: {
          page_link: internal_click,
          anchor_link: anchor_link,
          anchor_link_extern: anchor_link_extern
        }
      },
      'ds2-micro-story': {
        record_click_item: {
          pdf_download_icon_link: download,
          download_link: download,
          video_link: open_video,
          external_link: outbound_click,
          page_link: internal_click,
          email_link: email,
          request_link: start_request,
          configurator_link: start_vco,
          anchor_link: anchor_link,
          anchor_link_extern: anchor_link_extern
        },
        record_click_unfold: {
          record_click_unfold: expand_click
        }
      },
      'ds2-model-brief': {
        record_click: {
          download_link: download,
          page_link: internal_click,
          request_link: start_request,
          configurator_link: start_vco,
          anchor_link: anchor_link,
          anchor_link_extern: anchor_link_extern
        }
      },
      'ds2-model-carousel': {
        record_impressions: {
          record_impressions: expand_impression
        },
        record_click: {
          download_link: download,
          external_link: outbound_click,
          highlight_link: open_highlight,
          video_link: open_video,
          email_link: email,
          request_link: start_request,
          configurator_link: start_vco,
          page_link: internal_click,
          anchor_link: anchor_link,
          anchor_link_extern: anchor_link_extern
        }
      },
      'ds2-news-article': {
        record_impressions: {
          record_impressions: impression
        },
        record_click: {
          download_link: download,
          video_link: open_video,
          highlight_link: open_highlight,
          external_link: outbound_click,
          page_link: internal_click,
          email_link: email,
          request_link: start_request,
          configurator_link: start_vco,
          anchor_link: anchor_link,
          anchor_link_extern: anchor_link_extern
        }
      },
      'news-teaser': {
        record_impressions: {
          record_impressions: data('impression', 'impression', true, false, true)
        },
        record_click: {
          page_link: internal_click,
          external_link: outbound_click,
          anchor_link: anchor_link,
          anchor_link_extern: anchor_link_extern
        }
      },
      'ds2-detail': {
        record_gallery_impression: {
          record_gallery_impression: impression
        },
        record_content_impression: {
          record_content_impression: expand_impression
        },
        record_click: {
          download_link: download,
          video_link: open_video,
          highlight_link: open_highlight,
          external_link: outbound_click,
          page_link: internal_click,
          email_link: email,
          request_link: start_request,
          configurator_link: start_vco,
          anchor_link: anchor_link,
          anchor_link_extern: anchor_link_extern
        }
      },
      'ds2-offer-teaser': {
        record_click: {
          external_link: outbound_click,
          configurator_link: start_vco,
          request_link: start_request,
          page_link: internal_click,
          anchor_link: anchor_link,
          anchor_link_extern: anchor_link_extern
        }
      },
      'pre-configuration': {
        record_click: {
          configurator_link: start_vco,
          request_link: start_request,
          page_link: internal_click,
          anchor_link: anchor_link,
          anchor_link_extern: anchor_link_extern
        },
        record_click_info_icon: {
          record_click_info_icon: show_information_layer
        },
        record_impressions: {
          record_impressions: data('impression', 'impression', true, false, true)
        }
      },
      'ds2-quote': {
        record_click: {
          download_link: download,
          video_link: open_video,
          external_link: outbound_click,
          request_link: start_request,
          configurator_link: start_vco,
          page_link: internal_click,
          anchor_link: anchor_link,
          anchor_link_extern: anchor_link_extern
        }
      },
      'ds2-navigation-salesbar': {
        record_click: {
          record_click: data('click', 'open_contact_button', true, false, true)
        }
      },
      'ds2-sitemap': {
        record_click: {
          record_click: {}
        }
      },
      'ds2-content-slider': {
        record_impressions: {
          record_impressions: impression
        },
        record_click: {
          download_link: download,
          video_link: open_video,
          highlight_link: open_highlight,
          external_link: outbound_click,
          page_link: internal_click,
          email_link: email,
          request_link: start_request,
          configurator_link: start_vco,
          anchor_link: anchor_link,
          anchor_link_extern: anchor_link_extern
        }
      },
      'ds2-spotlight': {
        record_impressions: {
          record_impressions: data('impression', 'impression', true, false, true)
        },
        record_click: {
          download_link: download,
          video_link: open_video,
          highlight_link: open_highlight,
          external_link: outbound_click,
          page_link: internal_click,
          email_link: email,
          request_link: start_request,
          configurator_link: start_vco,
          anchor_link: anchor_link,
          anchor_link_extern: anchor_link_extern
        }
      },
      'ds2-layer-video': {
        record_video_start: {
          record_video_start: data('click', 'start_video', true, false, true)
        },
        record_video_progress_seconds: {
          record_video_progress_seconds: progress
        },
        record_video_progress_percent: {
          record_video_progress_percent: milestone
        }
      },
      'ds2-stage-presentation': {
        record_video_start: {
          record_video_start: data('click', 'start_video', true, false, true)
        },
        record_video_progress_seconds: {
          record_video_progress_seconds: progress
        },
        record_video_progress_percent: {
          record_video_progress_percent: milestone
        },
        record_click_highlight_link: {
          record_click_highlight_link: open_highlight
        },
        record_click_item: {
          highlight_link: open_highlight,
          video_link: open_video,
          request_link: start_request,
          configurator_link: start_vco,
          page_link: internal_click,
          anchor_link: anchor_link,
          anchor_link_extern: anchor_link_extern
        },
        record_click_unfold: {
          record_click_unfold: expand_click
        }
      },
      'ds2-stage-teaser': {
        record_video_start: {
          record_video_start: data('click', 'start_video', true, false, true)
        },
        record_video_progress_seconds: {
          record_video_progress_seconds: progress
        },
        record_video_progress_percent: {
          record_video_progress_percent: milestone
        },
        record_impressions: {
          record_impressions: impression
        },
        record_click: {
          configurator_link: start_vco,
          download_link: download,
          email_link: email,
          external_link: outbound_click,
          highlight_link: open_highlight,
          page_link: internal_click,
          request_link: start_request,
          video_link: open_video,
          anchor_link: anchor_link,
          anchor_link_extern: anchor_link_extern
        }
      },
      'standard-detail': {
        record_gallery_impression: {
          record_gallery_impression: impression
        },
        record_content_impression: {
          record_content_impression: expand_impression
        },
        record_click: {
          download_link: download,
          video_link: open_video,
          highlight_link: open_highlight,
          external_link: outbound_click,
          page_link: internal_click,
          email_link: email,
          request_link: start_request,
          configurator_link: start_vco,
          anchor_link: anchor_link,
          anchor_link_extern: anchor_link_extern
        }
      },
      'ds2-table': {
        record_click_item: {
          pdf_download_icon_link: download,
          download_link: download,
          video_link: open_video,
          highlight_link: open_highlight,
          external_link: outbound_click,
          page_link: internal_click,
          email_link: email,
          request_link: start_request,
          configurator_link: start_vco,
          anchor_link: anchor_link,
          anchor_link_extern: anchor_link_extern
        },
        record_table_sliding: {
          record_table_sliding: data('click', 'slide', true, false, true)
        },
        record_column_impressions: {
          record_column_impressions: impression
        }
      },
      'ds2-technical-data': {
        record_content_impression_model_data: {
          record_content_impression_model_data: data('impression', 'show_model_data', true, false, true)
        },
        record_click: {
          page_link: internal_click,
          configurator_link: start_vco,
          anchor_link: anchor_link,
          anchor_link_extern: anchor_link_extern
        },
        record_click_info_icon: {
          record_click_info_icon: show_information_layer
        },
        record_click_efficiency_icon: {
          record_click_efficiency_icon: show_information_layer
        },
        record_content_impression_accordion: {
          record_content_impression_accordion: expand_impression
        }
      },
      'ds2-model-overview': {},
      'ds2-text-only': {
        record_click: {
          download_link: download,
          video_link: open_video,
          highlight_link: open_highlight,
          external_link: outbound_click,
          page_link: internal_click,
          email_link: email,
          request_link: start_request,
          configurator_link: start_vco,
          anchor_link: anchor_link,
          anchor_link_extern: anchor_link_extern
        }
      },
      'ds2-typo': {
        record_click: {
          download_link: download,
          external_link: outbound_click,
          highlight_link: open_highlight,
          video_link: open_video,
          email_link: email,
          request_link: start_request,
          configurator_link: start_vco,
          page_link: internal_click,
          anchor_link: anchor_link,
          anchor_link_extern: anchor_link_extern
        }
      },
      'ds2-video-container': {
        record_video_start: {
          record_video_start: data('click', 'start_video', true, false, true)
        },
        record_video_progress_seconds: {
          record_video_progress_seconds: progress
        },
        record_video_progress_percent: {
          record_video_progress_percent: milestone
        },
        record_click: {
          download_link: download,
          video_link: open_video,
          highlight_link: open_highlight,
          external_link: outbound_click,
          page_link: internal_click,
          email_link: email,
          request_link: start_request,
          configurator_link: start_vco,
          anchor_link: anchor_link,
          anchor_link_extern: anchor_link_extern
        }
      },
      'ds2-sound': {
        record_video_start: {
          record_video_start: data('click', 'start_video', true, false, true)
        },
        record_video_progress_seconds: {
          record_video_progress_seconds: progress
        },
        record_video_progress_percent: {
          record_video_progress_percent: milestone
        },
        record_click: {
          download_link: download,
          video_link: open_video,
          highlight_link: open_highlight,
          external_link: outbound_click,
          page_link: internal_click,
          email_link: email,
          request_link: start_request,
          configurator_link: start_vco,
          anchor_link: anchor_link,
          anchor_link_extern: anchor_link_extern
        }
      },
      'video-layer': {
        record_video_progress_seconds: {
          record_video_progress_seconds: progress
        },
        record_video_progress_percent: {
          record_video_progress_percent: milestone
        }
      },
      'ds2-navigation-model': {
        record_click: {
          configurator_link: start_vco,
          page_link: internal_click,
          anchor_link: anchor_link,
          anchor_link_extern: anchor_link_extern
        }
      },
      'ds2-navigation-model-small': {
        record_click: {
          configurator_link: start_vco,
          page_link: internal_click,
          anchor_link: anchor_link,
          anchor_link_extern: anchor_link_extern
        }
      },
      'ds2-models': {
        record_click: {
          configurator_link: start_vco,
          page_link: internal_click,
          anchor_link: anchor_link,
          anchor_link_extern: anchor_link_extern
        }
      },
      'ds2-magazine--heroteaser': {
        record_click: {
          page_link: internal_click
        }
      },
      'ds2-article-model-overview': {
        record_click: {
          page_link: internal_click,
          configurator_link: start_vco
        }
      },
      'ds2-article-text': {
        record_click: {
          page_link: internal_click,
          external_link: outbound_click
        }
      },
      'ds2-related-articles': {
        record_click: {
          page_link: internal_click
        }
      },
      'ds2-magazine--overview': {
        record_click: {
          page_link: internal_click
        }
      },
      'ds2-hotspot': {
        record_impressions: {
          record_impressions: data('impression', 'impression', true, false, true)
        },
        record_video_start: {
          record_video_start: data('click', 'start_video', true, false, true)
        },
        record_video_progress_seconds: {
          record_video_progress_seconds: progress
        },
        record_video_progress_percent: {
          record_video_progress_percent: milestone
        },
        record_click: {
          download_link: download,
          video_link: open_video,
          highlight_link: open_highlight,
          external_link: outbound_click,
          page_link: internal_click,
          email_link: email,
          request_link: start_request,
          configurator_link: start_vco,
          anchor_link: anchor_link,
          anchor_link_extern: anchor_link_extern
        }
      },
      'ds2-need-analyzer-teaser': {
        record_click: {
          page_link: internal_click
        }
      },
      'ds2-nsc': {
        record_click: {
          external_link: outbound_click
        }
      },
      'ds2-need-analyzer': {
        record_click: {
          page_link: internal_click,
          external_link: outbound_click
        }
      },
      'ds2-topic-slider': {
        record_impressions: {
          record_impressions: data('impression', 'impression', true, false, true)
        },
        record_click: {
          download_link: download,
          video_link: open_video,
          highlight_link: open_highlight,
          external_link: outbound_click,
          page_link: internal_click,
          email_link: email,
          request_link: start_request,
          configurator_link: start_vco,
          anchor_link: anchor_link,
          anchor_link_extern: anchor_link_extern
        }
      },
      'ds2-smartbanner': {
        record_click: {
          external_link: outbound_click
        }
      }
    };
  },

  /**
   * Initialises the mapping.
   */
  initTracking: function () {
    var self = this;
    this.mapping = this.initMapping();
    $(window).on('ds2trackEvent', function (e, a, trackingOptions) {
      self.bmwTrack(trackingOptions);
    });
  },

  mapComponent: function (componentName) {
    if (_.has(this.mapping, componentName)) {
      return _.cloneDeep(this.mapping[componentName]);
    }
    return {};
  },

  _trackingApiExists: function () {
    return _.has(window, 'digitals2.tracking.api');
  },

  _getNavigationSourceID: function () {
    if (this._trackingApiExists()) {
      var api = window.digitals2.tracking.api;
      return api.getPageObject(api.getCurrentPageIndex()).page.pageInfo.pageName;
    }
    return window.top.location.href;
  },

  // used for tracking page attributes
  navCookieGetData: function (pElement) {
    log('_navCookieGetData pElement: '.pElement);
    try {
      var navObj = {
        navigationSource: this._getNavigationSourceID(),
        navigationItem: $(pElement).text().trim(),
        navigationComponentID: $(pElement).closest('.ds2-component').data('tracking-component').componentInfo.componentID
      };

      this._navCookieSave(navObj);
    } catch (error) {
      log(error);
    }
  },

  _navCookieSave: function (navObj) {
    var EVENT_ATTR_COOKIE = 'cc_digital_eventAttributes',
      cookieAllowed = cookiecontroller.api.isCookieAllowed(EVENT_ATTR_COOKIE);

    if (navObj && cookieAllowed) {
      cookiecontroller.api.setCookie(EVENT_ATTR_COOKIE, JSON.stringify(navObj));
    }
  },

  /**
   * trackEvent
   */
  trackEvent: function (trackingEvent, trackingOptions, interactionEvent) {
    if (!this._trackingApiExists()) {
      log('tracking api not available');
      return trackingEvent;
    }

    if (!trackingEvent || !trackingOptions) {
      log('param trackingEvent and trackingOptions must not be null');
      return trackingEvent;
    }

    var api = window.digitals2.tracking.api;

    if (trackingOptions.active === false) {
      log('tracking of this event is deactivated');
    } else {
      if (_.has(trackingEvent, 'category.eventType') && trackingEvent.category.eventType === 'delayed') {
        api.eventCookieSave(trackingEvent);
      } else {
        $(window).trigger('ds2trackEvent', [api.addEventTracking({}, trackingEvent, 0), trackingOptions]);
      }
    }
  },

  /**
   * bmwTrack()
   */
  bmwTrack: function (trackingOptions) {

    // the update of the digitalData object should happen prior to the execution
    // of the bmwTrack function and is handled exclusively via the API.
    log('> always update digitalData before actual bmwTrack flow');

    if (trackingOptions.active === false) {
      log('tracking of this event is deactivated');
    } else {

      // if (!trackingOptions.timing) // ???
      if (trackingOptions.timing === false) {
        // WARNING: dont no for what case this will be good
        log('added to dataLayer but no satelliteTrack call');
      }

      // fs??? -> if (trackingOptions.timing) {} // ???
      if (trackingOptions.timing === true && trackingOptions.useTimer === false ||
        trackingOptions.timing === true && trackingOptions.useTimer === true
      ) {

        if (window._satellite) {
          log('_satellite.track will be called');
          var satelliteName = this._mapTrackingNameToSatelliteTrack(trackingOptions.name);
          if (satelliteName === '') {
            satelliteName = trackingOptions.name;
          }
          _satellite.track(satelliteName);
        } else {
          log('_satellite not defined');
        }
      }
    }
  },
  _mapTrackingNameToSatelliteTrack: function (trackingName) {
    return this.trackingNameMapping[trackingName] || '';
  },
  _triggerOriginalEvent: function (pEvent, pTime) {

    setTimeout(function () {
      log('> setTimeout');
      log('> pEvent: ', pEvent);

      // pass second param pFromTracking [bool] to tell event handler whether the original event should be "continued"
      $(pEvent.target).trigger(pEvent.type, true);

    }, pTime);
  }
};

window.digitals2.tracking.dispatcher.initTracking();

$(window).on('initializeComponents', function () {

  /*
   * Don't initialize the components if is not available.
   */
  if (!_.has(window, 'digitals2.tracking.api')) {
    return;
  }

  /*
   * Don't initialize the components if is not available.
   */
  if (!_.has(window, 'digitals2.tracking.api')) {
    return;
  }

  /**
   * Returns the required tracking options for a component.
   *
   * @type {function}
   * @param {string} component The name of the component.
   * @return {{trackingOptions: {component: string}}} The required component information.
   */
  var getOptions = function (component) {
    return {
      api: digitals2.tracking.api,
      dispatcher: window.digitals2.tracking.dispatcher,
      eventBuilder: window.digitals2.tracking.eventBuilder,
      bmwTrackOptionsBuilder: window.digitals2.tracking.bmwTrackOptionsBuilder,
      TC: window.digitals2.tracking.TrackingConstants,
      trackingOptions: {component: component}
    };
  };

  $('.ds2-chat').ds2TrackingBase(getOptions('ds2-chat'));
  $('.ds2-accordion').ds2TrackingAccordion(getOptions('ds2-accordion'));
  $('.ds2-accordion--element').ds2TrackingAccordionElement(getOptions('ds2-accordion-element'));
  $('.ds2-anchor').ds2TrackingBase(getOptions('ds2-anchor'));
  $('.ds2-basic-teaser').ds2TrackingBase(getOptions('ds2-basic-teaser'));
  $('.ds2-business-card').ds2TrackingBase(getOptions('ds2-business-card'));
  $('.ds2-smartbanner').ds2TrackingSmartbanner(getOptions('ds2-smartbanner'));
  $('.ds2-cluster-overview').ds2TrackingBase(getOptions('ds2-cluster-overview'));
  $('.ds2-contact-box').ds2TrackingBase(getOptions('ds2-contact-box'));
  $('.ds2-content-overview').ds2TrackingBase(getOptions('ds2-content-overview'));
  $('.ds2-content-presentation').ds2TrackingContentPresentation(getOptions('ds2-content-presentation'));
  $('.ds2-content-slider').ds2TrackingContentSlider(getOptions('ds2-content-slider'));
  $('.ds2-detail', '.fallback').ds2TrackingFallbackDetail(getOptions('ds2-detail'));
  $('.ds2-detail', '.offer').ds2TrackingOfferDetail(getOptions('ds2-detail'));
  $('.ds2-detail', '.standard').ds2TrackingOfferDetail(getOptions('ds2-detail'));
  $('.ds2-errors').ds2TrackingErrorPage(getOptions('ds2-errors'));
  $('.ds2-gallery').ds2TrackingGallery(getOptions('ds2-gallery'));
  $('.ds2-glossary-article').ds2TrackingBase(getOptions('ds2-glossary-article'));
  $('.ds2-glossary-overview').ds2TrackingGlossaryOverview(getOptions('ds2-glossary-overview'));
  $('.ds2-language-selection').ds2TrackingBase(getOptions('ds2-language-selection'));
  $('.ds2-layer-error').ds2TrackingErrorLayer(getOptions('ds2-layer-error'));
  $('.ds2-layer-video').ds2TrackingVideoLayer(getOptions('ds2-layer-video'));
  $('.ds2-main-footer').ds2TrackingBase(getOptions('ds2-main-footer'));
  $('.ds2-micro-story').ds2TrackingMicroStory(getOptions('ds2-micro-story'));
  $('.ds2-model-brief').ds2TrackingBase(getOptions('ds2-model-brief'));
  $('.ds2-model-carousel').ds2TrackingModelCarousel(getOptions('ds2-model-carousel'));
  $('.ds2-navigation-content-bar').ds2TrackingNavigationContentBar(getOptions('ds2-navigation-content-bar'));
  $('.ds2-navigation-main').ds2TrackingNavigation(getOptions('ds2-navigation-main'));
  $('.ds2-navigation-model').ds2TrackingBase(getOptions('ds2-navigation-model'));
  $('.ds2-navigation-model-small').ds2TrackingBase(getOptions('ds2-navigation-model-small'));
  $('.ds2-navigation-salesbar').ds2TrackingNavigationSalesbar(getOptions('ds2-navigation-salesbar'));
  $('.ds2-news-article').ds2TrackingBase(getOptions('ds2-news-article'));
  $('.ds2-pre-configuration').ds2TrackingPreConfiguration(getOptions('ds2-pre-configuration'));
  $('.ds2-quote').ds2TrackingBase(getOptions('ds2-quote'));
  $('.ds2-sitemap').ds2TrackingBase(getOptions('ds2-sitemap'));
  $('.ds2-stage-presentation').ds2TrackingStagePresentation(getOptions('ds2-stage-presentation'));
  $('.ds2-stage-teaser').ds2TrackingStageTeaser(getOptions('ds2-stage-teaser'));
  $('.ds2-table').ds2TrackingTable(getOptions('ds2-table'));
  $('.ds2-technical-data').ds2TrackingTechnicalData(getOptions('ds2-technical-data'));
  $('.ds2-text-only').ds2TrackingBase(getOptions('ds2-text-only'));
  $('.ds2-typo').ds2TrackingBase(getOptions('ds2-typo'));
  $('.ds2-video-container').ds2TrackingVideoContainer(getOptions('ds2-video-container'));
  $('.ds2-sharing').ds2TrackingSharing(getOptions('ds2-sharing'));
  $('.ds2-models').ds2TrackingModelOverview(getOptions('ds2-models'));
  $('.ds2-magazine--heroteaser').ds2TrackingBase(getOptions('ds2-magazine--heroteaser'));
  $('.ds2-article-model-overview').ds2TrackingArticleModelOverview(getOptions('ds2-article-model-overview'));
  $('.ds2-article-text').ds2TrackingMagazineText(getOptions('ds2-article-text'));
  $('.ds2-sound').ds2TrackingSound(getOptions('ds2-sound'));
  $('.ds2-magazine--overview').ds2TrackingMagazineOverview(getOptions('ds2-magazine--overview'));
  $('.ds2-related-articles').ds2TrackingRelatedArticles(getOptions('ds2-related-articles'));
  $('.ds2-hotspot').ds2TrackingHotspot(getOptions('ds2-hotspot'));
  $('.ds2-hse').ds2TrackingHotspotExtended(getOptions('ds2-hse'));
  $('.ds2-nsc').ds2TrackingNsc(getOptions('ds2-nsc'));
  if ($('[data-component-path="ds2-need-analyzer"]').length > 0) {
    require(['ds2-need-analyzer-tracking', 'ds2-na-dispatcher'], function () {
      $('[data-component-path="ds2-need-analyzer"]').eq(0).ds2TrackingNeedAnalyzer(getOptions('ds2-need-analyzer'));
    });
  }
  if ($('[data-component-path="ds2-need-analyzer-extended"]').length > 0) {
    require(['ds2-need-analyzer-extended-tracking'], function () {
      $('[data-component-path="ds2-need-analyzer-extended"]').eq(0).ds2TrackingNeedAnalyzerExtended(getOptions('ds2-need-analyzer'));
    });
  }
  $('.ds2-need-analyzer-teaser').ds2TrackingNeedAnalyzerTeaser(getOptions('ds2-need-analyzer-teaser'));
  $('.ds2-topic-slider').ds2TrackingTopicSlider(getOptions('ds2-topic-slider'));
  $('.ds2-facebook-video').ds2TrackingFacebookVideo(getOptions('ds2-facebook-video'));
  $('.ds2-comparison-slider').ds2TrackingComparisonSlider(getOptions('ds2-comparison-slider'));
  $('.ds2-tooltip').ds2TrackingTooltip(getOptions('ds2-tooltip'));
  $('.usabilla-integrated-button').ds2TrackingBase(getOptions('usabilla-integrated-button'));
  if ($('#ds2-model-navigation').length) {
    $('#ds2-model-navigation').ds2TrackingEnavigationModel(getOptions('ds2-model-navigation'));
  }
  if ($('.ds2-need-analyzer-share-page').length) {
    $('.ds2-need-analyzer-share-page').ds2TrackingNeedAnalyzerSharePage(getOptions('ds2-need-analyzer-share-page'));
  }
  $('body').ds2TrackingLogin();
});
