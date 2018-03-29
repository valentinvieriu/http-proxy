importScripts(
  '/etc/clientlibs/digitals2/clientlib/js/vendor/workbox/workbox-sw.js'
);
const CACHE_NAME = 'bmwkit';
const CACHE_SUFFIX = 'v1';
workbox.setConfig({
  modulePathPrefix: '/etc/clientlibs/digitals2/clientlib/js/vendor/workbox/',
  debug: true
});
workbox.core.setLogLevel(workbox.core.LOG_LEVELS.debug);
workbox.core.setCacheNameDetails({
  prefix: CACHE_NAME,
  suffix: CACHE_SUFFIX,
  precache: 'install-time',
  runtime: 'run-time',
  googleAnalytics: 'ga'
});
// workbox.skipWaiting();
const PRECACHE_URLS = [
  '/etc/clientlibs/digitals2/home.css',
  '/de.cc-cookies.json',
  '/etc/clientlibs/digitals2/ltr+requests.min.20180223082733.min.css',
  '/etc/clientlibs/digitals2/clientlib/api.min.20180216002220.min.js',
  '/etc/clientlibs/digitals2/clientlib/base.min.20180216002220.min.js',
  '/de/home_link_preload_no_nav_critical_css.html'
];

// Precaching
workbox.precaching.precacheAndRoute(PRECACHE_URLS);
// PRECACHE_URLS.map(url => {
//   workbox.routing.registerRoute(url, workbox.strategies.cacheOnly(), 'GET');
// });

// https://developers.google.com/web/tools/workbox/reference-docs/latest/workbox.routing#registerRoute
// https://developers.google.com/web/tools/workbox/reference-docs/latest/workbox.strategies
workbox.routing.registerRoute(
  // Cache html files
  /.*\.(?:html)/,
  workbox.strategies.cacheOnly()
);

workbox.routing.registerRoute(
  // Cache css files
  /.*\.css/,
  workbox.strategies.cacheOnly()
);

workbox.routing.registerRoute(
  // Cache font files
  /.*\.(?:woff|ttf|woff2)/,
  workbox.strategies.cacheOnly()
);

// Force Caching of Opaque Responses
// https://developers.google.com/web/tools/workbox/reference-docs/latest/workbox.cacheableResponse.Plugin
workbox.routing.registerRoute(
  new RegExp('(https://assets\.adobedtm\.com/.*\.js|https://bmw\.scene7\.com/.*\.js|https://www\.p28\.bmw\.com/.*\.js)'),
  workbox.strategies.cacheOnly({
    plugins: [
      // Force Cache
      new workbox.cacheableResponse.Plugin({
        statuses: [0, 200], // One or more status codes that a Response can have and be considered cacheable.
      }),
    ]
  }),
);

workbox.routing.registerRoute(
  /.*\.js/,
  workbox.strategies.cacheOnly()
);
workbox.routing.registerRoute(
  /.*\.json/,
  workbox.strategies.cacheOnly()
);

workbox.routing.registerRoute(
  // Cache image files
  /.*\.(?:png|jpg|jpeg|svg|gif)/,
  // Use the cache if it's available
  workbox.strategies.cacheOnly({
    // Use a custom cache name
    // cacheName: `${CACHE_NAME}-images-${CACHE_SUFFIX}`,
    // plugins: [
    //   new workbox.expiration.Plugin({
    //     // Cache only 100 images
    //     maxEntries: 100,
    //     // Cache for a maximum of a week
    //     maxAgeSeconds: 7 * 24 * 60 * 60,
    //   })
    // ],
  })
);


