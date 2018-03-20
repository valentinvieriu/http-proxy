requirejs.config( {
    use: {
        'cocoen': {
            exports: 'Cocoen'
        },
        'accounting': {
            exports: 'accounting'
        },
        'foundation': {
            exports: 'jQuery',
            deps: [ 'use!jquery' ]
        },
        'foundation-reveal': {
            exports: 'jQuery',
            deps: [ 'use!jquery' ]
        },
        'foundation-utils': {
            exports: 'jQuery',
            deps: [ 'use!jquery' ]
        },
        'handlebars': {
            exports: 'handlebars'
        },
        'iscroll': {
            exports: 'IScroll'
        },
        'isotope': {
            exports: 'jQuery',
            deps: [ 'use!jquery' ]
        },
        'jquery': {
            exports: 'jQuery'
        },
        'jquery-bigtext': {
            exports: 'jQuery',
            deps: [ 'use!jquery' ]
        },
        'jquery-fittext': {
            exports: 'jQuery',
            deps: [ 'use!jquery' ]
        },
        'jquery-qtip': {
            exports: 'jQuery',
            deps: [ 'use!jquery' ]
        },
        'jquery-slick': {
            exports: 'jQuery',
            deps: [ 'use!jquery' ]
        },
        'jquery-sleck': {
            exports: 'jQuery',
            deps: [ 'use!jquery' ]
        },
        'jquery-ui': {
            exports: 'jQuery',
            deps: [ 'use!jquery' ]
        },
        'log': {
            exports: 'log'
        },
        'lodash': {
            exports: 'jQuery',
            deps: [ 'use!jquery' ]
        },
        'velocity': {
            exports: 'jQuery',
            deps: [ 'use!jquery' ]
        },
         'slick': {
             exports: 'jQuery',
             deps: [ 'use!jquery' ]
         },
         'angular': {
             exports: 'angular',
             deps: [ 'use!jquery' ]
         }
    },
    paths: {
    }
} );
