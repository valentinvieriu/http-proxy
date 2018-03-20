const fs = require('fs');
const path = require('path');
const penthouse = require('penthouse');

const rootPath = process.cwd();
penthouse({
  width: 1440,
  height: 900,
  renderWaitTime: 10000,
  url: 'http://localhost:3000/de/home_link_preload_no_nav.html',
  css: path.resolve(path.join(rootPath, '/public/etc/clientlibs/digitals2/ltr+requests.min.20180223082733.min.css')),
}).then(criticalCss => {
  // use the critical css
  fs.writeFileSync(path.join(rootPath, '/public/etc/clientlibs/digitals2/home.css'), criticalCss);
});
